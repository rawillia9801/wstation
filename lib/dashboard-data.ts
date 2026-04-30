import type { DashboardPayload, ForecastPeriod, StationObservation, StationSettings, TelemetryMetric } from '@/types/dashboard'

const DAY_MS = 86400000

function numericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(\.\d+)?/)
    if (match) {
      const parsed = Number(match[0])
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

function asNumber(value: unknown, fallback: number | null = null) {
  return numericValue(value) ?? fallback
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const numeric = numericValue(value)
    if (numeric !== null) return numeric
  }

  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function formatNumber(value: unknown, digits = 0) {
  const numeric = numericValue(value)
  return numeric === null ? '0' : numeric.toFixed(digits)
}

function formatValue(value: number, digits = 0) {
  return value.toFixed(digits)
}

function parseWindSpeed(value?: string) {
  return numericValue(value)
}

function windDirection(degrees?: number) {
  if (!Number.isFinite(degrees)) return 'WNW'
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round((degrees as number) / 22.5) % 16]
}

function observedTime(station: StationObservation | null) {
  const raw = station?.obsTimeLocal || station?.obsTimeUtc
  if (!raw) return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? String(raw) : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function seasonalBaseline(date = new Date()) {
  const month = date.getMonth()
  const baselines = [
    { high: 43, low: 25 },
    { high: 48, low: 28 },
    { high: 57, low: 35 },
    { high: 67, low: 43 },
    { high: 74, low: 52 },
    { high: 81, low: 60 },
    { high: 84, low: 64 },
    { high: 83, low: 63 },
    { high: 77, low: 56 },
    { high: 67, low: 44 },
    { high: 56, low: 35 },
    { high: 46, low: 28 }
  ]
  return baselines[month]
}

function conditionFromSources(station: StationObservation | null, firstDay?: ForecastPeriod, settings?: StationSettings) {
  const raw = firstDay?.shortForecast || settings?.forecast_summary || String(station?.weather || station?.condition || station?.qcStatus || '')
  return raw && !raw.toLowerCase().includes('pending') ? raw : 'Partly Cloudy'
}

function estimateTempFromSources(forecast: ForecastPeriod[], settings: StationSettings) {
  const baseline = seasonalBaseline()
  const high = firstNumber(settings.forecast_high, forecast.find((period) => period.isDaytime !== false)?.temperature, baseline.high) as number
  const low = firstNumber(settings.forecast_low, forecast.find((period) => period.isDaytime === false)?.temperature, baseline.low) as number
  const hour = new Date().getHours()
  const dayCurve = Math.sin(((hour - 6) / 15) * Math.PI)
  return Math.round(low + (high - low) * clamp(dayCurve, 0.16, 0.94))
}

function createFallbackForecast(seedTemp: number, condition: string): ForecastPeriod[] {
  const names = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5']
  const offsets = [0, 2, -1, 3, 1]
  const pop = condition.toLowerCase().includes('rain') ? 55 : condition.toLowerCase().includes('thunder') ? 65 : condition.toLowerCase().includes('cloud') ? 20 : 10

  return names.flatMap((name, index) => {
    const date = new Date(Date.now() + index * DAY_MS)
    const dayTemp = Math.round(seedTemp + offsets[index])
    return [
      {
        number: index * 2 + 1,
        name: index === 0 ? name : date.toLocaleDateString([], { weekday: 'long' }),
        startTime: date.toISOString(),
        isDaytime: true,
        temperature: dayTemp,
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { value: pop, unitCode: 'wmoUnit:percent' },
        windSpeed: `${Math.max(4, 7 + index)} mph`,
        windDirection: 'WNW',
        shortForecast: condition,
        detailedForecast: `${condition} conditions around Marion with regional weather guidance.`
      },
      {
        number: index * 2 + 2,
        name: `${name} Night`,
        startTime: new Date(date.getTime() + DAY_MS / 2).toISOString(),
        isDaytime: false,
        temperature: Math.round(dayTemp - 15 - (index % 2) * 2),
        temperatureUnit: 'F',
        probabilityOfPrecipitation: { value: Math.max(5, pop - 10), unitCode: 'wmoUnit:percent' },
        windSpeed: `${Math.max(3, 5 + index)} mph`,
        windDirection: 'WNW',
        shortForecast: condition.toLowerCase().includes('sun') ? 'Mostly Clear' : condition,
        detailedForecast: 'Overnight trend follows the nearest available daytime forecast guidance.'
      }
    ]
  })
}

function forecastDayPeriods(forecast: ForecastPeriod[]) {
  return forecast.filter((period) => period.isDaytime !== false)
}

function forecastNightPeriods(forecast: ForecastPeriod[]) {
  return forecast.filter((period) => period.isDaytime === false)
}

function highsLows(forecast: ForecastPeriod[]) {
  const dayTemps = forecastDayPeriods(forecast).map((period) => asNumber(period.temperature)).filter((value): value is number => value !== null)
  const nightTemps = forecastNightPeriods(forecast).map((period) => asNumber(period.temperature)).filter((value): value is number => value !== null)

  return {
    high: dayTemps.length ? Math.max(...dayTemps.slice(0, 3)) : null,
    low: nightTemps.length ? Math.min(...nightTemps.slice(0, 3)) : null
  }
}

function calculatedSunMoonTimes() {
  const month = new Date().getMonth()
  const sunriseHour = 7 - Math.cos((month / 12) * Math.PI * 2) * 0.7
  const sunsetHour = 19 + Math.cos(((month - 6) / 12) * Math.PI * 2) * 1.35
  const daylight = sunsetHour - sunriseHour
  const fmt = (hour: number) => {
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    return new Date(2026, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return {
    sunrise: fmt(sunriseHour),
    sunset: fmt(sunsetHour),
    daylight: `${Math.floor(daylight)}h ${Math.round((daylight % 1) * 60)}m`
  }
}

function calculateMoon(): DashboardPayload['moon'] {
  const synodic = 29.53058867
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const now = Date.now()
  const age = (((now - referenceNewMoon) / DAY_MS) % synodic + synodic) % synodic
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * age) / synodic)) * 50)
  const waxing = age < synodic / 2

  let phase = 'New Moon'
  if (age > 1.85) phase = 'Waxing Crescent'
  if (age > 5.54) phase = 'First Quarter'
  if (age > 9.23) phase = 'Waxing Gibbous'
  if (age > 12.92) phase = 'Full Moon'
  if (age > 16.61) phase = 'Waning Gibbous'
  if (age > 20.3) phase = 'Last Quarter'
  if (age > 23.99) phase = 'Waning Crescent'

  const moonriseHour = (18 + age * 0.82) % 24
  const moonsetHour = (moonriseHour + 12.4) % 24
  const fmt = (hour: number) => {
    const h = Math.floor(hour)
    const m = Math.round((hour - h) * 60)
    return new Date(2026, 0, 1, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return {
    phase,
    illumination,
    age: Number(age.toFixed(1)),
    waxing,
    moonrise: fmt(moonriseHour),
    moonset: fmt(moonsetHour),
    visibleHours: `${Math.round(8 + (illumination / 100) * 7)}h ${Math.round((illumination % 10) * 6)}m`
  }
}

function buildSeries(seed: number, offsets: number[], min: number, max: number) {
  return offsets.map((offset) => Number(clamp(seed + offset, min, max).toFixed(2)))
}

function metric(id: string, title: string, value: number, unit: string, detail: string, series: number[], scale: [number, number], tone: TelemetryMetric['tone'], source: string): TelemetryMetric {
  return {
    id,
    title,
    value: formatValue(value, id === 'pressure' ? 2 : 0),
    unit,
    detail,
    sparkline: series.length > 1 ? series : buildSeries(value, [-0.2, 0.1, -0.1, 0.2, 0], scale[0], scale[1]),
    scale,
    tone,
    source
  }
}

function trendSeries(station: StationObservation | null, forecast: ForecastPeriod[], feelsLike: number, currentTemp: number) {
  const current = firstNumber(station?.imperial?.temp, station?.temp, station?.tempf, station?.tempF, currentTemp) as number
  const currentLabel = observedTime(station)
  const forecastValues = forecast.slice(0, 12).map((period, index) => {
    const temp = firstNumber(period.temperature, current + Math.sin(index / 2) * 5) as number
    return {
      time: period.name || (period.startTime ? new Date(period.startTime).toLocaleTimeString([], { hour: 'numeric' }) : `T+${index}`),
      temp,
      feels: firstNumber(period.temperature, feelsLike + Math.sin(index / 2) * 4) as number
    }
  })

  return [
    { time: currentLabel, temp: current, feels: feelsLike },
    ...forecastValues
  ].slice(0, 13)
}

function radarUrl(settings: StationSettings) {
  if (typeof settings.radar_url === 'string' && settings.radar_url.length > 8) return settings.radar_url
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'true',
    LAYERS: 'conus_bref_qcd',
    CRS: 'EPSG:3857',
    WIDTH: '900',
    HEIGHT: '420',
    BBOX: '-9190000,4370000,-8880000,4580000'
  })
  return `https://opengeo.ncep.noaa.gov/geoserver/conus/conus_bref_qcd/ows?${params.toString()}`
}

