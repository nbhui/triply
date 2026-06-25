'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { fmt } from '@/lib/utils'
import type { CarCategory } from '@/lib/types'

const CATEGORIES: { id: CarCategory | 'all'; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'economy',  label: 'Economy' },
  { id: 'compact',  label: 'Compact' },
  { id: 'midsize',  label: 'Midsize' },
  { id: 'fullsize', label: 'Full-size' },
  { id: 'suv',      label: 'SUV' },
  { id: 'luxury',   label: 'Luxury' },
  { id: 'minivan',  label: 'Minivan' },
]

const CAT_ICONS: Record<CarCategory, string> = {
  economy:  '🚘',
  compact:  '🚗',
  midsize:  '🚙',
  fullsize: '🚘',
  suv:      '🛻',
  luxury:   '🏎',
  minivan:  '🚐',
}

export default function CarsPage() {
  const router = useRouter()
  const { trip, cars, selHotel, selCar, selectCar, clearCar, carFilters, setCarFilters } = useTripStore()

  if (!selHotel) {
    return (
      <div className="text-center mt-24 text-muted">
        <div className="text-4xl mb-4">🔒</div>
        <p className="mb-4">Select a hotel first.</p>
        <Link href="/hotels" className="text-accent underline">Go to hotels →</Link>
      </div>
    )
  }

  const f = carFilters
  const filtered = cars.filter((c) => {
    return c.priceDay >= f.priceMin &&
           c.priceDay <= f.priceMax &&
           (f.category === 'all' || c.category === f.category) &&
           (!f.automatic || c.transmission === 'automatic') &&
           (!f.unlimitedMileage || c.unlimitedMileage) &&
           (!f.freeCancellation || c.freeCancellation)
  })

  const minPrice = Math.min(...cars.map((c) => c.priceDay))
  const topId    = cars.reduce((b, c) => c.rating > b.rating ? c : b, cars[0])?.id

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Car Rentals in {trip!.to}</h1>
        <p className="text-muted text-sm">
          {trip!.nights} days · Pick up & drop off at destination · Optional
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCarFilters({ category: cat.id })}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
            style={{
              background: f.category === cat.id ? 'var(--accent-d)' : 'var(--s1)',
              borderColor: f.category === cat.id ? 'var(--accent)' : 'var(--bdr)',
              color: f.category === cat.id ? 'var(--accent)' : 'var(--tx2)',
              fontWeight: f.category === cat.id ? 600 : 500,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-5 items-start">
        {/* Car list */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 mb-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-muted border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
              No cars match these filters.
            </div>
          ) : filtered.map((car) => {
            const selected = selCar?.id === car.id
            const cheapest = car.priceDay === minPrice
            const top      = car.id === topId

            return (
              <button
                key={car.id}
                onClick={() => selected ? clearCar() : selectCar(car.id)}
                className="text-left rounded-2xl p-5 border transition-all"
                style={{
                  background: selected ? 'var(--accent-g)' : 'var(--s1)',
                  borderColor: selected ? 'var(--accent)' : 'var(--bdr)',
                  borderWidth: selected ? 1.5 : 1,
                }}
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0 mt-0.5">
                      {CAT_ICONS[car.category]}
                    </div>
                    <div>
                      <div className="font-bold text-base text-foreground mb-0.5">{car.model}</div>
                      <div className="text-sm text-muted mb-1">{car.company} · <span className="capitalize">{car.category}</span></div>
                      <div className="text-xs text-subtle">
                        {car.seats} seats · {car.transmission === 'automatic' ? 'Automatic' : 'Manual'}
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {car.features.map((feat) => (
                          <span key={feat} className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{ background: 'var(--s3)', color: 'var(--tx2)' }}>
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-foreground">
                      {fmt(car.priceDay, trip!.currency)}<span className="text-xs font-normal text-subtle">/day</span>
                    </div>
                    <div className="text-xs text-subtle mb-2">{fmt(car.totalPrice, trip!.currency)} total</div>
                    <div className="text-xs text-muted mb-2">⭐ {car.rating}/5 · {car.reviews} reviews</div>
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      {cheapest && <Chip color="green">💚 Best Price</Chip>}
                      {top      && <Chip color="purple">⭐ Top Rated</Chip>}
                      {selected && <Chip color="blue">✓ Selected</Chip>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Filter panel */}
        <aside className="w-64 flex-shrink-0 sticky top-6 rounded-2xl p-5 border"
          style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
          <div className="font-bold text-sm text-foreground mb-4">Filters</div>

          <div className="mb-5">
            <label className="text-xs font-medium text-muted block mb-2">Price per day</label>
            <div className="flex gap-2">
              <input
                className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-elevated border border-border text-foreground focus:border-accent"
                type="number"
                value={f.priceMin}
                onChange={(e) => setCarFilters({ priceMin: Number(e.target.value) })}
                placeholder="Min"
              />
              <input
                className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-elevated border border-border text-foreground focus:border-accent"
                type="number"
                value={f.priceMax}
                onChange={(e) => setCarFilters({ priceMax: Number(e.target.value) })}
                placeholder="Max"
              />
            </div>
          </div>

          {([
            ['automatic',       'Automatic only'],
            ['unlimitedMileage','Unlimited mileage'],
            ['freeCancellation','Free cancellation'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 py-2 cursor-pointer text-sm text-foreground">
              <input
                type="checkbox"
                checked={f[key]}
                onChange={(e) => setCarFilters({ [key]: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              {label}
            </label>
          ))}

          {/* Sticky navigation buttons */}
          <div className="mt-6 pt-5 border-t flex flex-col gap-2" style={{ borderColor: 'var(--bdr)' }}>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'var(--accent)' }}
            >
              {selCar ? 'Go to dashboard →' : 'Skip & go to dashboard →'}
            </button>
            <button
              onClick={() => router.push('/hotels')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
            >
              ← Back to hotels
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Chip({ children, color }: { children: React.ReactNode; color: 'green' | 'blue' | 'purple' }) {
  const s: Record<string, React.CSSProperties> = {
    green:  { background: 'var(--green-d)',  color: 'var(--green)',  border: '1px solid rgba(0,200,150,.2)' },
    blue:   { background: 'var(--accent-d)', color: 'var(--accent)', border: '1px solid rgba(59,142,248,.2)' },
    purple: { background: 'var(--purple-d)', color: 'var(--purple)', border: '1px solid rgba(167,139,250,.2)' },
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={s[color]}>{children}</span>
  )
}
