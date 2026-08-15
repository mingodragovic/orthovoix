// src/app/pages/ExerciseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useExercise } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Clock, 
  Tag, 
  Music, 
  Image as ImageIcon, 
  Video,
  FileText,
  AlertCircle,
  Play,
  Volume2,
  Info
} from 'lucide-react';
import { useState } from 'react';
import { ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ExerciseEditModal } from '../components/exercises/ExerciseEditModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function ExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useExercise(id!);

  const getDifficultyLabel = (difficulty: ExerciseDifficulty) => {
    switch(difficulty) {
      case 'beginner': return t('exercises.difficulty.beginner', 'Beginner');
      case 'intermediate': return t('exercises.difficulty.intermediate', 'Intermediate');
      case 'advanced': return t('exercises.difficulty.advanced', 'Advanced');
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: ExerciseDifficulty) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryLabel = (category: ExerciseCategory) => {
    const labels: Record<ExerciseCategory, string> = {
      pronunciation: t('exercises.category.pronunciation', 'Pronunciation'),
      vocabulary: t('exercises.category.vocabulary', 'Vocabulary'),
      grammar: t('exercises.category.grammar', 'Grammar'),
      comprehension: t('exercises.category.comprehension', 'Comprehension'),
      fluency: t('exercises.category.fluency', 'Fluency'),
      articulation: t('exercises.category.articulation', 'Articulation'),
      phonology: t('exercises.category.phonology', 'Phonology'),
      language: t('exercises.category.language', 'Language'),
      social_communication: t('exercises.category.social_communication', 'Social Communication'),
      other: t('exercises.category.other', 'Other'),
    };
    return labels[category] || category;
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
      return;
    }
    setPlayingAudio(audioUrl);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => setPlayingAudio(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-red-500">{t('common.error', 'Error')}</p>
          <button
            onClick={() => navigate('/exercises')}
            className="mt-2 text-primary hover:underline"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  const exercise = data.data;
  const slides = exercise.slides || [];
  const hasSlides = slides.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Breadcrumb 
        showBack={true} 
        showHome={true}
        items={[
          { label: t('sidebar.exercises', 'Exercises'), path: '/exercises' },
          { label: exercise.title, path: `/exercises/${exercise.id}` }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 overflow-hidden">
            {exercise.coverImageUrl ? (
              <img 
                src={exercise.coverImageUrl} 
                alt={exercise.title}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : exercise.imageUrl ? (
              <img 
                src={exercise.imageUrl} 
                alt={exercise.title}
                className="w-full h-full rounded-xl object-cover"
              />
            ) : (
              <BookOpen size={32} />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {exercise.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
                {getDifficultyLabel(exercise.difficulty)}
              </span>
              <span className="text-sm text-gray-600">
                {getCategoryLabel(exercise.category)}
              </span>
              {exercise.duration && (
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock size={14} />
                  {exercise.duration} {t('exercises.minutes', 'min')}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setEditModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
        >
          <Edit size={16} />
          {t('common.edit', 'Edit')}
        </button>
      </div>

      {/* Slider / Media Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {hasSlides ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, A11y]}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              className="aspect-[4/3] w-full"
              loop={false}
              autoHeight={false}
            >
              {slides.map((slide: any, index: number) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🖼️
                      </div>
                    )}
                    
                    {slide.audioUrl && (
                      <button
                        onClick={() => handlePlayAudio(slide.audioUrl)}
                        className={`absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                          playingAudio === slide.audioUrl
                            ? 'bg-primary text-white'
                            : 'bg-white text-primary border-2 border-primary'
                        }`}
                      >
                        {playingAudio === slide.audioUrl ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Volume2 size={24} />
                        )}
                      </button>
                    )}

                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {index + 1} / {slides.length}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {slides.length > 1 && (
              <>
                <button
                  className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Previous slide"
                >
                  ◀
                </button>
                <button
                  className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Next slide"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        ) : exercise.coverImageUrl ? (
          <div className="aspect-[4/3] w-full relative bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={exercise.coverImageUrl}
              alt={exercise.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : exercise.imageUrl ? (
          <div className="aspect-[4/3] w-full relative bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={exercise.imageUrl}
              alt={exercise.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] w-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
            🎯
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <FileText size={20} />
                {t('exercises.description', 'Description')}
              </h2>
              <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <Play size={20} />
                {t('exercises.instructions', 'Instructions')}
              </h2>
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 whitespace-pre-wrap">
                {exercise.instructions}
              </div>
            </div>
          </div>

          {/* Materials */}
          {exercise.materials && exercise.materials.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <Tag size={20} />
                  {t('exercises.materials', 'Materials')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {exercise.materials.map((material, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Video */}
          {exercise.videoUrl && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Video size={16} />
                  {t('exercises.video', 'Video')}
                </h3>
              </div>
              <div className="p-4">
                <video controls className="w-full rounded-lg">
                  <source src={exercise.videoUrl} type="video/mp4" />
                  {t('exercises.videoNotSupported', 'Your browser does not support the video element')}
                </video>
              </div>
            </div>
          )}

          {/* Audio */}
          {exercise.audioUrl && !hasSlides && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Music size={16} />
                  {t('exercises.audio', 'Audio')}
                </h3>
              </div>
              <div className="p-4">
                <audio controls className="w-full">
                  <source src={exercise.audioUrl} type="audio/mpeg" />
                  {t('exercises.audioNotSupported', 'Your browser does not support the audio element')}
                </audio>
              </div>
            </div>
          )}

          {/* Tags */}
          {exercise.tags && exercise.tags.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Tag size={16} />
                  {t('exercises.tags', 'Tags')}
                </h3>
              </div>
              <div className="p-4 flex flex-wrap gap-1">
                {exercise.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium">{t('exercises.metadata', 'Metadata')}</h3>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.createdBy', 'Created By')}</span>
                <span>{exercise.creatorName || exercise.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.createdAt', 'Created At')}</span>
                <span>{new Date(exercise.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.updatedAt', 'Updated At')}</span>
                <span>{new Date(exercise.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('exercises.status', 'Status')}</span>
                <span className={exercise.isActive ? 'text-green-600' : 'text-red-600'}>
                  {exercise.isActive ? t('exercises.active', 'Active') : t('exercises.inactive', 'Inactive')}
                </span>
              </div>
              {hasSlides && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('exercises.slides', 'Slides')}</span>
                  <span>{slides.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ExerciseEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        exerciseId={exercise.id}
        onSuccess={() => {
          refetch();
          setEditModalOpen(false);
        }}
      />
    </div>
  );
}