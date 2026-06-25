'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { fmt, fmtDate } from '@/lib/utils'
import type { Flight } from '@/lib/types'

export default function FlightsPage() {
  const router = useRouter()
  const { trip, flights, selFlight, selectFlight } = useTripStore()

  if (!trip) {
    return (
      <div className="text-center mt-24 text-muted">
        <div className="text-4xl mb-4">🔒</div>
        <p className="mb-4">Set up your trip first.</p>
        <Link href="/search" className="text-accent underline">Plan a trip →</Link>
      </div>
    )
  }

  const minPrice = Math.min(...flights.map((f) => f.price))
  const fastId   = flights.reduce((b, f) => f.durMins < b.durMins ? f : b, flights[0])?.id

  const stopLabel = ['Nonstop', '1 stop', '2 stops']
  const stopColor = [
    { bg: 'var(--green-d)', color: 'var(--green)', border: 'rgba(0,200,150,.2)' },
    { bg: 'var(--amber-d)', color: 'var(--amber)', border: 'rgba(240,160,48,.2)' },
    { bg: 'var(--red-d)',   color: 'var(--red)',   border: 'rgba(255,77,77,.2)' },
  ]

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-3 text-xl font-bold text-foreground mb-1">
          {trip.from}
          <span className="text-subtle text-sm font-normal">— ✈ —</span>
          {trip.to}
        </div>
        <p className="text-muted text-sm">
          {fmtDate(trip.departDate)} · {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} · Economy
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {flights.map((flight) => {
          const selected = selFlight?.id === flight.id
          const cheapest = flight.price === minPrice
          const fastest  = flight.id === fastId
          const sc = stopColor[flight.stops]

          return (
            <button
              key={flight.id}
              onClick={() => selectFlight(flight.id)}
              className="text-left rounded-2xl p-5 border transition-all"
              style={{
                background: selected ? 'var(--accent-g)' : 'var(--s1)',
                borderColor: selected ? 'var(--accent)' : 'var(--bdr)',
                borderWidth: selected ? 1.5 : 1,
              }}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-5">
                  <div className="flex items-center justify-center rounded-xl text-xs font-bold flex-shrink-0"
                    style={{ width: 38, height: 38, background: 'var(--s3)', color: 'var(--accent)', letterSpacing: 0 }}>
                    {flight.code}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-base text-foreground">
                      {flight.depart}
                      <span className="text-subtle text-xs font-normal">——</span>
                      {flight.arrive}
                    </div>
                    <div className="text-sm text-muted mt-0.5">{flight.airline} · {flight.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Chip bg={sc.bg} color={sc.color} border={sc.border}>{stopLabel[flight.stops]}</Chip>
                  {cheapest && <Chip bg="var(--green-d)" color="var(--green)" border="rgba(0,200,150,.2)">💚 Cheapest</Chip>}
                  {fastest  && <Chip bg="var(--accent-d)" color="var(--accent)" border="rgba(59,142,248,.2)">⚡ Fastest</Chip>}
                  {selected && <Chip bg="var(--accent-d)" color="var(--accent)" border="rgba(59,142,248,.2)">✓ Selected</Chip>}
                  <div className="text-right min-w-[90px]">
                    <div className="text-lg font-bold text-foreground">{fmt(flight.price, trip.currency)}</div>
                    <div className="text-xs text-subtle">{fmt(flight.pricePerPax, trip.currency)}/person</div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all"
          style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
        >
          ← Back
        </button>
        <button
          onClick={() => selFlight && router.push('/hotels')}
          disabled={!selFlight}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)' }}
        >
          Continue to hotels →
        </button>
      </div>
    </div>
  )
}

function Chip({ children, bg, color, border }: { children: React.ReactNode; bg: string; color: string; border: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: bg, color, border: `1px solid ${border}` }}
    >
      {children}
    </span>
  )
}
