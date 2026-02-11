import { create } from "zustand"

type NotificationStoreState = {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
}))
