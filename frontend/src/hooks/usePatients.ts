// src/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getPatients,
  getMyPatients,
  getMyChild,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientExercises,
  getPatientProgress,
} from '@/lib/api/patients';
import type { PatientFilters, CreatePatientRequest, UpdatePatientRequest } from '@/types/patient.types';
import { useAuth } from '@/providers/AuthProvider';
import { Role } from '@/types/api.types';

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: PatientFilters) => [...patientKeys.lists(), filters] as const,
  myPatients: () => [...patientKeys.all, 'my-patients'] as const,
  myPatientsList: (filters?: PatientFilters) => [...patientKeys.myPatients(), filters] as const,
  myChild: () => [...patientKeys.all, 'my-child'] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  exercises: (id: string) => [...patientKeys.detail(id), 'exercises'] as const,
  progress: (id: string) => [...patientKeys.detail(id), 'progress'] as const,
};

// === QUERIES ===

// Get all patients (Orthophoniste only)
export function usePatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: patientKeys.list(filters),
    queryFn: () => getPatients(filters),
  });
}

// Get my patients (Orthophoniste only)
export function useMyPatients(filters?: PatientFilters) {
  return useQuery({
    queryKey: patientKeys.myPatientsList(filters),
    queryFn: () => getMyPatients(filters),
  });
}

// Get my child (Parent only)
export function useMyChild() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: patientKeys.myChild(),
    queryFn: getMyChild,
    enabled: user?.role === 'parent',
  });
}

// Get patient by ID
export function usePatient(id: string) {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
}

// Get patient exercises
export function usePatientExercises(id: string) {
  return useQuery({
    queryKey: patientKeys.exercises(id),
    queryFn: () => getPatientExercises(id),
    enabled: !!id,
  });
}

// Get patient progress
export function usePatientProgress(id: string) {
  return useQuery({
    queryKey: patientKeys.progress(id),
    queryFn: () => getPatientProgress(id),
    enabled: !!id,
  });
}

// === MUTATIONS ===

// Create patient
export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      success(t('patients.create.success', 'Patient created successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patients.create.error', 'Failed to create patient');
      error(message);
    },
  });
}

// Update patient
export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdatePatientRequest) => updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) });
      success(t('patients.update.success', 'Patient updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patients.update.error', 'Failed to update patient');
      error(message);
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      success(t('patients.delete.success', 'Patient deleted successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patients.delete.error', 'Failed to delete patient');
      error(message);
    },
  });
}