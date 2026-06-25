'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { CURRENCIES } from '@/lib/utils'
import type { CurrencyCode, TripType } from '@/lib/types'

const inputCls = [
  'w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors',
  'bg-elevated border border-border text-foreground',
  'focus:border-accent placeholder:text-subtle',
].join(' ')

const selectCls = [
  'w-full px-3 py-2.5 rounded-xl text-sm outline-none',
  'bg-elevated border border-border text-foreground',
].join(' ')

export default function SearchPage() {
  const router = useRouter()
  const { trip, setupTrip } = useTripStore()

  const [tripType, setTripType] = useState<TripType>(trip?.tripType ?? 'round')
  const [from, setFrom] = useState(trip?.from ?? '')
  const [to, setTo] = useState(trip?.to ?? '')
  const [departDate, setDepartDate] = useState(trip?.departDate ?? '')
  const [returnDate, setReturnDate] = useState(trip?.returnDate ?? '')
  const [travelers, setTravelers] = useState(trip?.travelers ?? 2)
  const [nights, setNights] = useState(trip?.nights ?? 7)
  const [currency, setCurrency] = useState<CurrencyCode>(trip?.currency ?? 'USD')
  const [budget, setBudget] = useState(trip?.budget?.toString() ?? '')
  const [error, setError] = useState('')

  const submit = () => {
    if (!from.trim())    return setError('Enter your origin city')
    if (!to.trim())      return setError('Enter your destination city')
    if (!departDate)     return setError('Select a departure date')
    if (tripType === 'round' && !returnDate) return setError('Select a return date')
    if (new Date(departDate) < new Date()) return setError('Departure date must be in the future')
    setError('')

    setupTrip({
      from: from.trim(),
      to: to.trim(),
      departDate,
      returnDate: tripType === 'round' ? returnDate : undefined,
      travelers,
      nights,
      currency,
      budget: budget ? parseInt(budget) : undefined,
      tripType,
    })
    router.push('/flights')
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Plan a new trip</h1>
        <p className="text-muted text-sm">Set your route and dates — we&apos;ll find flights, hotels, and cars for you.</p>
      </div>

      <div className="max-w-2xl rounded-2xl p-6 border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
        {/* Trip type */}
        <div className="mb-5">
          <Label>Trip type</Label>
          <div className="flex gap-2 mt-1.5">
            {(['round', 'one'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTripType(t)}
                className="px-4 py-2 rounded-xl text-sm border transition-all"
                style={{
                  background: tripType === t ? 'var(--accent-d)' : 'var(--s2)',
                  borderColor: tripType === t ? 'var(--accent)' : 'var(--bdr)',
                  color: tripType === t ? 'var(--accent)' : 'var(--tx2)',
                  fontWeight: tripType === t ? 600 : 500,
                }}
              >
                {t === 'round' ? '⇄ Round trip' : '→ One way'}
              </button>
            ))}
          </div>
        </div>

        {/* Origin / Destination */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>From</Label>
            <input className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="e.g. Tel Aviv" />
          </div>
          <div>
            <Label>To</Label>
            <input className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} placeholder="e.g. London" />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>Departure</Label>
            <input className={inputCls} type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
          </div>
          {tripType === 'round' ? (
            <div>
              <Label>Return</Label>
              <input className={inputCls} type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
            </div>
          ) : <div />}
        </div>

        {/* Travelers / Nights / Currency */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Travelers</Label>
            <input className={inputCls} type="number" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} min={1} max={20} />
          </div>
          <div>
            <Label>Hotel nights</Label>
            <input className={inputCls} type="number" value={nights} onChange={(e) => setNights(Number(e.target.value))} min={1} max={90} />
          </div>
          <div>
            <Label>Currency</Label>
            <select className={selectCls} value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
              {Object.entries(CURRENCIES).map(([code, c]) => (
                <option key={code} value={code} style={{ background: 'var(--s2)' }}>{c.sym} {code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <Label>Budget target <span className="font-normal" style={{ color: 'var(--tx3)' }}>(optional)</span></Label>
          <input
            className={inputCls}
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Leave blank to skip"
          />
        </div>

        {error && (
          <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>⚠ {error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-elevated"
            style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: 'var(--accent)' }}
          >
            Search flights →
          </button>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium mb-1.5 text-muted">
      {children}
    </label>
  )
}
