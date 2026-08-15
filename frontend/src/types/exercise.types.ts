// src/types/exercise.types.ts
export type ExerciseCategory =
  | 'pronunciation'
  | 'vocabulary'
  | 'grammar'
  | 'comprehension'
  | 'fluency'
  | 'articulation'
  | 'phonology'
  | 'language'
  | 'social_communication'
  | 'other';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseSlide {
  name?: string;
  imageUrl?: string;
  imageKey?: string;
  audioUrl?: string;
  audioKey?: string;
  order: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  instructions: string;
  materials?: string[];
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  audioKey?: string;
  videoKey?: string;
  imageKey?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  slides?: ExerciseSlide[];
  tags?: string[];
  isActive: boolean;
  createdBy: string;
  creatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseRequest {
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  instructions: string;
  materials?: string[];
  duration?: number;
  tags?: string[];
  isActive?: boolean;
}

export interface SlideInput {
  name: string;
  imageFile: File | null;
  audioFile: File | null;
  order: number;
}

export interface CreateExerciseWithMediaRequest {
  title: string;
  description: string;
  category: ExerciseCategory;
  difficulty: ExerciseDifficulty;
  instructions: string;
  materials?: string[];
  duration?: number;
  tags?: string[];
  isActive?: boolean;
  coverImageFile?: File | null;
  videoFile?: File | null;
  slides?: SlideInput[];
}

export interface UpdateExerciseRequest {
  title?: string;
  description?: string;
  category?: ExerciseCategory;
  difficulty?: ExerciseDifficulty;
  instructions?: string;
  materials?: string[];
  duration?: number;
  tags?: string[];
  isActive?: boolean;
  coverImageKey?: string | null;
  videoKey?: string | null;
  slides?: {
    name?: string;
    imageKey?: string;
    audioKey?: string;
    imageIndex?: number;
    audioIndex?: number;
    order: number;
  }[];
}

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  category?: ExerciseCategory;
  difficulty?: ExerciseDifficulty;
  search?: string;
  isActive?: boolean;
}

export interface ExercisesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    items: Exercise[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ExerciseResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: Exercise;
}

export interface ExerciseCategoriesResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    categories: ExerciseCategory[];
  };
}

export interface ExerciseWithMediaResponse {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  data: {
    exercise: Exercise;
    fileInfo: {
      totalFiles: number;
      coverImage: 'Uploaded' | 'Not provided';
      video: 'Uploaded' | 'Not provided';
      slidesCount: number;
      imagesUploaded: number;
      audioUploaded: number;
    };
  };
}