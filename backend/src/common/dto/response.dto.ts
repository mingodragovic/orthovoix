// src/common/dto/response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success message' })
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login' })
  path: string;

  constructor(partial: Partial<ResponseDto<T>>) {
    this.statusCode = partial.statusCode || 200;
    this.message = partial.message || 'Success';
    this.data = partial.data;
    this.path = partial.path || '';
    this.timestamp = partial.timestamp || new Date().toISOString();
  }
}

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ required: false, type: [String] })
  errors?: string[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/auth/login' })
  path: string;

  constructor(partial: Partial<ErrorResponseDto>) {
    this.statusCode = partial.statusCode || 500;
    this.message = partial.message || 'Internal server error';
    this.errors = partial.errors;
    this.path = partial.path || '';
    this.timestamp = partial.timestamp || new Date().toISOString();
  }
}