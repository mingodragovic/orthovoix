// src/components/exercises/ExerciseCreateModal.tsx
import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExerciseWithMedia, useExerciseCategories } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertCircle, Upload, X, Music, Image as ImageIcon, Video, Plus, Trash2, GripVertical } from 'lucide-react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { FormModal } from '../ui/FormModal';

interface ExerciseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_SLIDES = 10;
const MAX_FILES = 20;

// ✅ SIMPLIFIED SCHEMA - only validate required fields, no strict length requirements
const createExerciseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum([
    'pronunciation', 'vocabulary', 'grammar', 'comprehension', 
    'fluency', 'articulation', 'phonology', 'language', 
    'social_communication', 'other'
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  instructions: z.string().min(1, 'Instructions are required'),
  duration: z.number().optional(),
  materials: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  slides: z.array(z.object({
    name: z.string().optional(),
    imageFile: z.any().nullable(),
    audioFile: z.any().nullable(),
  })).default([]),
});

type CreateExerciseFormValues = z.infer<typeof createExerciseSchema>;

export function ExerciseCreateModal({ isOpen, onClose, onSuccess }: ExerciseCreateModalProps) {
  const { t } = useTranslation();
  const createExercise = useCreateExerciseWithMedia();
  const { data: categoriesData } = useExerciseCategories();
  
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [materialInput, setMaterialInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<CreateExerciseFormValues>({
    resolver: zodResolver(createExerciseSchema),
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
  const isActive = watch('isActive');

  const categories = categoriesData?.data?.categories || [];

  // ✅ SIMPLE VALIDATION - just check if required fields have content
  const title = watch('title');
  const description = watch('description');
  const instructions = watch('instructions');

  // ✅ Button enables when all required fields have at least 1 character
  const isFormValid = Boolean(
    title?.trim() &&
    description?.trim() &&
    instructions?.trim()
  );

  const isButtonDisabled = !isFormValid || isSubmitting || createExercise.isPending;

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
      imageFile: null,
      audioFile: null,
    });
  };

  const removeSlide = (index: number) => {
    remove(index);
  };

  const handleSlideFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'imageFile' | 'audioFile'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentSlides = watch('slides');
      const updatedSlides = [...currentSlides];
      updatedSlides[index] = {
        ...updatedSlides[index],
        [field]: file,
      };
      setValue('slides', updatedSlides);
    }
  };

  const removeSlideFile = (index: number, field: 'imageFile' | 'audioFile') => {
    const currentSlides = watch('slides');
    const updatedSlides = [...currentSlides];
    updatedSlides[index] = {
      ...updatedSlides[index],
      [field]: null,
    };
    setValue('slides', updatedSlides);
  };

  const onSubmit = async (data: CreateExerciseFormValues) => {
    try {
      // ✅ Only include slides that have at least an image or audio file
      const validSlides = data.slides
        .filter(slide => slide.imageFile || slide.audioFile)
        .map((slide, index) => ({
          name: slide.name?.trim() || `Slide ${index + 1}`,
          imageFile: slide.imageFile,
          audioFile: slide.audioFile,
          order: index,
        }));

      console.log('📤 Submitting slides with names:', validSlides);

      await createExercise.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        instructions: data.instructions,
        duration: data.duration,
        materials: data.materials,
        tags: data.tags,
        isActive: data.isActive,
        coverImageFile: coverImageFile,
        videoFile: videoFile,
        slides: validSlides,
      });

      setCoverImageFile(null);
      setVideoFile(null);
      setMaterialInput('');
      setTagInput('');
      reset();
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Exercise creation failed:', error);
    }
  };

  const handleClose = () => {
    setCoverImageFile(null);
    setVideoFile(null);
    setMaterialInput('');
    setTagInput('');
    onClose();
  };

  const totalFiles = (coverImageFile ? 1 : 0) + (videoFile ? 1 : 0) + 
    slides.reduce((acc, slide) => acc + (slide.imageFile ? 1 : 0) + (slide.audioFile ? 1 : 0), 0);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      title={t('exercises.create.title', 'Create Exercise')}
      submitText={t('exercises.create.submit', 'Create Exercise')}
      isLoading={createExercise.isPending}
      isSubmitDisabled={isButtonDisabled}
      size="xl"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Form Status */}
        <div className={`p-3 rounded-xl text-sm font-medium ${
          isFormValid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {isFormValid ? (
            '✅ All required fields are filled. Ready to create!'
          ) : (
            '⚠️ Please fill in: Title, Description, and Instructions'
          )}
        </div>

        {/* File Count */}
        {totalFiles > 0 && (
          <div className={`text-xs px-3 py-2 rounded-lg ${totalFiles > MAX_FILES ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
            📁 {totalFiles} / {MAX_FILES} files uploaded
            {totalFiles > MAX_FILES && (
              <span className="block text-red-600 font-medium">⚠️ Too many files! Maximum {MAX_FILES} files allowed.</span>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.title')} <span className="text-red-500">*</span>
            <span className={`text-xs ml-2 ${title?.trim() ? 'text-green-500' : 'text-muted-foreground'}`}>
              {title?.trim() ? '✅' : '⚠️ Required'}
            </span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Pronunciation Practice - /r/ Sound"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all ${
              errors.title ? 'border-2 border-red-400' : 'focus:ring-2 focus:ring-primary/30'
            } ${title?.trim() && !errors.title ? 'border-2 border-green-400' : ''}`}
            disabled={createExercise.isPending}
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.description')} <span className="text-red-500">*</span>
            <span className={`text-xs ml-2 ${description?.trim() ? 'text-green-500' : 'text-muted-foreground'}`}>
              {description?.trim() ? '✅' : '⚠️ Required'}
            </span>
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Practice the /r/ sound with these tongue twisters and exercises"
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.description ? 'border-2 border-red-400' : 'focus:ring-2 focus:ring-primary/30'
            } ${description?.trim() && !errors.description ? 'border-2 border-green-400' : ''}`}
            disabled={createExercise.isPending}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Category & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.category')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`exercises.category.${cat}`)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {t('exercises.difficulty')} <span className="text-red-500">*</span>
            </label>
            <select
              {...register('difficulty')}
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            >
              <option value="beginner">{t('exercises.difficulty.beginner')}</option>
              <option value="intermediate">{t('exercises.difficulty.intermediate')}</option>
              <option value="advanced">{t('exercises.difficulty.advanced')}</option>
            </select>
            {errors.difficulty && (
              <p className="text-xs text-red-500 mt-1">{errors.difficulty.message}</p>
            )}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.duration')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
          </label>
          <input
            type="number"
            {...register('duration', { valueAsNumber: true })}
            placeholder="15"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            disabled={createExercise.isPending}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.instructions')} <span className="text-red-500">*</span>
            <span className={`text-xs ml-2 ${instructions?.trim() ? 'text-green-500' : 'text-muted-foreground'}`}>
              {instructions?.trim() ? '✅' : '⚠️ Required'}
            </span>
          </label>
          <textarea
            {...register('instructions')}
            rows={4}
            placeholder="Repeat each word 5 times: red, run, rest, round, right..."
            className={`w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${
              errors.instructions ? 'border-2 border-red-400' : 'focus:ring-2 focus:ring-primary/30'
            } ${instructions?.trim() && !errors.instructions ? 'border-2 border-green-400' : ''}`}
            disabled={createExercise.isPending}
          />
          {errors.instructions && (
            <p className="text-xs text-red-500 mt-1">{errors.instructions.message}</p>
          )}
        </div>

        {/* Materials */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.materials')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
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
              placeholder={t('exercises.create.enterMaterial')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            />
            <button
              type="button"
              onClick={addMaterial}
              disabled={!materialInput.trim() || createExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.tags')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
            <span className="text-xs text-muted-foreground ml-2">{t('exercises.tags.hint')}</span>
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
              placeholder={t('exercises.create.enterTag')}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={createExercise.isPending}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim() || createExercise.isPending}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('exercises.tags.examples')}</p>
        </div>

        {/* Status - FIXED: Using checkbox for boolean */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            {t('exercises.status')}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setValue('isActive', e.target.checked)}
              className="w-4 h-4 text-primary rounded"
              disabled={createExercise.isPending}
            />
            <span className="text-sm">{t('exercises.active')}</span>
          </label>
          {errors.isActive && (
            <p className="text-xs text-red-500 mt-1">{errors.isActive.message}</p>
          )}
        </div>

        {/* Cover Image & Video */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <ImageIcon size={14} />
              {t('exercises.coverImage', 'Cover Image')}
              <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
            </label>
            <input
              type="file"
              ref={coverImageInputRef}
              onChange={(e) => handleFileSelect(e, setCoverImageFile)}
              accept="image/*"
              className="hidden"
            />
            {coverImageFile ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm truncate max-w-[120px]">{coverImageFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(setCoverImageFile)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverImageInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {t('exercises.create.uploadCoverImage', 'Upload Cover Image')}
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-2">
              <Video size={14} />
              {t('exercises.video')}
              <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
            </label>
            <input
              type="file"
              ref={videoInputRef}
              onChange={(e) => handleFileSelect(e, setVideoFile)}
              accept="video/*"
              className="hidden"
            />
            {videoFile ? (
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-sm truncate max-w-[120px]">{videoFile.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(setVideoFile)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {t('exercises.create.uploadVideo')}
              </button>
            )}
          </div>
        </div>

        {/* Slides */}
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium text-gray-900">
                {t('exercises.slides', 'Slides')}
                <span className="text-xs text-muted-foreground ml-2">({t('common.optional')})</span>
              </label>
              <p className="text-xs text-muted-foreground">
                {slides.length} / {MAX_SLIDES} slides
              </p>
            </div>
            <button
              type="button"
              onClick={addSlide}
              disabled={slides.length >= MAX_SLIDES || createExercise.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              {t('exercises.create.addSlide', 'Add Slide')}
            </button>
          </div>

          {slides.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-sm text-muted-foreground">
                {t('exercises.create.noSlides', 'No slides added yet. Click "Add Slide" to get started.')}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register(`slides.${index}.name`)}
                      placeholder={t('exercises.create.slideName', 'Slide name (optional)')}
                      className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200"
                      disabled={createExercise.isPending}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    disabled={createExercise.isPending}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('exercises.image', 'Image')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSlideFileSelect(e, index, 'imageFile')}
                      className="hidden"
                      id={`slide-image-${index}`}
                    />
                    {slide.imageFile ? (
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-primary/20">
                        <span className="text-sm truncate max-w-[120px]">{slide.imageFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSlideFile(index, 'imageFile')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById(`slide-image-${index}`)?.click()}
                        className="w-full py-2 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                      >
                        {t('exercises.create.uploadImage', 'Upload Image')}
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {t('exercises.audio', 'Audio')} <span className="text-xs text-muted-foreground">({t('common.optional')})</span>
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleSlideFileSelect(e, index, 'audioFile')}
                      className="hidden"
                      id={`slide-audio-${index}`}
                    />
                    {slide.audioFile ? (
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-primary/20">
                        <span className="text-sm truncate max-w-[120px]">{slide.audioFile.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSlideFile(index, 'audioFile')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => document.getElementById(`slide-audio-${index}`)?.click()}
                        className="w-full py-2 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm text-muted-foreground"
                      >
                        {t('exercises.create.uploadAudio', 'Upload Audio')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormModal>
  );
}