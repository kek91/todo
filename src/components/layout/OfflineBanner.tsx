import { useOffline } from '../../hooks/useOffline'

export function OfflineBanner() {
  const isOffline = useOffline()
  if (!isOffline) return null

  return (
    <div className="bg-[#F5A623]/20 border-b border-[#F5A623]/30 px-4 py-2 text-center">
      <span className="text-xs text-[#F5A623] font-medium">
        ⚡ Offline — showing cached data
      </span>
    </div>
  )
}
