import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'
import { AuthError, AuthErrorName } from '../error/auth.error'

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private logger = new Logger(AuthService.name)
  private auth0Audienve: string
  private auth0Domain: string
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    this.auth0Audienve = this.configService.get<string>('AUTH0_AUDIENCE') ?? ''
    this.auth0Domain = this.configService.get<string>('AUTH0_DOMAIN') ?? ''
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const httpContext = context.switchToHttp()
    const request = httpContext.getRequest()
    const response = httpContext.getResponse()
    const header = request.header('Authorization')

    // Check for Authorization Header
    if (!header) {
      throw new AuthError({
        description: 'Authorization: Missing header',
        name: AuthErrorName.MISSING_HEADER
      })
    }
    //Check for Authorization Header value (TODO: use remove only to get tokem value, there is no need to check for bearer)
    const parts = header.split(' ') as string[]
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError({
        description: 'Authorization: Bearer <token> header invalid',
        name: AuthErrorName.INVALID_TOKEN
      })
    }
    const token = parts[1]

    // Validate the token and set user values to request object
    try {
      request['user'] = await this.authService.authenticate(token)
      return true
    } catch (error) {
      this.logger.error((error as Error).message)

      if (error instanceof AuthError) {
        response.status(HttpStatus.UNAUTHORIZED).json({
          error: error.name,
          message: error.message
        })
        return false
      }
      // throw new AuthError({})
      throw new AuthError({})
    }
  }
}
