import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class ConfigService implements JwtOptionsFactory {
  public createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    return {
      // Needed by JwtService
    };
  }
  public createSecretOptions() {
    return {
      secret: process.env.SECRET || 'wolSecret',
    };
  }
}
