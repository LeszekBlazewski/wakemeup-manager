import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { resolve } from 'path';
import { OS } from 'src/types';

@Injectable()
export class ConfigService implements JwtOptionsFactory {
  public createUserData() {
    return {
      username: process.env.AUTH_USERNAME || 'username',
      password: process.env.AUTH_PASSWORD || 'password',
      name: 'Lab 229 Cluster Manager',
    };
  }

  /**
   * @returns absolute path to inventory yaml
   */
  public createInventoryPath() {
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

  public createPrivateKeyPath() {
    return (
      process.env.SSH_PRIVATE_KEY ||
      resolve('/home/damian_koper/.ssh/id_ed25519')
    );
  }

  public createTftpOptions() {
    return {
      port: process.env.TFTP_PORT || 6969,
      address: process.env.TFTP_ADDRESS || undefined,
      exclusive: true,
    };
  }

  /** GRUB boot option index  */
  public createBootOptions() {
    return {
      [OS.UBUNTU]: process.env.GRUB_UBUNTU || 0,
      [OS.WINDOWS]: process.env.GRUB_WINDOWS || 3,
    };
  }

  public createWettyOptions() {
    return {
      address: 'http://localhost:3001',
    };
  }
}
