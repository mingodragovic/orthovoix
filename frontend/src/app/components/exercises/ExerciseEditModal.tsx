// src/components/exercises/ExerciseEditModal.tsx
import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExercise, useUpdateExercise, useExerciseCategories } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle, Upload, X, Music, Image as ImageIcon, Video, Plus, Trash2, GripVertical } from 'lucide-react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { FormModal } from '../ui/FormModal';

interface ExerciseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  onSuccess?: () => void;
}

const MAX_SLIDES = 10;

const editExerciseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'pronunciation', 'vocabulary', 'grammar', 'comprehension', 
    'fluency', 'articulation', 'phonology', 'language', 
    'social_communication', 'other'
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters'),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean(),
  slides: z.array(z.object({
    name: z.string().optional(),
    imageKey: z.string().optional(),
    audioKey: z.string().optional(),
    order: z.number(),
    // For new uploads during edit
    newImageFile: z.any().nullable(),
    newAudioFile: z.any().nullable(),
    // Track if slide should be deleted
    _delete: z.boolean().default(false),
  })).default([]),
});

type EditExerciseFormValues = z.infer<typeof editExerciseSchema>;

export function ExerciseEditModal({ isOpen, onClose, exerciseId, onSuccess }: ExerciseEditModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useExercise(exerciseId);
  const updateExercise = useUpdateExercise(exerciseId);
  const { data: categoriesData } = useExerciseCategories();
  
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingCoverImageKey, setExistingCoverImageKey] = useState<string | null>(null);
  const [existingVideoKey, setExistingVideoKey] = useState<string | null>(null);
  
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [materialInput, setMaterialInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<EditExerciseFormValues>({
    resolver: zodResolver(editExerciseSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      category: 'pronunciation',
      difficulty: 'beginner',
      instructions: '',
      duration: undefined,
      materials: [],
      tags: [],
      isActive: true,
      slides: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'slides',
  });

  const materials = watch('materials') || [];
  const tags = watch('tags') || [];
  const slides = watch('slides') || [];

  const categories = categoriesData?.data?.categories || [];

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      const exercise = data.data;
      const existingSlides = exercise.slides?.map((slide, index) => ({
        name: slide.name || '',
        imageKey: slide.imageKey || '',
        audioKey: slide.audioKey || '',
        order: index,
        newImageFile: null,
        newAudioFile: null,
        _delete: false,
      })) || [];

      reset({
        title: exercise.title,
        description: exercise.description,
        category: exercise.category,
        difficulty: exercise.difficulty,
        instructions: exercise.instructions,
        duration: exercise.duration,
        materials: exercise.materials || [],
        tags: exercise.tags || [],
        isActive: exercise.isActive,
        slides: existingSlides,
      });

      setExistingCoverImageKey(exercise.coverImageKey || null);
      setExistingVideoKey(exercise.videoKey || null);
    }
  }, [data, reset]);

  const addMaterial = () => {
    if (materialInput.trim()) {
      setValue('materials', [...materials, materialInput.trim()]);
      setMaterialInput('');
    }
  };

  const removeMaterial = (index: number) => {
    setValue('materials', materials.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', tags.filter((_, i) => i !== index));
  };

  const handleMaterialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMaterial();
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const removeFile = (setFile: (file: File | null) => void) => {
    setFile(null);
  };

  const addSlide = () => {
    if (slides.length >= MAX_SLIDES) {
      return;
    }
    append({
      name: '',
      imageKey: '',
      audioKey: '',
      order: slides.length,
      newImageFile: null,
      newAudioFile: null,
      _delete: false,
    });
  };

  const removeSlide = (index: number) => {
    const currentSlides = watch('slides');
    // If the slide has an imageKey or audioKey (existing slide), mark for deletion
    if (currentSlides[index]?.imageKey || currentSlides[index]?.audioKey) {
      setValue(`slides.${index}._delete`, true);
    } else {
      remove(index);
    }
  };

  const moveSlide = (from: number, to: number) => {
    move(from, to);
  };

  const handleSlideFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'newImageFile' | 'newAudioFile'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(`slides.${index}.${field}`, file);
    }
  };

  const removeSlideFile = (index: number, field: 'newImageFile' | 'newAudioFile') => {
    setValue(`slides.${index}.${field}`, null);
  };

  const onSubmit = async (data: EditExerciseFormValues) => {
    try {
      // Filter out deleted slides
      const validSlides = data.slides
        .filter(slide => !slide._delete)
        .map((slide, index) => ({
          name: slide.name,
          imageKey: slide.imageKey,
          audioKey: slide.audioKey,
          imageIndex: undefined, // Not used in update
          audioIndex: undefined, // Not used in update
          order: index,
        }));

      // Build update payload
      const updatePayload: any = {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        instructions: data.instructions,
        duration: data.duration,
        materials: data.materials,
        tags: data.tags,
        isActive: data.isActive,
        slides: validSlides,
      };

      // Handle cover image
      if (coverImageFile) {
        // Need to upload new cover image via separate endpoint or keep existing
        // For now, keep existing if no new file
        updatePayload.coverImageKey = existingCoverImageKey;
      } else {
        updatePayload.coverImageKey = existingCoverImageKey;
      }

      // Handle video
      if (videoFile) {
        updatePayload.videoKey = existingVideoKey;
      } else {
        updatePayload.videoKey = existingVideoKey;
      }

      await updateExercise.mutateAsync(updatePayload);

      // Clear files on success
      setCoverImageFile(null);
      setVideoFile(null);
      setMaterialInput('');
      setTagInput('');
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Exercise update failed:', error);
    }
  };

  const handleClose = () => {
    setCoverImageFile(null);
    setVideoFile(null);
    setMaterialInput('');
    setTagInput('');
    reset();
    onClose();
  };

  if (isLoading) {
    return (
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSubmit={() => {}}
        title={t('exercises.edit.title', 'Edit Exercise')}
        isLoading={true}
      >
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </FormModal>
    );
  }

  const exercise = data?.data;
  const hasCoverImage = exercise?.coverImageUrl || coverImageFile;
  const hasVideo = exercise?.videoUrl || videoFile;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('exercises.edit.title', 'Edit Exercise')}
      submitText={t('exercises.edit.submit', 'Update Exercise')}
      isLoading={updateExercise.isPending}
      isSubmitDisabled={!isValid || !isDirty || updateExercise.isPending}
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.title')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.title ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.description')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.description ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.category')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`exercises.category.${cat}`)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.category.message}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.difficulty')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('difficulty')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            >
              <option value="beginner">{t('exercises.difficulty.beginner')}</option>
              <option value="intermediate">{t('exercises.difficulty.intermediate')}</option>
              <option value="advanced">{t('exercises.difficulty.advanced')}</option>
            </select>
            {errors.difficulty && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.duration')}
          </label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.duration ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.duration && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.duration.message}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.instructions')} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('instructions')}
            rows={4}
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.instructions ? 'border-2 border-red-400 focus:ring-red-400/30' : 'focus:ring-2 focus:ring-primary/30'
            }`}
            disabled={updateExercise.isPending}
          />
          {errors.instructions && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={14} /> {errors.instructions.message}
            </p>
          )}
        </div>

        {/* Materials */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.materials')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {materials.map((material, index) => (
              <span key={index} className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-lg text-sm">
                {material}
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={materialInput}
              onChange={(e) => setMaterialInput(e.target.value)}
              onKeyDown={handleMaterialKeyDown}
              placeholder={t('exercises.edit.enterMaterial')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            />
            <button
              type="button"
              onClick={addMaterial}
              disabled={!materialInput.trim() || updateExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.tags')}
            <span className="text-xs text-muted-foreground ml-2">
              {t('exercises.tags.hint')}
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={t('exercises.edit.enterTag')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={updateExercise.isPending}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || updateExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('exercises.tags.examples')}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.status')}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register('isActive')}
                value="true"
                className="w-4 h-4 text-primary"
                disabled={updateExercise.isPending}
              />
              <span className="text-sm">{t('exercises.active')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                {...register('isActive')}
                value="false"
                className="w-4 h-4 text-primary"
                disabled={updateExercise.isPending}
              />
              <span className="text-sm">{t('exercises.inactive')}</span>
            </label>
          </div>
        </div>

        {/* Cover Image & Video Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <ImageIcon size={14} />
              {t('exercises.coverImage', 'Cover Image')}
            </label>
            <input
              type="file"
              ref={coverImageInputRef}
              onChange={(e) => handleFileSelect(e, setCoverImageFile)}
              accept="image/*"
              className="hidden"
            />
            {hasCoverImage ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2">
                  {coverImageFile ? (
                    <span className="text-sm truncate max-w-[120px]">{coverImageFile.name}</span>
                  ) : (
                    <span className="text-sm text-green-600">✅ {t('exercises.hasCoverImage', 'Has cover image')}</span>
                  )}
                </div>
                {coverImageFile ? (
                  <button
                    type="button"
                    onClick={() => removeFile(setCoverImageFile)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('exercises.edit.replaceImage', 'Replace')}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverImageInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {t('exercises.edit.uploadCoverImage', 'Upload Cover Image')}
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Video size={14} />
              {t('exercises.video')}
            </label>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleFileSelect(e, setVideoFile)}
              accept="video/*"
              className="hidden"
            />
            {hasVideo ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2">
                  {videoFile ? (
                    <span className="text-sm truncate max-w-[120px]">{videoFile.name}</span>
                  ) : (
                    <span className="text-sm text-green-600">✅ {t('exercises.hasVideo', 'Has video')}</span>
                  )}
                </div>
                {videoFile ? (
                  <button
                    type="button"
                    onClick={() => removeFile(setVideoFile)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="text-sm text-primary hover:underline"
                  >
                    {t('exercises.edit.replaceVideo', 'Replace')}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {t('exercises.edit.uploadVideo')}
              </button>
            )}
          </div>
        </div>

        {/* Slides Section */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium text-gray-900">
                {t('exercises.slides', 'Slides')}
              </label>
              <p className="text-xs text-muted-foreground">
                {slides.filter(s => !s._delete).length} / {MAX_SLIDES} slides
              </p>
            </div>
            <button
              type="button"
              onClick={addSlide}
              disabled={slides.length >= MAX_SLIDES || updateExercise.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              {t('exercises.edit.addSlide', 'Add Slide')}
            </button>
          </div>

          {slides.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-sm text-muted-foreground">
                {t('exercises.edit.noSlides', 'No slides added yet.')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {slides.map((slide, index) => {
              if (slide._delete) return null;
              
              const hasExistingImage = slide.imageKey && !slide.newImageFile;
              const hasExistingAudio = slide.audioKey && !slide.newAudioFile;
              
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      type="button"
                      className="cursor-grab text-gray-400 hover:text-gray-600"
                    >
                      <GripVertical size={18} />
                    </button>
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <input
                        type="text"
                        {...register(`slides.${index}.name`)}
                        placeholder={t('exercises.edit.slideName', 'Slide name (e.g., "Apple")')}
                        className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200"
                        disabled={updateExercise.isPending}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      disabled={updateExercise.isPending}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Image */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        {t('exercises.image', 'Image')}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSlideFileSelect(e, index, 'newImageFile')}
                        className="hidden"
                        id={`edit-slide-image-${index}`}
                      />
                      {hasExistingImage ? (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700">✅ {t('exercises.hasImage', 'Has image')}</span>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`edit-slide-image-${index}`)?.click()}
                            className="text-sm text-primary hover:underline"
                          >
                            {t('exercises.edit.replaceImage', 'Replace')}
                          </button>
                        </div>
                      ) : slide.newImageFile ? (
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-primary/20">
                          <span className="text-sm truncate max-w-[120px]">{slide.newImageFile.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSlideFile(index, 'newImageFile')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById(`edit-slide-image-${index}`)?.click()}
                          className="w-full py-2 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                        >
                          {t('exercises.edit.uploadImage', 'Upload Image')}
                        </button>
                      )}
                    </div>

                    {/* Audio */}
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        {t('exercises.audio', 'Audio')}
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleSlideFileSelect(e, index, 'newAudioFile')}
                        className="hidden"
                        id={`edit-slide-audio-${index}`}
                      />
                      {hasExistingAudio ? (
                        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-700">✅ {t('exercises.hasAudio', 'Has audio')}</span>
                          <button
                            type="button"
                            onClick={() => document.getElementById(`edit-slide-audio-${index}`)?.click()}
                            className="text-sm text-primary hover:underline"
                          >
                            {t('exercises.edit.replaceAudio', 'Replace')}
                          </button>
                        </div>
                      ) : slide.newAudioFile ? (
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-primary/20">
                          <span className="text-sm truncate max-w-[120px]">{slide.newAudioFile.name}</span>
                          <button
                            type="button"
                            onClick={() => removeSlideFile(index, 'newAudioFile')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById(`edit-slide-audio-${index}`)?.click()}
                          className="w-full py-2 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                        >
                          {t('exercises.edit.uploadAudio', 'Upload Audio')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FormModal>
  );
}