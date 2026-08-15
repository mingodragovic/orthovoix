// src/app/pages/ExerciseList.tsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, BookOpen, Clock, Tag } from 'lucide-react';
import { useExercises, useExerciseCategories, useDeleteExercise } from '@/hooks/useExercises';
import { useTranslation } from '@/hooks/useTranslation';
import { Exercise, ExerciseCategory, ExerciseDifficulty } from '@/types/exercise.types';
import { useAuth } from '@/providers/AuthProvider';
import { Column, DataTable } from '../components/ui/DataTable';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ExerciseEditModal } from '../components/exercises/ExerciseEditModal';
import { ExerciseCreateModal } from '../components/exercises/ExerciseCreateModal';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Pagination } from '../components/ui/Pagination';

export function ExerciseList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [exerciseToEdit, setExerciseToEdit] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useExercises({
    page,
    limit: 10,
    search: search || undefined,
    category: categoryFilter as ExerciseCategory || undefined,
    difficulty: difficultyFilter as ExerciseDifficulty || undefined,
    isActive: showInactive ? false : true,
  });

  const { data: categoriesData } = useExerciseCategories();
  const deleteExercise = useDeleteExercise();

  const getDifficultyLabel = (difficulty: ExerciseDifficulty) => {
    switch(difficulty) {
      case 'beginner': return t('exercises.difficulty.beginner');
      case 'intermediate': return t('exercises.difficulty.intermediate');
      case 'advanced': return t('exercises.difficulty.advanced');
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
      pronunciation: t('exercises.category.pronunciation'),
      vocabulary: t('exercises.category.vocabulary'),
      grammar: t('exercises.category.grammar'),
      comprehension: t('exercises.category.comprehension'),
      fluency: t('exercises.category.fluency'),
      articulation: t('exercises.category.articulation'),
      phonology: t('exercises.category.phonology'),
      language: t('exercises.category.language'),
      social_communication: t('exercises.category.social_communication'),
      other: t('exercises.category.other'),
    };
    return labels[category] || category;
  };

  const handleDeleteClick = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (exerciseToDelete) {
      deleteExercise.mutate(exerciseToDelete.id);
      setDeleteModalOpen(false);
      setExerciseToDelete(null);
    }
  };

  const handleEditClick = (exerciseId: string) => {
    setExerciseToEdit(exerciseId);
    setEditModalOpen(true);
  };

  const columns: Column<Exercise>[] = useMemo(() => [
    {
      key: 'title',
      header: t('exercises.title'),
      sortable: true,
      render: (exercise) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {exercise.imageUrl ? (
              <img 
                src={exercise.imageUrl} 
                alt={exercise.title}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <BookOpen size={20} />
            )}
          </div>
          <div>
            <div className="font-medium line-clamp-1">{exercise.title}</div>
            <div className="text-xs text-gray-500 line-clamp-1">{exercise.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: t('exercises.category'),
      sortable: true,
      render: (exercise) => (
        <span className="text-sm text-gray-700">
          {getCategoryLabel(exercise.category)}
        </span>
      ),
    },
    {
      key: 'difficulty',
      header: t('exercises.difficulty'),
      sortable: true,
      render: (exercise) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(exercise.difficulty)}`}>
          {getDifficultyLabel(exercise.difficulty)}
        </span>
      ),
    },
    {
      key: 'duration',
      header: t('exercises.duration'),
      sortable: true,
      render: (exercise) => (
        <span className="text-sm text-gray-700 flex items-center gap-1">
          <Clock size={14} className="text-gray-400" />
          {exercise.duration ? `${exercise.duration} ${t('exercises.minutes')}` : '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: t('exercises.status'),
      sortable: true,
      render: (exercise) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          exercise.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {exercise.isActive ? t('exercises.active') : t('exercises.inactive')}
        </span>
      ),
    },
  ], [t, getCategoryLabel, getDifficultyLabel, getDifficultyColor]);

  const exercises = data?.data?.items || [];
  const pagination = data?.data || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const categories = categoriesData?.data?.categories || [];

  const categoryOptions = useMemo(() => 
    categories.map((cat) => ({
      label: getCategoryLabel(cat),
      value: cat,
      field: 'category' as keyof Exercise,
    })),
  [categories, getCategoryLabel]);

  const difficultyOptions = useMemo(() => [
    { label: t('exercises.difficulty.beginner'), value: 'beginner', field: 'difficulty' as keyof Exercise },
    { label: t('exercises.difficulty.intermediate'), value: 'intermediate', field: 'difficulty' as keyof Exercise },
    { label: t('exercises.difficulty.advanced'), value: 'advanced', field: 'difficulty' as keyof Exercise },
  ], [t]);

  return (
    <div className="space-y-6">
      <Breadcrumb showBack={true} showHome={true} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('exercises.title')}
          </h1>
          <p className="text-muted-foreground">{t('exercises.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => {
                setShowInactive(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            {t('exercises.showInactive')}
          </label>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-medium hover:shadow-lg active:scale-95 transition-all"
          >
            <Plus size={18} />
            {t('exercises.add')}
          </button>
        </div>
      </div>

      <DataTable<Exercise>
        data={exercises}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder={t('exercises.search')}
        searchFields={['title', 'description']}
        filterOptions={[...categoryOptions, ...difficultyOptions]}
        emptyMessage={t('exercises.noResults')}
        actions={(exercise) => (
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/exercises/${exercise.id}`)} className="p-1 hover:bg-gray-100 rounded" title={t('common.view')}>
              <Eye className="w-4 h-4 text-gray-500 hover:text-primary" />
            </button>
            <button onClick={() => handleEditClick(exercise.id)} className="p-1 hover:bg-gray-100 rounded" title={t('common.edit')}>
              <Edit className="w-4 h-4 text-gray-500 hover:text-blue-600" />
            </button>
            <button onClick={() => handleDeleteClick(exercise)} className="p-1 hover:bg-gray-100 rounded" title={t('common.delete')} disabled={deleteExercise.isPending}>
              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      />

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={setPage}
        />
      )}

      <ExerciseCreateModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={() => refetch()} />
      {exerciseToEdit && (
        <ExerciseEditModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setExerciseToEdit(null); }}
          exerciseId={exerciseToEdit}
          onSuccess={() => refetch()}
        />
      )}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('exercises.delete.title')}
        message={t('exercises.delete.confirm', { title: exerciseToDelete?.title || '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteExercise.isPending}
      />
    </div>
  );
}