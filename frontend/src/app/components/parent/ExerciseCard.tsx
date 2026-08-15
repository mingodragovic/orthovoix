// src/components/parent/ExerciseCard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Play, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

interface ExerciseCardProps {
  id: string;
  title: string;
  status: string;
  score: number | null;
  dueDate: string;
  imageUrl?: string | null;
  onClick?: () => void;
}

export function ExerciseCard({ id, title, status, score, dueDate, imageUrl, onClick }: ExerciseCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'assigned': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-green-600" />;
      case 'in-progress': return <Clock size={14} className="text-blue-600" />;
      case 'assigned': return <Clock size={14} className="text-yellow-600" />;
      case 'overdue': return <AlertCircle size={14} className="text-red-600" />;
      default: return null;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/parent/exercises/${id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* Image / Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <Play size={20} className="text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900 truncate">{title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  {t(`patientExercises.status.${status}`)}
                </span>
                {score !== null && score !== undefined && (
                  <span className="text-xs text-gray-500">
                    {t('exercises.score', 'Score')}: {score}%
                  </span>
                )}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-1" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {t('patientExercises.dueDate')}: {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}
          </p>
        </div>
      </div>
    </button>
  );
}