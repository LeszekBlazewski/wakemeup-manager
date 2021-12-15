import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';

@Injectable()
export class JwtBootStrategy extends PassportStrategy(Strategy, 'jwt-boot') {
  constructor(
    public configService: ConfigService,
    public authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('boot_token'),
      ignoreExpiration: false,
      secretOrKey: configService.createBootOptions().bootTokenSecret,
    });
  }

  async validate(_payload: any) {
    return {};
  }
}
