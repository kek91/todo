import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { login, register } from '../../api/auth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (mode === 'login') return login(email, password)
      return register(email, password, name)
    },
    onSuccess: onSuccess,
    onError: (e: Error) => setError(e.message),
  })

  return (
    <div className="min-h-screen bg-[#0F1117] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7C6AF5]/20 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-[#7C6AF5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#E8EAF0]">Household Todo</h1>
          <p className="text-[#7B80A0] text-sm mt-1">Your shared family dashboard</p>
        </div>

        <div className="bg-[#1A1D27] border border-[#2E3245] rounded-2xl p-6 space-y-4">
          {mode === 'register' && (
            <Input
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={mode === 'login'}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-[#F55A5A] bg-[#F55A5A]/10 rounded-xl px-3 py-2">{error}</p>
          )}

          <Button
            className="w-full"
            size="lg"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="w-full text-sm text-[#7B80A0] hover:text-[#E8EAF0] transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
