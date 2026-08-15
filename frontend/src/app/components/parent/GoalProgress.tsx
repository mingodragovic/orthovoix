// src/components/parent/GoalProgress.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface GoalProgressProps {
  totalGoals: number;
  achievedGoals: number;
  goalCompletionRate: number;
  goalStatusCount: {
    'not-started': number;
    'in-progress': number;
    'achieved': number;
    'abandoned': number;
  };
}

export function GoalProgress({
  totalGoals,
  achievedGoals,
  goalCompletionRate,
  goalStatusCount,
}: GoalProgressProps) {
  const { t } = useTranslation();

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (goalCompletionRate / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        {t('progress.goals.title', 'Goal Progress')}
      </h3>

      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="#E5E7EB" strokeWidth="12" />
            <circle
              cx="65"
              cy="65"
              r="54"
              fill="none"
              stroke="url(#goalGradient)"
              strokeWidth="12"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
            />
            <defs>
              <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4A90D9" />
                <stop offset="100%" stopColor="#6EC6A0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{goalCompletionRate}%</span>
            <span className="text-xs text-gray-500">{t('progress.goals.completionRate', 'Completion Rate')}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{t('progress.goals.total', 'Total Goals')}</span>
            <span className="font-medium">{totalGoals}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <CheckCircle size={14} className="text-green-500" />
              {t('progress.goals.achieved', 'Achieved')}
            </span>
            <span className="font-medium text-green-600">{achievedGoals}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <Clock size={14} className="text-blue-500" />
              {t('progress.goals.inProgress', 'In Progress')}
            </span>
            <span className="font-medium text-blue-600">{goalStatusCount['in-progress']}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <AlertCircle size={14} className="text-yellow-500" />
              {t('progress.goals.notStarted', 'Not Started')}
            </span>
            <span className="font-medium text-yellow-600">{goalStatusCount['not-started']}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600">
              <XCircle size={14} className="text-red-500" />
              {t('progress.goals.abandoned', 'Abandoned')}
            </span>
            <span className="font-medium text-red-600">{goalStatusCount['abandoned']}</span>
          </div>
        </div>
      </div>
    </div>
  );
}