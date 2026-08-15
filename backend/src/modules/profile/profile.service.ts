// src/modules/profile/profile.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from '../../utils/helpers';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/interfaces/user-roles.enum';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.usersService.findById(userId);

    // If email is being changed, check if it's already taken
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.usersService.findOneByEmail(
        updateProfileDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Email is already in use by another account');
      }
    }

    // Role-specific validation
    if (user.role === UserRole.PARENT) {
      if (updateProfileDto.specialization || updateProfileDto.licenseNumber) {
        throw new ForbiddenException('Parents cannot update professional information');
      }
    }

    if (user.role === UserRole.ORTHOPHONISTE) {
      if (updateProfileDto.childName) {
        throw new ForbiddenException('Orthophonistes cannot update child name');
      }
    }

    // Remove undefined values
    const updateData: any = {};
    Object.keys(updateProfileDto).forEach((key) => {
      if (updateProfileDto[key as keyof UpdateProfileDto] !== undefined) {
        updateData[key] = updateProfileDto[key as keyof UpdateProfileDto];
      }
    });

    // If avatar is an empty string, treat it as undefined (keep existing)
    if (updateData.avatar === '') {
      delete updateData.avatar;
    }

    console.log('📝 Updating profile with:', updateData);

    Object.assign(user, updateData);
    return this.usersService.update(userId, updateData);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);

    // Verify current password
    const isPasswordValid = await comparePassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    await this.usersService.updatePassword(userId, changePasswordDto.newPassword);
  }

  /**
   * Remove avatar
   */
  async removeAvatar(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    user.avatar = undefined;
    return this.usersService.update(userId, { avatar: undefined });
  }

  /**
   * Sanitize user for response
   */
  sanitizeUser(user: User): any {
    return this.usersService.sanitizeUser(user);
  }
}