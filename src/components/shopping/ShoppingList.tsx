import { useRef, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getShoppingItems,
  createShoppingItem,
  clearCheckedItems,
  getRecentItemTitles,
} from '../../api/shopping'
import { ShoppingItem } from './ShoppingItem'
import { useShoppingRealtime } from '../../hooks/useRealtime'
import { groupBy } from '../../lib/utils'
import type { List } from '../../types'

interface ShoppingListProps {
  list: List
  householdId: string
}

export function ShoppingList({ list, householdId }: ShoppingListProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [category, setCategory] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useShoppingRealtime(list.id)

  const { data: items = [] } = useQuery({
    queryKey: ['shopping', list.id],
    queryFn: () => getShoppingItems(list.id),
  })

  const { data: recentTitles = [] } = useQuery({
    queryKey: ['shopping-recent', householdId],
    queryFn: () => getRecentItemTitles(householdId),
    staleTime: 1000 * 60 * 5,
  })

  // Filter suggestions
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([])
      return
    }
    const q = input.toLowerCase()
    setSuggestions(recentTitles.filter((t) => t.toLowerCase().includes(q) && t !== input).slice(0, 5))
  }, [input, recentTitles])

  const addMutation = useMutation({
    mutationFn: (title: string) =>
      createShoppingItem({
        list: list.id,
        household: householdId,
        title: title.trim(),
        category: category.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping', list.id] })
      queryClient.invalidateQueries({ queryKey: ['shopping-recent', householdId] })
      setInput('')
      setShowSuggestions(false)
      inputRef.current?.focus()
    },
  })

  const clearMutation = useMutation({
    mutationFn: () => clearCheckedItems(list.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping', list.id] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    addMutation.mutate(input)
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)
  const grouped = groupBy(unchecked, (i) => i.category || 'Other')
  const categories = Object.keys(grouped).sort()

  // Keep input focused
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Quick-add input — always at top */}
      <div className="p-3 border-b border-[var(--border)] relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Add item... (tap Enter)"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[#7C6AF5] text-base"
            />
            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl overflow-hidden z-10 shadow-xl">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addMutation.mutate(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category"
            className="w-28 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-3 text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-[#7C6AF5] text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || addMutation.isPending}
            className="bg-[#7C6AF5] text-white rounded-xl px-4 font-medium disabled:opacity-50 hover:bg-[#6A59D8] transition-colors active:scale-95"
          >
            +
          </button>
        </form>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {categories.map((cat) => (
          <div key={cat}>
            {categories.length > 1 && (
              <div className="px-4 py-2 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                {cat}
              </div>
            )}
            {grouped[cat].map((item) => (
              <ShoppingItem key={item.id} item={item} listId={list.id} />
            ))}
          </div>
        ))}

        {/* Checked items */}
        {checked.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                In cart ({checked.length})
              </span>
              <button
                onClick={() => clearMutation.mutate()}
                className="text-xs text-[#F55A5A] hover:text-[#F55A5A]/80 transition-colors"
              >
                Clear all
              </button>
            </div>
            {checked.map((item) => (
              <ShoppingItem key={item.id} item={item} listId={list.id} />
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <span className="text-3xl">🛒</span>
            <p className="text-[var(--muted)] text-sm">Add items to your shopping list</p>
          </div>
        )}
      </div>
    </div>
  )
}
