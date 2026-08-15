// src/modules/dashboard/dto/admin-dashboard.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDto {
  @ApiProperty({ example: 45 })
  totalPatients!: number;

  @ApiProperty({ example: 32 })
  activePatients!: number;

  @ApiProperty({ example: 8 })
  inactivePatients!: number;

  @ApiProperty({ example: 5 })
  dischargedPatients!: number;

  @ApiProperty({ example: 12 })
  totalExercises!: number;

  @ApiProperty({ example: 38 })
  totalAssignments!: number;

  @ApiProperty({ example: 15 })
  completedAssignments!: number;

  @ApiProperty({ example: 12 })
  inProgressAssignments!: number;

  @ApiProperty({ example: 6 })
  overdueAssignments!: number;

  @ApiProperty({ example: 5 })
  upcomingAppointments!: number;

  @ApiProperty({ example: 75 })
  averageCompletionRate!: number;
}

export class RecentActivityDto {
  @ApiProperty({ example: '2024-01-15T10:00:00.000Z' })
  date!: Date;

  @ApiProperty({ example: 'Emma Martin' })
  patientName!: string;

  @ApiProperty({ example: 'completed' })
  action!: string;

  @ApiProperty({ example: 'Completed exercise: Pronunciation Practice' })
  description!: string;

  @ApiProperty({ example: 'fba6f68f-f4ed-4f1a-895e-c916273e5066' })
  patientId!: string;
}

export class PatientGrowthDto {
  @ApiProperty({ example: '2024-01' })
  month!: string;

  @ApiProperty({ example: 5 })
  newPatients!: number;

  @ApiProperty({ example: 25 })
  totalPatients!: number;
}

export class CategoryDistributionDto {
  @ApiProperty({ example: 'pronunciation' })
  category!: string;

  @ApiProperty({ example: 8 })
  count!: number;

  @ApiProperty({ example: '#4CAF50' })
  color!: string;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminStatsDto })
  stats!: AdminStatsDto;

  @ApiProperty({ type: [RecentActivityDto] })
  recentActivity!: RecentActivityDto[];

  @ApiProperty({ type: [PatientGrowthDto] })
  patientGrowth!: PatientGrowthDto[];

  @ApiProperty({ type: [CategoryDistributionDto] })
  categoryDistribution!: CategoryDistributionDto[];

  @ApiProperty({ example: 85 })
  weeklyCompletionRate!: number;

  @ApiProperty({ example: 92 })
  patientSatisfaction!: number;
}