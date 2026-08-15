// src/app/pages/ParentExerciseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useExercise } from '@/hooks/useExercises';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { 
  ArrowLeft, 
  Play, 
  Mic, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  FileText,
  Volume2,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion } from 'motion/react';

interface Slide {
  name?: string;
  imageUrl?: string;
  imageKey?: string;
  audioUrl?: string;
  audioKey?: string;
  order: number;
}

export function ParentExerciseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: assignmentsData, isLoading: assignmentsLoading } = usePatientExercises(childId || '');
  
  // ✅ FIX: Extract assignments array from response
  let assignments: any[] = [];
  if (assignmentsData) {
    if (Array.isArray(assignmentsData)) {
      assignments = assignmentsData;
    } else if (assignmentsData.data && Array.isArray(assignmentsData.data)) {
      assignments = assignmentsData.data;
    } else if (Array.isArray((assignmentsData as any)?.data)) {
      assignments = (assignmentsData as any).data;
    }
  }
  
  const assignment = assignments.find((a: any) => a.id === id);
  const exerciseId = assignment?.exerciseId;

  const { data: exerciseData, isLoading: exerciseLoading } = useExercise(exerciseId || '');
  const exercise = exerciseData?.data;

  const handlePlayAudio = async (audioUrl: string) => {
    if (isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        console.error('Audio playback error');
      };
    } catch (err) {
      setIsPlayingAudio(false);
      console.error('Audio playback error:', err);
    }
  };

  if (assignmentsLoading || exerciseLoading) {
    return <LoadingSpinner />;
  }

  if (!assignment || !exercise) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => navigate('/parent/exercises')} className="mt-2 text-primary hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const slides = exercise.slides || [];
  const hasSlides = slides.length > 0;
  const isCompleted = assignment.status === 'completed';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return t('patientExercises.status.completed');
      case 'in-progress': return t('patientExercises.status.inProgress');
      case 'assigned': return t('patientExercises.status.assigned');
      case 'overdue': return t('patientExercises.status.overdue');
      case 'cancelled': return t('patientExercises.status.cancelled');
      default: return status;
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent/exercises')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{exercise.title}</h1>
          <p className="text-sm text-gray-500">{exercise.category}</p>
        </div>
      </div>

      {/* Status */}
      <div className={`p-3 rounded-xl border ${getStatusColor(assignment.status)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {t('patientExercises.status')}: {getStatusLabel(assignment.status)}
          </span>
        </div>
      </div>

      {/* Slider / Media Section */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
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
              {slides.map((slide: Slide, index: number) => (
                <SwiperSlide key={index}>
                  <div 
                    className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
                    onClick={() => {
                      if (slide.audioUrl) {
                        handlePlayAudio(slide.audioUrl!);
                      }
                    }}
                  >
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.name || `Slide ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🎯
                      </div>
                    )}
                    
                    {/* Audio Play Button Overlay */}
                    {slide.audioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(slide.audioUrl!);
                        }}
                        disabled={isPlayingAudio}
                        className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-primary/90 text-white shadow-lg flex items-center justify-center hover:bg-primary transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isPlayingAudio ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Volume2 size={24} />
                        )}
                      </button>
                    )}

                    {/* Tap to listen hint */}
                    {slide.audioUrl && (
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Info size={12} />
                        {t('exercisePractice.tapToListen', 'Tap image to listen')}
                      </div>
                    )}

                    {/* Slide Name */}
                    {slide.name && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
                        {slide.name}
                      </div>
                    )}

                    {/* Slide Counter */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                      {index + 1} / {slides.length}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom Navigation Buttons */}
            {slides.length > 1 && (
              <>
                <button
                  className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button
                  className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight size={20} className="text-gray-700" />
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
        ) : (
          <div className="aspect-[4/3] w-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
            🎯
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h2 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
          <FileText size={16} />
          {t('exercises.description')}
        </h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{exercise.description}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <h2 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Play size={16} />
          {t('exercises.instructions')}
        </h2>
        <p className="text-sm text-blue-800 whitespace-pre-wrap">{exercise.instructions}</p>
      </div>

      {/* Materials */}
      {exercise.materials && exercise.materials.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen size={16} />
            {t('exercises.materials')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercise.materials.map((material: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                {material}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Due Date */}
      {assignment.dueDate && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            {t('patientExercises.dueDate')}: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Practice Button */}
      {!isCompleted && (
        <button
          onClick={() => navigate(`/parent/exercises/${id}/practice`)}
          className="w-full py-4 rounded-2xl bg-primary text-white font-medium text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Mic size={20} />
          {t('exercisePractice.recordYourself')}
        </button>
      )}

      {isCompleted && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm">
            <CheckCircle size={16} />
            {t('exercisePractice.alreadySubmitted')}
          </div>
        </div>
      )}
    </div>
  );
}