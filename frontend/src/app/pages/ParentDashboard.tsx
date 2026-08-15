// src/app/pages/ParentDashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useParentDashboard } from '@/hooks/useParentDashboard';
import { useUnreadCount } from '@/hooks/useNotifications';
import { ChildHeader } from '@/app/components/parent/ChildHeader';
import { StatCard } from '@/app/components/parent/StatCard';
import { ExerciseCard } from '@/app/components/parent/ExerciseCard';
import { AppointmentCard } from '@/app/components/parent/AppointmentCard';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Bell,
  Award,
  Target
} from 'lucide-react';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/providers/AuthProvider';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';

export function ParentDashboard() {
  const { user } = useAuth();
  const isParent = user?.role === 'parent';
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  
  const { data: dashboard, isLoading, error } = useParentDashboard(isParent);
  const { data: unreadCount } = useUnreadCount();

  const getLocale = () => {
    switch(language) {
      case 'ar': return arSA;
      case 'en': return enUS;
      default: return fr;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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

  // Pie chart data for exercise status
  const pieData = [
    { name: t('parent.dashboard.stats.completed'), value: stats.completedExercises, color: '#48BB78' },
    { name: t('parent.dashboard.stats.inProgress'), value: stats.inProgressExercises, color: '#4A90D9' },
    { name: t('parent.dashboard.stats.overdue'), value: stats.overdueExercises, color: '#FC8181' },
  ].filter(item => item.value > 0);

  const COLORS = ['#48BB78', '#4A90D9', '#FC8181'];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('parent.dashboard.title', 'Dashboard')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('parent.dashboard.subtitle', 'Welcome back!')}
          </p>
        </div>
        <button
          onClick={() => navigate('/parent/notifications')}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

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
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.averageScore', 'Average Score')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.averageScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('parent.dashboard.stats.latestScore', 'Latest Score')}</span>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Trend Line Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('parent.dashboard.progressTrend', 'Progress Trend')}
          </h3>
          {progressTrend && progressTrend.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatDate(value)}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={(value) => formatDate(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4A90D9"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4A90D9' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              {t('parent.dashboard.noTrendData', 'No trend data available')}
            </p>
          )}
        </div>

        {/* Exercise Status Pie Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('parent.dashboard.exerciseDistribution', 'Exercise Distribution')}
          </h3>
          {pieData.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              {t('parent.dashboard.noData', 'No data available')}
            </p>
          )}
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
              className="text-xs text-primary hover:underline"
            >
              {t('common.viewAll')}
            </button>
          </div>
          <div className="space-y-2">
            {recentExercises.slice(0, 3).map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                id={exercise.id}
                title={exercise.title}
                status={exercise.status}
                score={exercise.score}
                dueDate={exercise.dueDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">
              {t('parent.dashboard.upcomingAppointments')}
            </h2>
            <button
              onClick={() => navigate('/parent/appointments')}
              className="text-xs text-primary hover:underline"
            >
              {t('common.viewAll')}
            </button>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                id={appointment.id}
                dateTime={appointment.dateTime}
                location={appointment.location}
                isVirtual={appointment.isVirtual}
                type={appointment.type}
                status="scheduled"
                orthophonisteName=""
              />
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
              className="text-xs text-primary hover:underline"
            >
              {t('common.viewAll')}
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