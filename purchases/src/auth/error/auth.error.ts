import { BaseError } from '@shared/errors/base.error'

export enum AuthErrorName {
  UNEXPECTED_ERROR = 'unexpectedError',

  TOKEN_EXPIRED = 'tokenExpired',
  MISSING_TOKEN = 'missingToken',
  MISSING_HEADER = 'missingHeader',

  INVALID_TOKEN = 'invalidToken',
  INVALID_TOKEN_PUB_KEY = 'invalidTokenPublicKey'
}

type ErrorArgs = {
  name?: AuthErrorName
  description?: string
}

export class AuthError extends BaseError<AuthErrorName> {
  constructor({ name, description }: ErrorArgs) {
    super({
      description: description
        ? `Auth Error: ${description}`
        : `Auth Error: Unexpected error`,
      name: name ?? AuthErrorName.UNEXPECTED_ERROR
    })
    Object.setPrototypeOf(this, AuthError.prototype)
    Error.captureStackTrace(this)
  }
}
