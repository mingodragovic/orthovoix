// src/components/parent/NotificationCard.tsx
import { useTranslation } from '@/hooks/useTranslation';
import { Bell, CheckCircle, Clock, AlertCircle, Calendar, BookOpen, TrendingUp } from 'lucide-react';
import { NotificationType } from '@/types/notification.types';

interface NotificationCardProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timeAgo: string;
  onMarkRead?: (id: string) => void;
  onClick?: () => void;
}

export function NotificationCard({
  id,
  title,
  message,
  type,
  read,
  timeAgo,
  onMarkRead,
  onClick,
}: NotificationCardProps) {
  const { t } = useTranslation();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'appointment':
      case 'appointment-reminder':
        return <Calendar size={16} className="text-blue-500" />;
      case 'exercise':
      case 'exercise-assigned':
      case 'exercise-due-soon':
      case 'exercise-overdue':
        return <BookOpen size={16} className="text-green-500" />;
      case 'progress':
      case 'progress-updated':
        return <TrendingUp size={16} className="text-purple-500" />;
      case 'system':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'appointment':
      case 'appointment-reminder':
        return 'bg-blue-50';
      case 'exercise':
      case 'exercise-assigned':
      case 'exercise-due-soon':
      case 'exercise-overdue':
        return 'bg-green-50';
      case 'progress':
      case 'progress-updated':
        return 'bg-purple-50';
      case 'system':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!read ? 'bg-primary/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`${getIconBg(type)} p-2 rounded-lg flex-shrink-0`}>
          {getIcon(type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`text-sm font-medium ${!read ? 'text-gray-900' : 'text-gray-700'}`}>
                {title}
              </p>
              <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{message}</p>
            </div>
            {!read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead?.(id);
                }}
                className="flex-shrink-0 p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title={t('notifications.markRead')}
              >
                <CheckCircle size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}