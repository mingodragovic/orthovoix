// src/modules/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MESSAGES } from '../../constants/messages';
import { comparePassword, hashPassword, sanitizeUser } from '../../utils/helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException(MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Find a user by email without throwing an error
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find a user by reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  /**
   * Update a user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Validate ID
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    // Find the user
    const user = await this.findById(id);

    // If email is being changed, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException(MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    // Remove undefined values
    Object.keys(updateUserDto).forEach(key => {
      if (updateUserDto[key] === undefined) {
        delete updateUserDto[key];
      }
    });

    // Update the user
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Update a user's refresh token
   */
  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await this.userRepository.update(id, { refreshToken: refreshToken || undefined });
  }

  /**
   * Update a user's reset password token
   */
  async updateResetToken(
    id: string,
    token: string | null,
    expires: Date | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      resetPasswordToken: token || undefined,
      resetPasswordExpires: expires || undefined,
    });
  }

/**
 * Update a user's password - FIXED VERSION
 */

async updatePassword(id: string, newPassword: string): Promise<void> {
    // Get the user
    const user = await this.findById(id);
    
    // ✅ Set the password to the NEW plain text
    // The entity hook will hash it automatically
    user.password = newPassword;
    
    // Save the user (this triggers @BeforeUpdate)
    await this.userRepository.save(user);
    
    // Clear reset tokens
    await this.userRepository.update(id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
    });
}

/**
 * Update a user's password (Alternative using entity's @BeforeUpdate)
 * This relies on the entity's @BeforeUpdate hook
 */
async updatePasswordWithHook(id: string, newPassword: string): Promise<void> {
    // This saves the plain text and relies on @BeforeUpdate to hash it
    // Make sure your entity has the @BeforeUpdate hook!
    await this.userRepository.update(id, {
        password: newPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
    });
}
  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findOneByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error(MESSAGES.ACCOUNT_DEACTIVATED);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Sanitize user for response
   */
  sanitizeUser(user: User): any {
    return sanitizeUser(user);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepository.remove(user);
  }
}