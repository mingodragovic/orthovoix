import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { MESSAGES } from '../../constants/messages';
import { comparePassword, generateRandomString, hashPassword } from '../../utils/helpers';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
     private emailService: EmailService, 
  ) {}

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findOneByEmail(email);

      if (!user) {
        return null;
      }

      if (!user.isActive) {
        throw new UnauthorizedException(MESSAGES.ACCOUNT_DEACTIVATED);
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.usersService.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * Register a new user (parent)
   */
  async register(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const user = await this.usersService.create(createUserDto);

    return {
      user: this.usersService.sanitizeUser(user),
    };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  /**
   * Refresh tokens
   */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(MESSAGES.ACCOUNT_DEACTIVATED);
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException(MESSAGES.INVALID_REFRESH_TOKEN);
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Get expiration times from config with fallbacks
    const accessExpiration = this.configService.get<string>('jwt.accessExpiration') || '15m';
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration') || '7d';

    // Generate access token
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessExpiration as any,
    });

    // Generate refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: refreshExpiration as any,
    });

    // Store refresh token
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Forgot password - Generate and send OTP
   */
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      // Return success even if user not found for security
      return { message: 'If an account exists, an OTP has been sent' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await hashPassword(otp);
    const expires = new Date(Date.now() + 600000); // 10 minutes

    await this.usersService.updateResetToken(user.id, hashedOtp, expires);

    // Send OTP via email
    try {
      await this.emailService.sendPasswordResetOTP(
        user.email,
        user.name,
        otp,
      );
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    return { message: 'If an account exists, an OTP has been sent' };
  }

  /**
   * Verify OTP and reset password
   */
  async resetPasswordWithOTP(email: string, otp: string, newPassword: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new BadRequestException('No OTP request found. Please request a new OTP.');
    }

    // Check if OTP is expired
    if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Verify OTP
    const isValid = await comparePassword(otp, user.resetPasswordToken);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP code. Please try again.');
    }

    // Update password
    await this.usersService.updatePassword(user.id, newPassword);

    // Clear reset token
    await this.usersService.updateResetToken(user.id, null, null);

    // Invalidate all sessions
    await this.usersService.updateRefreshToken(user.id, null);

    return { message: 'Password reset successfully' };
  }


  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string) {
    // Find user by hashed token
    const users = await this.usersService.findAll();
    let foundUser: User | null = null;
    let tokenValid = false;

    for (const user of users) {
      if (user.resetPasswordToken) {
        const isValid = await comparePassword(token, user.resetPasswordToken);
        if (isValid) {
          foundUser = user;
          tokenValid = true;
          break;
        }
      }
    }

    if (!foundUser || !tokenValid) {
      throw new UnauthorizedException(MESSAGES.INVALID_RESET_TOKEN);
    }

    // Check if token is expired
    if (foundUser.resetPasswordExpires && new Date() > foundUser.resetPasswordExpires) {
      throw new UnauthorizedException(MESSAGES.INVALID_RESET_TOKEN);
    }

    // Update password
    await this.usersService.updatePassword(foundUser.id, newPassword);

    // Invalidate all sessions by clearing refresh token
    await this.usersService.updateRefreshToken(foundUser.id, null);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    return this.usersService.sanitizeUser(user);
  }
}