// src/modules/storage/storage.controller.ts
import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Query,
  BadRequestException,
  Body,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/interfaces/user-roles.enum';
import { ResponseDto } from '../../common/dto/response.dto';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('storage')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @Roles(UserRole.PARENT, UserRole.ORTHOPHONISTE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        folder: {
          type: 'string',
          default: 'uploads',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'File uploaded successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.CREATED },
            message: { example: 'File uploaded successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/storage/upload' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                key: { type: 'string' },
                bucket: { type: 'string' },
                duration: { type: 'number' }
              }
            }
          }
        }
      ]
    }
  })
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('folder') folder: string = 'uploads',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const result = await this.storageService.uploadFile(file, folder);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'File uploaded successfully',
      data: result,
    });
  }

  @Post('upload-multiple')
  @Roles(UserRole.ORTHOPHONISTE)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({ summary: 'Upload multiple files (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        folder: {
          type: 'string',
          default: 'uploads',
        },
      },
    },
  })
  async uploadMultipleFiles(
    @UploadedFiles() files: MulterFile[],
    @Query('folder') folder: string = 'uploads',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const results = await this.storageService.uploadMultipleFiles(files, folder);
    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'Files uploaded successfully',
      data: results,
    });
  }

  @Delete(':key')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'Delete a file by key' })
  @ApiOkResponse({
    description: 'File deleted successfully',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: HttpStatus.OK },
        message: { type: 'string', example: 'File deleted successfully' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        path: { type: 'string', example: '/api/storage/123' }
      }
    }
  })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'File deleted successfully',
    });
  }

  @Get('url/:key')
  @ApiOperation({ summary: 'Get presigned URL for a file' })
  @ApiOkResponse({
    description: 'File URL retrieved successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.OK },
            message: { example: 'File URL retrieved successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/storage/url/123' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                url: { type: 'string' }
              }
            }
          }
        }
      ]
    }
  })
  async getFileUrl(@Param('key') key: string) {
    const url = await this.storageService.getFileUrl(key);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'File URL retrieved successfully',
      data: { url },
    });
  }

  @Get('list')
  @Roles(UserRole.ORTHOPHONISTE)
  @ApiOperation({ summary: 'List files in bucket' })
  async listFiles(@Query('prefix') prefix: string = '') {
    const files = await this.storageService.listFiles(prefix);
    return new ResponseDto({
      statusCode: HttpStatus.OK,
      message: 'Files listed successfully',
      data: files,
    });
  }

  /**
   * Upload a voice recording (Parent or Orthophoniste)
   * Validates duration (max 10 seconds)
   */
  @Post('upload/recording')
  @Roles(UserRole.PARENT, UserRole.ORTHOPHONISTE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload a voice recording (max 10 seconds)',
    description: 'Uploads an audio recording. Duration is automatically validated (max 10 seconds).'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (webm, mp3, wav, ogg) - max 10 seconds',
        },
        patientId: { type: 'string' },
        exerciseId: { type: 'string' },
        assignmentId: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Recording uploaded successfully',
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { example: HttpStatus.CREATED },
            message: { example: 'Recording uploaded successfully' },
            timestamp: { example: '2024-01-15T10:00:00.000Z' },
            path: { example: '/api/storage/upload/recording' }
          }
        },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                key: { type: 'string' },
                bucket: { type: 'string' },
                duration: { type: 'number', example: 3.5 },
                patientId: { type: 'string' },
                exerciseId: { type: 'string' },
                assignmentId: { type: 'string' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Recording exceeds 10 seconds limit or invalid file type' 
  })
  async uploadRecording(
    @UploadedFile() file: MulterFile,
    @Body() body: { patientId: string; exerciseId: string; assignmentId: string },
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type (audio only)
    const allowedMimeTypes: string[] = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only audio files are allowed (webm, mp3, wav, ogg, aac).',
      );
    }

    // Validate file size (max 10MB for recordings)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Recording file size exceeds 10MB limit.');
    }

    const folder = `recordings/${body.patientId}/${body.exerciseId}`;
    const result = await this.storageService.uploadRecording(file, folder);

    return new ResponseDto({
      statusCode: HttpStatus.CREATED,
      message: 'Recording uploaded successfully',
      data: {
        ...result,
        patientId: body.patientId,
        exerciseId: body.exerciseId,
        assignmentId: body.assignmentId,
      },
    });
  }
}