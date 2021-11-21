import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, MaxLength } from 'class-validator';
export class LoginDto {
  @ApiProperty()
  @IsString()
  @MaxLength(63)
  readonly username: string;

  @ApiProperty()
  @IsString()
  readonly password: string;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  readonly rememberMe?: boolean;
}
