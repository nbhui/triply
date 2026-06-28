'use client'
import { create } from 'zustand'
import { uid } from './utils'
import { generateFlights, generateHotels, generateCars } from './mock-data'
import { supabase } from './supabase'
import type {
  Trip, Flight, Hotel, Car, Expense,
  HotelFilters, CarFilters, SavedTrip, Toast,
} from './types'

export interface AuthUser {
  name: string
  email: string
}

interface TripStore {
  user: AuthUser | null
  trip: Trip | null
  savedTrips: SavedTrip[]
  flights: Flight[]
  hotels: Hotel[]
  cars: Car[]
  selFlight: Flight | null
  selHotel: Hotel | null
  selCar: Car | null
  expenses: Expense[]
  hotelFilters: HotelFilters
  carFilters: CarFilters
  toasts: Toast[]
  confirmedPrices: { flight?: number; hotel?: number; car?: number }

  setupTrip: (trip: Omit<Trip, 'id'>) => void
  selectFlight: (id: string) => void
  selectHotel: (id: string) => void
  selectCar: (id: string) => void
  clearCar: () => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  deleteExpense: (id: string) => void
  startNewTrip: () => void
  switchTrip: (index: number) => void
  setHotelFilters: (filters: Partial<HotelFilters>) => void
  setCarFilters: (filters: Partial<CarFilters>) => void
  setConfirmedPrice: (type: 'flight' | 'hotel' | 'car', price: number) => void
  signUp: (name: string, email: string, password: string) => Promise<string | null>
  signIn: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
  initAuth: () => () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useTripStore = create<TripStore>((set, get) => ({
  user: null,
  trip: null,
  savedTrips: [],
  flights: [],
  hotels: [],
  cars: [],
  selFlight: null,
  selHotel: null,
  selCar: null,
  expenses: [],
  hotelFilters: {
    priceMin: 50,
    priceMax: 300,
    stars4up: false,
    cityCenter: false,
    freeCancellation: false,
    breakfastIncluded: false,
  },
  carFilters: {
    priceMin: 20,
    priceMax: 200,
    category: 'all',
    automatic: false,
    unlimitedMileage: false,
    freeCancellation: false,
  },
  toasts: [],
  confirmedPrices: {},

  setupTrip: (tripData) => {
    const trip: Trip = { ...tripData, id: uid() }
    set({
      trip,
      flights: generateFlights(trip),
      hotels: generateHotels(trip),
      cars: generateCars(trip),
      selFlight: null,
      selHotel: null,
      selCar: null,
      expenses: [],
      confirmedPrices: {},
    })
  },

  selectFlight: (id) => {
    const flight = get().flights.find((f) => f.id === id) ?? null
    set({ selFlight: flight })
    if (flight) get().addToast('Flight selected ✓', 'success')
  },

  selectHotel: (id) => {
    const hotel = get().hotels.find((h) => h.id === id) ?? null
    set({ selHotel: hotel })
    if (hotel) get().addToast('Hotel selected ✓', 'success')
  },

  selectCar: (id) => {
    const car = get().cars.find((c) => c.id === id) ?? null
    set({ selCar: car })
    if (car) get().addToast('Car selected ✓', 'success')
  },

  clearCar: () => set({ selCar: null }),

  addExpense: (expenseData) => {
    const expense: Expense = { ...expenseData, id: uid() }
    set((s) => ({ expenses: [...s.expenses, expense] }))
    get().addToast('Expense added ✓', 'success')
  },

  deleteExpense: (id) => {
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
  },

  startNewTrip: () => {
    const { trip, selFlight, selHotel, selCar, expenses, savedTrips } = get()
    const updated = trip
      ? [{ ...trip, selFlight, selHotel, selCar, expenses }, ...savedTrips]
      : savedTrips
    set({
      savedTrips: updated,
      trip: null,
      flights: [],
      hotels: [],
      cars: [],
      selFlight: null,
      selHotel: null,
      selCar: null,
      expenses: [],
    })
  },

  switchTrip: (index) => {
    const { trip, selFlight, selHotel, selCar, expenses, savedTrips } = get()
    const target = savedTrips[index]
    if (!target) return
    const remaining = savedTrips.filter((_, i) => i !== index)
    const archiveCurrent = trip ? [{ ...trip, selFlight, selHotel, selCar, expenses }] : []
    set({
      savedTrips: [...archiveCurrent, ...remaining],
      trip: target,
      flights: generateFlights(target),
      hotels: generateHotels(target),
      cars: generateCars(target),
      selFlight: target.selFlight ?? null,
      selHotel: target.selHotel ?? null,
      selCar: target.selCar ?? null,
      expenses: target.expenses ?? [],
    })
  },

  setHotelFilters: (filters) =>
    set((s) => ({ hotelFilters: { ...s.hotelFilters, ...filters } })),

  setCarFilters: (filters) =>
    set((s) => ({ carFilters: { ...s.carFilters, ...filters } })),

  setConfirmedPrice: (type, price) =>
    set((s) => ({ confirmedPrices: { ...s.confirmedPrices, [type]: price } })),

  signUp: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return error.message
    if (data.user) {
      set({ user: { name, email } })
      get().addToast(`Welcome, ${name}! 👋`, 'success')
    }
    return null
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    const name = data.user?.user_metadata?.name ?? email.split('@')[0]
    set({ user: { name, email } })
    get().addToast(`Welcome back, ${name}!`, 'success')
    return null
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
    get().addToast('Signed out successfully', 'info')
  },

  initAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name = session.user.user_metadata?.name ?? session.user.email!.split('@')[0]
        set({ user: { name, email: session.user.email! } })
      } else {
        set({ user: null })
      }
    })
    return () => subscription.unsubscribe()
  },

  addToast: (message, type = 'info') => {
    const id = uid()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
