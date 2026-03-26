import { create } from 'zustand'

interface XPFloat {
  id: string
  xp: number
  x: number
  y: number
}

interface GamificationState {
  pendingXPFloats: XPFloat[]
  showLevelUp: boolean
  levelUpTo: number
  addXPFloat: (xp: number, x: number, y: number) => void
  removeXPFloat: (id: string) => void
  triggerLevelUp: (level: number) => void
  clearLevelUp: () => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  pendingXPFloats: [],
  showLevelUp: false,
  levelUpTo: 1,
  addXPFloat: (xp, x, y) =>
    set((s) => ({
      pendingXPFloats: [
        ...s.pendingXPFloats,
        { id: Math.random().toString(36).slice(2), xp, x, y },
      ],
    })),
  removeXPFloat: (id) =>
    set((s) => ({ pendingXPFloats: s.pendingXPFloats.filter((f) => f.id !== id) })),
  triggerLevelUp: (level) => set({ showLevelUp: true, levelUpTo: level }),
  clearLevelUp: () => set({ showLevelUp: false }),
}))
