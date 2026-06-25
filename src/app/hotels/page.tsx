'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTripStore } from '@/lib/store'
import { fmt, fmtDate } from '@/lib/utils'
import type { Hotel } from '@/lib/types'

const inputCls = 'w-full px-3 py-2 rounded-xl text-sm outline-none bg-elevated border border-border text-foreground focus:border-accent'

export default function HotelsPage() {
  const router = useRouter()
  const { trip, hotels, selFlight, selHotel, selectHotel, hotelFilters, setHotelFilters } = useTripStore()

  if (!selFlight) {
    return (
      <div className="text-center mt-24 text-muted">
        <div className="text-4xl mb-4">🔒</div>
        <p className="mb-4">Select a flight first.</p>
        <Link href="/flights" className="text-accent underline">Go to flights →</Link>
      </div>
    )
  }

  const f = hotelFilters
  const filtered = hotels.filter((h) => {
    return h.priceNight >= f.priceMin &&
           h.priceNight <= f.priceMax &&
           (!f.stars4up || h.stars >= 4) &&
           (!f.cityCenter || h.cityCenterDistance <= 3) &&
           (!f.freeCancellation || h.freeCancellation) &&
           (!f.breakfastIncluded || h.breakfastIncluded)
  })

  const minPrice = Math.min(...hotels.map((h) => h.priceNight))
  const topId    = hotels.reduce((b, h) => h.rating > b.rating ? h : b, hotels[0])?.id

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Hotels in {trip!.to}</h1>
        <p className="text-muted text-sm">
          {fmtDate(trip!.departDate)} → {fmtDate(trip!.returnDate)} · {trip!.nights} nights · {trip!.travelers} guest{trip!.travelers > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* List */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 mb-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-muted border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
              No hotels match these filters.
            </div>
          ) : filtered.map((hotel) => {
            const selected = selHotel?.id === hotel.id
            const cheapest = hotel.priceNight === minPrice
            const top      = hotel.id === topId
            const stars    = '★'.repeat(hotel.stars) + '☆'.repeat(5 - hotel.stars)

            return (
              <button
                key={hotel.id}
                onClick={() => selectHotel(hotel.id)}
                className="text-left rounded-2xl p-5 border transition-all"
                style={{
                  background: selected ? 'var(--accent-g)' : 'var(--s1)',
                  borderColor: selected ? 'var(--accent)' : 'var(--bdr)',
                  borderWidth: selected ? 1.5 : 1,
                }}
              >
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-40">
                    <div className="font-bold text-base text-foreground mb-1">{hotel.name}</div>
                    <div className="text-sm mb-1" style={{ color: 'var(--amber)', letterSpacing: 1 }}>{stars}</div>
                    <div className="text-sm text-muted">⭐ {hotel.rating}/10 · {hotel.reviews} reviews</div>
                    <div className="text-xs text-subtle mt-1.5">
                      {hotel.cityCenterDistance} km from center
                      {hotel.freeCancellation ? ' · Free cancellation' : ''}
                      {hotel.breakfastIncluded ? ' · Breakfast included' : ''}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-foreground">
                      {fmt(hotel.priceNight, trip!.currency)}<span className="text-xs font-normal text-subtle">/night</span>
                    </div>
                    <div className="text-xs text-subtle mb-2">{fmt(hotel.totalPrice, trip!.currency)} total</div>
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      {cheapest && <SmallChip color="green">💚 Best Price</SmallChip>}
                      {top      && <SmallChip color="purple">⭐ Top Rated</SmallChip>}
                      {selected && <SmallChip color="blue">✓ Selected</SmallChip>}
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
            <label className="text-xs font-medium text-muted block mb-2">Price per night</label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                type="number"
                value={f.priceMin}
                onChange={(e) => setHotelFilters({ priceMin: Number(e.target.value) })}
                placeholder="Min"
              />
              <input
                className={inputCls}
                type="number"
                value={f.priceMax}
                onChange={(e) => setHotelFilters({ priceMax: Number(e.target.value) })}
                placeholder="Max"
              />
            </div>
          </div>

          {([
            ['stars4up',         '4 stars and above'],
            ['cityCenter',       'Within 3 km of center'],
            ['freeCancellation', 'Free cancellation'],
            ['breakfastIncluded','Breakfast included'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 py-2 cursor-pointer text-sm text-foreground">
              <input
                type="checkbox"
                checked={f[key]}
                onChange={(e) => setHotelFilters({ [key]: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              {label}
            </label>
          ))}

          {/* Sticky navigation buttons */}
          <div className="mt-6 pt-5 border-t flex flex-col gap-2" style={{ borderColor: 'var(--bdr)' }}>
            <button
              onClick={() => router.push('/flights')}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
              style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
            >
              ← Back to flights
            </button>
            <button
              onClick={() => selHotel && router.push('/cars')}
              disabled={!selHotel}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent)' }}
            >
              Continue to cars →
            </button>
            <button
              onClick={() => selHotel && router.push('/dashboard')}
              disabled={!selHotel}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
            >
              Skip cars →
            </button>
          </div>
        </aside>
      </div>

    </div>
  )
}

function SmallChip({ children, color }: { children: React.ReactNode; color: 'green' | 'blue' | 'purple' }) {
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
