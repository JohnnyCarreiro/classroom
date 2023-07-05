export const AUTHENTICATION_STRATEGY_TOKEN = 'auth.strategy'

export abstract class AuthenticationStrategy<AuthResponse> {
  abstract authenticate(accessToken: string): Promise<AuthResponse>
}
