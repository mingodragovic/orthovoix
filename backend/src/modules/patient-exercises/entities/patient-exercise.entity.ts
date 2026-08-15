// src/modules/patient-exercises/entities/patient-exercise.entity.ts
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
import { User } from '../../users/entities/user.entity';
import { PatientExerciseStatus, PriorityLevel } from '../interfaces/patient-exercise-status.enum';

export interface ProgressLog {
  date: Date;
  status: string;
  notes: string;
  score?: number;
}

export interface Performance {
  score?: number;        // 0-100
  timeTaken?: number;    // Minutes
  attempts?: number;
  feedback?: string;
}

@Entity('patient_exercises')
@Index(['patientId', 'exerciseId'])
@Index(['status', 'dueDate'])
export class PatientExercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
  assignedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assignedBy' })
  assigner!: User;

  @Column({ type: 'timestamp' })
  assignedDate!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  dueDate?: Date;

  @Column({ nullable: true, type: 'timestamp' })
  completedDate?: Date;

  @Column({
    type: 'enum',
    enum: PatientExerciseStatus,
    default: PatientExerciseStatus.ASSIGNED,
  })
  status!: PatientExerciseStatus;

  @Column({
    type: 'enum',
    enum: PriorityLevel,
    default: PriorityLevel.MEDIUM,
  })
  priority!: PriorityLevel;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true, type: 'jsonb' })
  performance?: Performance;

  @Column({ nullable: true, type: 'jsonb' })
  progressLogs?: ProgressLog[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}