'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { fmtDate, fmt } from '@/lib/utils'
import { clx } from '@/lib/utils'

type Requires = 'trip' | 'flight' | 'hotel'

interface NavItem {
  href: string
  icon: string
  label: string
  requires?: Requires
}

const NAV: NavItem[] = [
  { href: '/',          icon: '🏠', label: 'Home' },
  { href: '/search',    icon: '🔍', label: 'Plan Trip' },
  { href: '/flights',   icon: '✈',  label: 'Flights',   requires: 'trip' },
  { href: '/hotels',    icon: '🏨', label: 'Hotels',    requires: 'flight' },
  { href: '/cars',      icon: '🚗', label: 'Cars',      requires: 'hotel' },
  { href: '/dashboard', icon: '📊', label: 'Dashboard', requires: 'hotel' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { trip, selFlight, selHotel, selCar, addToast, startNewTrip } = useTripStore()

  const isUnlocked = (requires?: Requires) => {
    if (!requires) return true
    if (requires === 'trip')   return !!trip
    if (requires === 'flight') return !!selFlight
    if (requires === 'hotel')  return !!selHotel
    return false
  }

  const lockMessage: Record<Requires, string> = {
    trip:   'Set up your trip first',
    flight: 'Select a flight first',
    hotel:  'Select a hotel first',
  }

  const handleNewTrip = () => {
    startNewTrip()
    router.push('/search')
  }

  const steps = [
    { label: 'Choose flight', done: !!selFlight, locked: !trip },
    { label: 'Choose hotel',  done: !!selHotel,  locked: !selFlight },
    { label: 'Choose car',    done: !!selCar,      locked: !selHotel, optional: true },
    { label: 'Dashboard',     done: false,        locked: !selHotel },
  ]

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 w-56 flex flex-col z-50 overflow-y-auto"
      style={{ background: 'var(--s1)', borderRight: '1px solid var(--bdr)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2 border-b"
        style={{ borderColor: 'var(--bdr)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.3px' }}>
        <span>✈</span>
        <span>Trip<span style={{ color: 'var(--accent)' }}>ly</span></span>
      </div>

      {/* Nav */}
      <div className="pt-1">
        <div className="px-5 pt-3 pb-1"
          style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--tx3)' }}>
          Menu
        </div>
        {NAV.map(({ href, icon, label, requires }) => {
          const locked = !isUnlocked(requires as Requires | undefined)
          const active = pathname === href

          if (locked) {
            return (
              <button
                key={href}
                onClick={() => addToast(lockMessage[requires as Requires] + ' 🔒', 'error')}
                className="w-full flex items-center gap-2.5 px-5 py-2.5 text-left transition-all"
                style={{
                  fontSize: 13.5,
                  opacity: 0.35,
                  cursor: 'not-allowed',
                  color: 'var(--tx2)',
                  borderLeft: '2.5px solid transparent',
                }}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
                {label}
                <span className="ml-auto" style={{ fontSize: 10 }}>🔒</span>
              </button>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={clx(
                'flex items-center gap-2.5 px-5 py-2.5 transition-all',
                active ? '' : 'hover:opacity-100'
              )}
              style={{
                fontSize: 13.5,
                color: active ? 'var(--accent)' : 'var(--tx2)',
                borderLeft: `2.5px solid ${active ? 'var(--accent)' : 'transparent'}`,
                background: active ? 'var(--accent-g)' : undefined,
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>

      {/* Trip summary */}
      {trip && (
        <>
          <div className="mx-3 mt-3 rounded-xl p-3"
            style={{ background: 'var(--s2)', border: '1px solid var(--bdr)', fontSize: 12.5 }}>
            <div style={{ fontWeight: 700, color: 'var(--tx)', marginBottom: 4, fontSize: 13 }}>
              ✈ {trip.from} → {trip.to}
            </div>
            <div style={{ color: 'var(--tx2)', lineHeight: 1.6 }}>
              {fmtDate(trip.departDate)}<br />
              {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} · {trip.nights} nights<br />
              {trip.currency}{trip.budget ? ` · Budget: ${fmt(trip.budget, trip.currency)}` : ''}
            </div>
          </div>

          <div className="mx-3 mt-2">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 py-1"
                style={{ fontSize: 12, color: step.done ? 'var(--green)' : step.locked ? 'var(--tx3)' : 'var(--tx)' }}>
                <div className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    fontSize: 10,
                    border: `1.5px solid ${step.done ? 'var(--green)' : step.locked ? 'var(--tx3)' : 'var(--accent)'}`,
                    background: step.done ? 'var(--green)' : 'transparent',
                    color: step.done ? '#000' : undefined,
                    fontWeight: 700,
                  }}>
                  {step.done ? '✓' : i + 1}
                </div>
                {step.label}
                {step.optional && <span style={{ fontSize: 10, color: 'var(--tx3)' }}>(opt)</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="mt-auto p-3 border-t" style={{ borderColor: 'var(--bdr)' }}>
        <button
          onClick={handleNewTrip}
          className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-1.5 transition-all hover:brightness-110"
          style={{ background: 'var(--accent)', fontSize: 13 }}
        >
          + New Trip
        </button>
      </div>
    </aside>
  )
}
