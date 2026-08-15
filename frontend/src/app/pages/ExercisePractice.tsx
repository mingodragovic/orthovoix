// src/app/pages/ExercisePractice.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useExercise } from '@/hooks/useExercises';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useToast } from '@/hooks/useToast';
import { useSubmissionByExercise } from '@/hooks/useSubmissions';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Play, Square, Mic, ArrowLeft, Volume2, Send, CheckCircle2, ChevronLeft, ChevronRight, Info, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiClient } from '@/lib/api/client';

interface Slide {
  name?: string;
  imageUrl?: string;
  imageKey?: string;
  audioUrl?: string;
  audioKey?: string;
  order: number;
}

interface RecordingState {
  [slideIndex: number]: {
    audioBlob: Blob | null;
    audioUrl: string | null;
    duration: number;
    audioKey: string | null;
    isRecorded: boolean;
  };
}

const MAX_RECORDING_DURATION = 10; // seconds

export function ExercisePractice() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isMicReady, setIsMicReady] = useState(false);
  const [isCheckingMic, setIsCheckingMic] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [recordings, setRecordings] = useState<RecordingState>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recordingForSlide, setRecordingForSlide] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: assignmentsData, isLoading: assignmentsLoading } = usePatientExercises(childId || '');
  
  // Extract assignments array from response
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
  const assignmentId = assignment?.id;
  const exerciseId = assignment?.exerciseId;

  const { data: exerciseData, isLoading: exerciseLoading } = useExercise(exerciseId || '');
  const exercise = exerciseData?.data;

  // Check if submission already exists for this exercise
  const { data: existingSubmission, refetch: refetchSubmission } = useSubmissionByExercise(exerciseId || '');
  const hasSubmitted = !!existingSubmission;
  const submissionStatus = existingSubmission?.status || '';
  const isPending = submissionStatus === 'pending';
  const isRejected = submissionStatus === 'rejected' || submissionStatus === 'needs-improvement';
  const isApproved = submissionStatus === 'approved';

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    error: recorderError,
  } = useMediaRecorder({
    onError: (err) => {
      console.error('Recording error:', err);
      showError('Failed to start recording. Please check your microphone settings.');
    },
  });

  // Check microphone availability
  useEffect(() => {
    const checkMicrophone = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setIsMicReady(true);
        console.log('✅ Microphone is ready');
      } catch (err) {
        console.error('❌ Microphone not available:', err);
        setIsMicReady(false);
        showError('Please allow microphone access to record. Check your browser settings.');
      } finally {
        setIsCheckingMic(false);
      }
    };

    checkMicrophone();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Reset recording state when slide changes
  useEffect(() => {
    if (audioUrl && recordingForSlide !== null) {
      // Update recordings state with the new audio
      setRecordings(prev => ({
        ...prev,
        [recordingForSlide]: {
          audioBlob,
          audioUrl,
          duration,
          audioKey: null,
          isRecorded: true,
        }
      }));
    }
  }, [audioUrl, duration, audioBlob, recordingForSlide]);

  const handleStartRecording = async (slideIndex: number) => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setRecordingForSlide(slideIndex);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // The audio will be saved in the useEffect above
  };

  const handleResetRecording = (slideIndex: number) => {
    // Clear the recording for this slide
    setRecordings(prev => ({
      ...prev,
      [slideIndex]: {
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        audioKey: null,
        isRecorded: false,
      }
    }));
    resetRecording();
    setRecordingForSlide(null);
  };

  const getRecordedSlidesCount = () => {
    return Object.values(recordings).filter(r => r.isRecorded).length;
  };

  const getTotalSlides = () => {
    return exercise?.slides?.length || 0;
  };

  const isAllSlidesRecorded = () => {
    return getRecordedSlidesCount() === getTotalSlides() && getTotalSlides() > 0;
  };

  const handleSubmitAllRecordings = async () => {
    if (!childId || !exerciseId || !assignmentId) {
      setStatusMessage(t('exercisePractice.missingData'));
      return;
    }

    // Check all slides are recorded
    if (!isAllSlidesRecorded()) {
      setStatusMessage('Please record audio for all slides before submitting.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    try {
      const answers = [];
      
      // Upload each recording and collect answers
      for (const [slideIndexStr, recording] of Object.entries(recordings)) {
        const slideIndex = parseInt(slideIndexStr);
        if (!recording.isRecorded || !recording.audioBlob) continue;

        // Upload recording to storage
        const formData = new FormData();
        formData.append('file', recording.audioBlob, `slide-${slideIndex}.webm`);
        formData.append('patientId', childId);
        formData.append('exerciseId', exerciseId);
        formData.append('assignmentId', assignmentId);

        const uploadResponse = await apiClient.post('/storage/upload/recording', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const uploadedFile = uploadResponse.data.data;

        answers.push({
          slideIndex: slideIndex,
          recordedAudioKey: uploadedFile.key,
          duration: recording.duration,
          notes: t('exercisePractice.submissionNotes'),
        });
      }

      // Create submission with all answers
      const submissionData = {
        patientExerciseId: assignmentId,
        answers: answers,
        metadata: {
          deviceInfo: navigator.userAgent,
          browserInfo: navigator.userAgent,
        },
        notes: t('exercisePractice.submissionNotes'),
      };

      await apiClient.post('/submissions', submissionData);
      
      setStatusMessage(t('exercisePractice.success'));
      
      // Show success animation
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);

      success(t('exercisePractice.submitted'));

      // Refetch submission and navigate
      await refetchSubmission();
      setTimeout(() => {
        navigate('/parent/submissions');
      }, 2500);

    } catch (err: any) {
      console.error('Submission error:', err);
      const message = err.response?.data?.message || t('exercisePractice.error');
      setStatusMessage(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaySlideAudio = async (audioUrl: string) => {
    if (isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        audioRef.current = null;
        showError('Failed to play audio');
      };
    } catch (err) {
      setIsPlayingAudio(false);
      showError('Failed to play audio');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Slider navigation
  const goToSlide = (index: number) => {
    const slides = exercise?.slides || [];
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => {
    const slides = exercise?.slides || [];
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEndX(e.changedTouches[0].clientX);
    const diff = touchStartX - touchEndX;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  if (assignmentsLoading || exerciseLoading || !childId || isCheckingMic) {
    return <LoadingSpinner />;
  }

  if (!assignment || !exerciseId || !exercise) {
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
  const currentSlideData = slides[currentSlide];
  const isSlideRecorded = recordings[currentSlide]?.isRecorded || false;
  const slideRecording = recordings[currentSlide] || null;
  const totalRecorded = getRecordedSlidesCount();
  const totalSlides = getTotalSlides();
  const allRecorded = isAllSlidesRecorded();

  // Check if we can submit (all slides recorded, not already submitted)
  const canSubmit = allRecorded && !hasSubmitted && !isRecording;

  return (
    <div className="space-y-4 pb-20 mx-auto px-3 sm:px-4 md:px-6 max-w-4xl w-full">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-xs sm:max-w-sm mx-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              </motion.div>
              <p className="text-lg font-bold text-gray-900">
                {t('exercisePractice.submitted')}
              </p>
              <p className="text-sm text-gray-600">
                {t('exercisePractice.waitingForReview')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/parent/exercises')}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{exercise.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">{exercise.category}</p>
        </div>
        {hasSubmitted && (
          <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${
            isPending ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            isApproved ? 'bg-green-100 text-green-700 border border-green-200' :
            'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {isPending ? '⏳' : isApproved ? '✅' : '❌'}
            <span className="hidden sm:inline ml-1">
              {t(`submissions.status.${submissionStatus}`, submissionStatus)}
            </span>
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!hasSubmitted && hasSlides && (
        <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(totalRecorded / totalSlides) * 100}%` }}
          />
        </div>
      )}

      {/* Progress Text */}
      {!hasSubmitted && hasSlides && (
        <div className="text-center text-sm text-gray-600">
          {t('exercisePractice.slideProgress', 'Slide {current} of {total}')}
          {' • '}
          {totalRecorded === totalSlides ? (
            <span className="text-green-600 font-medium">✅ All slides recorded!</span>
          ) : (
            <span className="text-gray-500">
              {t('exercisePractice.recordedSlides', '{count} of {total} recorded')}
            </span>
          )}
        </div>
      )}

      {/* Mic Status */}
      {!hasSubmitted && (
        <div className={`text-center text-xs sm:text-sm p-2 rounded-lg ${
          isMicReady ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isMicReady ? '✅ Microphone is ready' : '⚠️ Microphone not available. Please check your browser settings.'}
        </div>
      )}

      {/* Submission Status Banner */}
      {hasSubmitted && (
        <div className={`rounded-xl p-3 sm:p-4 border ${
          isPending ? 'bg-yellow-50 border-yellow-200' :
          isApproved ? 'bg-green-50 border-green-200' :
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            {isPending && <Clock size={18} className="text-yellow-600 animate-pulse flex-shrink-0 mt-0.5 sm:mt-0" />}
            {isApproved && <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />}
            {isRejected && <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />}
            <div className="min-w-0">
              <p className={`text-sm font-medium ${
                isPending ? 'text-yellow-800' :
                isApproved ? 'text-green-800' :
                'text-red-800'
              }`}>
                {isPending && t('submissions.pendingMessage')}
                {isApproved && t('submissions.approvedMessage')}
                {isRejected && t('submissions.rejectedMessage')}
              </p>
              {isRejected && existingSubmission?.reviewNotes && (
                <p className="text-xs sm:text-sm mt-1 text-red-700 break-words">
                  💬 {existingSubmission.reviewNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Slider */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
        {hasSlides ? (
          <div 
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide: Slide, index: number) => (
                <div 
                  key={index} 
                  className="min-w-full aspect-square sm:aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative"
                >
                  <div 
                    className="w-full h-full cursor-pointer relative"
                    onClick={() => {
                      if (slide.audioUrl) {
                        handlePlaySlideAudio(slide.audioUrl!);
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
                      <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl">
                        🎯
                      </div>
                    )}
                    
                    {/* Recording Status Badge */}
                    {recordings[index]?.isRecorded && (
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-green-500 text-white text-[8px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                        Recorded
                      </div>
                    )}

                    {slide.audioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaySlideAudio(slide.audioUrl!);
                        }}
                        disabled={isPlayingAudio}
                        className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary/90 text-white shadow-lg flex items-center justify-center hover:bg-primary transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {isPlayingAudio ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Volume2 size={18} className="sm:w-6 sm:h-6" />
                        )}
                      </button>
                    )}

                    {slide.audioUrl && (
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/50 backdrop-blur-sm text-white text-[8px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1">
                        <Info size={10} className="sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">{t('exercisePractice.tapToListen', 'Tap image to listen')}</span>
                      </div>
                    )}

                    {slide.name && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-2 py-1 sm:px-4 sm:py-2 rounded-full max-w-[80%] truncate">
                        {slide.name}
                      </div>
                    )}

                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/50 backdrop-blur-sm text-white text-[8px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                      {index + 1} / {slides.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-primary w-4 sm:w-6' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className={`absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors ${
                    currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={16} className="sm:w-5 sm:h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className={`absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors ${
                    currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label="Next slide"
                >
                  <ChevronRight size={16} className="sm:w-5 sm:h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>
        ) : exercise.coverImageUrl ? (
          <div className="aspect-square sm:aspect-[4/3] w-full relative bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={exercise.coverImageUrl}
              alt={exercise.title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-square sm:aspect-[4/3] w-full flex items-center justify-center text-4xl sm:text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
            🎯
          </div>
        )}
      </div>

      {/* Exercise Info */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 text-sm sm:text-base">{exercise.title}</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{exercise.description}</p>
        {exercise.duration && (
          <p className="text-xs text-gray-500 mt-2">
            ⏱️ {exercise.duration} {t('exercises.minutes')}
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 border border-blue-100">
        <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
          {t('exercises.instructions')}
        </h3>
        <p className="text-xs sm:text-sm text-blue-800 break-words">{exercise.instructions}</p>
      </div>

      {/* Recording Section - Only show if not submitted */}
      {!hasSubmitted || isRejected ? (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm font-medium text-gray-900">
              {isRejected ? t('exercisePractice.resubmit', 'Resubmit your recording') : 
                `${t('exercisePractice.recordYourself')} - ${t('exercisePractice.slide', 'Slide')} ${currentSlide + 1}`}
            </h3>
            {isRecording && (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs text-red-500 font-medium">
                  {t('exercisePractice.recording')}
                </span>
              </div>
            )}
          </div>

          {/* Recording Status for current slide */}
          {isSlideRecorded && !isRecording && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2 text-sm text-green-700">
              <CheckCircle size={16} />
              <span>✓ Recording saved for this slide</span>
              <button
                onClick={() => handleResetRecording(currentSlide)}
                className="ml-auto text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                {t('exercisePractice.reset')}
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="text-xl sm:text-2xl font-mono text-gray-700">
              {isSlideRecorded && !isRecording 
                ? formatDuration(slideRecording?.duration || 0)
                : formatDuration(duration)
              }
            </div>

            {/* Record/Play Controls */}
            {isSlideRecorded && !isRecording ? (
              // Show play button for recorded audio
              <div className="flex items-center gap-3">
                {slideRecording?.audioUrl && (
                  <button
                    onClick={() => {
                      if (slideRecording.audioUrl) {
                        const audio = new Audio(slideRecording.audioUrl);
                        audio.play();
                      }
                    }}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary text-white shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    <Play size={24} className="sm:w-8 sm:h-8" />
                  </button>
                )}
              </div>
            ) : (
              // Show record button
              <button
                onClick={() => {
                  if (isRecording) {
                    handleStopRecording();
                  } else {
                    handleStartRecording(currentSlide);
                  }
                }}
                disabled={!isMicReady}
                className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 text-white shadow-lg scale-105 animate-pulse' 
                    : isMicReady 
                      ? 'bg-primary text-white shadow-md hover:shadow-lg active:scale-95' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isRecording ? <Square size={24} className="sm:w-8 sm:h-8" /> : <Mic size={24} className="sm:w-8 sm:h-8" />}
              </button>
            )}

            {!isRecording && !isMicReady && (
              <p className="text-xs text-red-500 text-center">Please allow microphone access in your browser settings</p>
            )}

            {/* Duration warning */}
            {isRecording && duration >= MAX_RECORDING_DURATION - 2 && (
              <p className="text-xs text-orange-500 font-medium animate-pulse">
                ⚠️ {MAX_RECORDING_DURATION - duration}s remaining
              </p>
            )}
            {isRecording && duration >= MAX_RECORDING_DURATION && (
              <p className="text-xs text-red-500 font-medium">
                ⛔ Maximum {MAX_RECORDING_DURATION}s reached
              </p>
            )}

            {statusMessage && (
              <div className={`text-center text-xs sm:text-sm font-medium ${
                statusMessage.includes('🎉') ? 'text-green-600' : 'text-red-500'
              }`}>
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          <div className="text-center py-3 sm:py-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50 rounded-full text-green-700 text-xs sm:text-sm">
              <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
              {t('exercisePractice.alreadySubmitted')}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button - Show when all slides recorded */}
      {!hasSubmitted && allRecorded && totalSlides > 0 && !isRecording && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-3 sm:p-4 border-2 border-green-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-sm font-medium text-green-800">✅ All slides recorded!</p>
              <p className="text-xs text-green-600">{totalSlides} {t('exercisePractice.slidesRecorded', 'slides recorded')}</p>
            </div>
            <button
              onClick={handleSubmitAllRecordings}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('exercisePractice.submitting')}
                </>
              ) : (
                <>
                  <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {t('exercisePractice.submitAll', 'Submit All Recordings')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Show message if no recording yet for this slide */}
      {!hasSubmitted && !isSlideRecorded && !isRecording && (
        <div className="bg-gray-50 rounded-2xl p-3 sm:p-4 border border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            🎤 {t('exercisePractice.recordSlide', 'Record audio for this slide')}
          </p>
        </div>
      )}

      {/* Show message if all slides recorded but not submitted */}
      {!hasSubmitted && allRecorded && !isRecording && totalSlides > 0 && (
        <div className="text-center text-sm text-green-600 font-medium">
          ✅ All slides recorded! Click the green button above to submit.
        </div>
      )}

      {/* Rejected - Show option to try again */}
      {isRejected && (
        <button
          onClick={() => {
            setRecordings({});
            setRecordingForSlide(null);
            setStatusMessage('');
            // Reset any existing submission state
            window.location.reload();
          }}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />
          {t('exercisePractice.tryAgain', 'Try Again')}
        </button>
      )}
    </div>
  );
}