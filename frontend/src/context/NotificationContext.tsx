// context/NotificationContext.tsx — EcoTrade Rwanda
// Persistent, typed notification system with localStorage backing.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

export type NotificationType = 'bid' | 'collection' | 'payment' | 'system' | 'message' | 'alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;   // ISO string
  read: boolean;
  link?: string;
  meta?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'ecotrade_notifications';
const MAX_NOTIFICATIONS = 50;

function genId() {
  return `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Seed demo notifications ─────────────────────────────────────────────────
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'demo_1',
    type: 'bid',
    title: 'New Bid Received',
    message: 'GreenEnergy Recyclers placed a bid of RWF 17,500 on your UCO listing',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/business',
  },
  {
    id: 'demo_2',
    type: 'collection',
    title: 'Pickup Scheduled',
    message: 'Your glass collection is confirmed for tomorrow at 09:00',
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    link: '/dashboard/business',
  },
  {
    id: 'demo_3',
    type: 'payment',
    title: 'Payment Confirmed',
    message: 'RWF 25,000 has been transferred to your account',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'demo_4',
    type: 'system',
    title: 'Green Score Updated',
    message: 'Your green score increased to 87 — excellent work!',
    time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        // First visit — seed demo notifications
        setNotifications(DEMO_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_NOTIFICATIONS));
      }
    } catch {
      setNotifications(DEMO_NOTIFICATIONS);
    }
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'time' | 'read'>) => {
      const newNotif: Notification = {
        ...n,
        id: genId(),
        time: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => {
        const updated = [newNotif, ...prev];
        const trimmed = updated.slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        return trimmed;
      });
    },
    [],
  );

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markRead, markAllRead, remove, clearAll }}
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
