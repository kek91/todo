import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createHousehold, joinHouseholdByCode } from '../../api/auth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { pb } from '../../api/client'

interface HouseholdSetupProps {
  onSuccess: () => void
}

export function HouseholdSetup({ onSuccess }: HouseholdSetupProps) {
  const userId = pb.authStore.record?.id as string
  const [mode, setMode] = useState<'create' | 'join'>('create')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createHousehold(householdName.trim(), userId),
    onSuccess,
    onError: (e: Error) => setError(e.message),
  })

  const joinMutation = useMutation({
    mutationFn: () => joinHouseholdByCode(inviteCode.trim().toUpperCase(), userId),
    onSuccess,
    onError: (e: Error) => setError(e.message),
  })

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="text-xl font-bold text-[#E8EAF0]">Set up your household</h2>
          <p className="text-[#7B80A0] text-sm mt-1">Create a new one or join an existing household</p>
        </div>

        <div className="flex gap-2">
          {(['create', 'join'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                mode === m
                  ? 'bg-[#7C6AF5] text-white'
                  : 'bg-[#252837] text-[#7B80A0]'
              }`}
            >
              {m === 'create' ? 'Create' : 'Join with code'}
            </button>
          ))}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
          {mode === 'create' ? (
            <>
              <Input
                label="Household name"
                placeholder="e.g. The Johnsons"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-[#F55A5A]">{error}</p>}
              <Button
                className="w-full"
                size="lg"
                loading={createMutation.isPending}
                disabled={!householdName.trim()}
                onClick={() => createMutation.mutate()}
              >
                Create Household
              </Button>
            </>
          ) : (
            <>
              <Input
                label="Invite code"
                placeholder="e.g. ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                autoFocus
                maxLength={8}
              />
              {error && <p className="text-sm text-[#F55A5A]">{error}</p>}
              <Button
                className="w-full"
                size="lg"
                loading={joinMutation.isPending}
                disabled={inviteCode.length < 4}
                onClick={() => joinMutation.mutate()}
              >
                Join Household
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
