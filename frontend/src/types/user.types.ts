// src/types/user.types.ts
import { Role } from './api.types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Parent specific
  childName?: string;
  childId?: string;
  // Orthophoniste specific
  specialization?: string;
  licenseNumber?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar?: string;
  childName?: string;
  childId?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: Role;
  avatar?: string;
  isActive?: boolean;
  childName?: string;
  childId?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface UsersResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: User[];
}

export interface UserResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: User;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}