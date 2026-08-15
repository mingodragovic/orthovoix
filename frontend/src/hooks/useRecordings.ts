// src/hooks/useRecordings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  uploadRecordingFile,
  createRecording,
  getRecordingsByAssignment,
  getRecordingById,
  getFreshRecordingUrl,
  reviewRecording,
  getPatientRecordings,
  deleteRecording,
  getAllPatientRecordings,
} from '@/services/recording.service';
import type {
  CreateRecordingDto,
  UpdateRecordingReviewDto,
  RecordingStatus,
} from '@/types/recording.types';
import { useRef } from 'react';

export const recordingKeys = {
  all: ['recordings'] as const,
  byAssignment: (assignmentId: string) =>
    [...recordingKeys.all, 'assignment', assignmentId] as const,
  byId: (recordingId: string) =>
    [...recordingKeys.all, 'detail', recordingId] as const,
  byPatient: (patientId: string) =>
    [...recordingKeys.all, 'patient', patientId] as const,
  byPatientPaginated: (patientId: string, page: number, limit: number) =>
    [...recordingKeys.byPatient(patientId), { page, limit }] as const,
  allRecordings: (page: number, limit: number, status?: RecordingStatus, patientId?: string, exerciseId?: string) =>
    [...recordingKeys.all, 'all', { page, limit, status, patientId, exerciseId }] as const,
};

// === QUERIES ===

export function useRecordingsByAssignment(assignmentId: string) {
  console.log('🔄 [useRecordingsByAssignment] Hook called with assignmentId:', assignmentId);

  return useQuery({
    queryKey: recordingKeys.byAssignment(assignmentId),
    queryFn: () => {
      console.log('📡 [useRecordingsByAssignment] Fetching data...');
      return getRecordingsByAssignment(assignmentId);
    },
    enabled: !!assignmentId,
  });
}

export function useRecording(recordingId: string) {
  console.log('🔄 [useRecording] Hook called with recordingId:', recordingId);

  return useQuery({
    queryKey: recordingKeys.byId(recordingId),
    queryFn: () => {
      console.log('📡 [useRecording] Fetching data...');
      return getRecordingById(recordingId);
    },
    enabled: !!recordingId,
  });
}

export function usePatientRecordings(patientId: string, page = 1, limit = 10) {
  console.log('🔄 [usePatientRecordings] Hook called with:', {
    patientId,
    page,
    limit,
  });

  return useQuery({
    queryKey: recordingKeys.byPatientPaginated(patientId, page, limit),
    queryFn: () => {
      console.log('📡 [usePatientRecordings] Fetching data...');
      return getPatientRecordings(patientId, page, limit);
    },
    enabled: !!patientId,
  });
}

export function useAllPatientRecordings(
  page = 1,
  limit = 10,
  status?: RecordingStatus,
  patientId?: string,
  exerciseId?: string
) {
  console.log('🔄 [useAllPatientRecordings] Hook called with:', {
    page,
    limit,
    status,
    patientId,
    exerciseId,
  });

  return useQuery({
    queryKey: recordingKeys.allRecordings(page, limit, status, patientId, exerciseId),
    queryFn: () => {
      console.log('📡 [useAllPatientRecordings] Fetching data...');
      return getAllPatientRecordings(page, limit, status, patientId, exerciseId);
    },
  });
}

export function useFreshRecordingUrl(recordingId: string) {
  console.log('🔄 [useFreshRecordingUrl] Hook called with recordingId:', recordingId);

  return useQuery({
    queryKey: [...recordingKeys.byId(recordingId), 'url'],
    queryFn: () => {
      console.log('📡 [useFreshRecordingUrl] Fetching data...');
      return getFreshRecordingUrl(recordingId);
    },
    enabled: !!recordingId,
    staleTime: 6 * 60 * 60 * 1000,
  });
}

// === MUTATIONS ===

export function useUploadRecording() {
  const { success, error } = useToast();
  const { t } = useTranslation();
  const toastIdRef = useRef<string | number | undefined>(undefined);

  console.log('🔄 [useUploadRecording] Hook initialized');

  return useMutation({
    mutationFn: ({
      file,
      patientId,
      exerciseId,
      assignmentId,
    }: {
      file: Blob;
      patientId: string;
      exerciseId: string;
      assignmentId: string;
    }) => {
      console.log('📡 [useUploadRecording] Mutation called with:', {
        patientId,
        exerciseId,
        assignmentId,
        fileSize: file.size,
      });
      return uploadRecordingFile(file, patientId, exerciseId, assignmentId);
    },
    onMutate: () => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
      }
      toastIdRef.current = toast.loading(t('recordings.uploading', 'Uploading recording...'));
      return toastIdRef.current;
    },
    onSuccess: () => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      success(t('recordings.uploaded', 'Recording uploaded successfully!'));
    },
    onError: (err: any) => {
      if (toastIdRef.current !== undefined) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      const message = err.response?.data?.message || t('recordings.uploadError', 'Failed to upload recording');
      error(message);
    },
  });
}

export function useCreateRecording() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  console.log('🔄 [useCreateRecording] Hook initialized');

  return useMutation({
    mutationFn: ({
      assignmentId,
      data,
    }: {
      assignmentId: string;
      data: CreateRecordingDto;
    }) => {
      console.log('📡 [useCreateRecording] Mutation called with:', {
        assignmentId,
        data,
      });
      return createRecording(assignmentId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: recordingKeys.byAssignment(data.patientExerciseId),
      });
      success(t('recordings.saved', 'Recording saved successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('recordings.saveError', 'Failed to save recording');
      error(message);
    },
  });
}

export function useReviewRecording() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  console.log('🔄 [useReviewRecording] Hook initialized');

  return useMutation({
    mutationFn: ({
      recordingId,
      data,
    }: {
      recordingId: string;
      data: UpdateRecordingReviewDto;
    }) => {
      console.log('📡 [useReviewRecording] Mutation called with:', {
        recordingId,
        data,
      });
      return reviewRecording(recordingId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: recordingKeys.byId(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: recordingKeys.byPatient(data.patientExerciseId),
      });
      success(t('recordings.reviewed', 'Recording reviewed successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('recordings.reviewError', 'Failed to review recording');
      error(message);
    },
  });
}

export function useDeleteRecording() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  console.log('🔄 [useDeleteRecording] Hook initialized');

  return useMutation({
    mutationFn: (recordingId: string) => {
      console.log('📡 [useDeleteRecording] Mutation called with recordingId:', recordingId);
      return deleteRecording(recordingId);
    },
    onSuccess: (_, recordingId) => {
      queryClient.invalidateQueries({
        queryKey: recordingKeys.byId(recordingId),
      });
      success(t('recordings.deleted', 'Recording deleted successfully!'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('recordings.deleteError', 'Failed to delete recording');
      error(message);
    },
  });
}