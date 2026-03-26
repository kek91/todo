import { useQuery } from '@tanstack/react-query'
import { getTasksDueToday } from '../api/tasks'
import { getLists } from '../api/tasks'
import { getShoppingItems } from '../api/shopping'
import { getProfile } from '../api/auth'
import { TaskItem } from '../components/tasks/TaskItem'
import { XPBar } from '../components/gamification/XPBar'
import { Card } from '../components/ui/Card'
import { useUIStore } from '../stores/uiStore'
import { useUserRealtime } from '../hooks/useRealtime'
import { pb } from '../api/client'

interface DashboardProps {
  householdId: string
}

export function Dashboard({ householdId }: DashboardProps) {
  const userId = pb.authStore.record?.id as string
  const { setActiveTab, setActiveListId } = useUIStore()

  useUserRealtime(userId)

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId),
  })

  const { data: dueTasks = [] } = useQuery({
    queryKey: ['tasks-today', householdId],
    queryFn: () => getTasksDueToday(householdId),
    refetchInterval: 1000 * 60 * 5, // refresh every 5 min
  })

  const { data: lists = [] } = useQuery({
    queryKey: ['lists', householdId],
    queryFn: () => getLists(householdId),
  })

  const shoppingList = lists.find((l) => l.type === 'shopping')

  const { data: shoppingItems = [] } = useQuery({
    queryKey: ['shopping', shoppingList?.id],
    queryFn: () => getShoppingItems(shoppingList!.id),
    enabled: !!shoppingList,
  })

  const uncheckedShopping = shoppingItems.filter((i) => !i.checked)
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'

  // Find the first todo list to use as "today's list"
  const firstTodoList = lists.find((l) => l.type === 'todo')

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-4 space-y-4">
      {/* Greeting + XP */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#7B80A0]">{greeting}</p>
            <h1 className="text-xl font-bold text-[#E8EAF0]">{profile?.name?.split(' ')[0] ?? 'Hey'} 👋</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#7B80A0]">Total XP</p>
            <p className="text-lg font-bold text-[#7C6AF5]">{profile?.xp ?? 0}</p>
          </div>
        </div>
        {profile && (
          <XPBar xp={profile.xp} level={profile.level} streak={profile.streak} />
        )}
      </Card>

      {/* Today's tasks */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-semibold text-[#E8EAF0]">
            Due today
            {dueTasks.length > 0 && (
              <span className="ml-2 bg-[#F5A623]/20 text-[#F5A623] text-xs px-1.5 py-0.5 rounded-full">
                {dueTasks.length}
              </span>
            )}
          </h2>
          {firstTodoList && (
            <button
              onClick={() => { setActiveListId(firstTodoList.id); setActiveTab('tasks') }}
              className="text-xs text-[#7C6AF5] hover:text-[#6A59D8]"
            >
              View all →
            </button>
          )}
        </div>

        {dueTasks.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-2xl mb-1">✅</p>
            <p className="text-sm text-[#7B80A0]">Nothing due today!</p>
          </Card>
        ) : (
          <Card className="divide-y divide-[#2E3245]">
            {dueTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="px-1">
                <TaskItem
                  task={task}
                  listId={task.expand?.list?.id ?? task.list}
                />
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Shopping preview */}
      {shoppingList && uncheckedShopping.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold text-[#E8EAF0]">🛒 Shopping</h2>
            <button
              onClick={() => { setActiveListId(shoppingList.id); setActiveTab('shopping') }}
              className="text-xs text-[#7C6AF5]"
            >
              Open →
            </button>
          </div>
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {uncheckedShopping.slice(0, 8).map((item) => (
                <span key={item.id} className="bg-[#252837] text-[#E8EAF0] text-xs px-2.5 py-1 rounded-lg">
                  {item.title}
                </span>
              ))}
              {uncheckedShopping.length > 8 && (
                <span className="bg-[#252837] text-[#7B80A0] text-xs px-2.5 py-1 rounded-lg">
                  +{uncheckedShopping.length - 8} more
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Stats row */}
      {profile && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Level', value: profile.level, icon: '⭐' },
            { label: 'Streak', value: `${profile.streak}d`, icon: '🔥' },
            { label: 'Done today', value: dueTasks.filter((t) => t.completed).length, icon: '✅' },
          ].map(({ label, value, icon }) => (
            <Card key={label} className="p-3 text-center">
              <div className="text-xl mb-0.5">{icon}</div>
              <div className="text-lg font-bold text-[#E8EAF0]">{value}</div>
              <div className="text-xs text-[#7B80A0]">{label}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
