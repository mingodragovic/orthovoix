// src/modules/exercises/entities/exercise.entity.ts
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
import { ExerciseCategory, ExerciseDifficulty } from '../interfaces/exercise-category.enum';

export interface SlideItem {
  name?: string;        // Display name for the slide (e.g., "tomato")
  imageUrl?: string;    // Generated dynamically
  imageKey?: string;    // Storage key
  audioUrl?: string;    // Generated dynamically
  audioKey?: string;    // Storage key
  order?: number;       // Slide order
}

@Entity('exercises')
@Index(['category', 'difficulty'])
@Index(['isActive', 'createdBy'])
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: ExerciseCategory,
    default: ExerciseCategory.OTHER,
  })
  category!: ExerciseCategory;

  @Column({
    type: 'enum',
    enum: ExerciseDifficulty,
    default: ExerciseDifficulty.BEGINNER,
  })
  difficulty!: ExerciseDifficulty;

  @Column({ type: 'text' })
  instructions!: string;

  @Column({ nullable: true, type: 'jsonb' })
  materials?: string[];

  @Column({ nullable: true, type: 'int' })
  duration?: number;

  // Cover image for the exercise card (thumbnail)
  @Column({ nullable: true })
  coverImageKey?: string;

  // Single video (unchanged)
  @Column({ nullable: true })
  videoKey?: string;

  // Array of slides (image + audio pairs)
  @Column({ nullable: true, type: 'jsonb' })
  slides?: SlideItem[];

  @Column({ nullable: true, type: 'jsonb' })
  tags?: string[];

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}