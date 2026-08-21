// src/modules/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../interfaces/user-roles.enum';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PARENT })
  role!: UserRole;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiProperty({ required: false, description: 'Storage key for the avatar image' })
  avatarKey?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ required: false, example: '2024-01-15T10:00:00.000Z' })
  lastLogin?: Date;

  @ApiProperty({ required: false, example: 'Emma' })
  childName?: string;

  @ApiProperty({ required: false, example: 'patient_1' })
  childId?: string;

  @ApiProperty({ required: false, example: 'Orthophonie Pédiatrique' })
  specialization?: string;

  @ApiProperty({ required: false, example: '12345' })
  licenseNumber?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  updatedAt!: Date;
}