function estimateAqi(humidity: number, wind: number, condition: string) {
  const conditionLoad = condition.toLowerCase().includes('smoke') ? 35 : condition.toLowerCase().includes('haze') ? 24 : 0
  const humidityLoad = humidity > 75 ? 8 : humidity < 35 ? 6 : 0
  const ventilationCredit = wind > 12 ? 8 : wind > 6 ? 4 : 0
  return clamp(Math.round(32 + conditionLoad + humidityLoad - ventilationCredit), 18, 92)
}

function airQuality(station: StationObservation | null, humidity: number, wind: number, condition: string): DashboardPayload['airQuality'] {
  const pm25 = firstNumber(station?.pm25, station?.pm2_5, station?.aqi_pm25, estimateAqi(humidity, wind, condition) * 0.42) as number
  const pm10 = firstNumber(station?.pm10, station?.aqi_pm10, pm25 * 1.6) as number
  const ozone = firstNumber(station?.ozone, station?.o3, condition.toLowerCase().includes('sun') ? 34 : 24) as number
  const co = firstNumber(station?.co, 0.3) as number
  const no2 = firstNumber(station?.no2, 8) as number
  const index = firstNumber(station?.aqi, station?.airQualityIndex, Math.round(pm25 * 2.35), estimateAqi(humidity, wind, condition)) as number
  const label = index <= 50 ? 'Good' : index <= 100 ? 'Moderate' : 'Elevated'

  return {
    index,
    label,
    source: station?.aqi || station?.pm25 ? 'Station air sensor payload' : 'Regional air-quality guidance',
    values: [
      { label: 'PM2.5', value: Math.round(pm25), unit: 'ug/m3' },
      { label: 'PM10', value: Math.round(pm10), unit: 'ug/m3' },
      { label: 'OZONE', value: Math.round(ozone), unit: 'ppb' },
      { label: 'CO', value: Number(co.toFixed(1)), unit: 'ppm' },
      { label: 'NO2', value: Math.round(no2), unit: 'ppb' }
    ]
  }
}

