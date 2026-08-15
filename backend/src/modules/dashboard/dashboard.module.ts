// src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { PatientExercise } from '../patient-exercises/entities/patient-exercise.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Progress } from '../progress/entities/progress.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patient,
      Exercise,
      PatientExercise,
      Appointment,
      Progress,
      Notification,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}