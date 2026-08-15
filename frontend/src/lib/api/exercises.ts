// src/lib/api/exercises.ts
import { apiClient } from './client';
import type {
  Exercise,
  CreateExerciseRequest,
  CreateExerciseWithMediaRequest,
  UpdateExerciseRequest,
  ExerciseFilters,
  ExercisesResponse,
  ExerciseResponse,
  ExerciseCategoriesResponse,
  ExerciseWithMediaResponse,
} from '@/types/exercise.types';
import type { ApiResponse } from '@/types/api.types';

const EXERCISES_BASE = '/exercises';

// Get all exercises with filters
export async function getExercises(filters?: ExerciseFilters): Promise<ExercisesResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', String(filters.page));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.category) params.append('category', filters.category);
  if (filters?.difficulty) params.append('difficulty', filters.difficulty);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ExercisesResponse>(`${EXERCISES_BASE}${query}`);
  return response.data;
}

// Get exercise categories
export async function getExerciseCategories(): Promise<ExerciseCategoriesResponse> {
  const response = await apiClient.get<ExerciseCategoriesResponse>(`${EXERCISES_BASE}/categories`);
  return response.data;
}

// Search exercises
export async function searchExercises(q: string, page?: number, limit?: number): Promise<ExercisesResponse> {
  const params = new URLSearchParams();
  params.append('q', q);
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.get<ExercisesResponse>(`${EXERCISES_BASE}/search${query}`);
  return response.data;
}

// Get exercise by ID
export async function getExerciseById(id: string): Promise<ExerciseResponse> {
  const response = await apiClient.get<ExerciseResponse>(`${EXERCISES_BASE}/${id}`);
  return response.data;
}

// Create exercise with media (multipart/form-data)

export async function createExerciseWithMedia(
  data: CreateExerciseWithMediaRequest
): Promise<ExerciseWithMediaResponse> {
  const formData = new FormData();
  
  // Append all text fields
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);
  formData.append('difficulty', data.difficulty);
  formData.append('instructions', data.instructions);
  
  if (data.duration !== undefined && data.duration !== null) {
    formData.append('duration', String(data.duration));
  }
  
  const isActive = data.isActive !== undefined ? data.isActive : true;
  formData.append('isActive', String(isActive));
  
  if (data.materials && data.materials.length > 0) {
    formData.append('materials', JSON.stringify(data.materials));
  }
  
  if (data.tags && data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }
  
  // Collect all files
  const files: File[] = [];
  
  // Track indices
  let coverImageIndex = -1;
  let videoIndex = -1;
  const slidesData: { name: string; imageIndex: number; audioIndex: number; order: number }[] = [];

  // 1. Add cover image first if exists
  if (data.coverImageFile) {
    coverImageIndex = files.length;
    files.push(data.coverImageFile);
  }

  // 2. Process slides - add images and audios
  if (data.slides && data.slides.length > 0) {
    for (let i = 0; i < data.slides.length; i++) {
      const slide = data.slides[i];
      let imageIndex = -1;
      let audioIndex = -1;

      // Add image file if exists
      if (slide.imageFile) {
        imageIndex = files.length;
        files.push(slide.imageFile);
      }

      // Add audio file if exists
      if (slide.audioFile) {
        audioIndex = files.length;
        files.push(slide.audioFile);
      }

      // ✅ Include the name in the slides data
      slidesData.push({
        name: slide.name?.trim() || `Slide ${i + 1}`,
        imageIndex: imageIndex,
        audioIndex: audioIndex,
        order: i,
      });
    }
  }

  // 3. Add video last if exists
  if (data.videoFile) {
    videoIndex = files.length;
    files.push(data.videoFile);
  }

  // Append files array
  files.forEach((file) => {
    formData.append('files', file);
  });

  // Append indices
  if (coverImageIndex >= 0) {
    formData.append('coverImageIndex', String(coverImageIndex));
  }

  if (videoIndex >= 0) {
    formData.append('videoIndex', String(videoIndex));
  }

  // ✅ Append slides as JSON string with names
  if (slidesData.length > 0) {
    formData.append('slides', JSON.stringify(slidesData));
  }

  const response = await apiClient.post<ExerciseWithMediaResponse>(
    `${EXERCISES_BASE}/with-media`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// Update exercise (supports media updates via keys)
export async function updateExercise(id: string, data: UpdateExerciseRequest): Promise<Exercise> {
  const response = await apiClient.put<Exercise>(`${EXERCISES_BASE}/${id}`, data);
  return response.data;
}

// Delete exercise (soft delete)
export async function deleteExercise(id: string): Promise<ApiResponse> {
  const response = await apiClient.delete<ApiResponse>(`${EXERCISES_BASE}/${id}`);
  return response.data;
}