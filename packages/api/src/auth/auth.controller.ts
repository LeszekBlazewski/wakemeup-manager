import {
  Controller,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto as LoginDto } from './dto/login.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';
import { User } from './models/User.model';
import { Token } from './decorators/token.decorator';
import { AuthUser } from './decorators/auth-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: LoginDto) {
    const user = await this.service.validateUser(
      loginDTO.username,
      loginDTO.password,
    );
    if (user) {
      return await this.service.login(user, loginDTO.rememberMe);
    } else {
      throw new NotFoundException();
    }
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  async refresh(@Token() token: string, @AuthUser() user: User) {
    return await this.service.refresh(token, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@AuthUser() user: User) {
    return { ...user, password: undefined };
  }
}
