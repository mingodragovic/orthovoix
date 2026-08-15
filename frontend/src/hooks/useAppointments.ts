// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getAllAppointments,
  getMyAppointments,
  getPatientAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  addSessionNotes,
} from '@/lib/api/appointments';
import type {
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  SessionNoteRequest,
} from '@/types/appointment.types';

export const appointmentKeys = {
  all: ['appointments'] as const,
  allList: (page?: number, limit?: number, status?: string, startDate?: string, endDate?: string) =>
    [...appointmentKeys.all, 'all', { page, limit, status, startDate, endDate }] as const,
  my: () => [...appointmentKeys.all, 'my'] as const,
  myList: (page?: number, limit?: number, status?: string) =>
    [...appointmentKeys.my(), { page, limit, status }] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
  patient: (patientId: string) => [...appointmentKeys.all, 'patient', patientId] as const,
  patientList: (patientId: string, page?: number, limit?: number) =>
    [...appointmentKeys.patient(patientId), { page, limit }] as const,
};

// === QUERIES ===

export function useAllAppointments(
  page = 1,
  limit = 10,
  status?: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: appointmentKeys.allList(page, limit, status, startDate, endDate),
    queryFn: () => getAllAppointments(page, limit, status, startDate, endDate),
  });
}

export function useMyAppointments(page = 1, limit = 10, status?: string) {
  return useQuery({
    queryKey: appointmentKeys.myList(page, limit, status),
    queryFn: () => getMyAppointments(page, limit, status),
  });
}

export function usePatientAppointments(patientId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: appointmentKeys.patientList(patientId, page, limit),
    queryFn: () => getPatientAppointments(patientId, page, limit),
    enabled: !!patientId,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
  });
}

// === MUTATIONS ===

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.allList() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.my() });
      success(t('appointments.createSuccess', 'Appointment created successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('appointments.createError', 'Failed to create appointment');
      error(message);
    },
  });
}

export function useUpdateAppointment(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateAppointmentRequest) => updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.allList() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      success(t('appointments.updateSuccess', 'Appointment updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('appointments.updateError', 'Failed to update appointment');
      error(message);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.allList() });
      success(t('appointments.deleteSuccess', 'Appointment deleted successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('appointments.deleteError', 'Failed to delete appointment');
      error(message);
    },
  });
}

export function useAddSessionNotes(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: SessionNoteRequest) => addSessionNotes(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      success(t('appointments.notesSuccess', 'Session notes added successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('appointments.notesError', 'Failed to add session notes');
      error(message);
    },
  });
}