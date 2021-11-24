import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtQueryStrategy } from './auth/jwt-query.strategy';
import { appRef } from './main';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private jwtQueryStrategy: JwtQueryStrategy,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    /** Terminal proxy - secured proxy workaround around nest */
    const app = appRef.value;
    const passport = (this.jwtQueryStrategy as any).getPassportInstance();
    app
      .getHttpAdapter()
      .getInstance()
      .use(
        cors(),
        cookieParser(),
        passport.authenticate('jwt-query', { session: false }),
        createProxyMiddleware('/api/wetty', {
          target: this.configService.createWettyOptions().address,
          changeOrigin: false,
          ws: true,
        }),
      );
  }

  getHello(): string {
    return 'Hello World!';
  }
}
