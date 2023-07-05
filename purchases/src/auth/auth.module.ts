import { Module } from '@nestjs/common'
import { ManualAuthenticationStrategy } from './strategy/manual.strategy'
import { AuthenticationStrategy } from './strategy/authentication.strategy'
import { AuthService } from './auth.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get<string>('AUTH0_DOMAIN'),
        timeout: configService.get('HTTP_TIMEOUT')
        // maxRedirects: configService.get('HTTP_MAX_REDIRECTS'),
        // maxRate: configService.get('HTTP_MAX_RATE_LIMIT')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    ManualAuthenticationStrategy,
    {
      provide: AuthenticationStrategy,
      useClass: ManualAuthenticationStrategy
    },
    {
      provide: AuthService,
      useFactory: (strategy: AuthenticationStrategy<AuthUserResponse>) => {
        return new AuthService(strategy)
      },
      inject: [ManualAuthenticationStrategy]
    }
  ],
  exports: [AuthService]
})
export class AuthModule {}
