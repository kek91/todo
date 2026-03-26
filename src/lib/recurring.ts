import type { Task } from '../types'

export function getNextRecurringDate(task: Task): Date | null {
  if (task.recurring === 'none') return null

  const base = task.completed_at ? new Date(task.completed_at) : new Date()

  switch (task.recurring) {
    case 'daily':
      return addDays(base, 1)
    case 'weekly':
      return addDays(base, 7)
    case 'custom':
      return addDays(base, task.recurring_interval || 1)
    default:
      return null
  }
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isOverdue(task: Task): boolean {
  if (!task.due_date || task.completed) return false
  return new Date(task.due_date) < new Date()
}

export function isDueToday(task: Task): boolean {
  if (!task.due_date || task.completed) return false
  const due = new Date(task.due_date)
  const today = new Date()
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  )
}

export function isDueSoon(task: Task): boolean {
  if (!task.due_date || task.completed) return false
  const due = new Date(task.due_date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)
  return due <= tomorrow && !isOverdue(task)
}

export function formatDueDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, tomorrow)) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function isStreakActive(lastActive: string): boolean {
  if (!lastActive) return false
  const last = new Date(lastActive)
  const now = new Date()
  const diff = now.getTime() - last.getTime()
  return diff < 1000 * 60 * 60 * 36 // 36 hours grace window
}
