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
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
    rainChance: number
  }>
  radarUrl?: string
}

const FALLBACK_RADAR_URL =
  'https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif'

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

    return {
      source: 'staley',
      stale: false,
      temperature: Number(data.temperature ?? 0),
      humidity: Number(data.humidity ?? 0),
      pressure: Number(data.pressure ?? 0),
      windSpeed: Number(data.windSpeed ?? 0),
      windDirection: data.windDirection ?? 'NW',
      uvIndex: Number(data.uvIndex ?? 0),
      condition: data.condition ?? 'Unknown',
      forecast: data.forecast ?? [],
      radarUrl: data.radarUrl ?? FALLBACK_RADAR_URL,
    }
  } catch (error) {
    console.error('Staley station fetch failed:', error)
    return null
  }
}

async function fetchFallbackWeather(): Promise<WeatherPayload> {
  const endpoint = process.env.FALLBACK_WEATHER_ENDPOINT

  if (!endpoint) {
    return {
      source: 'fallback',
      stale: false,
      temperature: 71,
      humidity: 59,
      pressure: 29.93,
      windSpeed: 6,
      windDirection: 'WNW',
      uvIndex: 2,
      condition: 'Partly Cloudy',
      radarUrl: FALLBACK_RADAR_URL,
      forecast: [
        {
          day: 'TODAY',
          high: 72,
          low: 58,
          condition: 'Showers',
          rainChance: 40,
        },
      ],
    }
  }

  const response = await fetch(endpoint, {
    next: { revalidate: 300 },
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await response.json()

  return {
    source: 'fallback',
    stale: false,
    temperature: Number(data.temperature ?? 0),
    humidity: Number(data.humidity ?? 0),
    pressure: Number(data.pressure ?? 0),
    windSpeed: Number(data.windSpeed ?? 0),
    windDirection: data.windDirection ?? 'NW',
    uvIndex: Number(data.uvIndex ?? 0),
    condition: data.condition ?? 'Unknown',
    forecast: data.forecast ?? [],
    radarUrl: data.radarUrl ?? FALLBACK_RADAR_URL,
  }
}

export async function getWeatherData(): Promise<WeatherPayload> {
  const staleyData = await fetchStaleyStation()

  if (staleyData) {
    return staleyData
  }

  return fetchFallbackWeather()
}