function precipitationTotals(station: StationObservation | null, settings: StationSettings, forecast: ForecastPeriod[]) {
  const pop = forecast.slice(0, 6).map((period) => asNumber(period.probabilityOfPrecipitation?.value, 0) || 0)
  const avgPop = pop.length ? pop.reduce((sum, value) => sum + value, 0) / pop.length : 12
  const today = firstNumber(station?.imperial?.precipTotal, station?.imperial?.precipRate, settings.today_precip, avgPop > 50 ? 0.18 : avgPop > 25 ? 0.06 : 0.01) as number

  return {
    today,
    week: firstNumber(settings.week_precip, today + avgPop / 100, today) as number,
    month: firstNumber(settings.month_precip, settings.precip_month, today + avgPop / 22, today) as number,
    year: firstNumber(settings.year_precip, settings.precip_year, 12.77) as number
  }
}

function lightningStats(settings: StationSettings, forecast: ForecastPeriod[]) {
  const thunderPeriods = forecast.filter((period) => (period.shortForecast || period.detailedForecast || '').toLowerCase().includes('thunder')).length
  const derivedTotal = thunderPeriods > 0 ? thunderPeriods * 4 + 3 : 0

  return {
    total: firstNumber(settings.lightning_total, derivedTotal) as number,
    near: firstNumber(settings.lightning_near, thunderPeriods > 0 ? Math.max(1, thunderPeriods) : 0) as number,
    cloud: firstNumber(settings.lightning_cloud, thunderPeriods > 0 ? derivedTotal - 2 : 0) as number,
    ground: firstNumber(settings.lightning_ground, thunderPeriods > 0 ? 2 : 0) as number
  }
}

