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

const HARD_FALLBACK: WeatherPayload = {
  source: 'fallback',
  stale: false,
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
    {
      day: 'TODAY',
      high: 65,
      low: 49,
      condition: 'Partly Cloudy',
      rainChance: 10,
    },
    {
      day: 'TOMORROW',
      high: 67,
      low: 51,
      condition: 'Showers',
      rainChance: 40,
    },
    {
      day: 'WEDNESDAY',
      high: 70,
      low: 53,
      condition: 'Sunny',
      rainChance: 5,
    },
  ],
}

function resolveRadarUrl(data: any) {
  return (
    data?.radarUrl ||
    process.env.NEXT_PUBLIC_RADAR_URL ||
    DEFAULT_RADAR_URL
  )
}

function normalizePayload(data: any, source: 'staley' | 'fallback'): WeatherPayload {
  return {
    source,
    stale: false,
    temperature: Number(data?.temperature ?? HARD_FALLBACK.temperature),
    humidity: Number(data?.humidity ?? HARD_FALLBACK.humidity),
    pressure: Number(data?.pressure ?? HARD_FALLBACK.pressure),
    windSpeed: Number(data?.windSpeed ?? HARD_FALLBACK.windSpeed),
    windDirection: data?.windDirection ?? HARD_FALLBACK.windDirection,
    uvIndex: Number(data?.uvIndex ?? HARD_FALLBACK.uvIndex),
    condition: data?.condition ?? HARD_FALLBACK.condition,
    radarUrl: resolveRadarUrl(data),
    radarSource: source === 'staley' ? 'staley-radar' : 'fallback-radar',
    forecast:
      Array.isArray(data?.forecast) && data.forecast.length > 0
        ? data.forecast
        : HARD_FALLBACK.forecast,
  }
}

async function fetchStaleyStation(): Promise<WeatherPayload | null> {
  try {
    const endpoint = process.env.STALEY_STATION_ENDPOINT

    if (!endpoint) {
      return null
    }

    const response = await fetch(endpoint, {
      next: { revalidate: 120 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return normalizePayload(data, 'staley')
  } catch (error) {
    console.error('Staley station fetch failed:', error)
    return null
  }
}

async function fetchFallbackWeather(): Promise<WeatherPayload> {
  try {
    const endpoint = process.env.FALLBACK_WEATHER_ENDPOINT

    if (!endpoint) {
      return HARD_FALLBACK
    }

    const response = await fetch(endpoint, {
      next: { revalidate: 300 },
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return HARD_FALLBACK
    }

    const data = await response.json()

    return normalizePayload(data, 'fallback')
  } catch (error) {
    console.error('Fallback provider failed:', error)
    return HARD_FALLBACK
  }
}

export async function getWeatherData(): Promise<WeatherPayload> {
  const staleyData = await fetchStaleyStation()

  if (staleyData) {
    return staleyData
  }

  return fetchFallbackWeather()
}
