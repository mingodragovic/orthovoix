// src/modules/notifications/entities/notification.entity.ts
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
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../interfaces/notification-type.enum';

export interface NotificationMetadata {
  appointmentId?: string;
  exerciseId?: string;
  patientId?: string;
  progressId?: string;
  reportId?: string;
  url?: string;
  [key: string]: any;
}

@Entity('notifications')
@Index(['userId', 'read'])
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  readAt?: Date;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata?: NotificationMetadata;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}