// src/modules/storage/storage.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { randomBytes } from 'crypto';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

// Define Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  duration?: number;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private configService: ConfigService,
  ) {
    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    try {
      const exists = await this.minioClient.bucketExists(bucket);
      if (!exists) {
        await this.minioClient.makeBucket(bucket, 'us-east-1');
        // Set public read policy for the bucket
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
    }
  }

  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop() || '';
    return `${timestamp}-${random}.${extension}`;
  }

  /**
   * Get audio duration from buffer using fluent-ffmpeg
   */
  private async getAudioDuration(buffer: Buffer): Promise<number> {
    return new Promise((resolve, reject) => {
      // Save buffer to a temporary file path for ffprobe
      const tempFilePath = `/tmp/audio-${Date.now()}.webm`;
      const fs = require('fs');
      fs.writeFileSync(tempFilePath, buffer);

      ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkErr) {
          // Ignore cleanup errors
        }

        if (err) {
          console.warn('FFProbe failed:', err.message);
          reject(err);
          return;
        }
        
        const duration = metadata?.format?.duration || 0;
        resolve(duration);
      });
    });
  }

  /**
   * Validate audio duration (max 10 seconds)
   */
  async validateAudioDuration(buffer: Buffer, maxDurationSeconds: number = 10): Promise<number> {
    try {
      const duration = await this.getAudioDuration(buffer);
      
      if (duration > maxDurationSeconds) {
        throw new BadRequestException(
          `Audio recording exceeds maximum duration of ${maxDurationSeconds} seconds. Current duration: ${duration.toFixed(2)} seconds.`
        );
      }
      
      return duration;
    } catch (error) {
      // If we can't detect duration, proceed with upload but log warning
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Could not detect audio duration:', errorMessage);
      return 0;
    }
  }

  /**
   * Get public URL for a file
   * Uses configured public URL if available
   */
  private getPublicUrl(key: string): string {
    const publicUrl = this.configService.get<string>('minio.publicUrl');
    if (publicUrl) {
      // Ensure proper formatting
      const baseUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
      return `${baseUrl}${key}`;
    }
    
    // Fallback: build URL from components
    const endpoint = this.configService.get<string>('minio.endpoint') || 'localhost';
    const port = this.configService.get<number>('minio.port') || 9000;
    const useSSL = this.configService.get<boolean>('minio.useSSL') || false;
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    
    const protocol = useSSL ? 'https' : 'http';
    const baseUrl = `${protocol}://${endpoint}:${port}/${bucket}/`;
    return `${baseUrl}${key}`;
  }

  async uploadFile(file: MulterFile, folder: string = 'uploads'): Promise<UploadResult> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    const fileName = this.generateFileName(file.originalname);
    const key = `${folder}/${fileName}`;

    await this.minioClient.putObject(
      bucket,
      key,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
      },
    );

    // Use public URL
    const url = this.getPublicUrl(key);

    return {
      url,
      key,
      bucket,
    };
  }

  /**
   * Upload a recording with duration validation
   */
  async uploadRecording(file: MulterFile, folder: string = 'recordings'): Promise<UploadResult> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    
    const duration = await this.validateAudioDuration(file.buffer, 10);
    
    const fileName = this.generateFileName(file.originalname);
    const key = `${folder}/${fileName}`;

    await this.minioClient.putObject(
      bucket,
      key,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
        'x-amz-meta-duration': duration.toString(),
      },
    );

    // Use public URL
    const url = this.getPublicUrl(key);

    return {
      url,
      key,
      bucket,
      duration,
    };
  }

  async uploadMultipleFiles(files: MulterFile[], folder: string = 'uploads'): Promise<UploadResult[]> {
    return Promise.all(files.map(file => this.uploadFile(file, folder)));
  }

  async deleteFile(key: string): Promise<void> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    try {
      await this.minioClient.removeObject(bucket, key);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async getFileUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    // Use public URL if available
    const publicUrl = this.configService.get<string>('minio.publicUrl');
    if (publicUrl) {
      const baseUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
      return `${baseUrl}${key}`;
    }
    
    // Fallback to presigned URL
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    try {
      return await this.minioClient.presignedGetObject(bucket, key, expirySeconds);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  /**
   * Get public URL for a file (public method)
   * Use this method when you need a permanent/public URL
   */
  async getPublicFileUrl(key: string): Promise<string> {
    try {
      return this.getPublicUrl(key);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  /**
   * Get presigned URL for a file (public method)
   * Use this method when you need a temporary URL with expiration
   */
  async getPresignedFileUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    try {
      return await this.minioClient.presignedGetObject(bucket, key, expirySeconds);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async getFileMetadata(key: string): Promise<Minio.BucketItem> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    try {
      const stat = await this.minioClient.statObject(bucket, key);
      return {
        name: key,
        size: stat.size,
        etag: stat.etag || '',
        lastModified: stat.lastModified || new Date(),
      };
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async listFiles(prefix: string = ''): Promise<Minio.BucketItem[]> {
    const bucket = this.configService.get<string>('minio.bucket') || 'orthovoix';
    const objects: Minio.BucketItem[] = [];
    const stream = this.minioClient.listObjects(bucket, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        if (obj.name) {
          objects.push({
            name: obj.name,
            size: obj.size || 0,
            etag: obj.etag || '',
            lastModified: obj.lastModified || new Date(),
          });
        }
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(objects));
    });
  }
}