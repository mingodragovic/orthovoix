// src/modules/appointments/interfaces/appointment-status.enum.ts
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export enum AppointmentType {
  INITIAL_ASSESSMENT = 'initial-assessment',
  FOLLOW_UP = 'follow-up',
  THERAPY_SESSION = 'therapy-session',
  PROGRESS_REVIEW = 'progress-review',
  OTHER = 'other',
}