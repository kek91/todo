import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, getHouseholdMembers, logout } from '../api/auth'
import { XPBar } from '../components/gamification/XPBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useUIStore } from '../stores/uiStore'
import { getLevelTitle, xpForLevel } from '../lib/xp'
import { getInitials } from '../lib/utils'
import { pb } from '../api/client'

interface ProfilePageProps {
  householdId: string
}

export function ProfilePage({ householdId }: ProfilePageProps) {
  const userId = pb.authStore.record?.id as string
  const { theme, setTheme } = useUIStore()
  const queryClient = useQueryClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', householdId],
    queryFn: () => getHouseholdMembers(householdId),
  })

  const logoutMutation = useMutation({
    mutationFn: async () => logout(),
    onSuccess: () => {
      queryClient.clear()
      window.location.reload()
    },
  })

  const LEVEL_MILESTONES = [1, 2, 3, 5, 7, 10]

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-4 space-y-4">
      {/* Profile card */}
      {profile && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#7C6AF5]/20 flex items-center justify-center text-xl font-bold text-[#7C6AF5]">
              {getInitials(profile.name)}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-[#E8EAF0] text-lg">{profile.name}</h2>
              <p className="text-[#7B80A0] text-sm">{profile.email}</p>
              <Badge variant="accent" className="mt-1">{getLevelTitle(profile.level)}</Badge>
            </div>
          </div>
          <XPBar xp={profile.xp} level={profile.level} streak={profile.streak} />
        </Card>
      )}

      {/* Level roadmap */}
      {profile && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[#E8EAF0] mb-3">Level Roadmap</h3>
          <div className="space-y-2">
            {LEVEL_MILESTONES.map((lvl) => {
              const reached = profile.level >= lvl
              return (
                <div key={lvl} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    reached ? 'bg-[#7C6AF5] text-white' : 'bg-[#252837] text-[#7B80A0]'
                  }`}>
                    {lvl}
                  </div>
                  <div className="flex-1">
                    <span className={`text-sm ${reached ? 'text-[#E8EAF0]' : 'text-[#7B80A0]'}`}>
                      {getLevelTitle(lvl)}
                    </span>
                  </div>
                  <span className="text-xs text-[#7B80A0]">{xpForLevel(lvl)} XP</span>
                  {reached && <span className="text-xs text-[#5EE8A8]">✓</span>}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Household members */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[#E8EAF0] mb-3">Household Members</h3>
        <div className="space-y-2">
          {members.map((m) => {
            const user = m.expand?.user
            if (!user) return null
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#252837] flex items-center justify-center text-sm font-bold text-[#7C6AF5]">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#E8EAF0]">{user.name}</p>
                  <p className="text-xs text-[#7B80A0]">Level {user.level} · {user.xp} XP</p>
                </div>
                <Badge variant={m.role === 'admin' ? 'accent' : 'default'}>{m.role}</Badge>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#E8EAF0]">Settings</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#7B80A0]">Theme</span>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  theme === t ? 'bg-[#7C6AF5] text-white' : 'bg-[#252837] text-[#7B80A0]'
                }`}
              >
                {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Button
        variant="danger"
        className="w-full"
        loading={logoutMutation.isPending}
        onClick={() => logoutMutation.mutate()}
      >
        Sign out
      </Button>
    </div>
  )
}
