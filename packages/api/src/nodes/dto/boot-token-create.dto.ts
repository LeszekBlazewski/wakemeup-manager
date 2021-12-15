import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsBoolean,
  MinLength,
  IsOptional,
  IsIP,
  ValidateIf,
} from 'class-validator';
import { OS } from '../interfaces/NodeState.interfaces';

export class BootTokenCreateDto {
  @ApiProperty()
  @IsEnum(OS)
  os: OS;

  @ApiProperty()
  @IsISO8601()
  expiresAt: string;

  @ApiProperty()
  @IsBoolean()
  changePassword: boolean;

  @ApiProperty()
  @MinLength(8)
  @IsOptional()
  @ValidateIf((o) => o.changePassword)
  password?: string;

  @ApiProperty()
  @IsIP()
  host: string;
}
