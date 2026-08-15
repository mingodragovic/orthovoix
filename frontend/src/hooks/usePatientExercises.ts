// src/hooks/usePatientExercises.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getAllAssignments,
  getPatientExercises,
  getPatientProgress,
  getPatientExerciseById,
  assignExercise,
  updateExerciseStatus,
  updateExerciseProgress,
} from '@/lib/api/patient-exercises';
import type {
  AssignExerciseRequest,
  UpdateStatusRequest,
  UpdateProgressRequest,
  PatientExerciseStatus,
} from '@/types/patient-exercise.types';

export const patientExerciseKeys = {
  all: ['patient-exercises'] as const,
  allAssignments: (filters?: any) => [...patientExerciseKeys.all, 'all', filters] as const,
  byPatient: (patientId: string) => [...patientExerciseKeys.all, 'patient', patientId] as const,
  byPatientWithStatus: (patientId: string, status?: PatientExerciseStatus) => 
    [...patientExerciseKeys.byPatient(patientId), status] as const,
  progress: (patientId: string) => [...patientExerciseKeys.all, 'progress', patientId] as const,
  detail: (id: string) => [...patientExerciseKeys.all, 'detail', id] as const,
};

export function useAllAssignments(
  page?: number,
  limit?: number,
  status?: PatientExerciseStatus,
  patientId?: string,
  exerciseId?: string
) {
  return useQuery({
    queryKey: patientExerciseKeys.allAssignments({ page, limit, status, patientId, exerciseId }),
    queryFn: () => getAllAssignments(page, limit, status, patientId, exerciseId),
  });
}

export function usePatientExercises(patientId: string, status?: PatientExerciseStatus) {
  return useQuery({
    queryKey: patientExerciseKeys.byPatientWithStatus(patientId, status),
    queryFn: () => getPatientExercises(patientId, status),
    enabled: !!patientId,
  });
}

export function usePatientProgress(patientId: string) {
  return useQuery({
    queryKey: patientExerciseKeys.progress(patientId),
    queryFn: () => getPatientProgress(patientId),
    enabled: !!patientId,
  });
}

export function usePatientExercise(id: string) {
  return useQuery({
    queryKey: patientExerciseKeys.detail(id),
    queryFn: () => getPatientExerciseById(id),
    enabled: !!id,
  });
}

export function useAssignExercise() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: AssignExerciseRequest) => assignExercise(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: patientExerciseKeys.byPatient(data.patientId) });
      success(t('patientExercises.assign.success'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patientExercises.assign.error');
      error(message);
    },
  });
}

export function useUpdateExerciseStatus(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateStatusRequest) => updateExerciseStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientExerciseKeys.detail(id) });
      success(t('patientExercises.status.success'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patientExercises.status.error');
      error(message);
    },
  });
}

export function useUpdateExerciseProgress(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateProgressRequest) => updateExerciseProgress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientExerciseKeys.detail(id) });
      success(t('patientExercises.progress.success'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('patientExercises.progress.error');
      error(message);
    },
  });
}