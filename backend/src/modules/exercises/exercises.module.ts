// src/modules/exercises/exercises.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { Exercise } from './entities/exercise.entity';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise]),
    UsersModule,
    StorageModule,
   ],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}