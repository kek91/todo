import { pb } from './client'
import type { ShoppingItem } from '../types'

export async function getShoppingItems(listId: string): Promise<ShoppingItem[]> {
  return pb.collection('shopping_items').getFullList<ShoppingItem>({
    filter: `list = "${listId}"`,
    sort: 'checked,category,created',
    expand: 'checked_by',
  })
}

export async function createShoppingItem(data: Partial<ShoppingItem>): Promise<ShoppingItem> {
  return pb.collection('shopping_items').create<ShoppingItem>(data)
}

export async function updateShoppingItem(
  id: string,
  data: Partial<ShoppingItem>,
): Promise<ShoppingItem> {
  return pb.collection('shopping_items').update<ShoppingItem>(id, data)
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await pb.collection('shopping_items').delete(id)
}

export async function checkShoppingItem(
  id: string,
  userId: string,
  checked: boolean,
): Promise<ShoppingItem> {
  return pb.collection('shopping_items').update<ShoppingItem>(id, {
    checked,
    checked_by: checked ? userId : '',
    checked_at: checked ? new Date().toISOString() : '',
  })
}

export async function clearCheckedItems(listId: string): Promise<void> {
  const items = await pb.collection('shopping_items').getFullList<ShoppingItem>({
    filter: `list = "${listId}" && checked = true`,
  })
  await Promise.all(items.map((item) => pb.collection('shopping_items').delete(item.id)))
}

// Get recently used item titles for autocomplete
export async function getRecentItemTitles(householdId: string, limit = 50): Promise<string[]> {
  const items = await pb.collection('shopping_items').getList<ShoppingItem>(1, limit, {
    filter: `household = "${householdId}"`,
    sort: '-created',
    fields: 'title',
  })
  const unique = [...new Set(items.items.map((i) => i.title))]
  return unique
}
