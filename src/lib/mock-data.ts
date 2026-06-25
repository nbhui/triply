import { uid, sr } from './utils'
import type { Trip, Flight, Hotel, Car, CarCategory } from './types'

const AIRLINES = [
  { name: 'El Al',            code: 'LY' },
  { name: 'British Airways',  code: 'BA' },
  { name: 'Lufthansa',        code: 'LH' },
  { name: 'Air France',       code: 'AF' },
  { name: 'Emirates',         code: 'EK' },
  { name: 'Turkish Airlines', code: 'TK' },
  { name: 'easyJet',          code: 'U2' },
  { name: 'Wizz Air',         code: 'W6' },
]

const HOTEL_NAMES = [
  'Grand Plaza Hotel', 'The Metropolitan', 'City Loft Suites',
  'Harbor View Inn', 'Royal Garden Hotel', 'Boutique Central',
  'The Skyline Residences', 'Old Town Boutique', 'The Prestige',
  'Budget Stay Express',
]

const CAR_COMPANIES = ['Hertz', 'Avis', 'Enterprise', 'Budget', 'Europcar', 'Sixt', 'Alamo', 'Thrifty']

const CAR_MODELS: Record<CarCategory, string[]> = {
  economy:  ['Hyundai i10', 'VW Polo', 'Toyota Yaris'],
  compact:  ['Ford Focus', 'VW Golf', 'Toyota Corolla'],
  midsize:  ['Toyota Camry', 'Honda Accord', 'Mazda 6'],
  fullsize: ['Ford Taurus', 'Dodge Charger', 'Chrysler 300'],
  suv:      ['Ford Explorer', 'Toyota RAV4', 'Honda CR-V'],
  luxury:   ['BMW 5 Series', 'Mercedes E-Class', 'Audi A6'],
  minivan:  ['Honda Odyssey', 'Chrysler Pacifica', 'Toyota Sienna'],
}

const CAR_CATEGORIES: CarCategory[] = [
  'economy', 'compact', 'midsize', 'suv', 'fullsize', 'luxury', 'minivan', 'compact',
]

const CAR_BASE_PRICES: Record<CarCategory, number> = {
  economy:  25,
  compact:  35,
  midsize:  50,
  fullsize: 65,
  suv:      80,
  luxury:   130,
  minivan:  90,
}

export function generateFlights(trip: Trip): Flight[] {
  const seed = [...(trip.from + trip.to)].reduce((sum, c) => sum + c.charCodeAt(0), 0)

  return AIRLINES.map((airline, i) => {
    const stops = i < 2 ? 0 : i < 5 ? 1 : 2
    const durMins = 140 + stops * 100 + sr(seed + i, 10, 80)
    const depH = sr(seed + i * 3, 5, 21)
    const depM = [0, 15, 30, 45][i % 4]
    const totalMins = depH * 60 + depM + durMins
    const arrH = Math.floor(totalMins / 60) % 24
    const arrM = totalMins % 60
    const basePrice = Math.max(80, 120 + sr(seed + i * 7, 30, 300) - stops * 15)

    return {
      id: uid(),
      airline: airline.name,
      code: airline.code,
      depart: `${String(depH).padStart(2, '0')}:${String(depM).padStart(2, '0')}`,
      arrive: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
      durMins,
      duration: `${Math.floor(durMins / 60)}h ${String(durMins % 60).padStart(2, '0')}m`,
      stops,
      price: basePrice * trip.travelers,
      pricePerPax: basePrice,
    }
  }).sort((a, b) => a.price - b.price)
}

export function generateHotels(trip: Trip): Hotel[] {
  const seed = [...trip.to].reduce((sum, c) => sum + c.charCodeAt(0), 0)

  return HOTEL_NAMES.map((name, i) => {
    const stars = i < 2 ? 5 : i < 5 ? 4 : 3
    const priceNight = 55 + sr(seed + i * 5, 15, 220)
    const rating = Math.min(10, 6.5 + sr(seed + i * 2, 0, 25) / 10)

    return {
      id: uid(),
      name,
      stars,
      rating: parseFloat(rating.toFixed(1)),
      reviews: 40 + sr(seed + i * 4, 20, 600),
      priceNight,
      totalPrice: priceNight * trip.nights,
      cityCenterDistance: sr(seed + i * 6, 1, 10),
      freeCancellation: i % 2 === 0,
      breakfastIncluded: i % 3 !== 0,
    }
  }).sort((a, b) => a.priceNight - b.priceNight)
}

export function generateCars(trip: Trip): Car[] {
  const seed = [...trip.to].reduce((sum, c) => sum + c.charCodeAt(0), 0)

  return CAR_COMPANIES.map((company, i) => {
    const category = CAR_CATEGORIES[i]
    const models = CAR_MODELS[category]
    const modelIdx = sr(seed + i * 3, 0, models.length - 1)
    const basePrice = CAR_BASE_PRICES[category]
    const priceDay = basePrice + sr(seed + i * 5, -8, 25)
    const seats = category === 'minivan' ? 7 : category === 'economy' || category === 'compact' ? 5 : 5

    return {
      id: uid(),
      company,
      model: models[modelIdx],
      category,
      priceDay,
      totalPrice: priceDay * trip.nights,
      seats,
      transmission: (i % 3 === 0 ? 'manual' : 'automatic') as 'manual' | 'automatic',
      unlimitedMileage: i % 2 === 0,
      freeCancellation: i % 3 !== 2,
      features: [
        ...(i % 2 === 0 ? ['Unlimited mileage'] : []),
        ...(i % 3 !== 2 ? ['Free cancellation'] : []),
        ...(i % 4 === 0 ? ['GPS included'] : []),
        ...(i % 5 === 0 ? ['Child seat available'] : []),
        'A/C',
      ],
      rating: parseFloat(Math.min(5, 3.5 + sr(seed + i * 2, 0, 15) / 10).toFixed(1)),
      reviews: 20 + sr(seed + i * 7, 10, 400),
    }
  }).sort((a, b) => a.priceDay - b.priceDay)
}
