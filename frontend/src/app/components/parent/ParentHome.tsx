// src/app/components/parent/ParentHome.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Bell,
  Award,
  Target,
  ChevronRight
} from 'lucide-react';
import { ChildHeader } from './ChildHeader';
import { StatCard } from './StatCard';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';

export function ParentHome() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const isParent = user?.role === 'parent';
  
  // ✅ Only fetch if user is parent and not loading
  const { data: dashboard, isLoading, error } = useParentDashboard();

  // Handle loading states
  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Handle error
  if (error || !dashboard || !isParent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <p className="text-red-500">{t('common.error')}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  const { child, stats, progressTrend, recentExercises, upcomingAppointments, recentNotifications } = dashboard;

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  // Pie chart data for exercise status
  const pieData = [
    { name: t('parent.dashboard.stats.completed'), value: stats.completedExercises, color: '#48BB78' },
    { name: t('parent.dashboard.stats.inProgress'), value: stats.inProgressExercises, color: '#4A90D9' },
    { name: t('parent.dashboard.stats.overdue'), value: stats.overdueExercises, color: '#FC8181' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Child Info */}
      <ChildHeader
        firstName={child.firstName}
        lastName={child.lastName}
        age={child.age}
        status={child.status}
        avatar={child.avatar}
      />

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={t('parent.dashboard.stats.totalExercises')}
          value={stats.totalExercises}
          icon={BookOpen}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          label={t('parent.dashboard.stats.completed')}
          value={stats.completedExercises}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label={t('parent.dashboard.stats.inProgress')}
          value={stats.inProgressExercises}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label={t('parent.dashboard.stats.overdue')}
          value={stats.overdueExercises}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.completionRate')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.completionRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.averageScore')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.averageScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.latestScore')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.latestScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.upcomingAppointments')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
        </div>
      </div>

      {/* Recent Exercises */}
      {recentExercises && recentExercises.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">
              {t('parent.dashboard.recentExercises')}
            </h2>
            <button
              onClick={() => navigate('/parent/exercises')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentExercises.slice(0, 3).map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/parent/exercises/${exercise.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{exercise.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        exercise.status === 'completed' ? 'bg-green-100 text-green-700' :
                        exercise.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        exercise.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t(`patientExercises.status.${exercise.status}`)}
                      </span>
                      {exercise.score !== null && exercise.score !== undefined && (
                        <span className="text-xs text-gray-500">Score: {exercise.score}%</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {recentNotifications && recentNotifications.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">
              {t('parent.dashboard.recentNotifications', 'Recent Notifications')}
            </h2>
            <button
              onClick={() => navigate('/parent/notifications')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentNotifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md cursor-pointer ${
                  !notification.read ? 'border-l-4 border-l-primary border-gray-100' : 'border-gray-100'
                }`}
                onClick={() => {
                  if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    !notification.read ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(notification.createdAt)}</p>
                  </div>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}