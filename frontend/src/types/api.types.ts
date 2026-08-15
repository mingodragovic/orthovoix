// src/types/api.types.ts

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data?: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

export type Role = 'orthophoniste' | 'parent';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}