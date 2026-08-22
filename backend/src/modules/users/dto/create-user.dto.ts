// src/modules/users/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  Matches,
  IsUUID,
  IsDate,
} from 'class-validator';
import { UserRole } from '../interfaces/user-roles.enum';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must be at least 8 characters with 1 number, 1 uppercase, and 1 lowercase letter',
  })
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PARENT })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ required: false, description: 'Storage key for the avatar image' })
  @IsOptional()
  @IsString()
  avatarKey?: string;

  @ApiProperty({ required: false, example: 'Emma' })
  @IsOptional()
  @IsString()
  childName?: string;

  @ApiProperty({ required: false, example: '2018-05-15' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  childDateOfBirth?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  childId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}