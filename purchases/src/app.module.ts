import { Module } from '@nestjs/common'
import { DatabaseModule } from './database/database.module'
import { HttpModule } from './http/http.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [DatabaseModule, HttpModule, AuthModule],
  controllers: [],
  providers: []
})
export class AppModule {}
