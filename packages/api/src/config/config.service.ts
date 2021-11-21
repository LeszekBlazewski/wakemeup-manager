import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { resolve } from 'path';

@Injectable()
export class ConfigService implements JwtOptionsFactory {
  public getUserData() {
    return {
      username: process.env.AUTH_USERNAME || 'username',
      password: process.env.AUTH_PASSWORD || 'password',
      name: 'Lab 229 Cluster Manager',
    };
  }

  /**
   * @returns absolute path to inventory yaml
   */
  public getInventoryPath() {
    return (
      process.env.ANSIBLE_INVENTORY ||
      resolve(__dirname, '../../test/data/inventory.yml')
    );
  }

  public isProd() {
    return process.env.NODE_ENV === 'production';
  }

  public isDev() {
    return process.env.NODE_ENV !== 'production';
  }

  public baseUrl() {
    return process.env.BASE_URL || 'localhost';
  }

  public createSecretOptions() {
    return {
      secret: process.env.SECRET || 'topSecret',
      secretExpiresIn: process.env.EXPIRES_IN || '1d',
      secretRefresh: process.env.SECRET_REFRESH || 'topSecret0',
      secretRefreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '1d',
      secretRefreshRememberExpiresIn:
        process.env.REFRESH_REMEMBER_EXPIRES_IN || '7d',
    };
  }

  public createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    return {
      /** All from createSecretOptions at runtime */
    };
  }
}
