// src/app/pages/ParentNotifications.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  useNotifications, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead,
  useUnreadCount
} from '@/hooks/useNotifications';
import { NotificationCard } from '../components/parent/NotificationCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, CheckCheck, Filter } from 'lucide-react';

export function ParentNotifications() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data, isLoading, error, refetch } = useNotifications(1, 20, showUnreadOnly ? false : undefined);
  const { data: unreadCount, refetch: refetchUnread } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.items || [];

  const handleMarkRead = (id: string) => {
    markRead.mutate(id, {
      onSuccess: () => {
        refetch();
        refetchUnread();
      },
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        refetch();
        refetchUnread();
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  return (
<div className="space-y-4 pb-20 mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/parent')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {t('parent.notifications.title', 'Notifications')}
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount !== undefined && unreadCount > 0
              ? t('parent.notifications.unread', { count: unreadCount })
              : t('parent.notifications.noUnread', 'No unread notifications')}
          </p>
        </div>
        {unreadCount !== undefined && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            {t('parent.notifications.markAllRead', 'Mark all read')}
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
            className="w-4 h-4 text-primary rounded focus:ring-primary"
          />
          {t('parent.notifications.unreadOnly', 'Unread only')}
        </label>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-semibold mb-2">
            {t('parent.notifications.empty', 'No notifications')}
          </h3>
          <p className="text-gray-500 text-sm">
            {t('parent.notifications.emptyDescription', 'Stay tuned for updates!')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              id={notification.id}
              title={notification.title}
              message={notification.message}
              type={notification.type}
              read={notification.read}
              timeAgo={notification.timeAgo}
              onMarkRead={handleMarkRead}
              onClick={() => {
                if (!notification.read) {
                  handleMarkRead(notification.id);
                }
                if (notification.actionUrl) {
                  navigate(notification.actionUrl);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}