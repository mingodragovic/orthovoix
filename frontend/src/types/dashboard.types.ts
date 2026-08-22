// src/types/dashboard.types.ts
export interface AdminDashboardResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    stats: {
      totalPatients: number;
      activePatients: number;
      inactivePatients: number;
      dischargedPatients: number;
      totalExercises: number;
      totalAssignments: number;
      completedAssignments: number;
      inProgressAssignments: number;
      overdueAssignments: number;
      upcomingAppointments: number;
      averageCompletionRate: number;
    };
    recentActivity: Array<{
      date: string;
      patientName: string;
      action: string;
      description: string;
      patientId: string;
    }>;
    patientGrowth: Array<{
      month: string;
      newPatients: number;
      totalPatients: number;
    }>;
    categoryDistribution: Array<{
      category: string;
      count: number;
      color: string;
    }>;
    weeklyCompletionRate: number;
    patientSatisfaction: number;
  };
}

export interface ParentDashboardResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    child: {
      id: string;
      firstName: string;
      lastName: string;
      age: number;
      status: string;
      avatar: string | null;
    };
    stats?: {
      totalExercises?: number;
      completedExercises?: number;
      inProgressExercises?: number;
      overdueExercises?: number;
      completionRate?: number;
      averageScore?: number;
      latestScore?: number;
      upcomingAppointments?: number;
    };
    progressTrend?: Array<{
      date: string;
      score: number;
      category: string;
    }>;
    recentExercises?: Array<{
      id: string;
      title: string;
      status: string;
      score: number | null;
      dueDate: string;
    }>;
    upcomingAppointments?: Array<{
      id: string;
      dateTime: string;
      location: string | null;
      isVirtual: boolean;
      type: string;
    }>;
    recentNotifications?: Array<{
      id: string;
      title: string;
      message: string;
      createdAt: string;
      read: boolean;
      actionUrl: string | null;
    }>;
    unreadNotifications?: number;
  };
}