'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTripStore } from '@/lib/store'
import { fmt, fmtDate, CATEGORIES } from '@/lib/utils'
import type { ExpenseCategory } from '@/lib/types'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const CHART_COLORS: Record<string, string> = {
  flight: '#3B8EF8',
  hotel:  '#00C896',
  car:    '#F0A030',
}

export default function DashboardPage() {
  const {
    trip, selFlight, selHotel, selCar,
    expenses, addExpense, deleteExpense,
    confirmedPrices, setConfirmedPrice,
  } = useTripStore()

  const [desc, setDesc]         = useState('')
  const [cat, setCat]           = useState<ExpenseCategory>('food')
  const [amount, setAmount]     = useState('')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [expError, setExpError] = useState('')

  if (!selHotel) {
    return (
      <div className="text-center mt-24 text-muted">
        <div className="text-4xl mb-4">🔒</div>
        <p className="mb-4">Select a hotel first to access the dashboard.</p>
        <Link href="/hotels" className="text-accent underline">Go to hotels →</Link>
      </div>
    )
  }

  const currency = trip!.currency

  // Use confirmed price if set, otherwise fall back to estimated
  const flightCost = confirmedPrices.flight  ?? selFlight?.price      ?? 0
  const hotelCost  = confirmedPrices.hotel   ?? selHotel?.totalPrice  ?? 0
  const carCost    = confirmedPrices.car     ?? selCar?.totalPrice    ?? 0
  const expTotal   = expenses.reduce((s, e) => s + e.amount, 0)
  const totalCost  = flightCost + hotelCost + carCost + expTotal

  const budget      = trip!.budget ?? 0
  const pct         = budget ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0
  const progressColor = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--amber)' : 'var(--green)'

  const handleAddExpense = () => {
    if (!desc.trim()) return setExpError('Enter a description')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return setExpError('Enter a valid amount')
    if (!date) return setExpError('Select a date')
    setExpError('')
    addExpense({ desc: desc.trim(), category: cat, amount: amt, date })
    setDesc('')
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
  }

  // Chart data
  const expByCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    expByCategory[e.category] = (expByCategory[e.category] ?? 0) + e.amount
  })
  const chartItems = [
    { label: 'Flights', value: flightCost, color: CHART_COLORS.flight },
    { label: 'Hotel',   value: hotelCost,  color: CHART_COLORS.hotel },
    ...(selCar ? [{ label: 'Car', value: carCost, color: CHART_COLORS.car }] : []),
    ...CATEGORIES.map((c) => ({ label: c.label, value: expByCategory[c.id] ?? 0, color: c.color })),
  ].filter((i) => i.value > 0)
  const chartTotal = chartItems.reduce((s, i) => s + i.value, 0)

  const inputCls  = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-elevated border border-border text-foreground focus:border-accent placeholder:text-subtle'
  const selectCls = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none bg-elevated border border-border text-foreground'

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-7 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Dashboard</h1>
          <p className="text-muted text-sm">{trip!.from} → {trip!.to} · {fmtDate(trip!.departDate)}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
          style={{ background: 'transparent', borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
        >
          🖨 Print / PDF
        </button>
      </div>

      {/* Confirm booking prices banner */}
      <ConfirmPrices
        currency={currency}
        flight={selFlight ? { label: selFlight.airline, estimated: selFlight.price,       confirmed: confirmedPrices.flight } : null}
        hotel={selHotel   ? { label: selHotel.name,     estimated: selHotel.totalPrice,   confirmed: confirmedPrices.hotel  } : null}
        car={selCar       ? { label: selCar.model,      estimated: selCar.totalPrice,     confirmed: confirmedPrices.car    } : null}
        onConfirm={setConfirmedPrice}
      />

      {/* Budget bar */}
      {budget > 0 && (
        <div className="rounded-2xl p-5 border mb-5" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <span className="text-sm font-semibold text-foreground">
              Budget — {fmt(totalCost, currency)} of {fmt(budget, currency)} spent
            </span>
            <span className="text-sm font-bold" style={{ color: progressColor }}>
              {budget - totalCost >= 0
                ? `${fmt(budget - totalCost, currency)} remaining`
                : `${fmt(totalCost - budget, currency)} over budget`}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--s3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: progressColor }} />
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '✈ Flights',   value: fmt(flightCost, currency), sub: selFlight?.airline ?? '—' },
          { label: '🏨 Hotel',    value: fmt(hotelCost,  currency), sub: trip!.nights + ' nights' },
          { label: '🚗 Car',      value: fmt(carCost,    currency), sub: selCar ? selCar.model : '—' },
          { label: '💰 Expenses', value: fmt(expTotal,   currency), sub: `${expenses.length} item${expenses.length !== 1 ? 's' : ''}` },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl p-5 border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted mb-1">{m.label}</div>
            <div className="text-2xl font-bold tracking-tight text-foreground">{m.value}</div>
            <div className="text-xs text-subtle mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Grand total */}
      <div className="rounded-2xl px-5 py-4 border mb-7 flex justify-between items-center"
        style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
        <span className="text-sm font-semibold text-foreground">📊 Grand Total</span>
        <div className="text-right">
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{fmt(totalCost, currency)}</span>
          <span className="text-xs text-subtle ml-2">{fmt(totalCost / trip!.travelers, currency)}/person</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Add expense + table */}
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl p-5 border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
            <div className="text-sm font-bold text-foreground mb-4">Add Expense</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Description</label>
                <input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Dinner" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Category</label>
                <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value as ExpenseCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: 'var(--s2)' }}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Amount ({currency})</label>
                <input className={inputCls} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min={0} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">Date</label>
                <input className={inputCls} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
            {expError && <p className="text-xs mb-2" style={{ color: 'var(--red)' }}>⚠ {expError}</p>}
            <button
              onClick={handleAddExpense}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ background: 'var(--accent)' }}
            >
              + Add expense
            </button>
          </div>

          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
            <div className="px-5 py-4 font-bold text-sm text-foreground border-b" style={{ borderColor: 'var(--bdr)' }}>
              Expenses {expenses.length > 0 && <span className="font-normal text-muted ml-1">({expenses.length})</span>}
            </div>
            {expenses.length === 0 ? (
              <div className="text-center py-10 text-muted text-sm">No expenses yet.<br />Add your first one above.</div>
            ) : (
              <>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Date', 'Description', 'Category', 'Amount', ''].map((h) => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-subtle border-b"
                          style={{ borderColor: 'var(--bdr)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e) => {
                      const c = CATEGORIES.find((x) => x.id === e.category) ?? CATEGORIES[CATEGORIES.length - 1]
                      return (
                        <tr key={e.id} className="border-b last:border-0 hover:bg-elevated transition-colors"
                          style={{ borderColor: 'rgba(31,45,68,.5)' }}>
                          <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">{fmtDate(e.date)}</td>
                          <td className="px-4 py-2.5 text-sm text-foreground">{e.desc}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                              style={{
                                background: c.color + '22',
                                color: c.color,
                                border: `1px solid ${c.color}44`,
                              }}
                            >
                              {c.icon} {c.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm font-bold text-foreground text-right">{fmt(e.amount, currency)}</td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={() => deleteExpense(e.id)}
                              className="no-print text-xs px-2 py-1 rounded-lg border transition-all hover:bg-danger-dim"
                              style={{ color: 'var(--red)', borderColor: 'var(--red-d)' }}
                            >✕</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-5 py-3 flex justify-end border-t text-sm font-bold text-foreground"
                  style={{ borderColor: 'var(--bdr)' }}>
                  Total: {fmt(expTotal, currency)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl p-5 border" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
          <div className="text-sm font-bold text-foreground mb-5">Cost breakdown</div>
          {chartItems.length === 0 ? (
            <div className="flex items-center justify-center h-56 text-muted text-sm">
              Add expenses to see the chart
            </div>
          ) : (
            <>
              <div style={{ position: 'relative', height: 230, marginBottom: '1.25rem' }}>
                <Doughnut
                  data={{
                    labels: chartItems.map((i) => i.label),
                    datasets: [{
                      data: chartItems.map((i) => Math.round(i.value)),
                      backgroundColor: chartItems.map((i) => i.color),
                      borderColor: '#0E1420',
                      borderWidth: 3,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '62%',
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) =>
                            `${ctx.label}: ${fmt(ctx.raw as number, currency)} (${Math.round(((ctx.raw as number) / chartTotal) * 100)}%)`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="flex flex-col gap-0">
                {chartItems.map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 border-b last:border-0"
                    style={{ borderColor: 'var(--bdr)' }}>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {fmt(item.value, currency)}
                      <span className="text-subtle font-normal ml-1">{Math.round((item.value / chartTotal) * 100)}%</span>
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 text-sm font-bold text-foreground">
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{fmt(totalCost, currency)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Confirm Prices Banner ─────────────────────────────────────────────────────

interface PriceItem {
  label: string
  estimated: number
  confirmed?: number
}

function ConfirmPrices({
  currency, flight, hotel, car, onConfirm,
}: {
  currency: string
  flight: PriceItem | null
  hotel:  PriceItem | null
  car:    PriceItem | null
  onConfirm: (type: 'flight' | 'hotel' | 'car', price: number) => void
}) {
  const items: { type: 'flight' | 'hotel' | 'car'; icon: string; item: PriceItem }[] = [
    ...(flight ? [{ type: 'flight' as const, icon: '✈', item: flight }] : []),
    ...(hotel  ? [{ type: 'hotel'  as const, icon: '🏨', item: hotel  }] : []),
    ...(car    ? [{ type: 'car'    as const, icon: '🚗', item: car    }] : []),
  ]

  return (
    <div className="rounded-2xl border mb-5 overflow-hidden" style={{ background: 'var(--s1)', borderColor: 'var(--bdr)' }}>
      <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--bdr)', background: 'var(--s2)' }}>
        <span>🧾</span>
        <span className="text-sm font-semibold text-foreground">Just booked?</span>
        <span className="text-xs text-muted">Confirm your actual prices below — defaults are our estimates.</span>
      </div>
      <div className="divide-y" style={{ borderColor: 'var(--bdr)' }}>
        {items.map(({ type, icon, item }) => (
          <PriceRow
            key={type}
            icon={icon}
            label={item.label}
            estimated={item.estimated}
            confirmed={item.confirmed}
            currency={currency}
            onSave={(price) => onConfirm(type, price)}
          />
        ))}
      </div>
    </div>
  )
}

function PriceRow({
  icon, label, estimated, confirmed, currency, onSave,
}: {
  icon: string
  label: string
  estimated: number
  confirmed?: number
  currency: string
  onSave: (price: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState(String(confirmed ?? estimated))

  const displayPrice = confirmed ?? estimated
  const isEdited     = confirmed !== undefined && confirmed !== estimated

  const handleSave = () => {
    const n = parseFloat(value)
    if (!isNaN(n) && n >= 0) onSave(n)
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="text-sm text-foreground truncate">{label}</span>
        {isEdited && (
          <span className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
            style={{ background: 'var(--green-d)', color: 'var(--green)' }}>
            updated
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <>
            <input
              autoFocus
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-28 px-2 py-1.5 rounded-lg text-sm outline-none text-right text-foreground"
              style={{ background: 'var(--s2)', border: '1px solid var(--accent)' }}
            />
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Save
            </button>
            <button
              onClick={() => { setValue(String(confirmed ?? estimated)); setEditing(false) }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-foreground">{fmt(displayPrice, currency as any)}</span>
            {isEdited && (
              <span className="text-xs text-subtle line-through">{fmt(estimated, currency as any)}</span>
            )}
            <button
              onClick={() => { setValue(String(displayPrice)); setEditing(true) }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-elevated"
              style={{ borderColor: 'var(--bdr)', color: 'var(--tx2)' }}
            >
              ✏ Edit
            </button>
          </>
        )}
      </div>
    </div>
  )
}
