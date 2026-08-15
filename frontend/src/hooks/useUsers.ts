// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '@/lib/api/users';
import type { UserFilters, CreateUserRequest, UpdateUserRequest } from '@/types/user.types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// === QUERIES ===

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

// === MUTATIONS ===

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      success(t('users.create.success', {}));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('users.create.error', {});
      error(message);
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      success(t('users.update.success', {}));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('users.update.error', {});
      error(message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      success(t('users.delete.success', {}));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('users.delete.error', {});
      error(message);
    },
  });
}