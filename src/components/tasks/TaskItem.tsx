import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Task } from '../../types'
import { completeTask, uncompleteTask, deleteTask } from '../../api/tasks'
import { useGamification } from '../../hooks/useGamification'
import { isOverdue, isDueToday, formatDueDate } from '../../lib/recurring'
import { cn } from '../../lib/utils'
import { pb } from '../../api/client'

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-[#7B80A0]/20',
  normal: '',
  high: 'bg-[#F5A623]/5',
  urgent: 'bg-[#F55A5A]/5',
}

const PRIORITY_BORDER: Record<string, string> = {
  low: '',
  normal: '',
  high: 'border-l-2 border-l-[#F5A623]',
  urgent: 'border-l-2 border-l-[#F55A5A]',
}

interface TaskItemProps {
  task: Task
  listId: string
}

export function TaskItem({ task, listId }: TaskItemProps) {
  const queryClient = useQueryClient()
  const { celebrate } = useGamification()
  const checkRef = useRef<HTMLButtonElement>(null)
  const [_justCompleted, setJustCompleted] = useState(false)

  const userId = pb.authStore.record?.id as string

  const completeMutation = useMutation({
    mutationFn: () => completeTask(task, userId),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', listId] })
      const prev = queryClient.getQueryData<Task[]>(['tasks', listId])
      queryClient.setQueryData<Task[]>(['tasks', listId], (old) =>
        old?.map((t) => (t.id === task.id ? { ...t, completed: true } : t)),
      )
      return { prev }
    },
    onSuccess: ({ xpGained, leveledUp, newLevel }) => {
      setJustCompleted(true)
      const rect = checkRef.current?.getBoundingClientRect()
      celebrate(xpGained, leveledUp, newLevel, rect?.x, rect?.y)
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] })
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['tasks', listId], ctx?.prev)
    },
  })

  const uncompleteMutation = useMutation({
    mutationFn: () => uncompleteTask(task.id),
    onSuccess: () => {
      setJustCompleted(false)
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(task.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', listId] }),
  })

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.completed) {
      uncompleteMutation.mutate()
    } else {
      completeMutation.mutate()
    }
  }

  const overdue = isOverdue(task)
  const dueToday = isDueToday(task)

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-3.5 rounded-xl border border-transparent',
        'hover:bg-[var(--surface-2)] transition-all duration-200 slide-up',
        PRIORITY_COLORS[task.priority],
        PRIORITY_BORDER[task.priority],
        task.completed && 'opacity-50',
      )}
    >
      {/* Checkbox */}
      <button
        ref={checkRef}
        onClick={handleCheck}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 transition-all duration-200',
          'flex items-center justify-center',
          task.completed
            ? 'bg-[#5EE8A8] border-[#5EE8A8] check-pop'
            : 'border-[var(--border)] hover:border-[#7C6AF5]',
        )}
      >
        {task.completed && (
          <svg className="w-3.5 h-3.5 text-[#0F1117]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-snug',
            task.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]',
          )}
        >
          {task.title}
        </p>
        {task.description && !task.completed && (
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.due_date && !task.completed && (
            <span
              className={cn(
                'text-xs font-medium',
                overdue ? 'text-[#F55A5A]' : dueToday ? 'text-[#F5A623]' : 'text-[var(--muted)]',
              )}
            >
              {overdue ? '⚠ ' : dueToday ? '· ' : ''}{formatDueDate(task.due_date)}
            </span>
          )}
          {task.recurring !== 'none' && !task.completed && (
            <span className="text-xs text-[#7C6AF5]">
              ↻ {task.recurring}
            </span>
          )}
          {task.expand?.assigned_to && (
            <span className="text-xs text-[var(--muted)]">
              {task.expand.assigned_to.name.split(' ')[0]}
            </span>
          )}
          <span className="text-xs text-[var(--muted)]/60 ml-auto">+{task.xp_value}xp</span>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => deleteMutation.mutate()}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg text-[var(--muted)] hover:text-[#F55A5A] hover:bg-[#F55A5A]/10 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
