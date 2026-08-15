// src/modules/patient-exercises/patient-exercises.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientExercisesController } from './patient-exercises.controller';
import { PatientExercisesService } from './patient-exercises.service';
import { PatientExercise } from './entities/patient-exercise.entity';
import { PatientsModule } from '../patients/patients.module';
import { ExercisesModule } from '../exercises/exercises.module';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientExercise]),
    PatientsModule,
    ExercisesModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [PatientExercisesController],
  providers: [PatientExercisesService],
  exports: [PatientExercisesService],
})
export class PatientExercisesModule {}