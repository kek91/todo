import { pb } from './client'
import type { Task, List } from '../types'
import { XP_BY_PRIORITY, calculateXPGain, levelFromXP } from '../lib/xp'
import { getNextRecurringDate } from '../lib/recurring'
import { isStreakActive } from '../lib/recurring'
import { updateProfile } from './auth'

// Lists
export async function getLists(householdId: string): Promise<List[]> {
  return pb.collection('lists').getFullList<List>({
    filter: `household = "${householdId}"`,
    sort: '+created',
  })
}

export async function createList(data: Partial<List>): Promise<List> {
  return pb.collection('lists').create<List>(data)
}

export async function updateList(id: string, data: Partial<List>): Promise<List> {
  return pb.collection('lists').update<List>(id, data)
}

export async function deleteList(id: string): Promise<void> {
  await pb.collection('lists').delete(id)
}

// Tasks
export async function getTasks(listId: string): Promise<Task[]> {
  return pb.collection('tasks').getFullList<Task>({
    filter: `list = "${listId}"`,
    sort: 'completed,due_date,created',
    expand: 'assigned_to,completed_by',
  })
}

export async function getTasksDueToday(householdId: string): Promise<Task[]> {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const todayStr = today.toISOString().split('T')[0]

  return pb.collection('tasks').getFullList<Task>({
    filter: `household = "${householdId}" && completed = false && due_date <= "${todayStr} 23:59:59"`,
    sort: 'priority,due_date',
    expand: 'assigned_to,list',
  })
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const xpValue = XP_BY_PRIORITY[data.priority ?? 'normal']
  return pb.collection('tasks').create<Task>({ xp_value: xpValue, ...data })
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  return pb.collection('tasks').update<Task>(id, data)
}

export async function deleteTask(id: string): Promise<void> {
  await pb.collection('tasks').delete(id)
}

export async function completeTask(
  task: Task,
  userId: string,
): Promise<{ task: Task; xpGained: number; leveledUp: boolean; newLevel: number; streakBonus: number }> {
  const now = new Date().toISOString()

  // Get user for streak calculation
  const user = await pb.collection('users').getOne(userId)
  const streakActive = isStreakActive(user.streak_last_active)
  const newStreak = streakActive ? user.streak + 1 : 1

  const { total: xpGained, streakBonus } = calculateXPGain(task.xp_value, newStreak)
  const newXP = (user.xp ?? 0) + xpGained
  const newLevel = levelFromXP(newXP)
  const leveledUp = newLevel > (user.level ?? 1)

  // Complete the task
  const updatedTask = await pb.collection('tasks').update<Task>(task.id, {
    completed: true,
    completed_at: now,
    completed_by: userId,
  })

  // If recurring, create the next occurrence
  if (task.recurring !== 'none') {
    const nextDate = getNextRecurringDate({ ...task, completed_at: now })
    if (nextDate) {
      await pb.collection('tasks').create<Task>({
        list: task.list,
        household: task.household,
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        priority: task.priority,
        due_date: nextDate.toISOString().split('T')[0],
        recurring: task.recurring,
        recurring_interval: task.recurring_interval,
        xp_value: task.xp_value,
        sort_order: task.sort_order,
      })
    }
  }

  // Update user XP, level, streak
  await updateProfile(userId, {
    xp: newXP,
    level: newLevel,
    streak: newStreak,
    streak_last_active: now,
  })

  // Log XP event
  await pb.collection('xp_events').create({
    user: userId,
    household: task.household,
    event_type: 'task_complete',
    xp_amount: xpGained,
    task: task.id,
  })

  if (leveledUp) {
    await pb.collection('xp_events').create({
      user: userId,
      household: task.household,
      event_type: 'level_up',
      xp_amount: 0,
      task: task.id,
    })
  }

  return { task: updatedTask, xpGained, leveledUp, newLevel, streakBonus }
}

export async function uncompleteTask(taskId: string): Promise<Task> {
  return pb.collection('tasks').update<Task>(taskId, {
    completed: false,
    completed_at: '',
    completed_by: '',
  })
}
