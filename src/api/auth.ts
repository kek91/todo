import { pb } from './client'
import type { User } from '../types'
import { generateInviteCode } from '../lib/utils'

export async function login(email: string, password: string) {
  const auth = await pb.collection('users').authWithPassword(email, password)
  return auth
}

export async function register(email: string, password: string, name: string) {
  const user = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
    xp: 0,
    level: 1,
    streak: 0,
  })
  await pb.collection('users').authWithPassword(email, password)
  return user
}

export function logout() {
  pb.authStore.clear()
}

export async function getProfile(userId: string): Promise<User> {
  return pb.collection('users').getOne<User>(userId)
}

export async function updateProfile(userId: string, data: Partial<User>): Promise<User> {
  return pb.collection('users').update<User>(userId, data)
}

// Household
export async function createHousehold(name: string, userId: string) {
  const household = await pb.collection('households').create({
    name,
    invite_code: generateInviteCode(),
    created_by: userId,
  })
  // Create admin membership
  await pb.collection('memberships').create({
    user: userId,
    household: household.id,
    role: 'admin',
    joined_at: new Date().toISOString(),
  })
  return household
}

export async function joinHouseholdByCode(code: string, userId: string) {
  const households = await pb.collection('households').getList(1, 1, {
    filter: `invite_code = "${code}"`,
  })
  if (!households.items.length) throw new Error('Household not found')
  const household = households.items[0]

  // Check not already a member
  const existing = await pb.collection('memberships').getList(1, 1, {
    filter: `user = "${userId}" && household = "${household.id}"`,
  })
  if (existing.items.length) throw new Error('Already a member')

  await pb.collection('memberships').create({
    user: userId,
    household: household.id,
    role: 'member',
    joined_at: new Date().toISOString(),
  })
  return household
}

export async function getHouseholdMembers(householdId: string) {
  return pb.collection('memberships').getFullList({
    filter: `household = "${householdId}"`,
    expand: 'user',
  })
}

export async function getUserHousehold(userId: string) {
  const memberships = await pb.collection('memberships').getList(1, 1, {
    filter: `user = "${userId}"`,
    expand: 'household',
  })
  if (!memberships.items.length) return null
  return memberships.items[0].expand?.household ?? null
}
