// src/modules/submissions/submissions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { Submission } from './entities/submission.entity';
import { PatientsModule } from '../patients/patients.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { PatientExercisesModule } from '../patient-exercises/patient-exercises.module';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    PatientsModule,
    ExercisesModule,
    PatientExercisesModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}