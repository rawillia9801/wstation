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
    uvSource: string | null
    high: LiveNumber
    low: LiveNumber
    condition: string | null
    conditionSource: string | null
    isDaylight: boolean | null
    precipToday: LiveNumber
  }
  forecast: Array<{
    day: string
    high: LiveNumber
    low: LiveNumber
    condition: string | null
    detailed: string | null
    wind: string | null
    precip: LiveNumber
    nightName: string | null
    nightCondition: string | null
    nightDetailed: string | null
    nightWind: string | null
    nightPrecip: LiveNumber
  }>
  history: Array<{ time: string; timestamp: string | null; temp: LiveNumber; feels: LiveNumber; humidity: LiveNumber; pressure: LiveNumber; wind: LiveNumber }>
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
    tileUrl: string | null
    source: string | null
  }
  camera: {
    configured: boolean
    live: boolean
    snapshotUrl: string | null
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

function parseDate(value: unknown) {
  if (!value) return null
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isCurrentDaylight(sunriseIso: string | null, sunsetIso: string | null, now = new Date()) {
  const sunrise = parseDate(sunriseIso)
  const sunset = parseDate(sunsetIso)
  if (!sunrise || !sunset) return null
  return now >= sunrise && now < sunset
}

function normalizeCondition(condition: string | null, daylight: boolean | null) {
  if (!condition) return null
  if (daylight !== false) return condition

  return condition
    .replace(/\bMostly Sunny\b/gi, 'Mostly Clear')
    .replace(/\bPartly Sunny\b/gi, 'Partly Cloudy')
    .replace(/\bSunny\b/gi, 'Clear')
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

const MOON_PHASE_IMAGES: Record<string, string> = {
  'New Moon': 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/internal_resources/366/new-moon.jpg?w=640&h=613&fit=clip&crop=faces%2Cfocalpoint',
  'Waxing Crescent': 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/internal_resources/368/waxing-crescent.jpg?w=640&h=613&fit=clip&crop=faces%2Cfocalpoint',
  'First Quarter': 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/internal_resources/367/first-quarter.jpg?w=640&h=613&fit=clip&crop=faces%2Cfocalpoint',
  'Waxing Gibbous': 'https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/internal_resources/365/waxing-gibbous.jpg?w=640&h=613&fit=clip&crop=faces%2Cfocalpoint',
  'Full Moon': 'https://science.nasa.gov/wp-content/uploads/2023/08/full.jpg',
  'Waning Gibbous': 'https://science.nasa.gov/wp-content/uploads/2023/08/waning-gibbous.jpg',
  'Last Quarter': 'https://science.nasa.gov/wp-content/uploads/2023/08/third-quarter.jpg',
  'Waning Crescent': 'https://science.nasa.gov/wp-content/uploads/2023/08/waning-crescent.jpg'
}

export function calculateMoon(date = new Date()) {
  const synodic = 29.530588853
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const days = (date.getTime() - knownNewMoon) / 86400000
  const age = ((days % synodic) + synodic) % synodic
  const phaseRatio = age / synodic
  const illumination = Math.round(((1 - Math.cos(2 * Math.PI * phaseRatio)) / 2) * 100)
  const phaseName = moonPhaseName(age)

  return {
    age: Number(age.toFixed(1)),
    illumination,
    phaseName,
    phaseImageUrl: MOON_PHASE_IMAGES[phaseName],
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
      detailed: day?.detailedForecast || null,
      wind: [day?.windDirection, day?.windSpeed].filter(Boolean).join(' ') || null,
      precip: number(day?.probabilityOfPrecipitation?.value),
      nightName: night?.name || null,
      nightCondition: night?.shortForecast || null,
      nightDetailed: night?.detailedForecast || null,
      nightWind: [night?.windDirection, night?.windSpeed].filter(Boolean).join(' ') || null,
      nightPrecip: number(night?.probabilityOfPrecipitation?.value)
    })
  }
  return result
}

function stationHistory(observations: any[]) {
  return observations.slice(-24).map((item) => ({
    time: item.obsTimeLocal ? new Date(item.obsTimeLocal).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '',
    timestamp: item.obsTimeLocal || item.obsTimeUtc || null,
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
    const sunriseIso = data?.daily?.sunrise?.[0] || null
    const sunsetIso = data?.daily?.sunset?.[0] || null
    const sunrise = sunriseIso ? new Date(sunriseIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null
    const sunset = sunsetIso ? new Date(sunsetIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null
    const seconds = number(data?.daily?.daylight_duration?.[0])
    const daylight = seconds === null ? null : `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
    return { sunrise, sunset, sunriseIso, sunsetIso, daylight, isDaylight: isCurrentDaylight(sunriseIso, sunsetIso) }
  } catch {
    return { sunrise: null, sunset: null, sunriseIso: null, sunsetIso: null, daylight: null, isDaylight: null }
  }
}

async function fetchOpenMeteoUv() {
  try {
    const params = new URLSearchParams({
      latitude: String(LAT),
      longitude: String(LON),
      hourly: 'uv_index',
      timezone: 'America/New_York',
      forecast_days: '1'
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: 'no-store' })
    const data = await response.json()
    const times: string[] = data?.hourly?.time || []
    const values: unknown[] = data?.hourly?.uv_index || []
    const now = Date.now()
    let best: { distance: number; value: LiveNumber } | null = null

    for (let index = 0; index < times.length; index += 1) {
      const parsed = new Date(times[index]).getTime()
      const uv = number(values[index])
      if (Number.isNaN(parsed) || uv === null) continue
      const distance = Math.abs(parsed - now)
      if (!best || distance < best.distance) best = { distance, value: uv }
    }

    return best?.value ?? null
  } catch (error) {
    console.warn('[live-data] UV secondary source unavailable', error)
    return null
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

function tileFor(lon: number, lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180
  const n = 2 ** zoom
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n)
  }
}

export async function getLiveDashboardPayload(): Promise<LiveDashboardPayload> {
  const [stationResult, historyResult, forecastResult, astronomy, aqi, radarTime, uvResult, settings] = await Promise.allSettled([
    fetchCurrentStationWeather(),
    fetchStationHistory(),
    fetchNOAAForecast(),
    fetchAstronomy(),
    fetchAqi(),
    fetchRadarTime(),
    fetchOpenMeteoUv(),
    readSettings()
  ])

  const station = stationResult.status === 'fulfilled' ? stationResult.value : null
  const history = historyResult.status === 'fulfilled' ? stationHistory(historyResult.value) : []
  const forecastPeriods = forecastResult.status === 'fulfilled' ? forecastResult.value : []
  const forecast = pairForecast(Array.isArray(forecastPeriods) ? forecastPeriods : [])
  const astronomyBase = astronomy.status === 'fulfilled' ? astronomy.value : { sunrise: null, sunset: null, sunriseIso: null, sunsetIso: null, daylight: null, isDaylight: null }
  const aqiValue = aqi.status === 'fulfilled' ? aqi.value : { value: null, label: null, pm25: null, pm10: null, ozone: null, co: null, no2: null }
  const settingsValue = settings.status === 'fulfilled' ? settings.value : {}

  const daily = station?.daily || {}
  const currentForecast = forecast[0]
  const currentPeriod = Array.isArray(forecastPeriods)
    ? forecastPeriods.find((period: any) => {
      const start = parseDate(period?.startTime)
      const end = parseDate(period?.endTime)
      const now = new Date()
      return start && end && now >= start && now < end
    })
    : null
  const stationUv = number(station?.uv)
  const secondaryUv = uvResult.status === 'fulfilled' ? uvResult.value : null
  const uv = stationUv ?? secondaryUv
  const uvSource = stationUv !== null ? 'Weather Underground PWS' : secondaryUv !== null ? 'Open-Meteo UV forecast' : null
  if (uvSource) console.info(`[live-data] UV source: ${uvSource}`)
  const daylight = astronomyBase.isDaylight ?? null
  const rawCondition = currentPeriod?.shortForecast || currentForecast?.condition || null
  const normalizedCondition = normalizeCondition(rawCondition, daylight)
  const radarTimestamp = radarTime.status === 'fulfilled' ? radarTime.value : null
  const radarZoom = 7
  const radarTile = radarTimestamp === null ? null : tileFor(LON, LAT, radarZoom)
  const radarTileUrl = radarTimestamp === null || !radarTile ? null : `https://tilecache.rainviewer.com/v2/radar/${radarTimestamp}/256/${radarZoom}/${radarTile.x}/${radarTile.y}/2/1_1.png`
  const cameraSnapshotUrl = typeof process.env.CAMERA_SNAPSHOT_URL === 'string' && process.env.CAMERA_SNAPSHOT_URL.trim() ? '/api/camera/snapshot' : null
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
    uv,
    uvSource,
    high: number(daily.tempHigh),
    low: number(daily.tempLow),
    condition: normalizedCondition,
    conditionSource: currentPeriod?.shortForecast ? 'NOAA current forecast period' : currentForecast?.condition ? 'NOAA daily forecast' : null,
    isDaylight: daylight,
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
      rainViewerTime: radarTimestamp,
      tileUrl: radarTileUrl,
      source: radarTileUrl ? 'RainViewer' : null
    },
    camera: {
      configured: Boolean(cameraSnapshotUrl),
      live: false,
      snapshotUrl: cameraSnapshotUrl
    },
    alerts: [{ title: alertTitle, severity: 'advisory' }],
    settings: settingsValue
  }
}
