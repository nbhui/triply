import type { CurrencyCode, ExpenseCategory } from './types'

export const CURRENCIES: Record<CurrencyCode, { sym: string; name: string }> = {
  USD: { sym: '$', name: 'US Dollar' },
  EUR: { sym: '€', name: 'Euro' },
  ILS: { sym: '₪', name: 'Israeli Shekel' },
  GBP: { sym: '£', name: 'British Pound' },
}

export const CATEGORIES: {
  id: ExpenseCategory
  label: string
  icon: string
  color: string
}[] = [
  { id: 'food',       label: 'Food & Dining',    icon: '🍽', color: '#F59E0B' },
  { id: 'transport',  label: 'Local Transport',   icon: '🚌', color: '#3B82F6' },
  { id: 'activities', label: 'Activities',        icon: '🎟', color: '#A78BFA' },
  { id: 'shopping',   label: 'Shopping',          icon: '🛍', color: '#EC4899' },
  { id: 'insurance',  label: 'Insurance',         icon: '🛡', color: '#10B981' },
  { id: 'visa',       label: 'Visa & Fees',       icon: '📋', color: '#6366F1' },
  { id: 'other',      label: 'Other',             icon: '💳', color: '#6B7280' },
]

export const sym = (currency: CurrencyCode = 'USD') => CURRENCIES[currency]?.sym ?? '$'

export const fmt = (value: number, currency: CurrencyCode = 'USD') =>
  sym(currency) + Math.round(value).toLocaleString()

export const fmtDate = (date?: string) =>
  date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'

export const uid = () => Math.random().toString(36).slice(2, 9)

export const sr = (seed: number, min: number, max: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return min + Math.floor((x - Math.floor(x)) * (max - min + 1))
}

export const clx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')
