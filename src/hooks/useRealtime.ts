import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  subscribeToTasks,
  subscribeToShoppingItems,
  subscribeToUser,
} from '../api/realtime'

export function useTasksRealtime(listId: string | null) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!listId) return
    const unsub = subscribeToTasks(listId, queryClient)
    return unsub
  }, [listId, queryClient])
}

export function useShoppingRealtime(listId: string | null) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!listId) return
    const unsub = subscribeToShoppingItems(listId, queryClient)
    return unsub
  }, [listId, queryClient])
}

export function useUserRealtime(userId: string | null) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!userId) return
    const unsub = subscribeToUser(userId, queryClient)
    return unsub
  }, [userId, queryClient])
}
