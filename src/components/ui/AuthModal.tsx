'use client'
import { useState, useEffect } from 'react'
import { useTripStore } from '@/lib/store'

interface Props {
  initialMode?: 'login' | 'signup'
  onClose: () => void
}

const inputCls = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors text-foreground placeholder:text-subtle'

export default function AuthModal({ initialMode = 'login', onClose }: Props) {
  const { signIn, signUp } = useTripStore()
  const [mode, setMode]     = useState<'login' | 'signup'>(initialMode)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const validate = () => {
    if (mode === 'signup' && !name.trim()) return 'Enter your name'
    if (!email.trim() || !email.includes('@')) return 'Enter a valid email'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const submit = async () => {
    const err = validate()
    if (err) return setError(err)
    setLoading(true)
    setError('')
    const result = mode === 'signup'
      ? await signUp(name.trim(), email, password)
      : await signIn(email, password)
    setLoading(false)
    if (result) return setError(result)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl relative"
        style={{ background: 'var(--s1)', border: '1px solid var(--bdr)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-muted transition-all hover:bg-elevated hover:text-foreground"
          style={{ fontSize: 16 }}
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-3xl mb-3">✈</div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-muted">
            {mode === 'login'
              ? 'Sign in to access your saved trips'
              : 'Start planning your perfect trip'}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          {mode === 'signup' && (
            <input
              className={inputCls}
              style={{ background: 'var(--s2)', border: '1px solid var(--bdr)' }}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--bdr)'}
            />
          )}
          <input
            className={inputCls}
            style={{ background: 'var(--s2)', border: '1px solid var(--bdr)' }}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--bdr)'}
          />
          <div className="relative">
            <input
              className={inputCls}
              style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', paddingRight: '2.75rem' }}
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--bdr)'}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs mb-4" style={{ color: 'var(--red)' }}>⚠ {error}</p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:brightness-110 mb-4 disabled:opacity-60"
          style={{ background: 'var(--accent)' }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--bdr)' }} />
          <span className="text-xs text-subtle">or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--bdr)' }} />
        </div>

        <button
          className="w-full py-3 rounded-xl font-medium text-sm border transition-all hover:bg-elevated text-foreground mb-6"
          style={{ borderColor: 'var(--bdr)' }}
          onClick={() => setError('Google sign-in coming soon')}
        >
          <span className="mr-2">G</span> Continue with Google
        </button>

        <p className="text-center text-sm text-muted">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
