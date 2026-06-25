export type CurrencyCode = 'USD' | 'EUR' | 'ILS' | 'GBP'
export type TripType = 'round' | 'one'
export type ExpenseCategory = 'food' | 'transport' | 'activities' | 'shopping' | 'insurance' | 'visa' | 'other'
export type CarCategory = 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury' | 'minivan'

export interface Trip {
  id: string
  from: string
  to: string
  departDate: string
  returnDate?: string
  travelers: number
  nights: number
  currency: CurrencyCode
  budget?: number
  tripType: TripType
}

export interface Flight {
  id: string
  airline: string
  code: string
  depart: string
  arrive: string
  durMins: number
  duration: string
  stops: number
  price: number
  pricePerPax: number
}

export interface Hotel {
  id: string
  name: string
  stars: number
  rating: number
  reviews: number
  priceNight: number
  totalPrice: number
  cityCenterDistance: number
  freeCancellation: boolean
  breakfastIncluded: boolean
}

export interface Car {
  id: string
  company: string
  model: string
  category: CarCategory
  priceDay: number
  totalPrice: number
  seats: number
  transmission: 'automatic' | 'manual'
  unlimitedMileage: boolean
  freeCancellation: boolean
  features: string[]
  rating: number
  reviews: number
}

export interface Expense {
  id: string
  desc: string
  category: ExpenseCategory
  amount: number
  date: string
}

export interface HotelFilters {
  priceMin: number
  priceMax: number
  stars4up: boolean
  cityCenter: boolean
  freeCancellation: boolean
  breakfastIncluded: boolean
}

export interface CarFilters {
  priceMin: number
  priceMax: number
  category: CarCategory | 'all'
  automatic: boolean
  unlimitedMileage: boolean
  freeCancellation: boolean
}

export interface SavedTrip extends Trip {
  selFlight?: Flight | null
  selHotel?: Hotel | null
  selCar?: Car | null
  expenses?: Expense[]
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}
