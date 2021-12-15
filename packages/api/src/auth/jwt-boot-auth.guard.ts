import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtBootAuthGuard extends AuthGuard('jwt-boot') {}
