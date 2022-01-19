import { Injectable } from '@nestjs/common';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { resolve } from 'path';
import { OS } from 'src/types';
import { BootOptions } from './interfaces/boot-options.interface';
@Injectable()
export class ConfigService implements JwtOptionsFactory {
  public createUserData() {
    return {
      username: process.env.AUTH_USERNAME || 'username',
      password: process.env.AUTH_PASSWORD || 'password',
      name: 'Wake me up Manager',
    };
  }

  /**
   * @returns absolute path to inventory yaml
   */
  public createInventoryPath() {
    return (
      process.env.ANSIBLE_INVENTORY ||
      resolve(__dirname, '../../../../config/inventory.yml')
    );
  }

  public isProd() {
    return process.env.NODE_ENV === 'production';
  }

  public isDev() {
    return process.env.NODE_ENV !== 'production';
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
      resolve(__dirname, '../../../../config/id_ed25519')
    );
  }

  public createTftpOptions() {
    return {
      port: +process.env.TFTP_PORT || 6969,
    };
  }

  public createStudentOptions() {
    return {
      username: process.env.STUDENT_USERNAME || 'student',
    };
  }

  public createBootOptions(): BootOptions {
    return {
      wolAgentUrl: process.env.WOL_AGENT_URL || 'http://localhost:3003',
      wolAgentSecret: process.env.WOL_AGENT_SECRET || 'wolSecret',
      bootTokenSecret: process.env.BOOT_TOKEN_SECRET || 'bootSecret',
      [OS.UBUNTU]: +process.env.GRUB_UBUNTU || 0,
      [OS.WINDOWS]: +process.env.GRUB_WINDOWS || 3,
    };
  }

  public createWettyOptions() {
    return {
      proxy: process.env.WETTY_PROXY_URL || '/api/wetty',
      target: process.env.WETTY_TARGET_URL || 'http://localhost:3001',
    };
  }
}
