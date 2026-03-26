import { useEffect } from 'react'
import { useGamificationStore } from '../../stores/gamificationStore'

export function XPFloats() {
  const { pendingXPFloats, removeXPFloat } = useGamificationStore()

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pendingXPFloats.map((f) => (
        <XPFloat key={f.id} id={f.id} xp={f.xp} x={f.x} y={f.y} onDone={removeXPFloat} />
      ))}
    </div>
  )
}

function XPFloat({
  id,
  xp,
  x,
  y,
  onDone,
}: {
  id: string
  xp: number
  x: number
  y: number
  onDone: (id: string) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDone(id), 1300)
    return () => clearTimeout(timer)
  }, [id, onDone])

  return (
    <div
      className="absolute float-up text-sm font-bold text-[#5EE8A8] drop-shadow-lg select-none"
      style={{ left: x - 16, top: y - 24 }}
    >
      +{xp} XP
    </div>
  )
}
