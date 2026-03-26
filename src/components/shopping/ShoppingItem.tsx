import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkShoppingItem, deleteShoppingItem } from '../../api/shopping'
import type { ShoppingItem as ShoppingItemType } from '../../types'
import { cn } from '../../lib/utils'
import { pb } from '../../api/client'

interface ShoppingItemProps {
  item: ShoppingItemType
  listId: string
}

export function ShoppingItem({ item, listId }: ShoppingItemProps) {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id as string

  const checkMutation = useMutation({
    mutationFn: (checked: boolean) => checkShoppingItem(item.id, userId, checked),
    onMutate: async (checked) => {
      await queryClient.cancelQueries({ queryKey: ['shopping', listId] })
      const prev = queryClient.getQueryData(['shopping', listId])
      queryClient.setQueryData<ShoppingItemType[]>(['shopping', listId], (old) =>
        old?.map((i) => (i.id === item.id ? { ...i, checked } : i)),
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['shopping', listId], ctx?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', listId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteShoppingItem(item.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping', listId] }),
  })

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3.5 rounded-xl',
        'hover:bg-[#252837] transition-all duration-150',
        item.checked && 'opacity-50',
      )}
    >
      <button
        onClick={() => checkMutation.mutate(!item.checked)}
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all',
          item.checked
            ? 'bg-[#5EE8A8] border-[#5EE8A8] check-pop'
            : 'border-[#2E3245] hover:border-[#7C6AF5]',
        )}
      >
        {item.checked && (
          <svg className="w-3.5 h-3.5 text-[#0F1117]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span
        className={cn(
          'flex-1 text-sm',
          item.checked ? 'line-through text-[#7B80A0]' : 'text-[#E8EAF0]',
        )}
      >
        {item.title}
      </span>
      {item.category && (
        <span className="text-xs text-[#7B80A0] bg-[#252837] px-2 py-0.5 rounded-lg">
          {item.category}
        </span>
      )}
      <button
        onClick={() => deleteMutation.mutate()}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#7B80A0] hover:text-[#F55A5A] hover:bg-[#F55A5A]/10 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
