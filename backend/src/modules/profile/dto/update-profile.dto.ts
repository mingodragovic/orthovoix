// src/modules/profile/dto/update-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Dr. Sarah Johnson' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, example: 'dr.sarah@ortho.fr' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email?: string;

  @ApiProperty({ 
    required: false, 
    example: 'http://localhost:9000/orthovoix/avatars/...',
    description: 'Avatar URL (can be full URL with query parameters)'
  })
  @IsOptional()
  @IsString() // ← MUST be @IsString(), NOT @IsUrl()
  avatar?: string;

  // Parent-specific fields
  @ApiProperty({ required: false, example: 'Emma' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  childName?: string;

  // Orthophoniste-specific fields
  @ApiProperty({ required: false, example: 'Orthophonie Pédiatrique - Expert' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialization?: string;

  @ApiProperty({ required: false, example: '67890' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;
}