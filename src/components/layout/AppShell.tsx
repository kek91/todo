import { useEffect } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { TabBar } from './TabBar'
import { XPFloats } from '../gamification/XPFloats'
import { LevelUpModal } from '../gamification/LevelUpModal'
import { OfflineBanner } from './OfflineBanner'
import { Dashboard } from '../../pages/Dashboard'
import { TasksPage } from '../../pages/TasksPage'
import { ShoppingPage } from '../../pages/ShoppingPage'
import { ProfilePage } from '../../pages/ProfilePage'

interface AppShellProps {
  householdId: string
}

export function AppShell({ householdId }: AppShellProps) {
  const { activeTab, theme } = useUIStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const pages = {
    dashboard: <Dashboard householdId={householdId} />,
    tasks: <TasksPage householdId={householdId} />,
    shopping: <ShoppingPage householdId={householdId} />,
    profile: <ProfilePage householdId={householdId} />,
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <OfflineBanner />
      <main className="flex-1 overflow-hidden">
        {pages[activeTab]}
      </main>
      <TabBar />
      <XPFloats />
      <LevelUpModal />
    </div>
  )
}
