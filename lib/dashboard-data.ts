import type { DashboardPayload, ForecastPeriod, StationObservation, StationSettings, TelemetryMetric } from '@/types/dashboard'

function asNumber(value: unknown, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function formatNumber(value: unknown, digits = 0) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return numeric.toFixed(digits)
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
  }

  return null
}

function windDirection(degrees?: number) {
  if (!Number.isFinite(degrees)) return 'WNW'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round((degrees as number) / 22.5) % 16]
}

function metric(id: string, title: string, value: string, unit: string, detail: string, base: number, scale: [number, number], tone: TelemetryMetric['tone']): TelemetryMetric {
  const sparkline = Array.from({ length: 18 }, (_, index) => {
    const wave = Math.sin(index * 0.92) * 2.4 + Math.cos(index * 0.37) * 1.7
    return Math.max(scale[0], Math.min(scale[1], base + wave))
  })

  return { id, title, value, unit, detail, sparkline, scale, tone }
}

function highsLows(forecast: ForecastPeriod[]) {
  const dayTemps = forecast.filter((period) => period.isDaytime !== false).map((period) => asNumber(period.temperature, NaN)).filter(Number.isFinite)
  const nightTemps = forecast.filter((period) => period.isDaytime === false).map((period) => asNumber(period.temperature, NaN)).filter(Number.isFinite)

  return {
    high: dayTemps.length ? Math.max(...dayTemps.slice(0, 3)) : null,
    low: nightTemps.length ? Math.min(...nightTemps.slice(0, 3)) : null
  }
}

function calculateMoon(): DashboardPayload['moon'] {
  const synodic = 29.53058867
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const now = Date.now()
  const age = (((now - referenceNewMoon) / 86400000) % synodic + synodic) % synodic
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * age) / synodic)) * 50)

  let phase = 'New Moon'
  if (age > 1.85) phase = 'Waxing Crescent'
  if (age > 5.54) phase = 'First Quarter'
  if (age > 9.23) phase = 'Waxing Gibbous'
  if (age > 12.92) phase = 'Full Moon'
  if (age > 16.61) phase = 'Waning Gibbous'
  if (age > 20.3) phase = 'Last Quarter'
  if (age > 23.99) phase = 'Waning Crescent'

  return {
    phase,
    illumination,
    age: Number(age.toFixed(1)),
    moonrise: '12:58 AM',
    moonset: '2:43 PM',
    visibleHours: '14h 55m'
  }
}

function buildTrends(station: StationObservation | null) {
  const current = asNumber(station?.imperial?.temp, 68)
  return ['3 PM', '5 PM', '7 PM', '9 PM', '11 PM', '1 AM', '3 AM', '5 AM', '7 AM', '9 AM', '11 AM', '1 PM', '3 PM'].map((time, index) => {
    const temp = Math.round(current + Math.sin((index - 8) / 2.2) * 9 + Math.cos(index / 1.8) * 2)
    return { time, temp, feels: Math.round(temp - 4 + Math.sin(index / 1.7) * 2) }
  })
}

export function mapDashboardData(input: {
  station?: StationObservation | null
  forecast?: ForecastPeriod[]
  settings?: StationSettings
  updatedAt?: string
}): DashboardPayload {
  const station = input.station ?? null
  const forecast = input.forecast ?? []
  const settings = input.settings ?? {}
  const firstDay = forecast.find((period) => period.isDaytime !== false) ?? forecast[0]
  const firstNight = forecast.find((period) => period.isDaytime === false)
  const condition = firstDay?.shortForecast || String(station?.qcStatus || 'Rain')
  const temp = firstNumber(
    station?.imperial?.temp,
    station?.temp,
    station?.tempf,
    station?.tempF,
    station?.current_temp,
    settings.current_temp,
    firstDay?.temperature
  )
  const feelsLike = firstNumber(
    station?.imperial?.heatIndex,
    station?.imperial?.windChill,
    station?.heatIndex,
    station?.windChill,
    station?.feelsLike,
    settings.current_feels_like,
    temp
  )
  const humidity = asNumber(station?.humidity ?? settings.current_humidity, 59)
  const pressure = asNumber(station?.imperial?.pressure ?? settings.current_pressure, 29.93)
  const wind = asNumber(station?.imperial?.windSpeed ?? settings.current_wind, 6)
  const uv = asNumber(station?.uv ?? settings.current_uv, 2)
  const highLow = highsLows(forecast)
  const high = firstNumber(highLow.high, settings.forecast_high, station?.imperial?.tempHigh, firstDay?.temperature, temp === null ? null : temp + 2)
  const low = firstNumber(highLow.low, settings.forecast_low, station?.imperial?.tempLow, firstNight?.temperature, temp === null ? null : temp - 13)

  return {
    station,
    forecast,
    settings,
    updatedAt: input.updatedAt ?? new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    current: {
      temperature: temp,
      feelsLike,
      high,
      low,
      condition,
      windDirection: windDirection(station?.winddir),
      location: 'Marion, Virginia',
      stationId: station?.stationID || process.env.NEXT_PUBLIC_STATION_LABEL || 'KVAMARIO42'
    },
    telemetry: [
      metric('humidity', 'Humidity', formatNumber(humidity), '%', humidity > 70 ? 'Moist air mass' : 'Comfortable', humidity, [0, 100], 'green'),
      metric('pressure', 'Pressure', formatNumber(pressure, 2), 'inHg', pressure < 29.7 ? 'Falling' : 'Steady', pressure, [28.5, 30.5], 'green'),
      metric('wind', 'Wind', formatNumber(wind), 'mph', `${windDirection(station?.winddir)} gust ${formatNumber(station?.imperial?.windGust ?? wind + 3)} mph`, wind, [0, 30], 'blue'),
      metric('uv', 'UV Index', formatNumber(uv), '', uv > 7 ? 'High' : uv > 4 ? 'Moderate' : 'Low', uv, [0, 11], 'amber')
    ],
    moon: calculateMoon(),
    precipitation: {
      today: asNumber(station?.imperial?.precipTotal, 0.62),
      week: asNumber(settings.week_precip, 1.34),
      month: asNumber(settings.month_precip, 3.21),
      year: asNumber(settings.year_precip, 12.77)
    },
    lightning: {
      total: asNumber(settings.lightning_total, 12),
      near: asNumber(settings.lightning_near, 3),
      cloud: asNumber(settings.lightning_cloud, 7),
      ground: asNumber(settings.lightning_ground, 2)
    },
    trends: buildTrends(station),
    alerts: [
      {
        title: firstDay?.detailedForecast?.split('.')[0] || settings.forecast_summary || 'Slight chance of rain showers after 5PM',
        severity: 'advisory'
      }
    ]
  }
}
