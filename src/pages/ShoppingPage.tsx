import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLists, createList } from '../api/tasks'
import { ShoppingList } from '../components/shopping/ShoppingList'
import { Button } from '../components/ui/Button'

interface ShoppingPageProps {
  householdId: string
}

export function ShoppingPage({ householdId }: ShoppingPageProps) {
  const queryClient = useQueryClient()
  const [_creating, setCreating] = useState(false)

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['lists', householdId],
    queryFn: () => getLists(householdId),
  })

  const shoppingLists = lists.filter((l) => l.type === 'shopping')
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeList = shoppingLists.find((l) => l.id === activeId) ?? shoppingLists[0]

  const createMutation = useMutation({
    mutationFn: () =>
      createList({
        household: householdId,
        name: 'Shopping',
        type: 'shopping',
        icon: '🛒',
        sort_order: 0,
      }),
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ['lists', householdId] })
      setActiveId(list.id)
      setCreating(false)
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-full text-[var(--muted)]">Loading...</div>

  if (!activeList) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="text-5xl">🛒</span>
        <p className="text-[var(--muted)]">No shopping list yet</p>
        <Button loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
          Create Shopping List
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <span className="text-xl">🛒</span>
        <h2 className="font-semibold text-[var(--text)] flex-1">Shopping</h2>
        {shoppingLists.length > 1 && (
          <div className="flex gap-1">
            {shoppingLists.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  l.id === activeList.id
                    ? 'bg-[#7C6AF5] text-white'
                    : 'bg-[var(--surface-2)] text-[var(--muted)]'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ShoppingList list={activeList} householdId={householdId} />
      </div>
    </div>
  )
}
