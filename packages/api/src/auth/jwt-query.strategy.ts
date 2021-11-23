import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtQueryStrategy extends PassportStrategy(Strategy, 'jwt-query') {
  constructor(
    public configService: ConfigService,
    public authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('token'),
        (req: Request) => req.cookies['auth._token.local']?.substr(7),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.createSecretOptions().secret,
    });
  }

  async validate(_payload: any) {
    return this.authService.getUser();
  }
}
