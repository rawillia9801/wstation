import { fetchNOAAForecast } from './forecast'
import { readSettings } from './settings-store'
import { fetchCurrentStationWeather, fetchStationHistory } from './weather'

const LAT = 36.845
const LON = -81.507

export type LiveNumber = number | null

export type LiveDashboardPayload = {
  station: any | null
  stationOnline: boolean
  source: string
  updatedAt: string | null
  current: {
    stationId: string
    location: string
    temperature: LiveNumber
    feelsLike: LiveNumber
    humidity: LiveNumber
    pressure: LiveNumber
    dewpoint: LiveNumber
    windSpeed: LiveNumber
    windGust: LiveNumber
    windDirection: string | null
    uv: LiveNumber
    high: LiveNumber
    low: LiveNumber
    condition: string | null
    precipToday: LiveNumber
  }
  forecast: Array<{
    day: string
    high: LiveNumber
    low: LiveNumber
    condition: string | null
    precip: LiveNumber
  }>
  history: Array<{ time: string; temp: LiveNumber; feels: LiveNumber; humidity: LiveNumber; pressure: LiveNumber; wind: LiveNumber }>
  astronomy: {
    sunrise: string | null
    sunset: string | null
    daylight: string | null
    moonrise: string | null
    moonset: string | null
    moonVisible: string | null
    moon: ReturnType<typeof calculateMoon>
  }
  aqi: {
    value: LiveNumber
    label: string | null
    pm25: LiveNumber
    pm10: LiveNumber
    ozone: LiveNumber
    co: LiveNumber
    no2: LiveNumber
  }
  radar: {
    rainViewerTime: number | null
  }
  alerts: Array<{ title: string; severity: 'advisory' | 'watch' | 'warning' }>
  settings: any
}

function number(value: unknown): LiveNumber {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function windDirection(degrees: unknown) {
  const value = number(degrees)
  if (value === null) return null
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(value / 22.5) % 16]
}

function latestLabel(station: any) {
  const raw = station?.obsTimeLocal || station?.obsTimeUtc
  if (!raw) return null
  const parsed = new Date(raw)
  return Number.isNaN(parsed.getTime()) ? String(raw) : parsed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function isRecent(station: any) {
  const epoch = number(station?.epoch)
  if (epoch === null) return false
  return Date.now() - epoch * 1000 < 30 * 60 * 1000
}

function moonPhaseName(age: number) {
  if (age < 1.84566) return 'New Moon'
  if (age < 5.53699) return 'Waxing Crescent'
  if (age < 9.22831) return 'First Quarter'
  if (age < 12.91963) return 'Waxing Gibbous'
  if (age < 16.61096) return 'Full Moon'
  if (age < 20.30228) return 'Waning Gibbous'
  if (age < 23.99361) return 'Last Quarter'
  if (age < 27.68493) return 'Waning Crescent'
  return 'New Moon'
}

export function calculateMoon(date = new Date()) {
  const synodic = 29.530588853
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const days = (date.getTime() - knownNewMoon) / 86400000
  const age = ((days % synodic) + synodic) % synodic
  const phaseRatio = age / synodic
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phaseRatio)) / 2) * 100)

  return {
    age: Number(age.toFixed(1)),
    illumination,
    phaseName: moonPhaseName(age),
    phaseRatio,
    waxing: age < synodic / 2,
    shadowWidth: Math.round((1 - illumination / 100) * 120)
  }
}

function pairForecast(periods: any[]) {
  const result = []
  for (let index = 0; index < periods.length && result.length < 5; index += 1) {
    const day = periods[index]
    if (day?.isDaytime === false) continue
    const night = periods.slice(index + 1).find((period) => period?.isDaytime === false)
    result.push({
      day: result.length === 0 ? 'TODAY' : String(day?.name || '').toUpperCase(),
      high: number(day?.temperature),
      low: number(night?.temperature),
      condition: day?.shortForecast || null,
      precip: number(day?.probabilityOfPrecipitation?.value)
    })
  }
  return result
}

function stationHistory(observations: any[]) {
  return observations.slice(-24).map((item) => ({
    time: item.obsTimeLocal ? new Date(item.obsTimeLocal).toLocaleTimeString([], { hour: 'numeric' }) : '',
    temp: number(item.imperial?.tempAvg ?? item.imperial?.temp),
    feels: number(item.imperial?.windchillAvg ?? item.imperial?.heatindexAvg ?? item.imperial?.tempAvg ?? item.imperial?.temp),
    humidity: number(item.humidityAvg ?? item.humidity),
    pressure: number(item.imperial?.pressureMax ?? item.imperial?.pressure),
    wind: number(item.imperial?.windspeedAvg ?? item.imperial?.windSpeed)
  }))
}

