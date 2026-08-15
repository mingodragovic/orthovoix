// src/types/appointment.types.ts
export type AppointmentType =
  | 'initial-assessment'
  | 'follow-up'
  | 'therapy-session'
  | 'progress-review'
  | 'other';

export type AppointmentStatus =
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface SessionNote {
  date: string;
  notes: string;
  duration?: number;
  topics?: string[];
  progress?: string;
  nextSteps?: string;
}

export interface SessionNoteRequest {
  notes: string;
  duration?: number;
  topics?: string[];
  progress?: string;
  nextSteps?: string;
}
export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  orthophonisteId: string;
  orthophonisteName: string;
  dateTime: string;
  duration: number;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  sessionNotes: SessionNote[] | null;
  cancellationReason: string | null;
  location: string | null;
  meetingLink: string | null;
  isVirtual: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  dateTime: string;
  duration: number;
  type: AppointmentType;
  notes?: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
}

export interface UpdateAppointmentRequest {
  dateTime?: string;
  duration?: number;
  type?: AppointmentType;
  status?: AppointmentStatus;
  notes?: string;
  location?: string;
  isVirtual?: boolean;
  meetingLink?: string;
  cancellationReason?: string;
}

export interface AppointmentsResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Appointment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}