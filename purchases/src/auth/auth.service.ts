// import { Inject, Injectable, Logger } from '@nestjs/common'
import { AuthError } from './error/auth.error'
import { AuthenticationStrategy } from './strategy/authentication.strategy'

export class AuthService {
  constructor(
    private readonly strategy: AuthenticationStrategy<AuthUserResponse>
  ) {}

  // eslint-disable-next-line @typescript-eslint/ban-types
  async authenticate(accessToken: string): Promise<{}> {
    try {
      const userInfos = await this.strategy.authenticate(accessToken)

      const user = {
        id: userInfos.sub,
        username: userInfos.preferred_username,
        permissions: userInfos.group_permissions,
        roles: userInfos.groups
      }

      /**
       * Perform any addition business logic with the user:
       * - insert user in "users" table on first Auth,
       * - download users picture form auth provider,
       * - update user data from auth provider periodically
       * - etc.
       */

      return user
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }

      throw new AuthError({
        description: `${(error as Error).message}-${(error as Error).stack}`
      })
    }
  }
}
