import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { MESSAGES } from '../../constants/messages';
import { ResponseDto } from '../../common/dto/response.dto';
import { Throttle } from '@nestjs/throttler';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiCreatedResponse({
    description: MESSAGES.LOGIN_SUCCESS,
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 201 },
            message: { example: MESSAGES.LOGIN_SUCCESS },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/auth/login' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserResponseDto' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.INVALID_CREDENTIALS })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: MESSAGES.ACCOUNT_DEACTIVATED })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.LOGIN_SUCCESS,
      data: result,
    });
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({
    description: MESSAGES.LOGOUT_SUCCESS,
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: MESSAGES.LOGOUT_SUCCESS },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/auth/logout' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.UNAUTHORIZED })
  async logout(@Request() req) {
    await this.authService.logout(req.user.id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: MESSAGES.LOGOUT_SUCCESS,
    });
  }

  @Public()
  @Post('refresh')
  @UseGuards(RefreshAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiCreatedResponse({
    description: MESSAGES.REFRESH_SUCCESS,
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 201 },
            message: { example: MESSAGES.REFRESH_SUCCESS },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/auth/refresh' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.INVALID_REFRESH_TOKEN })
  async refresh(@Request() req, @Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(
      req.user.id,
      refreshTokenDto.refreshToken,
    );
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.REFRESH_SUCCESS,
      data: tokens,
    });
  }

  @Public()
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset OTP' })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: 'OTP sent successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/auth/forgot-password' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'If an account exists, an OTP has been sent' }
              }
            }
          }
        }
      ]
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(forgotPasswordDto.email);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: result.message || MESSAGES.FORGOT_PASSWORD_SUCCESS,
      data: result,
    });
  }

  @Public()
  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify OTP and reset password' })
  @ApiOkResponse({
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Password reset successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/auth/verify-otp' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.resetPasswordWithOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
      verifyOtpDto.newPassword,
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: result.message,
    });
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiOkResponse({
    description: MESSAGES.RESET_PASSWORD_SUCCESS,
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: MESSAGES.RESET_PASSWORD_SUCCESS },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/auth/reset-password' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.INVALID_RESET_TOKEN })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: MESSAGES.RESET_PASSWORD_SUCCESS,
    });
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: MESSAGES.PROFILE_SUCCESS,
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: MESSAGES.UNAUTHORIZED })
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.id);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: MESSAGES.PROFILE_SUCCESS,
      data: user,
    });
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new parent user' })
  @ApiCreatedResponse({
    description: MESSAGES.REGISTER_SUCCESS,
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 201 },
            message: { example: MESSAGES.REGISTER_SUCCESS },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/auth/register' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserResponseDto' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: MESSAGES.EMAIL_ALREADY_EXISTS })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation failed' })
  async register(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.register(createUserDto);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: MESSAGES.REGISTER_SUCCESS,
      data: result,
    });
  }
}