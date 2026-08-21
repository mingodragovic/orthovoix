// src/modules/profile/profile.controller.ts
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/dto/response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { StorageService } from '../storage/storage.service';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    const user = await this.profileService.getProfile(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: this.profileService.sanitizeUser(user),
    });
  }

  @Put()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Role-specific restrictions' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const user = await this.profileService.updateProfile(
      req.user.id,
      updateProfileDto,
    );

    return new ResponseDto({
      statusCode: 200,
      message: 'Profile updated successfully',
      data: this.profileService.sanitizeUser(user),
    });
  }

  /**
   * Upload avatar using multipart/form-data
   * This is the dedicated endpoint for avatar uploads
   */
  @Put('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload or update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, GIF, WEBP) - max 5MB',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Avatar updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.',
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    // Upload to storage
    const folder = `avatars/${req.user.id}`;
    const uploadResult = await this.storageService.uploadFile(file, folder);

    // Update profile with avatar key
    const user = await this.profileService.updateAvatar(
      req.user.id,
      uploadResult.key,
    );

    return new ResponseDto({
      statusCode: 200,
      message: 'Avatar updated successfully',
      data: this.profileService.sanitizeUser(user),
    });
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Password changed successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/profile/password' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Current password is incorrect or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    await this.profileService.changePassword(req.user.id, changePasswordDto);
    return new ResponseDto({
      statusCode: 200,
      message: 'Password changed successfully',
    });
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiOkResponse({
    description: 'Avatar removed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAvatar(@Request() req) {
    const user = await this.profileService.removeAvatar(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: 'Avatar removed successfully',
      data: this.profileService.sanitizeUser(user),
    });
  }
}