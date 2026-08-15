// src/modules/notifications/interfaces/notification-type.enum.ts
export enum NotificationType {
  // Appointment related
  APPOINTMENT = 'appointment',
  APPOINTMENT_CREATED = 'appointment-created',
  APPOINTMENT_UPDATED = 'appointment-updated',
  APPOINTMENT_CANCELLED = 'appointment-cancelled',
  APPOINTMENT_REMINDER = 'appointment-reminder',
  
  // Exercise related
  EXERCISE = 'exercise',
  EXERCISE_ASSIGNED = 'exercise-assigned',
  EXERCISE_DUE_SOON = 'exercise-due-soon',
  EXERCISE_OVERDUE = 'exercise-overdue',
  EXERCISE_COMPLETED = 'exercise-completed',
  
  // Progress related
  PROGRESS = 'progress',
  PROGRESS_UPDATED = 'progress-updated',
  PROGRESS_MILESTONE = 'progress-milestone',
  
  // Patient related
  PATIENT = 'patient',
  PATIENT_CREATED = 'patient-created',
  PATIENT_UPDATED = 'patient-updated',
  
  // System
  SYSTEM = 'system',
  REMINDER = 'reminder',
  
  // Report
  REPORT = 'report',
  REPORT_READY = 'report-ready',
}