// src/hooks/useSubmissions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getAllSubmissions,
  getMySubmissions,
  getPatientSubmissions,
  getSubmissionStats,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  updateSubmissionStatus,
  deleteSubmission,
} from '@/lib/api/submissions';
import type {
  SubmissionStatus,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
} from '@/types/submission.types';

export const submissionKeys = {
  all: ['submissions'] as const,
  allList: (page?: number, limit?: number, status?: SubmissionStatus, patientId?: string, exerciseId?: string) =>
    [...submissionKeys.all, 'all', { page, limit, status, patientId, exerciseId }] as const,
  my: () => [...submissionKeys.all, 'my'] as const,
  myList: (page?: number, limit?: number) =>
    [...submissionKeys.my(), { page, limit }] as const,
  patient: (patientId: string) => [...submissionKeys.all, 'patient', patientId] as const,
  patientList: (patientId: string, page?: number, limit?: number) =>
    [...submissionKeys.patient(patientId), { page, limit }] as const,
  stats: (patientId: string) => [...submissionKeys.all, 'stats', patientId] as const,
  detail: (id: string) => [...submissionKeys.all, 'detail', id] as const,
  byExercise: (exerciseId: string) => [...submissionKeys.all, 'exercise', exerciseId] as const,
};

// === QUERIES ===

export function useAllSubmissions(
  page = 1,
  limit = 10,
  status?: SubmissionStatus,
  patientId?: string,
  exerciseId?: string
) {
  return useQuery({
    queryKey: submissionKeys.allList(page, limit, status, patientId, exerciseId),
    queryFn: () => getAllSubmissions(page, limit, status, patientId, exerciseId),
  });
}

export function useMySubmissions(page = 1, limit = 10) {
  return useQuery({
    queryKey: submissionKeys.myList(page, limit),
    queryFn: () => getMySubmissions(page, limit),
  });
}

export function usePatientSubmissions(patientId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: submissionKeys.patientList(patientId, page, limit),
    queryFn: () => getPatientSubmissions(patientId, page, limit),
    enabled: !!patientId,
  });
}

export function useSubmissionStats(patientId: string) {
  return useQuery({
    queryKey: submissionKeys.stats(patientId),
    queryFn: () => getSubmissionStats(patientId),
    enabled: !!patientId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: async () => {
      const response = await getSubmissionById(id);
      // The API returns: { statusCode, message, data: { ... } }
      // We need to return the data object directly
      return response;
    },
    enabled: !!id,
  });
}

// ✅ NEW: Get submission by exercise ID
export function useSubmissionByExercise(exerciseId: string) {
  return useQuery({
    queryKey: submissionKeys.byExercise(exerciseId),
    queryFn: async () => {
      const response = await getMySubmissions(1, 100);
      const submissions = response.items || [];
      return submissions.find((s: any) => s.exerciseId === exerciseId) || null;
    },
    enabled: !!exerciseId,
  });
}

// === MUTATIONS ===

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) => createSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      queryClient.invalidateQueries({ queryKey: submissionKeys.my() });
      success(t('submissions.create.success', 'Submission created successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('submissions.create.error', 'Failed to create submission');
      error(message);
    },
  });
}

export function useUpdateSubmission(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateSubmissionRequest) => updateSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(id) });
      success(t('submissions.update.success', 'Submission updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('submissions.update.error', 'Failed to update submission');
      error(message);
    },
  });
}

export function useUpdateSubmissionStatus(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ status, reviewNotes }: { status: SubmissionStatus; reviewNotes?: string }) =>
      updateSubmissionStatus(id, status, reviewNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(id) });
      success(t('submissions.status.success', 'Status updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('submissions.status.error', 'Failed to update status');
      error(message);
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.all });
      success(t('submissions.delete.success', 'Submission deleted successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('submissions.delete.error', 'Failed to delete submission');
      error(message);
    },
  });
}