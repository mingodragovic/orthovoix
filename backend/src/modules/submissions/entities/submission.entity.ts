// src/modules/submissions/entities/submission.entity.ts
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
import { Patient } from '../../patients/entities/patient.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { PatientExercise } from '../../patient-exercises/entities/patient-exercise.entity';
import { User } from '../../users/entities/user.entity';
import { SubmissionStatus } from '../interfaces/submission-status.enum';

export interface RecordingAnswer {
  slideIndex: number;
  recordedAudioKey: string;
  recordedAudioUrl?: string;
  duration?: number;
  notes?: string;
}

export interface SubmissionMetadata {
  deviceInfo?: string;
  browserInfo?: string;
  ipAddress?: string;
  submittedAt: Date;
}

@Entity('submissions')
@Index(['patientId', 'exerciseId'])
@Index(['patientExerciseId'])
@Index(['status', 'submittedAt'])
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  patientExerciseId!: string;

  @ManyToOne(() => PatientExercise)
  @JoinColumn({ name: 'patientExerciseId' })
  patientExercise!: PatientExercise;

  @Column({ type: 'uuid' })
  patientId!: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column({ type: 'uuid' })
  exerciseId!: string;

  @ManyToOne(() => Exercise)
  @JoinColumn({ name: 'exerciseId' })
  exercise!: Exercise;

  @Column({ type: 'uuid' })
  submittedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submittedBy' })
  submitter!: User;

  @Column({ type: 'jsonb', nullable: true })
  answers?: RecordingAnswer[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: SubmissionMetadata;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status!: SubmissionStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  submittedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedBy' })
  reviewer?: User;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}