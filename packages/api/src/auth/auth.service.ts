import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from 'src/config/config.service';
import { User } from './models/User.model';

@Injectable()
export class AuthService {
  private user: User;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const salt = bcryptjs.genSaltSync(10);
    const userData = configService.getUserData();

    this.user = new User();
    this.user.id = 1;
    this.user.username = userData.username;
    this.user.name = userData.name;
    this.user.password = bcryptjs.hashSync(userData.password, salt);
  }

  public getUser() {
    return this.user;
  }

  async validateUser(username: string, pass: string): Promise<User> {
    const user = this.user.username === username ? this.user : null;
    if (user) {
      const valid = await bcryptjs.compare(pass, user.password);
      if (valid) {
        const userCopy = { ...user };
        delete userCopy.password;
        return userCopy;
      }
    }
    return null;
  }

  async login(user: User, rememberMe = false) {
    const secretOptions = this.configService.createSecretOptions();
    return {
      access_token: this.jwtService.sign(
        { sub: user.id },
        {
          secret: secretOptions.secret,
          expiresIn: secretOptions.secretExpiresIn,
        },
      ),
      refresh_token: this.jwtService.sign(
        { sub: user.id, rememberMe },
        {
          secret: secretOptions.secretRefresh,
          expiresIn: rememberMe
            ? secretOptions.secretRefreshRememberExpiresIn
            : secretOptions.secretRefreshExpiresIn,
        },
      ),
    };
  }

  async refresh(token: string, user: User) {
    const payload = this.jwtService.decode(token);
    if (typeof payload == 'object') {
      return await this.login(user, payload.rememberMe);
    }
    throw new NotFoundException();
  }
}
