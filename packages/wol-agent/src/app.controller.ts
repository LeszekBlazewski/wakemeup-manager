import {
  BadRequestException,
  Body,
  Controller,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { ConfigService } from './config/config.service';
import { TokenPayload } from './dto/token.dto';
import { WakeDto } from './dto/wake.dto';
import wol from 'wol';

@Controller('/wake')
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Post()
  async wake(@Body() wakeDto: WakeDto) {
    try {
      const payload = plainToClass(TokenPayload, this.validate(wakeDto));
      const errors = await validate(payload);
      if (errors.length) throw new BadRequestException(errors);

      wol.wake(payload.mac);
      this.logger.log(`Woken ${payload.mac}`);
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        this.logger.error(e);
        throw new UnauthorizedException();
      } else throw e;
    }
  }

  private validate(wakeDto: WakeDto) {
    return this.jwtService.verify(wakeDto.wake_token, {
      secret: this.configService.createSecretOptions().secret,
    });
  }
}
