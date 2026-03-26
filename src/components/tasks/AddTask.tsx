import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask } from '../../api/tasks'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Priority, RecurringType } from '../../types'
import { XP_BY_PRIORITY } from '../../lib/xp'
import { pb } from '../../api/client'

interface AddTaskProps {
  open: boolean
  onClose: () => void
  listId: string
  householdId: string
}

export function AddTask({ open, onClose, listId, householdId }: AddTaskProps) {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id as string

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [recurring, setRecurring] = useState<RecurringType>('none')
  const [recurringInterval, setRecurringInterval] = useState(1)

  const mutation = useMutation({
    mutationFn: () =>
      createTask({
        list: listId,
        household: householdId,
        title: title.trim(),
        description,
        priority,
        due_date: dueDate,
        recurring,
        recurring_interval: recurringInterval,
        assigned_to: userId,
        xp_value: XP_BY_PRIORITY[priority],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
      queryClient.invalidateQueries({ queryKey: ['tasks-today'] })
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDueDate('')
      setRecurring('none')
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    mutation.mutate()
  }

  const priorities: Priority[] = ['low', 'normal', 'high', 'urgent']
  const priorityColors: Record<Priority, string> = {
    low: 'border-[#7B80A0] text-[var(--muted)]',
    normal: 'border-[#7C6AF5] text-[#7C6AF5]',
    high: 'border-[#F5A623] text-[#F5A623]',
    urgent: 'border-[#F55A5A] text-[#F55A5A]',
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Description (optional)"
          placeholder="Add details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[var(--muted)] font-medium">Recurring</label>
            <select
              value={recurring}
              onChange={(e) => setRecurring(e.target.value as RecurringType)}
              className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] outline-none focus:border-[#7C6AF5] min-h-[48px]"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {recurring === 'custom' && (
          <Input
            label="Repeat every (days)"
            type="number"
            min={1}
            value={recurringInterval}
            onChange={(e) => setRecurringInterval(Number(e.target.value))}
          />
        )}

        <div>
          <p className="text-sm text-[var(--muted)] font-medium mb-2">Priority</p>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  priority === p
                    ? `${priorityColors[p]} bg-current/10`
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                {p}
                <div className="text-[10px] opacity-70 mt-0.5">+{XP_BY_PRIORITY[p]}xp</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={mutation.isPending} disabled={!title.trim()}>
            Add Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
