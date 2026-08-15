// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { StorageModule } from './modules/storage/storage.module';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import appConfig from './config/app.config';
import minioConfig from './config/minio.config';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { PatientExercisesModule } from './modules/patient-exercises/patient-exercises.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EmailModule } from './modules/email/email.module';
import { ProfileModule } from './modules/profile/profile.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RecordingsModule } from './modules/recordings/recordings.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig, minioConfig],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60),
            limit: configService.get<number>('THROTTLE_LIMIT', 5),
          },
        ],
      }),
    }),
    AuthModule,
    UsersModule,
    PatientsModule,

    PatientExercisesModule,
     ExercisesModule,
     ProgressModule,
     AppointmentsModule,
     NotificationsModule,
     EmailModule,
     ProfileModule,
     DashboardModule,
     RecordingsModule,
     SubmissionsModule,
         StorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}