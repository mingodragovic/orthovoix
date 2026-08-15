// src/modules/recordings/entities/recording.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PatientExercise } from '../../patient-exercises/entities/patient-exercise.entity';
import { RecordingStatus } from '../interfaces/recording-status.enum';

@Entity('recordings')
@Index(['patientExerciseId', 'createdAt'])
export class Recording {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientExerciseId!: string;

  @ManyToOne(() => PatientExercise)
  @JoinColumn({ name: 'patientExerciseId' })
  patientExercise!: PatientExercise;

  @Column({ type: 'text' })
  recordingUrl!: string;

  @Column({ type: 'text' })
  recordingKey!: string;

  @Column({ type: 'float', default: 0 })
  duration!: number; // Duration in seconds

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({
    type: 'enum',
    enum: RecordingStatus,
    default: RecordingStatus.PENDING,
  })
  status!: RecordingStatus;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}