async function fetchAstronomy() {
  try {
    const params = new URLSearchParams({
      latitude: String(LAT),
      longitude: String(LON),
      daily: 'sunrise,sunset,daylight_duration',
      timezone: 'America/New_York',
      forecast_days: '1'
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: 'no-store' })
    const data = await response.json()
    const sunrise = data?.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null
    const sunset = data?.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null
    const seconds = number(data?.daily?.daylight_duration?.[0])
    const daylight = seconds === null ? null : `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
    return { sunrise, sunset, daylight }
  } catch {
    return { sunrise: null, sunset: null, daylight: null }
  }
}

async function fetchAqi() {
  try {
    const params = new URLSearchParams({
      latitude: String(LAT),
      longitude: String(LON),
      hourly: 'us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
      timezone: 'America/New_York',
      forecast_days: '1'
    })
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`, { cache: 'no-store' })
    const data = await response.json()
    const last = (values: unknown[]) => values.map(number).filter((item): item is number => item !== null).at(-1) ?? null
    const value = last(data?.hourly?.us_aqi || [])
    return {
      value,
      label: value === null ? null : value <= 50 ? 'Good' : value <= 100 ? 'Moderate' : 'Elevated',
      pm25: last(data?.hourly?.pm2_5 || []),
      pm10: last(data?.hourly?.pm10 || []),
      ozone: last(data?.hourly?.ozone || []),
      co: last(data?.hourly?.carbon_monoxide || []),
      no2: last(data?.hourly?.nitrogen_dioxide || [])
    }
  } catch {
    return { value: null, label: null, pm25: null, pm10: null, ozone: null, co: null, no2: null }
  }
}

async function fetchRadarTime() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json', { cache: 'no-store' })
    const data = await response.json()
    return number(data?.radar?.past?.at(-1)?.time)
  } catch {
    return null
  }
}

export async function getLiveDashboardPayload(): Promise<LiveDashboardPayload> {
  const [stationResult, historyResult, forecastResult, astronomy, aqi, radarTime, settings] = await Promise.allSettled([
    fetchCurrentStationWeather(),
    fetchStationHistory(),
    fetchNOAAForecast(),
    fetchAstronomy(),
    fetchAqi(),
    fetchRadarTime(),
    readSettings()
  ])

  const station = stationResult.status === 'fulfilled' ? stationResult.value : null
  const history = historyResult.status === 'fulfilled' ? stationHistory(historyResult.value) : []
  const forecastPeriods = forecastResult.status === 'fulfilled' ? forecastResult.value : []
  const forecast = pairForecast(Array.isArray(forecastPeriods) ? forecastPeriods : [])
  const astronomyBase = astronomy.status === 'fulfilled' ? astronomy.value : { sunrise: null, sunset: null, daylight: null }
  const aqiValue = aqi.status === 'fulfilled' ? aqi.value : { value: null, label: null, pm25: null, pm10: null, ozone: null, co: null, no2: null }
  const settingsValue = settings.status === 'fulfilled' ? settings.value : {}

  const daily = station?.daily || {}
  const currentForecast = forecast[0]
  const current = {
    stationId: station?.stationID || 'KVAMARIO42',
    location: station?.neighborhood ? `${station.neighborhood}, Virginia` : 'Marion, Virginia',
    temperature: number(station?.imperial?.temp),
    feelsLike: number(station?.imperial?.heatIndex ?? station?.imperial?.windChill),
    humidity: number(station?.humidity),
    pressure: number(station?.imperial?.pressure),
    dewpoint: number(station?.imperial?.dewpt),
    windSpeed: number(station?.imperial?.windSpeed),
    windGust: number(station?.imperial?.windGust),
    windDirection: windDirection(station?.winddir),
    uv: number(station?.uv),
    high: number(daily.tempHigh),
    low: number(daily.tempLow),
    condition: currentForecast?.condition || null,
    precipToday: number(daily.precipTotal ?? station?.imperial?.precipTotal)
  }

  const alertTitle = currentForecast?.condition ? currentForecast.condition : 'Live Data Unavailable'

  return {
    station,
    stationOnline: Boolean(station?.stationID && isRecent(station)),
    source: station?.stationID ? 'Weather Underground PWS' : 'Live Data Unavailable',
    updatedAt: latestLabel(station),
    current,
    forecast,
    history,
    astronomy: {
      ...astronomyBase,
      moonrise: null,
      moonset: null,
      moonVisible: null,
      moon: calculateMoon()
    },
    aqi: aqiValue,
    radar: {
      rainViewerTime: radarTime.status === 'fulfilled' ? radarTime.value : null
    },
    alerts: [{ title: alertTitle, severity: 'advisory' }],
    settings: settingsValue
  }
}
