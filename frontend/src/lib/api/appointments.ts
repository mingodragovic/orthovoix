// src/lib/api/appointments.ts
import { apiClient } from './client';
import type {
  Appointment,
  AppointmentsResponse,
  CreateAppointmentRequest,
  SessionNoteRequest,
  UpdateAppointmentRequest,

} from '@/types/appointment.types';

const APPOINTMENTS_BASE = '/appointments';

// ============ Orthophoniste Endpoints ============

// Get all appointments (Orthophoniste only)
export async function getAllAppointments(
  page = 1,
  limit = 10,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<AppointmentsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<AppointmentsResponse>(
    `${APPOINTMENTS_BASE}?${params.toString()}`
  );
  return response.data.data;
}

// Get my appointments (Both roles)
export async function getMyAppointments(
  page = 1,
  limit = 10,
  status?: string
): Promise<AppointmentsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (status) params.append('status', status);

  const response = await apiClient.get<AppointmentsResponse>(
    `${APPOINTMENTS_BASE}/my?${params.toString()}`
  );
  return response.data.data;
}

// Get appointments for a specific patient
export async function getPatientAppointments(
  patientId: string,
  page = 1,
  limit = 10
): Promise<AppointmentsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));

  const response = await apiClient.get<AppointmentsResponse>(
    `${APPOINTMENTS_BASE}/patient/${patientId}?${params.toString()}`
  );
  return response.data.data;
}

// Get appointment by ID
export async function getAppointmentById(id: string): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(
    `${APPOINTMENTS_BASE}/${id}`
  );
  return response.data;
}

// Create appointment (Orthophoniste only)
export async function createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    APPOINTMENTS_BASE,
    data
  );
  return response.data;
}

// Update appointment (Orthophoniste only)
export async function updateAppointment(
  id: string,
  data: UpdateAppointmentRequest
): Promise<Appointment> {
  const response = await apiClient.put<Appointment>(
    `${APPOINTMENTS_BASE}/${id}`,
    data
  );
  return response.data;
}

// Delete appointment (Orthophoniste only)
export async function deleteAppointment(id: string): Promise<void> {
  await apiClient.delete(`${APPOINTMENTS_BASE}/${id}`);
}

// Add session notes (Orthophoniste only)
export async function addSessionNotes(
  id: string,
  data: SessionNoteRequest
): Promise<Appointment> {
  const response = await apiClient.post<Appointment>(
    `${APPOINTMENTS_BASE}/${id}/notes`,
    data
  );
  return response.data;
}