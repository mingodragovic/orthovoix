// src/app/pages/ParentProgress.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useProgressSummary, useProgressChart, useProgressRecords } from '@/hooks/useProgress';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { ProgressChart } from '@/app/components/parent/ProgressChart';
import { StrengthsWeaknesses } from '@/app/components/parent/StrengthsWeaknesses';
import { GoalProgress } from '@/app/components/parent/GoalProgress';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { TrendingUp, Award, Target, ArrowLeft } from 'lucide-react';

export function ParentProgress() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: dashboard } = useParentDashboard();
  const childId = patientId || dashboard?.child.id;

  const { data: summary, isLoading: summaryLoading } = useProgressSummary(childId || '');
  const { data: chartData, isLoading: chartLoading } = useProgressChart(childId || '');
  const { data: records, isLoading: recordsLoading } = useProgressRecords(childId || '', undefined, 5);

  if (summaryLoading || chartLoading || recordsLoading || !childId) {
    return <LoadingSpinner />;
  }

  if (!summary) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">{t('progress.noData', 'No progress data available yet')}</p>
      </div>
    );
  }

  const { summary: stats, commonStrengths, commonAreasForImprovement, goalStatusCount, trends } = summary;
  const chart = chartData || { labels: [], datasets: [] };

  return (
<div className="space-y-6 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('parent.progress.title', 'Progress')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('parent.progress.subtitle', 'Track your child\'s therapy progress')}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs text-gray-500">
              {t('progress.latestScore', 'Latest Score')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.latestOverallScore ?? '-'}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-primary" />
            <span className="text-xs text-gray-500">
              {t('progress.averageScore', 'Average Score')}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.averageOverallScore ?? '-'}%
          </p>
        </div>
      </div>

      {/* Goals */}
      <GoalProgress
        totalGoals={stats.totalGoals}
        achievedGoals={stats.achievedGoals}
        goalCompletionRate={stats.goalCompletionRate}
        goalStatusCount={goalStatusCount}
      />

      {/* Chart */}
      {chart.labels.length > 0 && chart.datasets.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('progress.chart', 'Progress Chart')}
          </h3>
          <ProgressChart
            labels={chart.labels}
            datasets={chart.datasets}
          />
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <StrengthsWeaknesses
        strengths={commonStrengths}
        areasForImprovement={commonAreasForImprovement}
      />

      {/* Recent Records */}
      {records && records.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('progress.recentRecords', 'Recent Records')}
          </h3>
          <div className="space-y-3">
            {records.slice(0, 5).map((record) => (
              <div key={record.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {record.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(record.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {record.scores.overallScore ?? '-'}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('progress.score', 'Score')}
                    </p>
                  </div>
                </div>
                {record.notes && (
                  <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}