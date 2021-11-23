import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from 'src/config/config.module';
import { ConfigService } from 'src/config/config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtQueryStrategy } from './jwt-query.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStrategy, JwtStrategy, JwtQueryStrategy],
  exports: [AuthService, JwtQueryStrategy],
})
export class AuthModule {}
