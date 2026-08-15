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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseDto } from '../../common/dto/response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

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
  console.log('=========================================');
  console.log('📝 PROFILE UPDATE REQUEST');
  console.log('=========================================');
  console.log('📝 Received DTO:', JSON.stringify(updateProfileDto, null, 2));
  console.log('📝 Avatar URL:', updateProfileDto.avatar);
  console.log('=========================================');
  
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