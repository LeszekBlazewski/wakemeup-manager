import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class WakeDto {
  @IsString()
  @ApiProperty()
  wake_token: string;
}
