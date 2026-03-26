import { useCallback } from 'react'
import confetti from 'canvas-confetti'
import { useGamificationStore } from '../stores/gamificationStore'

export function useGamification() {
  const { addXPFloat, triggerLevelUp } = useGamificationStore()

  const celebrate = useCallback(
    (xp: number, leveledUp: boolean, newLevel: number, clickX?: number, clickY?: number) => {
      // Confetti burst
      confetti({
        particleCount: leveledUp ? 150 : 60,
        spread: leveledUp ? 100 : 60,
        origin: {
          x: (clickX ?? window.innerWidth / 2) / window.innerWidth,
          y: (clickY ?? window.innerHeight / 2) / window.innerHeight,
        },
        colors: ['#7C6AF5', '#5EE8A8', '#F5A623', '#E8EAF0'],
        scalar: leveledUp ? 1.2 : 0.9,
        ticks: leveledUp ? 200 : 100,
      })

      // XP float label
      if (clickX !== undefined && clickY !== undefined) {
        addXPFloat(xp, clickX, clickY)
      }

      // Level up overlay
      if (leveledUp) {
        setTimeout(() => triggerLevelUp(newLevel), 400)
      }
    },
    [addXPFloat, triggerLevelUp],
  )

  return { celebrate }
}
