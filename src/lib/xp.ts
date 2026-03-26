// XP thresholds per level — grows roughly quadratically
// Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450 ...
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(100 * (level - 1) + 50 * (level - 1) * (level - 2))
}

export function levelFromXP(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; percent: number } {
  const level = levelFromXP(xp)
  const current = xp - xpForLevel(level)
  const needed = xpForLevel(level + 1) - xpForLevel(level)
  return { current, needed, percent: Math.round((current / needed) * 100) }
}

// XP values by priority
export const XP_BY_PRIORITY: Record<string, number> = {
  low: 5,
  normal: 10,
  high: 20,
  urgent: 35,
}

export function calculateXPGain(
  baseXP: number,
  streak: number,
): { total: number; streakBonus: number } {
  const streakBonus = streak >= 7 ? Math.floor(baseXP * 0.5)
    : streak >= 3 ? Math.floor(baseXP * 0.2)
    : 0
  return { total: baseXP + streakBonus, streakBonus }
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner',
  2: 'Organizer',
  3: 'Planner',
  4: 'Achiever',
  5: 'Hustler',
  6: 'Pro',
  7: 'Expert',
  8: 'Master',
  9: 'Legend',
  10: 'Household Hero',
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, 10)] ?? 'Household Hero'
}
