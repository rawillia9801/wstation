export type WeatherPayload = {
  source: 'staley' | 'fallback'
  stale: boolean
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: string
  uvIndex: number
  condition: string
  radarUrl?: string
  radarSource?: string
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    rainChance: number
  }>
}

const DEFAULT_RADAR_URL =
  'https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif'

const DEFAULT_LAT = 36.8348
const DEFAULT_LON = -81.5148

const HARD_FALLBACK: WeatherPayload = {
  source: 'fallback',
  stale: true,
  temperature: 63,
  humidity: 58,
  pressure: 30.01,
  windSpeed: 4,
  windDirection: 'NW',
  uvIndex: 1,
  condition: 'Partly Cloudy',
  radarUrl: DEFAULT_RADAR_URL,
  radarSource: 'weather.gov',
  forecast: [
    { day: 'TODAY', high: 65, low: 49, condition: 'Partly Cloudy', rainChance: 10 },
    { day: 'TOMORROW', high: 67, low: 51, condition: 'Showers', rainChance: 40 },
    { day: 'WEDNESDAY', high: 70, low: 53, condition: 'Sunny', rainChance: 5 },
  ],
}

function finiteNumber(value: unknown) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function hasRealStationData(data: any) {
  return (
    finiteNumber(data?.temperature) !== null ||
    finiteNumber(data?.tempf) !== null ||
    finiteNumber(data?.humidity) !== null ||
    finiteNumber(data?.humidityin) !== null
  )
}

function resolveRadarUrl(data?: any) {
  return data?.radarUrl || process.env.NEXT_PUBLIC_RADAR_URL || DEFAULT_RADAR_URL
}

function directionFromDegrees(degrees: number | null) {
  if (degrees === null) return HARD_FALLBACK.windDirection
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(degrees / 22.5) % 16]
}

function conditionFromCode(code: number | null) {
  if (code === null) return HARD_FALLBACK.condition
  if (code === 0) return 'Clear'
  if ([1, 2].includes(code)) return 'Partly Cloudy'
  if (code === 3) return 'Cloudy'
  if ([45, 48].includes(code)) return 'Fog'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow'
  if ([95, 96, 99].includes(code)) return 'Thunderstorms'
  return HARD_FALLBACK.condition
}

function normalizePayload(data: any, source: 'staley' | 'fallback'): WeatherPayload {
  const temperature = finiteNumber(data?.temperature ?? data?.tempf ?? data?.temp)
  const humidity = finiteNumber(data?.humidity ?? data?.humidityin)
  const pressure = finiteNumber(data?.pressure ?? data?.baromrelin ?? data?.baromabsin)
  const windSpeed = finiteNumber(data?.windSpeed ?? data?.windspeedmph)
  const uvIndex = finiteNumber(data?.uvIndex ?? data?.uv)

  return {
    source,
    stale: Boolean(data?.stale),
    temperature: temperature ?? HARD_FALLBACK.temperature,
    humidity: humidity ?? HARD_FALLBACK.humidity,
    pressure: pressure ?? HARD_FALLBACK.pressure,
    windSpeed: windSpeed ?? HARD_FALLBACK.windSpeed,
    windDirection: data?.windDirection ?? data?.winddir ?? HARD_FALLBACK.windDirection,
    uvIndex: uvIndex ?? HARD_FALLBACK.uvIndex,
    condition: data?.condition ?? HARD_FALLBACK.condition,
    radarUrl: resolveRadarUrl(data),
    radarSource: source === 'staley' ? 'staley-radar' : 'fallback-radar',
    forecast: Array.isArray(data?.forecast) && data.forecast.length > 0 ? data.forecast : HARD_FALLBACK.forecast,
  }
}

async function fetchStaleyStation(): Promise<WeatherPayload | null> {
  try {
    const endpoint = process.env.STALEY_STATION_ENDPOINT
    if (!endpoint) return null

    const response = await fetch(endpoint, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    if (!hasRealStationData(data)) return null

    return normalizePayload(data, 'staley')
  } catch (error) {
    console.error('Staley station fetch failed:', error)
    return null
  }
}

async function fetchOpenMeteoFallback(): Promise<WeatherPayload> {
  const latitude = Number(process.env.FALLBACK_WEATHER_LAT ?? DEFAULT_LAT)
  const longitude = Number(process.env.FALLBACK_WEATHER_LON ?? DEFAULT_LON)
  const url = new URL('https://api.open-meteo.com/v1/forecast')

  url.searchParams.set('latitude', String(Number.isFinite(latitude) ? latitude : DEFAULT_LAT))
  url.searchParams.set('longitude', String(Number.isFinite(longitude) ? longitude : DEFAULT_LON))
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('precipitation_unit', 'inch')
  url.searchParams.set('timezone', process.env.WEATHER_TIMEZONE || 'America/New_York')
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl')
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max')
  url.searchParams.set('forecast_days', '5')

  const response = await fetch(url, {
    next: { revalidate: 300 },
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) return HARD_FALLBACK

  const data = await response.json()
  const current = data?.current ?? {}
  const daily = data?.daily ?? {}
  const currentCode = finiteNumber(current.weather_code)
  const forecast = Array.isArray(daily.time)
    ? daily.time.map((date: string, index: number) => ({
        day: index === 0 ? 'TODAY' : new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
        high: Math.round(finiteNumber(daily.temperature_2m_max?.[index]) ?? HARD_FALLBACK.forecast[0].high),
        low: Math.round(finiteNumber(daily.temperature_2m_min?.[index]) ?? HARD_FALLBACK.forecast[0].low),
        condition: conditionFromCode(finiteNumber(daily.weather_code?.[index])),
        rainChance: Math.round(finiteNumber(daily.precipitation_probability_max?.[index]) ?? 0),
      }))
    : HARD_FALLBACK.forecast

  return {
    source: 'fallback',
    stale: false,
    temperature: Math.round((finiteNumber(current.temperature_2m) ?? HARD_FALLBACK.temperature) * 10) / 10,
    humidity: Math.round(finiteNumber(current.relative_humidity_2m) ?? HARD_FALLBACK.humidity),
    pressure: Math.round(((finiteNumber(current.pressure_msl) ?? 1016) * 0.0295299830714) * 100) / 100,
    windSpeed: Math.round(finiteNumber(current.wind_speed_10m) ?? HARD_FALLBACK.windSpeed),
    windDirection: directionFromDegrees(finiteNumber(current.wind_direction_10m)),
    uvIndex: Math.round(finiteNumber(daily.uv_index_max?.[0]) ?? HARD_FALLBACK.uvIndex),
    condition: conditionFromCode(currentCode),
    radarUrl: resolveRadarUrl(),
    radarSource: 'weather.gov',
    forecast,
  }
}

async function fetchFallbackWeather(): Promise<WeatherPayload> {
  try {
    const endpoint = process.env.FALLBACK_WEATHER_ENDPOINT

    if (endpoint) {
      const response = await fetch(endpoint, {
        next: { revalidate: 300 },
        headers: { Accept: 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        return normalizePayload(data, 'fallback')
      }
    }

    return fetchOpenMeteoFallback()
  } catch (error) {
    console.error('Fallback provider failed:', error)
    return HARD_FALLBACK
  }
}

export async function getWeatherData(): Promise<WeatherPayload> {
  const staleyData = await fetchStaleyStation()
  return staleyData ?? fetchFallbackWeather()
}
