// src/app/pages/AdminNotifications.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead, 
  useDeleteNotification, 
  useClearAllNotifications 
} from '@/hooks/useNotifications';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter,
  Calendar,
  Clock,
  FileText,
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Activity,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, arSA } from 'date-fns/locale';
import { NotificationType } from '@/types/notification.types';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { ConfirmationModal } from '@/app/components/ui/ConfirmationModal';

// Notification icon mapping - ✅ Fixed to only use valid types
const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, React.ReactNode> = {
    'appointment': <Calendar size={18} className="text-blue-500" />,
    'appointment-created': <Calendar size={18} className="text-green-500" />,
    'appointment-updated': <Calendar size={18} className="text-yellow-500" />,
    'appointment-cancelled': <Calendar size={18} className="text-red-500" />,
    'appointment-reminder': <Clock size={18} className="text-blue-500" />,
    'exercise': <BookOpen size={18} className="text-purple-500" />,
    'exercise-assigned': <BookOpen size={18} className="text-green-500" />,
    'exercise-due-soon': <Clock size={18} className="text-yellow-500" />,
    'exercise-overdue': <AlertCircle size={18} className="text-red-500" />,
    'exercise-completed': <CheckCircle size={18} className="text-green-500" />,
    'progress': <TrendingUp size={18} className="text-indigo-500" />,
    'progress-updated': <TrendingUp size={18} className="text-blue-500" />,
    'progress-milestone': <TrendingUp size={18} className="text-green-500" />,
    'patient': <User size={18} className="text-cyan-500" />,
    'patient-created': <User size={18} className="text-green-500" />,
    'patient-updated': <User size={18} className="text-yellow-500" />,
    'system': <Activity size={18} className="text-gray-500" />,
    'reminder': <Clock size={18} className="text-orange-500" />,
    'report': <FileText size={18} className="text-pink-500" />,
    'report-ready': <FileText size={18} className="text-green-500" />,
  };
  return icons[type] || <Bell size={18} className="text-gray-500" />;
};

// ✅ Fixed: t function with proper signature
const getTypeLabel = (type: NotificationType, t: (key: string, values?: Record<string, any>) => string) => {
  const labels: Record<NotificationType, string> = {
    'appointment': 'Appointment',
    'appointment-created': 'Appointment Created',
    'appointment-updated': 'Appointment Updated',
    'appointment-cancelled': 'Appointment Cancelled',
    'appointment-reminder': 'Appointment Reminder',
    'exercise': 'Exercise',
    'exercise-assigned': 'Exercise Assigned',
    'exercise-due-soon': 'Exercise Due Soon',
    'exercise-overdue': 'Exercise Overdue',
    'exercise-completed': 'Exercise Completed',
    'progress': 'Progress',
    'progress-updated': 'Progress Updated',
    'progress-milestone': 'Progress Milestone',
    'patient': 'Patient',
    'patient-created': 'Patient Created',
    'patient-updated': 'Patient Updated',
    'system': 'System',
    'reminder': 'Reminder',
    'report': 'Report',
    'report-ready': 'Report Ready',
  };
  return labels[type] || type;
};

export function AdminNotifications() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('');
  const [page, setPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useNotifications(page, 20, filterRead ? filterRead === 'read' : undefined);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const clearAll = useClearAllNotifications();

  const notifications = data?.items || [];
  const unreadCount = notifications.filter(n => !n.read).length;
  const pagination = data || { total: 0, page: 1, limit: 20, totalPages: 1 };

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

  const handleMarkRead = (id: string) => {
    markRead.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => refetch(),
    });
  };

  const handleDelete = (id: string) => {
    setSelectedNotificationId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedNotificationId) {
      deleteNotification.mutate(selectedNotificationId, {
        onSuccess: () => {
          refetch();
          setDeleteModalOpen(false);
          setSelectedNotificationId(null);
        },
      });
    }
  };

  const handleClearAll = () => {
    clearAll.mutate(undefined, {
      onSuccess: () => refetch(),
    });
  };

  // ✅ Fixed: Filter options with proper labels
  const notificationTypes: { value: string; label: string }[] = [
    { value: '', label: t('common.all') },
    { value: 'appointment', label: 'Appointment' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'progress', label: 'Progress' },
    { value: 'patient', label: 'Patient' },
    { value: 'system', label: 'System' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'report', label: 'Report' },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
        <button onClick={() => refetch()} className="mt-2 text-primary hover:underline">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <Breadcrumb showBack={true} showHome={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {t('notifications.adminTitle', 'Notifications')}
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 
              ? t('notifications.unreadCount', { count: unreadCount }) 
              : t('notifications.noUnread', 'No unread notifications')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} />
              {t('notifications.markAllRead', 'Mark all read')}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearAll.isPending}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              {t('notifications.clearAll', 'Clear all')}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            {notificationTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
          >
            <option value="">{t('notifications.filterStatus', 'All status')}</option>
            <option value="unread">{t('notifications.unread', 'Unread')}</option>
            <option value="read">{t('notifications.read', 'Read')}</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('notifications.empty', 'No notifications')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('notifications.emptyDescription', 'You\'re all caught up!')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-primary border-gray-100' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notification.read ? 'bg-primary/10' : 'bg-gray-50'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title={t('notifications.markRead', 'Mark as read')}
                        >
                          <CheckCheck size={16} className="text-gray-400 hover:text-primary" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{formatDate(notification.createdAt)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      {getTypeLabel(notification.type, t)}
                    </span>
                    {notification.actionUrl && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkRead(notification.id);
                            }
                            navigate(notification.actionUrl!);
                          }}
                          className="text-primary hover:underline"
                        >
                          {t('common.view')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('notifications.deleteTitle', 'Delete Notification')}
        message={t('notifications.deleteConfirm', 'Are you sure you want to delete this notification?')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteNotification.isPending}
      />
    </div>
  );
}