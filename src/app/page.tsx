'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { fmtDate, fmt } from '@/lib/utils'
import AuthModal from '@/components/ui/AuthModal'

export default function HomePage() {
  const router = useRouter()
  const { trip, savedTrips, selFlight, selHotel, selCar, expenses, switchTrip, user, logout } = useTripStore()
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)

  const continueHref = selHotel ? '/dashboard' : selFlight ? '/hotels' : '/flights'
  const allTrips = [
    ...(trip ? [{ trip, selFlight, selHotel, selCar, expenses, isActive: true, idx: -1 }] : []),
    ...savedTrips.map((t, i) => ({
      trip: t,
      selFlight: t.selFlight ?? null,
      selHotel: t.selHotel ?? null,
      selCar: t.selCar ?? null,
      expenses: t.expenses ?? [],
      isActive: false,
      idx: i,
    })),
  ]

  return (
    <div>
      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}

      {/* Hero */}
      <div className="max-w-xl mx-auto mt-16 text-center">
        <span className="block text-5xl mb-6">🌍</span>

        {user ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground leading-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted text-base leading-relaxed mb-8">
              Ready to plan your next adventure?
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-foreground leading-tight">
              Your complete travel planner
            </h1>
            <p className="text-muted text-base leading-relaxed mb-8">
              Search flights, hotels, and car rentals — compare options and track every expense in one clean dashboard.
            </p>
          </>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          {trip && (
            <Link
              href={continueHref}
              className="px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'var(--accent)' }}
            >
              Continue trip →
            </Link>
          )}
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              background: trip ? 'transparent' : 'var(--accent)',
              color: trip ? 'var(--tx2)' : '#fff',
              border: trip ? '1px solid var(--bdr)' : undefined,
            }}
          >
            ✈ {trip ? 'New Trip' : 'Start planning'}
          </Link>
          {!user && (
            <>
              <button
                onClick={() => setAuthMode('login')}
                className="px-5 py-2.5 rounded-xl font-semibold transition-all hover:bg-elevated"
                style={{ border: '1px solid var(--bdr)', color: 'var(--tx2)' }}
              >
                Sign in
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className="px-5 py-2.5 rounded-xl font-semibold transition-all hover:brightness-110 text-white"
                style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', color: 'var(--tx)' }}
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Auth CTA banner — shown only when not logged in and no trips */}
      {!user && !trip && savedTrips.length === 0 && (
        <div
          className="max-w-2xl mx-auto mt-10 rounded-2xl p-6 flex items-center justify-between gap-6 flex-wrap"
          style={{ background: 'var(--s1)', border: '1px solid var(--bdr)' }}
        >
          <div>
            <div className="font-bold text-foreground mb-1">Save your trips across devices</div>
            <div className="text-sm text-muted">Sign up free — your plans sync everywhere you plan.</div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setAuthMode('signup')}
              className="px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110"
              style={{ background: 'var(--accent)' }}
            >
              Get started
            </button>
            <button
              onClick={() => setAuthMode('login')}
              className="px-4 py-2 rounded-xl font-medium text-sm transition-all hover:bg-elevated"
              style={{ border: '1px solid var(--bdr)', color: 'var(--tx2)' }}
            >
              Sign in
            </button>
          </div>
        </div>
      )}

      {/* Feature highlights when no trips */}
      {!trip && savedTrips.length === 0 && (
        <div className="grid grid-cols-3 gap-5 max-w-2xl mx-auto mt-16">
          {[
            { icon: '✈', title: 'Flights',      desc: 'Compare airlines, times, stops, and prices side by side.' },
            { icon: '🏨', title: 'Hotels',       desc: 'Filter by price, stars, distance, and amenities.' },
            { icon: '🚗', title: 'Car Rentals',  desc: 'Pick your category and compare rental companies.' },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-2xl border text-center"
              style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold mb-1.5 text-foreground">{f.title}</div>
              <div className="text-sm text-muted leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Trips list */}
      {allTrips.length > 0 && (
        <div className="max-w-2xl mx-auto mt-12">
          <div className="h-px mb-6" style={{ background: 'var(--bdr)' }} />
          <div className="text-xs font-bold uppercase tracking-widest text-subtle mb-4">
            Planned trips
          </div>
          <div className="flex flex-col gap-3">
            {allTrips.map((t, i) => {
              const expTotal = t.expenses.reduce((s, e) => s + e.amount, 0)

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (t.isActive) router.push('/dashboard')
                    else switchTrip(t.idx)
                  }}
                  className="text-left rounded-2xl p-5 border transition-all"
                  style={{
                    background: 'var(--s1)',
                    borderColor: t.isActive ? 'var(--accent)' : 'var(--bdr)',
                    borderWidth: t.isActive ? 2 : 1,
                  }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="font-bold text-lg text-foreground mb-1">
                        {t.trip.from}
                        <span className="text-xs font-normal text-subtle mx-2">— ✈ —</span>
                        {t.trip.to}
                      </div>
                      <div className="text-sm text-muted">
                        {fmtDate(t.trip.departDate)}
                        {t.trip.returnDate ? ` → ${fmtDate(t.trip.returnDate)}` : ''}
                        {' · '}{t.trip.travelers} traveler{t.trip.travelers > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap items-center">
                      {t.selFlight && <Chip color="green">✓ Flight</Chip>}
                      {t.selHotel  && <Chip color="green">✓ Hotel</Chip>}
                      {t.selCar    && <Chip color="green">✓ Car</Chip>}
                      {t.expenses.length > 0 && <Chip color="blue">{t.expenses.length} exp</Chip>}
                      {expTotal > 0 && <Chip color="amber">{fmt(expTotal, t.trip.currency)}</Chip>}
                      {t.isActive && <Chip color="blue">Active</Chip>}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Chip({ children, color }: { children: React.ReactNode; color: 'green' | 'blue' | 'amber' }) {
  const s: Record<string, React.CSSProperties> = {
    green: { background: 'var(--green-d)', color: 'var(--green)', border: '1px solid rgba(0,200,150,.2)' },
    blue:  { background: 'var(--accent-d)', color: 'var(--accent)', border: '1px solid rgba(59,142,248,.2)' },
    amber: { background: 'var(--amber-d)', color: 'var(--amber)', border: '1px solid rgba(240,160,48,.2)' },
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={s[color]}>
      {children}
    </span>
  )
}
