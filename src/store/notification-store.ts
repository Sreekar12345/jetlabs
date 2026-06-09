import { create } from "zustand";

interface NotificationState {
  isOpen: boolean;
  unreadCount: number;
  setIsOpen: (isOpen: boolean) => void;
  setUnreadCount: (unreadCount: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOpen: false,
  unreadCount: 0,
  setIsOpen: (isOpen) => set({ isOpen }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
