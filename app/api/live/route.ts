import { NextResponse } from 'next/server'
import { getLiveDashboardPayload } from '@/lib/live-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const LAT = 36.845
const LON = -81.507
const CACHE_MS = 60000

let cachedPayload: any = null
let cachedAt = 0

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function conditionFromCode(code: number | null) {
  if (code === null) return 'Live Weather Backup'
  if (code === 0) return 'Clear'
  if ([1, 2].includes(code)) return 'Partly Cloudy'
  if (code === 3) return 'Cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorms'
  return 'Live Weather Backup'
}

function windDirection(degrees: number | null) {
  if (degrees === null) return null
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(degrees / 22.5) % 16]
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

function calculateMoon(date = new Date()) {
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
    phaseImageUrl: 'https://science.nasa.gov/wp-content/uploads/2023/08/full.jpg',
    phaseRatio,
    waxing: age < synodic / 2,
    shadowWidth: Math.round((1 - illumination / 100) * 120)
  }
}

function buildHistory(times: string[] = [], temps: unknown[] = [], humidity: unknown[] = [], pressure: unknown[] = [], wind: unknown[] = []) {
  return times.slice(-24).map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    timestamp: time,
    temp: number(temps[index]),
    feels: number(temps[index]),
    humidity: number(humidity[index]),
    pressure: number(pressure[index]),
    wind: number(wind[index])
  }))
}

function buildForecast(data: any) {
  const daily = data?.daily || {}
  const dates: string[] = daily.time || []
  const highs: unknown[] = daily.temperature_2m_max || []
  const lows: unknown[] = daily.temperature_2m_min || []
  const precip: unknown[] = daily.precipitation_probability_max || []
  const codes: unknown[] = daily.weather_code || []

  return dates.slice(0, 5).map((date, index) => {
    const label = index === 0 ? 'TODAY' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
    const condition = conditionFromCode(number(codes[index]))
    return {
      day: label,
      high: number(highs[index]),
      low: number(lows[index]),
      condition,
      detailed: condition,
      wind: null,
      precip: number(precip[index]),
      nightName: null,
      nightCondition: null,
      nightDetailed: null,
      nightWind: null,
      nightPrecip: null
    }
  })
}

function payloadHasUsableWeather(payload: any) {
  return Boolean(
    payload?.current?.temperature !== null ||
    payload?.current?.humidity !== null ||
    payload?.forecast?.some((day: any) => day?.high !== null || day?.condition)
  )
}

async function buildBackupPayload(reason = 'Primary station feed unavailable') {
  const params = new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LON),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,daylight_duration,uv_index_max',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'America/New_York',
    forecast_days: '5'
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Backup weather failed: ${response.status}`)
  const data = await response.json()
  const current = data?.current || {}
  const daily = data?.daily || {}
  const code = number(current.weather_code)
  const condition = conditionFromCode(code)
  const nowLabel = current.time ? new Date(current.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const precipToday = [current.precipitation, current.rain, current.showers, current.snowfall].map(number).filter((value): value is number => value !== null).reduce((sum, value) => sum + value, 0)

  const forecast = buildForecast(data)
  const history = buildHistory(data?.hourly?.time || [], data?.hourly?.temperature_2m || [], data?.hourly?.relative_humidity_2m || [], data?.hourly?.surface_pressure || [], data?.hourly?.wind_speed_10m || [])
  const sunriseIso = daily.sunrise?.[0] || null
  const sunsetIso = daily.sunset?.[0] || null
  const daylightSeconds = number(daily.daylight_duration?.[0])

  return {
    station: {
      stationID: 'KVAMARIO42',
      neighborhood: 'Marion',
      epoch: Math.floor(Date.now() / 1000),
      obsTimeLocal: current.time || new Date().toISOString(),
      imperial: {
        temp: number(current.temperature_2m),
        heatIndex: number(current.apparent_temperature),
        windChill: number(current.apparent_temperature),
        pressure: number(current.surface_pressure),
        windSpeed: number(current.wind_speed_10m),
        windGust: number(current.wind_gusts_10m),
        precipTotal: precipToday
      },
      humidity: number(current.relative_humidity_2m),
      winddir: number(current.wind_direction_10m),
      daily: {
        tempHigh: number(daily.temperature_2m_max?.[0]),
        tempLow: number(daily.temperature_2m_min?.[0]),
        precipTotal: precipToday
      }
    },
    stationOnline: true,
    source: `Open-Meteo live backup (${reason})`,
    updatedAt: nowLabel,
    current: {
      stationId: 'KVAMARIO42',
      location: 'Marion, Virginia',
      temperature: number(current.temperature_2m),
      feelsLike: number(current.apparent_temperature),
      humidity: number(current.relative_humidity_2m),
      pressure: number(current.surface_pressure),
      dewpoint: null,
      windSpeed: number(current.wind_speed_10m),
      windGust: number(current.wind_gusts_10m),
      windDirection: windDirection(number(current.wind_direction_10m)),
      uv: number(daily.uv_index_max?.[0]),
      uvSource: 'Open-Meteo live backup',
      high: number(daily.temperature_2m_max?.[0]),
      low: number(daily.temperature_2m_min?.[0]),
      condition,
      conditionSource: 'Open-Meteo live backup',
      isDaylight: current.is_day === 1,
      precipToday
    },
    forecast,
    history,
    astronomy: {
      sunrise: sunriseIso ? new Date(sunriseIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null,
      sunset: sunsetIso ? new Date(sunsetIso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : null,
      daylight: daylightSeconds === null ? null : `${Math.floor(daylightSeconds / 3600)}h ${Math.round((daylightSeconds % 3600) / 60)}m`,
      moonrise: null,
      moonset: null,
      moonVisible: null,
      moon: calculateMoon()
    },
    aqi: { value: null, label: null, pm25: null, pm10: null, ozone: null, co: null, no2: null },
    radar: { rainViewerTime: null, tileUrl: null, source: null },
    camera: { configured: false, live: false, snapshotUrl: null },
    alerts: [{ title: condition, severity: 'advisory' }],
    settings: {}
  }
}

export async function GET() {
  const now = Date.now()

  if (cachedPayload && now - cachedAt < CACHE_MS) {
    return NextResponse.json(cachedPayload, {
      headers: {
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=40'
      }
    })
  }

  try {
    const payload = await getLiveDashboardPayload()
    const finalPayload = payloadHasUsableWeather(payload) ? payload : await buildBackupPayload('primary payload empty')
    cachedPayload = finalPayload
    cachedAt = now

    return NextResponse.json(finalPayload, {
      headers: {
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=40'
      }
    })
  } catch (error) {
    console.error('[api/live] Primary weather payload failed', error)
    const fallbackPayload = await buildBackupPayload('primary payload failed')
    cachedPayload = fallbackPayload
    cachedAt = now

    return NextResponse.json(fallbackPayload, {
      headers: {
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=40'
      }
    })
  }
}
