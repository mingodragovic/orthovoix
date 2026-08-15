// src/modules/dashboard/dto/parent-dashboard.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ChildInfoDto {
  @ApiProperty({ example: 'fba6f68f-f4ed-4f1a-895e-c916273e5066' })
  id!: string;

  @ApiProperty({ example: 'Emma' })
  firstName!: string;

  @ApiProperty({ example: 'Martin' })
  lastName!: string;

  @ApiProperty({ example: 8 })
  age!: number;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar!: string | null;
}

export class ParentStatsDto {
  @ApiProperty({ example: 10 })
  totalExercises!: number;

  @ApiProperty({ example: 5 })
  completedExercises!: number;

  @ApiProperty({ example: 3 })
  inProgressExercises!: number;

  @ApiProperty({ example: 2 })
  overdueExercises!: number;

  @ApiProperty({ example: 50 })
  completionRate!: number;

  @ApiProperty({ example: 75 })
  averageScore!: number;

  @ApiProperty({ example: 85 })
  latestScore!: number;

  @ApiProperty({ example: 3 })
  upcomingAppointments!: number;
}

export class ProgressTrendDto {
  @ApiProperty({ example: '2024-01-01' })
  date!: string;

  @ApiProperty({ example: 60 })
  score!: number;

  @ApiProperty({ example: 'pronunciation' })
  category!: string;
}

export class RecentExerciseDto {
  @ApiProperty({ example: 'assign-123' })
  id!: string;

  @ApiProperty({ example: 'Pronunciation Practice with Audio' })
  title!: string;

  @ApiProperty({ example: 'in-progress' })
  status!: string;

  @ApiProperty({ example: 75 })
  score!: number | null;

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z' })
  dueDate!: Date;
}

export class UpcomingAppointmentDto {
  @ApiProperty({ example: 'app-123' })
  id!: string;

  @ApiProperty({ example: '2024-01-20T10:00:00.000Z' })
  dateTime!: Date;

  @ApiProperty({ example: 'Clinic Room 101' })
  location!: string;

  @ApiProperty({ example: false })
  isVirtual!: boolean;

  @ApiProperty({ example: 'therapy-session' })
  type!: string;
}

export class ParentNotificationDto {
  @ApiProperty({ example: 'notif-123' })
  id!: string;

  @ApiProperty({ example: 'Appointment Reminder' })
  title!: string;

  @ApiProperty({ example: 'Emma has an appointment tomorrow at 10:00 AM' })
  message!: string;

  @ApiProperty({ example: '2024-01-19T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: false })
  read!: boolean;

  @ApiProperty({ example: '/appointments/app-123' })
  actionUrl!: string;
}

export class ParentDashboardResponseDto {
  @ApiProperty({ type: ChildInfoDto })
  child!: ChildInfoDto;

  @ApiProperty({ type: ParentStatsDto })
  stats!: ParentStatsDto;

  @ApiProperty({ type: [ProgressTrendDto] })
  progressTrend!: ProgressTrendDto[];

  @ApiProperty({ type: [RecentExerciseDto] })
  recentExercises!: RecentExerciseDto[];

  @ApiProperty({ type: [UpcomingAppointmentDto] })
  upcomingAppointments!: UpcomingAppointmentDto[];

  @ApiProperty({ type: [ParentNotificationDto] })
  recentNotifications!: ParentNotificationDto[];

  @ApiProperty({ example: 3 })
  unreadNotifications!: number;
}