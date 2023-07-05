import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import * as jwt from 'jsonwebtoken'

import { AuthenticationStrategy } from './authentication.strategy'
import { AuthError, AuthErrorName } from '../error/auth.error'

export class InvalidTokenPublicKeyId extends Error {
  constructor(keyId: string) {
    super(`Invalid public key ID ${keyId}`)
  }
}

export interface AuthUserResponse {
  sub: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  group_permissions: string[]
  groups: string[]
}

/**
 * Format of the keys returned in the JSON response from AuthService for the list of public keys
 */
interface AuthServiceCertsResponse {
  keys: AuthServiceKey[]
}
interface AuthServiceKey {
  kid: KeyId
  x5c: PublicKey
}
type KeyId = string
type PublicKey = string

@Injectable()
export class ManualAuthenticationStrategy
  implements AuthenticationStrategy<AuthUserResponse>
{
  /**
   * Keep an in-memory map of the known public keys to avoid calling Authservice every time
   */
  private readonly keysMap: Map<KeyId, PublicKey> = new Map<KeyId, PublicKey>()

  // private readonly baseURL: string
  // private readonly realm: string

  constructor(private httpService: HttpService) {
    // this.baseURL = process.env.AUTHSERVICE_BASE_URL!
    // this.realm = process.env.AUTHSERVICE_REALM!
  }

  public async authenticate(accessToken: string): Promise<AuthUserResponse> {
    const token = jwt.decode(accessToken, { complete: true }) // For once, we'd like to have the header and not just the payload

    // Check if token is undefined or null and throw a new error

    if (token == null || token == undefined) {
      throw new AuthError({
        description: 'Could not decode Token',
        name: AuthErrorName.INVALID_TOKEN
      })
    }

    const keyId = token!.header!.kid!

    const publicKey = await this.getPublicKey(keyId)

    jwt.verify(
      accessToken,
      publicKey,
      { algorithms: ['RS256'] },
      (err, payload) => {
        if (err) {
          if (err.name == 'TokenExpiredError') {
            throw new AuthError({
              description: 'Token expired',
              name: AuthErrorName.TOKEN_EXPIRED
            })
          }
          if (err.name == 'JsonWebTokenError') {
            throw new AuthError({
              description: 'Invalid Token',
              name: AuthErrorName.INVALID_TOKEN
            })
          }
          throw new AuthError({
            description: 'Invalid Token, unexpected error'
          })
        }
        return payload
      }
    )

    const payload = jwt.verify(accessToken, publicKey, {
      algorithms: ['RS256']
    }) as AuthUserResponse
    return payload
  }

  private async getPublicKey(keyId: KeyId): Promise<PublicKey> {
    if (this.keysMap.has(keyId)) {
      return this.keysMap.get(keyId) as string
    } else {
      const keys = await this.httpService.axiosRef
        .get<AuthServiceCertsResponse>('.well-known/jwks.json')
        .then((response: any) => response.data.keys)

      const key = keys.find((k: { kid: string }) => k.kid === keyId)

      if (key) {
        const publicKey = `-----BEGIN CERTIFICATE-----\n${key.x5c}\n-----END CERTIFICATE-----`
        this.keysMap.set(keyId, publicKey)

        return publicKey
      } else {
        // Token is probably so old, Authservice doesn't even advertise the corresponding public key anymore
        throw new AuthError({
          description: `Invalid public key: ${keyId}`,
          name: AuthErrorName.INVALID_TOKEN_PUB_KEY
        })
      }
    }
  }
}
