const SYNODIC_MONTH = 29.530588853
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)
const CANONICAL_MOON_DATE = new Date('2026-05-06T19:00:00Z')

export type MoonDetails = {
  age: number
  illumination: number
  phaseName: string
  phaseRatio: number
  shadowWidth: number
  waxing: boolean
}

export function getMoonDetails(date = CANONICAL_MOON_DATE): MoonDetails {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000
  const age = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH
  const phaseRatio = age / SYNODIC_MONTH
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phaseRatio)) / 2) * 100)
  const waxing = age < SYNODIC_MONTH / 2

  let phaseName = 'New Moon'
  if (age >= 1.84566 && age < 5.53699) phaseName = 'Waxing Crescent'
  else if (age >= 5.53699 && age < 9.22831) phaseName = 'First Quarter'
  else if (age >= 9.22831 && age < 12.91963) phaseName = 'Waxing Gibbous'
  else if (age >= 12.91963 && age < 16.61096) phaseName = 'Full Moon'
  else if (age >= 16.61096 && age < 20.30228) phaseName = 'Waning Gibbous'
  else if (age >= 20.30228 && age < 23.99361) phaseName = 'Last Quarter'
  else if (age >= 23.99361 && age < 27.68493) phaseName = 'Waning Crescent'

  return {
    age: Number(age.toFixed(1)),
    illumination,
    phaseName,
    phaseRatio,
    shadowWidth: Math.round((1 - illumination / 100) * 120),
    waxing
  }
}
