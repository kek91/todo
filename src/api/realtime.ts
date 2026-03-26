import { pb } from './client'
import type { QueryClient } from '@tanstack/react-query'

type UnsubscribeFn = () => void

export function subscribeToTasks(
  listId: string,
  queryClient: QueryClient,
): UnsubscribeFn {
  let unsub: UnsubscribeFn = () => {}

  pb.collection('tasks')
    .subscribe('*', (e) => {
      const record = e.record
      if (record.list === listId || e.action === 'delete') {
        queryClient.invalidateQueries({ queryKey: ['tasks', listId] })
        queryClient.invalidateQueries({ queryKey: ['tasks-today'] })
      }
    })
    .then((fn) => { unsub = fn })

  return () => unsub()
}

export function subscribeToShoppingItems(
  listId: string,
  queryClient: QueryClient,
): UnsubscribeFn {
  let unsub: UnsubscribeFn = () => {}

  pb.collection('shopping_items')
    .subscribe('*', (e) => {
      const record = e.record
      if (record.list === listId || e.action === 'delete') {
        queryClient.invalidateQueries({ queryKey: ['shopping', listId] })
      }
    })
    .then((fn) => { unsub = fn })

  return () => unsub()
}

export function subscribeToUser(
  userId: string,
  queryClient: QueryClient,
): UnsubscribeFn {
  let unsub: UnsubscribeFn = () => {}

  pb.collection('users')
    .subscribe(userId, () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] })
    })
    .then((fn) => { unsub = fn })

  return () => unsub()
}
