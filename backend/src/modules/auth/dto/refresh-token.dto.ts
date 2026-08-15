import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_string' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}