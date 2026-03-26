import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLists, createList } from '../api/tasks'
import { TaskList } from '../components/tasks/TaskList'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/utils'

interface TasksPageProps {
  householdId: string
}

const LIST_ICONS = ['📋', '🌅', '📆', '⭐', '🎯', '📌', '🔧', '🏃', '💼', '🎓']

export function TasksPage({ householdId }: TasksPageProps) {
  const queryClient = useQueryClient()
  const [selectedListId, setSelectedListId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newListIcon, setNewListIcon] = useState('📋')

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['lists', householdId],
    queryFn: () => getLists(householdId),
  })

  const todoLists = lists.filter((l) => l.type === 'todo')
  const activeList = todoLists.find((l) => l.id === selectedListId) ?? todoLists[0]

  const createMutation = useMutation({
    mutationFn: () =>
      createList({
        household: householdId,
        name: newListName.trim(),
        type: 'todo',
        icon: newListIcon,
        sort_order: todoLists.length,
      }),
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['lists', householdId] })
      setSelectedListId(newList.id)
      setNewListName('')
      setCreateOpen(false)
    },
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-[var(--muted)]">Loading...</div>
  }

  return (
    <div className="flex h-full">
      {/* List sidebar */}
      <div className="w-14 sm:w-48 flex-shrink-0 border-r border-[var(--border)] flex flex-col bg-[var(--surface)]">
        <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {todoLists.map((list) => {
            const active = list.id === activeList?.id
            return (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 transition-all',
                  active ? 'bg-[#7C6AF5]/15 text-[#7C6AF5]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
                )}
              >
                <span className="text-xl flex-shrink-0">{list.icon}</span>
                <span className="text-sm font-medium hidden sm:block truncate">{list.name}</span>
              </button>
            )
          })}
        </div>
        <div className="p-2 border-t border-[var(--border)]">
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all text-sm"
          >
            <span className="text-lg">+</span>
            <span className="hidden sm:block">New list</span>
          </button>
        </div>
      </div>

      {/* Task content */}
      <div className="flex-1 overflow-hidden">
        {activeList ? (
          <TaskList list={activeList} householdId={householdId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-4xl">📋</span>
            <p className="text-[var(--muted)]">No lists yet</p>
            <Button onClick={() => setCreateOpen(true)}>Create your first list</Button>
          </div>
        )}
      </div>

      {/* Create list modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New List">
        <div className="space-y-4">
          <Input
            label="List name"
            placeholder="e.g. Weekly chores"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            autoFocus
          />
          <div>
            <p className="text-sm text-[var(--muted)] font-medium mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {LIST_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewListIcon(icon)}
                  className={cn(
                    'w-10 h-10 text-xl rounded-xl transition-all',
                    newListIcon === icon ? 'bg-[#7C6AF5]/30 ring-2 ring-[#7C6AF5]' : 'bg-[var(--surface-2)] hover:bg-[var(--border)]',
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={createMutation.isPending}
              disabled={!newListName.trim()}
              onClick={() => createMutation.mutate()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