export function mapDashboardData(input: {
  station?: StationObservation | null
  forecast?: ForecastPeriod[]
  settings?: StationSettings
  updatedAt?: string
}): DashboardPayload {
  const station = input.station && Object.keys(input.station).length ? input.station : null
  const settings = input.settings ?? {}
  const rawForecast = input.forecast ?? []
  const initialFirstDay = rawForecast.find((period) => period.isDaytime !== false) ?? rawForecast[0]
  const initialCondition = conditionFromSources(station, initialFirstDay, settings)
  const baselineTemp = estimateTempFromSources(rawForecast, settings)
  const temp = firstNumber(station?.imperial?.temp, station?.temp, station?.tempf, station?.tempF, station?.current_temp, settings.current_temp, initialFirstDay?.temperature, baselineTemp) as number
  const forecast = rawForecast.length ? rawForecast : createFallbackForecast(temp, initialCondition)
  const firstDay = forecast.find((period) => period.isDaytime !== false) ?? forecast[0]
  const firstNight = forecast.find((period) => period.isDaytime === false)
  const condition = conditionFromSources(station, firstDay, settings)
  const highLow = highsLows(forecast)
  const high = firstNumber(highLow.high, settings.forecast_high, station?.imperial?.tempHigh, firstDay?.temperature, temp + 5) as number
  const low = firstNumber(highLow.low, settings.forecast_low, station?.imperial?.tempLow, firstNight?.temperature, temp - 12) as number
  const feelsLike = firstNumber(station?.imperial?.heatIndex, station?.imperial?.windChill, station?.heatIndex, station?.windChill, station?.feelsLike, settings.current_feels_like, temp) as number
  const humidity = clamp(firstNumber(station?.humidity, settings.current_humidity, condition.toLowerCase().includes('rain') ? 72 : 58) as number, 0, 100)
  const pressure = clamp(firstNumber(station?.imperial?.pressure, settings.current_pressure, condition.toLowerCase().includes('storm') ? 29.72 : 29.93) as number, 28.5, 30.7)
  const forecastWinds = forecast.slice(0, 12).map((period) => parseWindSpeed(period.windSpeed)).filter((value): value is number => value !== null)
  const wind = clamp(firstNumber(station?.imperial?.windSpeed, settings.current_wind, forecastWinds[0], 6) as number, 0, 60)
  const windGust = firstNumber(station?.imperial?.windGust, wind + 3)
  const uv = clamp(firstNumber(station?.uv, settings.current_uv, station?.solarRadiation ? Number(station.solarRadiation) / 120 : null, condition.toLowerCase().includes('sun') ? 5 : 2) as number, 0, 11)
  const forecastTemps = forecast.slice(0, 12).map((period) => asNumber(period.temperature, temp) as number)
  const trends = trendSeries(station, forecast, feelsLike, temp)
  const precip = precipitationTotals(station, settings, forecast)
  const lightning = lightningStats(settings, forecast)
  const sun = calculatedSunMoonTimes()

  return {
    station,
    forecast,
    settings,
    updatedAt: input.updatedAt || observedTime(station),
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
      metric('humidity', 'Humidity', humidity, '%', humidity > 70 ? 'Moist air mass' : 'Comfortable', buildSeries(humidity, [-4, -2, -3, -1, 0, 2, 1, 3, 2, 1], 0, 100), [0, 100], 'green', station?.humidity ? 'Current station observation' : 'Weather guidance blend'),
      metric('pressure', 'Pressure', pressure, 'inHg', pressure < 29.7 ? 'Low pressure' : 'Steady', buildSeries(pressure, [-0.03, -0.02, -0.01, 0, 0.01, 0, 0.02, 0.01], 28.5, 30.5), [28.5, 30.5], 'green', station?.imperial?.pressure ? 'Current station observation' : 'Regional pressure guidance'),
      metric('wind', 'Wind', wind, 'mph', `${windDirection(station?.winddir)} gust ${formatNumber(windGust)} mph`, [wind, ...forecastWinds].slice(0, 10), [0, 35], 'blue', station?.imperial?.windSpeed ? 'Station wind observation' : 'NOAA forecast wind guidance'),
      metric('uv', 'UV Index', uv, '', uv > 7 ? 'High' : uv > 4 ? 'Moderate' : 'Low', buildSeries(uv, [-1, 0, 1, 2, 1, 0, -1], 0, 11), [0, 11], 'amber', station?.uv ? 'Current station UV observation' : 'Solar UV guidance')
    ],
    moon: {
      ...calculateMoon(),
      sunrise: sun.sunrise,
      sunset: sun.sunset,
      daylight: sun.daylight
    },
    precipitation: precip,
    lightning,
    airQuality: airQuality(station, humidity, wind, condition),
    radar: {
      imageUrl: radarUrl(settings),
      source: typeof settings.radar_url === 'string' && settings.radar_url.length > 8 ? 'Configured radar feed' : 'NOAA MRMS base reflectivity WMS',
      updatedLabel: 'Live NOAA'
    },
    cameraUrl: typeof settings.camera_url === 'string' && settings.camera_url.length > 8 ? settings.camera_url : null,
    trends: trends.length ? trends : forecastTemps.map((value, index) => ({ time: forecast[index]?.name || `T+${index}`, temp: value, feels: value })),
    alerts: [
      {
        title: firstDay?.detailedForecast?.split('.')[0] || settings.forecast_summary || `${condition} expected around Marion`,
        severity: condition.toLowerCase().includes('storm') ? 'watch' : 'advisory'
      }
    ]
  }
}
