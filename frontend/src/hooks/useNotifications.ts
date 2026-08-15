// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import { notificationService } from '@/services/notification.service';
import { useAuth } from '@/providers/AuthProvider';
import type { Notification, NotificationsResponse } from '@/types/notification.types';

const NOTIFICATIONS_BASE = '/notifications';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page?: number, limit?: number, read?: boolean) =>
    [...notificationKeys.all, 'list', { page, limit, read }] as const,
  unreadCount: ['notifications', 'unreadCount'] as const,
  detail: (id: string) => [...notificationKeys.all, 'detail', id] as const,
};

// Get notifications
export async function getNotifications(
  page = 1,
  limit = 10,
  read?: boolean
): Promise<NotificationsResponse['data']> {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (read !== undefined) params.append('read', String(read));

  const response = await apiClient.get<NotificationsResponse>(
    `${NOTIFICATIONS_BASE}?${params.toString()}`
  );
  return response.data.data;
}

// Get unread count
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ data: { count: number } }>(
    `${NOTIFICATIONS_BASE}/unread-count`
  );
  return response.data.data.count;
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await apiClient.put<Notification>(
    `${NOTIFICATIONS_BASE}/${id}/read`
  );
  return response.data;
}

// Mark all as read
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiClient.put(`${NOTIFICATIONS_BASE}/read-all`);
}

// Delete notification
export async function deleteNotification(id: string): Promise<void> {
  await apiClient.delete(`${NOTIFICATIONS_BASE}/${id}`);
}

// Delete all notifications
export async function clearAllNotifications(): Promise<void> {
  await apiClient.delete(NOTIFICATIONS_BASE);
}

// === QUERIES ===

export function useNotifications(page = 1, limit = 10, read?: boolean) {
  return useQuery({
    queryKey: notificationKeys.list(page, limit, read),
    queryFn: () => getNotifications(page, limit, read),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });
}

// === MUTATIONS ===

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      // Also emit via socket for real-time update
      notificationService.markNotificationRead(id).catch(console.error);
      success(t('notifications.markedRead', 'Notification marked as read'));
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      notificationService.markAllNotificationsRead().catch(console.error);
      success(t('notifications.allMarkedRead', 'All notifications marked as read'));
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      notificationService.deleteNotification(id).catch(console.error);
      success(t('notifications.deleted', 'Notification deleted'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('notifications.deleteError', 'Failed to delete notification');
      error(message);
    },
  });
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
      notificationService.clearAllNotifications().catch(console.error);
      success(t('notifications.allCleared', 'All notifications cleared'));
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || t('notifications.clearError', 'Failed to clear notifications');
      error(message);
    },
  });
}

// === SOCKET HOOK ===

/**
 * Hook to connect to WebSocket and listen for real-time notifications
 */
export function useNotificationSocket() {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('orthovoix_access_token') || sessionStorage.getItem('orthovoix_access_token');
      if (token) {
        // Connect the socket
        notificationService.connect(token);
        
        // Join the user's room
        notificationService.joinUserRoom(user.id).catch(console.error);

        // Set up listeners
        const handleNewNotification = (notification: Notification) => {
          setLastNotification(notification);
          setUnreadCount(prev => prev + 1);
        };

        const handleUnreadCount = (count: number) => {
          setUnreadCount(count);
        };

        const handleConnect = () => {
          setIsConnected(true);
        };

        const handleDisconnect = () => {
          setIsConnected(false);
        };

        notificationService.onNewNotification(handleNewNotification);
        notificationService.onUnreadCount(handleUnreadCount);
        notificationService.onConnect(handleConnect);
        notificationService.onDisconnect(handleDisconnect);

        // Check initial connection status
        setIsConnected(notificationService.isSocketConnected());

        return () => {
          notificationService.removeListener('new-notification');
          notificationService.removeListener('unread-count');
          // Don't disconnect on unmount - keep connection alive for other components
        };
      }
    } else {
      // Disconnect when not authenticated
      notificationService.disconnect();
      setIsConnected(false);
    }
  }, [isAuthenticated, user]);

  return {
    isConnected,
    lastNotification,
    unreadCount,
  };
}