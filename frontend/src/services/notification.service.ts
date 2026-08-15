// src/services/notification.service.ts
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types/notification.types';

// Event types for better type safety
export interface NotificationEvents {
  'new-notification': (notification: Notification) => void;
  'unread-count': (data: { count: number }) => void;
  'notification-read': (data: { notificationId: string }) => void;
  'notification-deleted': (data: { notificationId: string }) => void;
  'notifications-cleared': (data: { message: string }) => void;
}

class NotificationService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: {
    onNewNotification?: (notification: Notification) => void;
    onUnreadCount?: (count: number) => void;
    onNotificationRead?: (notificationId: string) => void;
    onNotificationDeleted?: (notificationId: string) => void;
    onNotificationsCleared?: () => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
  } = {};

  /**
   * Connect to the WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    this.token = token;
    this.reconnectAttempts = 0;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    this.socket = io(`${socketUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupListeners();
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  /**
   * Set up all socket event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.listeners.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ WebSocket disconnected: ${reason}`);
      this.isConnected = false;
      this.listeners.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.listeners.onError?.(error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 WebSocket reconnect attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ WebSocket reconnect error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnect failed after max attempts');
    });

    // Notification events
    this.socket.on('new-notification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification);
      this.listeners.onNewNotification?.(notification);
    });

    this.socket.on('unread-count', (data: { count: number }) => {
      console.log(`📊 Unread count updated: ${data.count}`);
      this.listeners.onUnreadCount?.(data.count);
    });

    this.socket.on('notification-read', (data: { notificationId: string }) => {
      console.log(`📖 Notification read: ${data.notificationId}`);
      this.listeners.onNotificationRead?.(data.notificationId);
    });

    this.socket.on('notification-deleted', (data: { notificationId: string }) => {
      console.log(`🗑️ Notification deleted: ${data.notificationId}`);
      this.listeners.onNotificationDeleted?.(data.notificationId);
    });

    this.socket.on('notifications-cleared', (data: { message: string }) => {
      console.log(`🧹 All notifications cleared: ${data.message}`);
      this.listeners.onNotificationsCleared?.();
    });

    // Generic error handler
    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      this.listeners.onError?.(error);
    });
  }

  /**
   * Emit events to the server
   */
  emit<T = void>(event: string, data?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Join a user's notification room
   */
  joinUserRoom(userId: string): Promise<void> {
    return this.emit('join-user', { userId });
  }

  /**
   * Mark a notification as read
   */
  markNotificationRead(notificationId: string): Promise<void> {
    return this.emit('mark-read', { notificationId });
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead(): Promise<void> {
    return this.emit('mark-all-read', {});
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Promise<void> {
    return this.emit('delete-notification', { notificationId });
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): Promise<void> {
    return this.emit('clear-notifications', {});
  }

  /**
   * Get the socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if socket is connected
   */
  isSocketConnected(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  // === Listener registration methods ===

  onNewNotification(callback: (notification: Notification) => void) {
    this.listeners.onNewNotification = callback;
  }

  onUnreadCount(callback: (count: number) => void) {
    this.listeners.onUnreadCount = callback;
  }

  onNotificationRead(callback: (notificationId: string) => void) {
    this.listeners.onNotificationRead = callback;
  }

  onNotificationDeleted(callback: (notificationId: string) => void) {
    this.listeners.onNotificationDeleted = callback;
  }

  onNotificationsCleared(callback: () => void) {
    this.listeners.onNotificationsCleared = callback;
  }

  onConnect(callback: () => void) {
    this.listeners.onConnect = callback;
  }

  onDisconnect(callback: () => void) {
    this.listeners.onDisconnect = callback;
  }

  onError(callback: (error: Error) => void) {
    this.listeners.onError = callback;
  }

  /**
   * Remove all listeners
   */
  removeListeners(): void {
    this.listeners = {};
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Remove a specific listener
   */
  removeListener(event: keyof NotificationEvents): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();