import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
  providers: [
    {
      provide: 'MINIO_CLIENT',
      useFactory: (configService: ConfigService) => {
        const endPoint = configService.get<string>('minio.endPoint') || 'localhost';
        const port = configService.get<number>('minio.port') || 9000;
        const useSSL = configService.get<boolean>('minio.useSSL') || false;
        const accessKey = configService.get<string>('minio.accessKey') || 'minioadmin';
        const secretKey = configService.get<string>('minio.secretKey') || 'minioadmin';

        return new Minio.Client({
          endPoint,
          port,
          useSSL,
          accessKey,
          secretKey,
        });
      },
      inject: [ConfigService],
    },
    StorageService,
  ],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}