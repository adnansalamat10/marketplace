// frontend/src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
  id: string; email: string; name: string;
  role: string; avatar?: string; walletBalance?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password, twoFactorCode) => {
        set({ isLoading: true });
        try {
          const data: any = await api.post('/api/auth/login', { email, password, twoFactorCode });
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const data: any = await api.post('/api/auth/register', { name, email, password });
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      },

      refreshUser: async () => {
        try {
          const user: any = await api.get('/api/users/me');
          set({ user });
        } catch {}
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user }) }
  )
);

// ─────────────────────────────────────────────────────────────
// frontend/src/store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string; title: string; price: number;
  image?: string; sellerId: string; sellerName: string;
}

interface CartState {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (productId: string) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        const exists = get().items.find(i => i.productId === item.productId);
        if (!exists) set(s => ({ items: [...s.items, item] }));
      },
      remove: (productId) => set(s => ({ items: s.items.filter(i => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: 'cart-storage' }
  )
);

// ─────────────────────────────────────────────────────────────
// frontend/src/store/notifications.store.ts
import { create } from 'zustand';

interface Notification {
  id: string; type: string; title: string; body: string;
  data?: any; isRead: boolean; createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (n: Notification[]) => void;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  }),
  addNotification: (n) => set(s => ({
    notifications: [n, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
  markRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
}));
