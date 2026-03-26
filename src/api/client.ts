import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_PB_URL ?? 'http://localhost:8090'

export const pb = new PocketBase(PB_URL)

// Keep auth store in sync with localStorage automatically (PB does this by default)
pb.autoCancellation(false)

export function isAuthenticated(): boolean {
  return pb.authStore.isValid
}

export function getCurrentUser() {
  return pb.authStore.record
}
