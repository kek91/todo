import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTasks } from '../../api/tasks'
import { TaskItem } from './TaskItem'
import { AddTask } from './AddTask'
import { Button } from '../ui/Button'
import { useTasksRealtime } from '../../hooks/useRealtime'
import type { List } from '../../types'

interface TaskListProps {
  list: List
  householdId: string
}

export function TaskList({ list, householdId }: TaskListProps) {
  const [addOpen, setAddOpen] = useState(false)

  useTasksRealtime(list.id)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', list.id],
    queryFn: () => getTasks(list.id),
  })

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)
  const [showCompleted, setShowCompleted] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-xl">{list.icon || '📋'}</span>
          <h2 className="font-semibold text-[var(--text)]">{list.name}</h2>
          {activeTasks.length > 0 && (
            <span className="bg-[#7C6AF5]/20 text-[#7C6AF5] text-xs font-bold px-2 py-0.5 rounded-full">
              {activeTasks.length}
            </span>
          )}
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          + Add
        </Button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-[var(--muted)]">Loading...</div>
        ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-3xl">✨</span>
            <p className="text-[var(--muted)] text-sm">No tasks yet. Add one!</p>
          </div>
        ) : (
          <>
            {activeTasks.length === 0 && (
              <div className="flex flex-col items-center py-8 gap-2">
                <span className="text-2xl">🎉</span>
                <p className="text-[#5EE8A8] text-sm font-medium">All done!</p>
              </div>
            )}
            {activeTasks.map((task) => (
              <TaskItem key={task.id} task={task} listId={list.id} />
            ))}

            {completedTasks.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  <span>{showCompleted ? '▾' : '▸'}</span>
                  <span>Completed ({completedTasks.length})</span>
                </button>
                {showCompleted && (
                  <div className="space-y-1">
                    {completedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} listId={list.id} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <AddTask
        open={addOpen}
        onClose={() => setAddOpen(false)}
        listId={list.id}
        householdId={householdId}
      />
    </div>
  )
}
