import type { DashboardPayload, ForecastPeriod, StationObservation, StationSettings, TelemetryMetric } from '@/types/dashboard'

function asNumber(value: unknown, fallback: number | null = null) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) return numeric
  }

  return null
}

function formatNumber(value: unknown, digits = 0) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '--'
  return numeric.toFixed(digits)
}

function formatValue(value: number | null, digits = 0) {
  return value === null ? '--' : value.toFixed(digits)
}

function parseWindSpeed(value?: string) {
  const match = value?.match(/\d+(\.\d+)?/)
  return match ? Number(match[0]) : null
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

function actualSeries(values: Array<number | null | undefined>, fallback: number | null) {
  const series = values.filter((value): value is number => Number.isFinite(Number(value)))
  if (series.length) return series
  return fallback === null ? [] : [fallback]
}

function metric(id: string, title: string, value: number | null, unit: string, detail: string, series: number[], scale: [number, number], tone: TelemetryMetric['tone'], source: string): TelemetryMetric {
  return {
    id,
    title,
    value: formatValue(value, id === 'pressure' ? 2 : 0),
    unit,
    detail,
    sparkline: series,
    scale,
    tone,
    source
  }
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

function calculateMoon(): DashboardPayload['moon'] {
  const synodic = 29.53058867
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  const now = Date.now()
  const age = (((now - referenceNewMoon) / 86400000) % synodic + synodic) % synodic
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

  return {
    phase,
    illumination,
    age: Number(age.toFixed(1)),
    waxing,
    moonrise: 'Calculated',
    moonset: 'Calculated',
    visibleHours: `${Math.round((illumination / 100) * 14)}h est`
  }
}

function trendSeries(station: StationObservation | null, forecast: ForecastPeriod[], feelsLike: number | null) {
  const current = firstNumber(station?.imperial?.temp, station?.temp, station?.tempf, station?.tempF)
  const currentLabel = observedTime(station)
  const forecastValues = forecast.slice(0, 12).map((period) => ({
    time: period.name || (period.startTime ? new Date(period.startTime).toLocaleTimeString([], { hour: 'numeric' }) : 'Forecast'),
    temp: asNumber(period.temperature),
    feels: asNumber(period.temperature)
  }))

  return [
    ...(current === null ? [] : [{ time: currentLabel, temp: current, feels: feelsLike ?? current }]),
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

function airQuality(station: StationObservation | null): DashboardPayload['airQuality'] {
  const pm25 = asNumber(station?.pm25 ?? station?.pm2_5 ?? station?.aqi_pm25)
  const pm10 = asNumber(station?.pm10 ?? station?.aqi_pm10)
  const ozone = asNumber(station?.ozone ?? station?.o3)
  const co = asNumber(station?.co)
  const no2 = asNumber(station?.no2)
  const values = [
    { label: 'PM2.5', value: pm25, unit: 'ug/m3' },
    { label: 'PM10', value: pm10, unit: 'ug/m3' },
    { label: 'OZONE', value: ozone, unit: 'ppb' },
    { label: 'CO', value: co, unit: 'ppm' },
    { label: 'NO2', value: no2, unit: 'ppb' }
  ]
  const observed = values.map((item) => item.value).filter((value): value is number => value !== null)
  const index = firstNumber(station?.aqi, station?.airQualityIndex, pm25)

  return {
    index,
    label: index === null ? 'No AQ feed' : index <= 50 ? 'Good' : index <= 100 ? 'Moderate' : 'Elevated',
    source: observed.length ? 'Station air sensor payload' : 'No station air-quality sensor in payload',
    values
  }
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
  const condition = firstDay?.shortForecast || String(station?.qcStatus || 'Weather data pending')
  const temp = firstNumber(station?.imperial?.temp, station?.temp, station?.tempf, station?.tempF, station?.current_temp, settings.current_temp)
  const feelsLike = firstNumber(station?.imperial?.heatIndex, station?.imperial?.windChill, station?.heatIndex, station?.windChill, station?.feelsLike, settings.current_feels_like, temp)
  const humidity = firstNumber(station?.humidity, settings.current_humidity)
  const pressure = firstNumber(station?.imperial?.pressure, settings.current_pressure)
  const wind = firstNumber(station?.imperial?.windSpeed, settings.current_wind)
  const windGust = firstNumber(station?.imperial?.windGust)
  const uv = firstNumber(station?.uv, settings.current_uv)
  const highLow = highsLows(forecast)
  const high = firstNumber(highLow.high, settings.forecast_high, station?.imperial?.tempHigh, firstDay?.temperature)
  const low = firstNumber(highLow.low, settings.forecast_low, station?.imperial?.tempLow, firstNight?.temperature)
  const forecastTemps = forecast.slice(0, 12).map((period) => asNumber(period.temperature))
  const forecastWinds = forecast.slice(0, 12).map((period) => parseWindSpeed(period.windSpeed))
  const trends = trendSeries(station, forecast, feelsLike)

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
      metric('humidity', 'Humidity', humidity, '%', humidity === null ? 'No humidity sample' : humidity > 70 ? 'Moist air mass' : 'Live station sample', actualSeries([humidity], humidity), [0, 100], 'green', 'Current station observation'),
      metric('pressure', 'Pressure', pressure, 'inHg', pressure === null ? 'No pressure sample' : pressure < 29.7 ? 'Low pressure' : 'Live station sample', actualSeries([pressure], pressure), [28.5, 30.5], 'green', 'Current station observation'),
      metric('wind', 'Wind', wind, 'mph', wind === null ? 'No wind sample' : `${windDirection(station?.winddir)}${windGust === null ? '' : ` gust ${formatNumber(windGust)} mph`}`, actualSeries([wind, ...forecastWinds], wind), [0, 35], 'blue', 'Station wind plus NOAA forecast wind'),
      metric('uv', 'UV Index', uv, '', uv === null ? 'No UV sample' : uv > 7 ? 'High' : uv > 4 ? 'Moderate' : 'Live station sample', actualSeries([uv], uv), [0, 11], 'amber', 'Current station observation')
    ],
    moon: calculateMoon(),
    precipitation: {
      today: asNumber(station?.imperial?.precipTotal),
      week: asNumber(settings.week_precip),
      month: asNumber(settings.month_precip),
      year: asNumber(settings.year_precip)
    },
    lightning: {
      total: asNumber(settings.lightning_total),
      near: asNumber(settings.lightning_near),
      cloud: asNumber(settings.lightning_cloud),
      ground: asNumber(settings.lightning_ground)
    },
    airQuality: airQuality(station),
    radar: {
      imageUrl: radarUrl(settings),
      source: 'NOAA MRMS base reflectivity WMS',
      updatedLabel: 'Live NOAA'
    },
    cameraUrl: typeof settings.camera_url === 'string' && settings.camera_url.length > 8 ? settings.camera_url : null,
    trends: trends.length ? trends : forecastTemps.map((value, index) => ({ time: forecast[index]?.name || 'Forecast', temp: value, feels: value })),
    alerts: [
      {
        title: firstDay?.detailedForecast?.split('.')[0] || settings.forecast_summary || 'Forecast feed pending',
        severity: 'advisory'
      }
    ]
  }
}
