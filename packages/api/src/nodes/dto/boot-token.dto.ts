import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class BootTokenDto {
  @ApiProperty()
  @IsJWT()
  boot_token: string;
}
