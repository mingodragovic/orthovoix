// src/modules/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './interfaces/user-roles.enum';
import { MESSAGES } from '../../constants/messages';
import { ResponseDto } from '../../common/dto/response.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiCreatedResponse({
    description: MESSAGES.USER_CREATED,
    type: UserResponseDto,
  })
  @ApiResponse({ status: 409, description: MESSAGES.EMAIL_ALREADY_EXISTS })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can create users' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return new ResponseDto({
      statusCode: 201,
      message: MESSAGES.USER_CREATED,
      data: this.usersService.sanitizeUser(user),
    });
  }

  @Get()
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({
    description: MESSAGES.USERS_FETCHED,
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: 200 },
            message: { example: MESSAGES.USERS_FETCHED },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/users' }
          }
        },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/UserResponseDto' }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can view users' })
  async findAll() {
    const users = await this.usersService.findAll();
    return new ResponseDto({
      statusCode: 200,
      message: MESSAGES.USERS_FETCHED,
      data: users.map(user => this.usersService.sanitizeUser(user)),
    });
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    description: MESSAGES.PROFILE_SUCCESS,
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: MESSAGES.UNAUTHORIZED })
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return new ResponseDto({
      statusCode: 200,
      message: MESSAGES.PROFILE_SUCCESS,
      data: this.usersService.sanitizeUser(user),
    });
  }

  @Get(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiOkResponse({
    description: MESSAGES.USER_FETCHED,
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can view users' })
  @ApiResponse({ status: 404, description: MESSAGES.USER_NOT_FOUND })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return new ResponseDto({
      statusCode: 200,
      message: MESSAGES.USER_FETCHED,
      data: this.usersService.sanitizeUser(user),
    });
  }

  @Put(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiOkResponse({
    description: MESSAGES.USER_UPDATED,
    type: UserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can update users' })
  @ApiResponse({ status: 404, description: MESSAGES.USER_NOT_FOUND })
  @ApiResponse({ status: 409, description: MESSAGES.EMAIL_ALREADY_EXISTS })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return new ResponseDto({
      statusCode: 200,
      message: MESSAGES.USER_UPDATED,
      data: this.usersService.sanitizeUser(user),
    });
  }

  @Delete(':id')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiOkResponse({
    description: MESSAGES.USER_DELETED,
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: MESSAGES.USER_DELETED },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/users/123' }
      }
    }
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Only orthophonistes can delete users' })
  @ApiResponse({ status: 404, description: MESSAGES.USER_NOT_FOUND })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.delete(id);
    return new ResponseDto({
      statusCode: 200,
      message: MESSAGES.USER_DELETED,
    });
  }
}