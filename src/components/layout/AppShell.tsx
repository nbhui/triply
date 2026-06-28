'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import ToastContainer from '@/components/ui/ToastContainer'
import AuthModal from '@/components/ui/AuthModal'
import { useTripStore } from '@/lib/store'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, initAuth } = useTripStore()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  useEffect(() => {
    const unsubscribe = initAuth()
    return unsubscribe
  }, [])

  return (
    <div className="relative flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="ml-56 flex-1 min-h-screen p-10 max-w-[calc(100vw-224px)]">
        {children}
      </main>

      {/* Top-right auth bar */}
      <div className="absolute top-4 right-4 z-[100] flex items-center gap-2">
        {user ? (
          <>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: 'var(--s1)', border: '1px solid var(--bdr)' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: 'var(--accent)', fontSize: 11 }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:bg-elevated text-muted"
              style={{ border: '1px solid var(--bdr)' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setAuthMode('login')}
              className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all hover:bg-elevated text-muted"
              style={{ border: '1px solid var(--bdr)' }}
            >
              Sign in
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'var(--accent)' }}
            >
              Sign up
            </button>
          </>
        )}
      </div>

      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
      <ToastContainer />
    </div>
  )
}
