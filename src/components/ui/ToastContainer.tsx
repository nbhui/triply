'use client'
import { useTripStore } from '@/lib/store'

export default function ToastContainer() {
  const toasts = useTripStore((s) => s.toasts)

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="px-4 py-2.5 rounded-xl text-sm font-medium shadow-2xl animate-[toastIn_.2s_ease]"
          style={{
            background: 'var(--s3)',
            border: `1px solid ${t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'var(--bdr)'}`,
            color: t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'var(--tx)',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
