// src/app/pages/ParentExercises.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { usePatientExercises } from '@/hooks/usePatientExercises';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Search, Filter, BookOpen, Clock, CheckCircle, Mic, Star, Grid3x3, List } from 'lucide-react';
import { PatientExerciseStatus } from '@/types/patient-exercise.types';
import { motion } from 'motion/react';

interface ExerciseCardProps {
  id: string;
  title: string;
  category: string;
  coverImageUrl?: string | null;
  status: PatientExerciseStatus;
  score?: number | null;
  dueDate?: string | null;
  onClick: () => void;
  onPractice: () => void;
  t: (key: string, values?: Record<string, any>) => string;
}

function ExerciseCard({ 
  id, 
  title, 
  category, 
  coverImageUrl, 
  status, 
  score, 
  dueDate, 
  onClick, 
  onPractice,
  t 
}: ExerciseCardProps) {
  const getStatusBadge = () => {
    const configs: Record<string, { label: string; color: string }> = {
      'assigned': { label: t('patientExercises.status.assigned'), color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'in-progress': { label: t('patientExercises.status.inProgress'), color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'completed': { label: t('patientExercises.status.completed'), color: 'bg-green-100 text-green-700 border-green-200' },
      'overdue': { label: t('patientExercises.status.overdue'), color: 'bg-red-100 text-red-700 border-red-200' },
      'cancelled': { label: t('patientExercises.status.cancelled'), color: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    return configs[status] || configs['assigned'];
  };

  const getStatusIcon = () => {
    const icons: Record<string, JSX.Element> = {
      'completed': <CheckCircle className="w-4 h-4" />,
      'in-progress': <Clock className="w-4 h-4" />,
      'assigned': <BookOpen className="w-4 h-4" />,
      'overdue': <Clock className="w-4 h-4" />,
      'cancelled': <BookOpen className="w-4 h-4" />,
    };
    return icons[status] || icons['assigned'];
  };

  const isCompleted = status === 'completed';
  const isOverdue = status === 'overdue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {coverImageUrl ? (
          <img 
            src={coverImageUrl} 
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🎯
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm ${getStatusBadge().color}`}>
            {getStatusIcon()}
            {getStatusBadge().label}
          </span>
        </div>

        {/* Overdue Indicator */}
        {isOverdue && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-red-500 text-white border-red-400 shadow-sm animate-pulse">
              ⚠️ {t('patientExercises.status.overdue')}
            </span>
          </div>
        )}

        {/* Score Badge for Completed */}
        {isCompleted && score !== null && score !== undefined && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm">
              <Star className="w-3 h-3" />
              {score}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {category}
        </p>
        
        {dueDate && !isCompleted && (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t('patientExercises.dueDate')}: {new Date(dueDate).toLocaleDateString()}
          </p>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPractice();
          }}
          className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isCompleted 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
              : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4" />
              {t('exercisePractice.alreadySubmitted')}
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              {t('exercisePractice.recordYourself')}
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function ParentExercises() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: dashboard } = useParentDashboard();
  const childId = dashboard?.child.id;

  const { data: exercisesData, isLoading, error } = usePatientExercises(
    childId || '',
    statusFilter as PatientExerciseStatus || undefined
  );

  // ✅ FIX: Handle both cases - if data is array directly or wrapped in data property
  let exercises: any[] = [];
  if (exercisesData) {
    if (Array.isArray(exercisesData)) {
      exercises = exercisesData;
    } else if (exercisesData.data && Array.isArray(exercisesData.data)) {
      exercises = exercisesData.data;
    } else if (Array.isArray((exercisesData as any)?.data)) {
      exercises = (exercisesData as any).data;
    }
  }

  const statusOptions: { value: string; label: string }[] = [
    { value: '', label: t('common.all') },
    { value: 'assigned', label: t('patientExercises.status.assigned') },
    { value: 'in-progress', label: t('patientExercises.status.inProgress') },
    { value: 'completed', label: t('patientExercises.status.completed') },
    { value: 'overdue', label: t('patientExercises.status.overdue') },
    { value: 'cancelled', label: t('patientExercises.status.cancelled') },
  ];

  const filteredExercises = exercises.filter((exercise: any) =>
    exercise.exerciseTitle?.toLowerCase().includes(search.toLowerCase()) || false
  );

  const statusFilteredExercises = statusFilter
    ? filteredExercises.filter((exercise: any) => exercise.status === statusFilter)
    : filteredExercises;

  const getStatusCount = (status: string) => {
    if (!status) return exercises.length;
    return exercises.filter((e: any) => e.status === status).length;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !childId) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {t('parent.exercises.title')}
        </h1>
        <p className="text-sm text-gray-500">
          {t('parent.exercises.subtitle')}
        </p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-4 gap-2">
        {statusOptions.filter(s => s.value).map((option) => (
          <button
            key={option.value}
            onClick={() => setStatusFilter(option.value)}
            className={`text-center p-2 rounded-xl transition-all ${
              statusFilter === option.value 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <p className="text-lg font-bold">{getStatusCount(option.value)}</p>
            <p className="text-[10px] font-medium truncate">{option.label}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('parent.exercises.search')}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="px-3 py-2.5 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Toggle view"
        >
          {viewMode === 'grid' ? <List size={18} /> : <Grid3x3 size={18} />}
        </button>
      </div>

      {/* Exercise Grid */}
      {statusFilteredExercises.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('parent.exercises.empty')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('parent.exercises.emptyDescription')}
          </p>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
          {statusFilteredExercises.map((exercise: any) => {
            return (
              <ExerciseCard
                key={exercise.id}
                id={exercise.id}
                title={exercise.exerciseTitle}
                category={exercise.exerciseCategory}
                coverImageUrl={exercise.coverImageUrl}
                status={exercise.status}
                score={exercise.performance?.score}
                dueDate={exercise.dueDate}
                onClick={() => navigate(`/parent/exercises/${exercise.id}`)}
                onPractice={() => navigate(`/parent/exercises/${exercise.id}/practice`)}
                t={t}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}