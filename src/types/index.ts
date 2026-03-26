export interface User {
  id: string
  email: string
  name: string
  avatar: string
  xp: number
  level: number
  streak: number
  streak_last_active: string
  created: string
  updated: string
}

export interface Household {
  id: string
  name: string
  invite_code: string
  created_by: string
  created: string
}

export type MemberRole = 'admin' | 'member'

export interface Membership {
  id: string
  user: string
  household: string
  role: MemberRole
  joined_at: string
  expand?: { user?: User; household?: Household }
}

export interface List {
  id: string
  household: string
  name: string
  type: 'todo' | 'shopping'
  color: string
  icon: string
  sort_order: number
  created: string
}

export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type RecurringType = 'none' | 'daily' | 'weekly' | 'custom'

export interface Task {
  id: string
  list: string
  household: string
  title: string
  description: string
  assigned_to: string
  priority: Priority
  due_date: string
  completed: boolean
  completed_at: string
  completed_by: string
  recurring: RecurringType
  recurring_interval: number
  recurring_next: string
  xp_value: number
  sort_order: number
  created: string
  updated: string
  expand?: {
    assigned_to?: User
    completed_by?: User
    list?: List
  }
}

export interface ShoppingItem {
  id: string
  household: string
  list: string
  title: string
  category: string
  checked: boolean
  checked_by: string
  checked_at: string
  sort_order: number
  created: string
  updated: string
  expand?: { checked_by?: User }
}

export interface XPEvent {
  id: string
  user: string
  household: string
  event_type: 'task_complete' | 'streak_bonus' | 'level_up'
  xp_amount: number
  task: string
  created: string
}

export interface XPGain {
  xp: number
  leveledUp: boolean
  newLevel: number
  streakBonus: number
}
