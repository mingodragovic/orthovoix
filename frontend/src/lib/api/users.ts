// src/lib/api/users.ts
import { apiClient } from './client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
  UserResponse,
  UserFilters,
} from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

const USERS_BASE = '/users';

// Get all users (Admin only)
export async function getUsers(filters?: UserFilters): Promise<UsersResponse> {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<UsersResponse>(`${USERS_BASE}${query}`);
  return response.data;
}

// Get user by ID (Admin only)
export async function getUserById(id: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`${USERS_BASE}/${id}`);
  return response.data;
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<User> {
  const response = await apiClient.get<User>(`${USERS_BASE}/profile`);
  return response.data;
}

// Create a new user (Admin only)
export async function createUser(data: CreateUserRequest): Promise<User> {
  const response = await apiClient.post<User>(USERS_BASE, data);
  return response.data;
}

// Update user (Admin only)
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
  const response = await apiClient.put<User>(`${USERS_BASE}/${id}`, data);
  return response.data;
}

// Delete user (Admin only)
export async function deleteUser(id: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(`${USERS_BASE}/${id}`);
  return response.data;
}