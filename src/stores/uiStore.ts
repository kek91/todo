import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'
type Tab = 'dashboard' | 'tasks' | 'shopping' | 'profile'

interface UIState {
  theme: Theme
  activeTab: Tab
  activeListId: string | null
  isAddTaskOpen: boolean
  isAddShoppingOpen: boolean
  setTheme: (theme: Theme) => void
  setActiveTab: (tab: Tab) => void
  setActiveListId: (id: string | null) => void
  setAddTaskOpen: (open: boolean) => void
  setAddShoppingOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      activeTab: 'dashboard',
      activeListId: null,
      isAddTaskOpen: false,
      isAddShoppingOpen: false,
      setTheme: (theme) => set({ theme }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveListId: (id) => set({ activeListId: id }),
      setAddTaskOpen: (open) => set({ isAddTaskOpen: open }),
      setAddShoppingOpen: (open) => set({ isAddShoppingOpen: open }),
    }),
    { name: 'ui-state', partialize: (s) => ({ theme: s.theme, activeListId: s.activeListId }) },
  ),
)
