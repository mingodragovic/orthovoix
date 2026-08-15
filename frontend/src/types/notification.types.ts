// src/types/notification.types.ts
export type NotificationType =
  | 'appointment'
  | 'appointment-created'
  | 'appointment-updated'
  | 'appointment-cancelled'
  | 'appointment-reminder'
  | 'exercise'
  | 'exercise-assigned'
  | 'exercise-due-soon'
  | 'exercise-overdue'
  | 'exercise-completed'
  | 'progress'
  | 'progress-updated'
  | 'progress-milestone'
  | 'patient'
  | 'patient-created'
  | 'patient-updated'
  | 'system'
  | 'reminder'
  | 'report'
  | 'report-ready';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  actionUrl: string | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  timeAgo: string;
}

export interface NotificationsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}