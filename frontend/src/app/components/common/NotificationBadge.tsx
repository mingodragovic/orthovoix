// src/app/components/common/NotificationBadge.tsx
import { useUnreadCount } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationBadge({ className, showLabel = true }: NotificationBadgeProps) {
  const { data: unreadCount, isLoading } = useUnreadCount();

  if (isLoading || !unreadCount || unreadCount === 0) {
    return null;
  }

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full",
        showLabel ? "ml-auto px-2 py-0.5 min-w-[20px] h-5" : "absolute -top-1 -right-1 w-5 h-5",
        className
      )}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}