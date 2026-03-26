import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { pb, isAuthenticated } from './api/client'
import { getUserHousehold } from './api/auth'
import { AppShell } from './components/layout/AppShell'
import { LoginForm } from './components/auth/LoginForm'
import { HouseholdSetup } from './components/auth/HouseholdSetup'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

type AppState = 'loading' | 'unauthenticated' | 'needs-household' | 'ready'

function AppInner() {
  const [state, setState] = useState<AppState>('loading')
  const [householdId, setHouseholdId] = useState<string | null>(null)

  const checkState = async () => {
    if (!isAuthenticated()) {
      setState('unauthenticated')
      return
    }
    const userId = pb.authStore.record?.id as string
    try {
      const household = await getUserHousehold(userId)
      if (!household) {
        setState('needs-household')
      } else {
        setHouseholdId(household.id)
        setState('ready')
      }
    } catch {
      setState('needs-household')
    }
  }

  useEffect(() => {
    checkState()
    const unsub = pb.authStore.onChange(() => {
      if (!isAuthenticated()) {
        setState('unauthenticated')
        setHouseholdId(null)
      }
    })
    return () => unsub()
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0F1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#7C6AF5] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#7B80A0] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (state === 'unauthenticated') {
    return <LoginForm onSuccess={checkState} />
  }

  if (state === 'needs-household') {
    return <HouseholdSetup onSuccess={checkState} />
  }

  return <AppShell householdId={householdId!} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}
