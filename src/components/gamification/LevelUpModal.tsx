import { useEffect } from 'react'
import { useGamificationStore } from '../../stores/gamificationStore'
import { getLevelTitle } from '../../lib/xp'

export function LevelUpModal() {
  const { showLevelUp, levelUpTo, clearLevelUp } = useGamificationStore()

  useEffect(() => {
    if (!showLevelUp) return
    const timer = setTimeout(clearLevelUp, 4000)
    return () => clearTimeout(timer)
  }, [showLevelUp, clearLevelUp])

  if (!showLevelUp) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="slide-up text-center space-y-2 p-8 bg-[var(--surface)]/90 backdrop-blur-sm border border-[#7C6AF5]/40 rounded-3xl shadow-2xl">
        <div className="text-5xl mb-2">🎉</div>
        <div className="text-2xl font-bold text-[#7C6AF5]">Level Up!</div>
        <div className="text-4xl font-black text-[var(--text)]">Level {levelUpTo}</div>
        <div className="text-[#5EE8A8] font-medium">{getLevelTitle(levelUpTo)}</div>
      </div>
    </div>
  )
}
