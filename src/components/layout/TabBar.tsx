import { useUIStore } from '../../stores/uiStore'
import { cn } from '../../lib/utils'

const tabs = [
  {
    id: 'dashboard' as const,
    label: 'Today',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'tasks' as const,
    label: 'Tasks',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'shopping' as const,
    label: 'Shopping',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'profile' as const,
    label: 'Profile',
    icon: (active: boolean) => (
      <svg className={cn('w-6 h-6', active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function TabBar() {
  const { activeTab, setActiveTab } = useUIStore()

  return (
    <nav className="flex-shrink-0 border-t border-[#2E3245] bg-[#1A1D27] safe-area-inset-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all active:scale-95',
                active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]',
              )}
            >
              {tab.icon(active)}
              <span className={cn('text-[10px] font-medium', active ? 'text-[#7C6AF5]' : 'text-[#7B80A0]')}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
