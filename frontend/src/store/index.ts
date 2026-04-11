export const useAuthStore = () => ({ user: null, logout: () => {}, isLoading: false, register: async () => {}, refreshUser: async () => {} });
export const useCartStore = () => ({ items: [], add: () => {}, remove: () => {}, clear: () => {}, total: () => 0 });
export const useNotificationsStore = () => ({ notifications: [], unreadCount: 0, addNotification: () => {}, markRead: () => {}, markAllRead: () => {}, setNotifications: () => {} });
