// context/NotificationContext.tsx — EcoTrade Rwanda
// Backend-powered notification system with auto-refresh

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { notificationsAPI } from '../services/api';

export type NotificationType = 'bid' | 'collection' | 'payment' | 'system' | 'message' | 'alert';

export interface Notification {
  id: string | number;
  type?: NotificationType | string;
  title: string;
  body?: string;
  message?: string;
  time?: string;   // ISO string or created_at
  created_at?: string;
  read?: boolean;
  is_read?: boolean;
  link?: string;
  meta?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string | number) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string | number) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);


export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('ecotrade_token');
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      // Fetch notifications from backend
      const notifs = await notificationsAPI.list();
      setNotifications(notifs as Notification[]);
      
      // Fetch unread count
      const { count } = await notificationsAPI.unreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // On error, keep existing notifications
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 30 seconds
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Refresh on auth changes
  useEffect(() => {
    const handleAuthChange = () => refresh();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [refresh]);

  const markRead = useCallback(async (id: string | number) => {
    try {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      await notificationsAPI.markRead(numId);
      setNotifications(prev =>
        prev.map(n => {
          const nId = typeof n.id === 'string' ? parseInt(n.id, 10) : n.id;
          return nId === numId ? { ...n, is_read: true, read: true } : n;
        })
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const remove = useCallback((id: string | number) => {
    // Optimistic update - remove locally
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    setNotifications(prev => prev.filter(n => {
      const nId = typeof n.id === 'string' ? parseInt(n.id, 10) : n.id;
      return nId !== numId;
    }));
  }, []);

  const clearAll = useCallback(() => {
    // Optimistic update - clear locally
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead, remove, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
