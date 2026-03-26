import { useEffect, useRef } from 'react'
import { xpProgressInLevel, getLevelTitle } from '../../lib/xp'

interface XPBarProps {
  xp: number
  level: number
  streak: number
  compact?: boolean
}

export function XPBar({ xp, level, streak, compact }: XPBarProps) {
  const { current, needed, percent } = xpProgressInLevel(xp)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!barRef.current) return
    barRef.current.style.setProperty('--xp-to', `${percent}%`)
    barRef.current.classList.remove('xp-animate')
    void barRef.current.offsetWidth
    barRef.current.classList.add('xp-animate')
  }, [percent])

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#7C6AF5]">Lv{level}</span>
        <div className="flex-1 h-1.5 bg-[#252837] rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-[#7C6AF5] rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        {streak > 0 && (
          <span className="text-xs text-[#F5A623]">🔥{streak}</span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-[#7C6AF5]">Level {level}</span>
          <span className="text-xs text-[#7B80A0] ml-2">{getLevelTitle(level)}</span>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="text-sm text-[#F5A623] font-medium">🔥 {streak} day streak</span>
          )}
          <span className="text-xs text-[#7B80A0]">{current}/{needed} XP</span>
        </div>
      </div>
      <div className="h-2 bg-[#252837] rounded-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #7C6AF5, #5EE8A8)',
          }}
        />
      </div>
    </div>
  )
}
