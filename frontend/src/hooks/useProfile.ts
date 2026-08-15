// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatarFile,
  removeAvatar,
  validateAvatarFile,
} from '@/lib/api/profile';
import type { UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile.types';
import { tokenManager } from '@/utils/tokenManager';

export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// === QUERIES ===

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
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
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { success, error, loading } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId: string }) => {
      // Step 1: Upload file to storage
      const uploadResult = await uploadAvatarFile(file, userId);
      const avatarUrl = uploadResult.url;

      // Step 2: Get current profile from cache OR fetch it if not available
      let currentProfile = queryClient.getQueryData<Profile>(profileKeys.detail());

      // ✅ FIX: If cache is empty, fetch fresh profile
      if (!currentProfile) {
        currentProfile = await getProfile();
      }

      // Step 3: Build full update payload with ALL fields
      const updateData: UpdateProfileRequest = {
        name: currentProfile.name,
        email: currentProfile.email,
        avatar: avatarUrl,
        childName: currentProfile.childName || null,
        specialization: currentProfile.specialization || null,
        licenseNumber: currentProfile.licenseNumber || null,
      };

      // Step 4: Update profile with full payload
      return await updateProfile(updateData);
    },
    onMutate: () => {
      return loading(t('profile.avatar.uploading', 'Uploading avatar...'));
    },
    onSuccess: (data) => {
      toast.dismiss();
      queryClient.setQueryData(profileKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      success(t('profile.avatar.success', 'Avatar uploaded successfully'));
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
    mutationFn: removeAvatar,
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