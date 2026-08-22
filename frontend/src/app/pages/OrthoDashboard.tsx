// src/app/pages/OrthoDashboard.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminDashboard } from '@/hooks/useDashboard';
import { useUnreadCount } from '@/hooks/useNotifications';
import { Bell, TrendingUp, Users, CheckCircle, Clock, Calendar, UserPlus, Activity, BarChart3, Award } from "lucide-react";
import { Avatar } from "../components/common/Avatar";
import { useAuth } from '@/providers/AuthProvider';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
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
  BarChart,
  Bar,
} from 'recharts';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { NotificationBadge } from '../components/common/NotificationBadge';

export function OrthoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language } = useTranslation();
  
  const { data: dashboard, isLoading, error } = useAdminDashboard();
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
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  const formatMonth = (monthString: string) => {
    try {
      const date = new Date(monthString + '-01');
      return format(date, 'MMM yyyy', { locale: getLocale() });
    } catch {
      return monthString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dashboard) {
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

  const { 
    stats, 
    recentActivity, 
    patientGrowth, 
    categoryDistribution, 
    weeklyCompletionRate,
    patientSatisfaction 
  } = dashboard;

  // Stats for the grid
  const statsData = [
    { 
      label: t('dashboard.totalPatients'), 
      val: stats.totalPatients, 
      color: "#4A90D9", 
      bg: "#EBF4FF", 
      icon: Users 
    },
    { 
      label: t('dashboard.activePatients'), 
      val: stats.activePatients, 
      color: "#48BB78", 
      bg: "#F0FFF4", 
      icon: CheckCircle 
    },
    { 
      label: t('dashboard.pendingAssignments'), 
      val: stats.inProgressAssignments, 
      color: "#F5A623", 
      bg: "#FFFAF0", 
      icon: Clock 
    },
    { 
      label: t('dashboard.upcomingAppointments'), 
      val: stats.upcomingAppointments, 
      color: "#9B59B6", 
      bg: "#F5F0FF", 
      icon: Calendar 
    },
  ];

  // COLORS for pie chart
  const COLORS = ['#4A90D9', '#48BB78', '#F5A623', '#FC8181', '#9B59B6', '#6EC6A0'];

  // Get category label
  const getCategoryLabel = (category: string) => {
    return t(`exercises.category.${category}`, category);
  };

  // Get action label
  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      'completed': '✅ ' + t('dashboard.completed'),
      'assigned': '📝 ' + t('dashboard.assigned'),
      'started': '▶️ ' + t('dashboard.started'),
      'overdue': '⚠️ ' + t('dashboard.overdue'),
    };
    return actions[action] || action;
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <LanguageSelector />

        <div>
          <p className="text-sm text-muted-foreground">{t('dashboard.greeting')},</p>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "Poppins, sans-serif" }}>
            {user?.name || "Dr. Sarah"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('dashboard.todayOverview', "Voici votre aperçu aujourd'hui")}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Bell size={22} className="text-foreground" />
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {user?.avatar ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={user.avatar} 
                alt={user.name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">${user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
                  }
                }}
              />
            </div>
          ) : (
            <Avatar initials={user?.name?.charAt(0)?.toUpperCase() || "DS"} size={42} />
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {statsData.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span className="text-2xl md:text-3xl font-bold" style={{ color: s.color, fontFamily: "Poppins, sans-serif" }}>{s.val}</span>
            </div>
            <div className="text-xs md:text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-primary" />
            <span className="text-xs text-gray-500">{t('dashboard.totalExercises', 'Total Exercises')}</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{stats.totalExercises}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-500" />
            <span className="text-xs text-gray-500">{t('dashboard.completedAssignments', 'Completed')}</span>
          </div>
          <p className="text-xl font-bold text-green-600">{stats.completedAssignments}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-red-500" />
            <span className="text-xs text-gray-500">{t('dashboard.overdueAssignments', 'Overdue')}</span>
          </div>
          <p className="text-xl font-bold text-red-600">{stats.overdueAssignments}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Award size={14} className="text-purple-500" />
            <span className="text-xs text-gray-500">{t('dashboard.completionRate', 'Completion Rate')}</span>
          </div>
          <p className="text-xl font-bold text-purple-600">{stats.averageCompletionRate}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Growth Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('dashboard.patientGrowth', 'Patient Growth')}
          </h3>
          {patientGrowth && patientGrowth.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatMonth}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelFormatter={formatMonth}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="totalPatients"
                    name={t('dashboard.totalPatients')}
                    stroke="#4A90D9"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4A90D9' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newPatients"
                    name={t('dashboard.newPatients')}
                    stroke="#48BB78"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#48BB78' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              {t('dashboard.noData', 'No data available')}
            </p>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {t('dashboard.categoryDistribution', 'Exercise Category Distribution')}
          </h3>
          {categoryDistribution && categoryDistribution.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                    label={({ category, percent }) => `${getCategoryLabel(category)} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => [value, getCategoryLabel(name as string)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">
              {t('dashboard.noData', 'No data available')}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">{t('dashboard.weeklyCompletionRate', 'Weekly Completion Rate')}</p>
              <p className="text-3xl font-bold text-green-700">{weeklyCompletionRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">{t('dashboard.patientSatisfaction', 'Patient Satisfaction')}</p>
              <p className="text-3xl font-bold text-purple-700">{patientSatisfaction}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
              <Award size={24} className="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: "👤", label: t('patients.add'), color: "#EBF4FF", path: "/patients" },
            { icon: "📝", label: t('exercises.add'), color: "#F0FFF4", path: "/exercise-create" },
            { icon: "📋", label: t('sidebar.patients'), color: "#FFFAF0", path: "/patients" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-white shadow-sm hover:shadow-md active:scale-95 transition-all text-left border border-border/50"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl flex-shrink-0" style={{ background: a.color }}>{a.icon}</div>
              <span className="text-sm md:text-base font-medium text-foreground">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-semibold" style={{ fontFamily: "Poppins, sans-serif" }}>
            {t('dashboard.recentActivity')}
          </h2>
          <button 
            onClick={() => navigate('/patients')}
            className="text-sm text-primary font-medium hover:underline"
          >
            {t('common.viewAll')}
          </button>
        </div>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {recentActivity.map((activity, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-4 md:p-5 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow border border-border/50 cursor-pointer"
                onClick={() => navigate(`/patients/${activity.patientId}`)}
              >
                <Avatar initials={activity.patientName?.charAt(0)?.toUpperCase() || 'P'} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium truncate">
                    <span className="font-semibold">{activity.patientName}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="text-primary">{activity.description}</span>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">{t('dashboard.noActivity', 'No recent activity')}</p>
          </div>
        )}
      </div>
    </div>
  );
}