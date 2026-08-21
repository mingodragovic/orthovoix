// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
} from '@/lib/api/profile';
import type { UpdateProfileRequest, ChangePasswordRequest, Profile } from '@/types/profile.types';
import { tokenManager } from '@/utils/tokenManager';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// === QUERIES ===

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const response = await getProfile();
      // ✅ Extract the data from the API response
      // The API returns: { statusCode, message, data: { ...profile } }
      return response.data || response;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: tokenManager.hasValidSession(),
  });
}

// === MUTATIONS ===

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await updateProfile(data);
      // ✅ Extract the data from the API response
      return response.data || response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.update.success', 'Profile updated successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.update.error', 'Failed to update profile');
      error(message);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadAvatar(file);
      // ✅ Extract the data from the API response
      return response.data || response;
    },
    onMutate: () => {
      return loading(t('profile.avatar.uploading', 'Uploading avatar...'));
    },
    onSuccess: (data) => {
      toast.dismiss();
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.avatar.success', 'Avatar updated successfully'));
    },
    onError: (err: any) => {
      toast.dismiss();
      const message = err.response?.data?.message || t('profile.avatar.error', 'Failed to upload avatar');
      error(message);
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      const response = await removeAvatar();
      // ✅ Extract the data from the API response
      return response.data || response;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.avatar.remove.success', 'Avatar removed successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.avatar.remove.error', 'Failed to remove avatar');
      error(message);
    },
  });
}

export function useChangePassword() {
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
    onSuccess: () => {
      success(t('profile.password.success', 'Password changed successfully'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('profile.password.error', 'Failed to change password');
      error(message);
    },
  });
}