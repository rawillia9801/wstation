type ForecastPeriod = {
  name?: string
  temperature?: number
  shortForecast?: string
  probabilityOfPrecipitation?: { value?: number | null }
}

const fallbackForecast = [
  { day: 'TODAY', high: 72, low: 58, condition: 'Showers', precip: 40 },
  { day: 'TOMORROW', high: 69, low: 53, condition: "T'storms", precip: 60 },
  { day: 'WEDNESDAY', high: 69, low: 49, condition: 'Partly Cloudy', precip: 20 },
  { day: 'THURSDAY', high: 60, low: 41, condition: 'Sunny', precip: 10 },
  { day: 'FRIDAY', high: 63, low: 45, condition: 'Mostly Sunny', precip: 10 }
]

const stationAliases: Record<string, string[]> = {
  temp: ['temp', 'tempf', 'tempF', 'temperature', 'temperatureF', 'outdoorTemp', 'outdoorTempF'],
  feelsLike: ['feelsLike', 'feels_like', 'heatIndex', 'heatIndexF', 'windChill', 'windChillF'],
  humidity: ['humidity', 'humidityin', 'humidityIn', 'outdoorHumidity'],
  pressure: ['pressure', 'baromrelin', 'baromRelin', 'baromabsin', 'baromAbsin', 'pressurein', 'pressureIn'],
  windSpeed: ['windSpeed', 'windSpeedMph', 'windspeedmph', 'wind_mph', 'windSpeedAvgMph'],
  windGust: ['windGust', 'windGustMph', 'windgustmph', 'wind_gust_mph'],
  uv: ['uv', 'uvIndex', 'uvi']
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === 'string' ? Number(value) : value
    if (typeof parsed === 'number' && Number.isFinite(parsed)) return parsed
  }
  return undefined
}

export function stationNumber(station: any, key: string, fallback: number) {
  const keys = stationAliases[key] ?? [key]
  const imperial = station?.imperial ?? {}
  const last = station?.lastData ?? station?.lastValidSample ?? station?.last ?? {}
  const ambient = station?.ambient ?? station?.ambientWeather ?? {}
  const current = station?.current ?? station?.weatherCurrent ?? {}
  const sources = [station, imperial, last, last?.imperial, ambient, ambient?.imperial, current, current?.imperial]

  for (const source of sources) {
    for (const alias of keys) {
      const value = pickNumber(source?.[alias])
      if (value !== undefined) return value
    }
  }

  return fallback
}

export function normalizeWeather(station: any, periods: ForecastPeriod[]) {
  const temp = stationNumber(station, 'temp', 71.4)
  const feelsLike = stationNumber(station, 'feelsLike', Math.round(temp))
  const humidity = stationNumber(station, 'humidity', 59)
  const pressure = stationNumber(station, 'pressure', 29.93)
  const wind = stationNumber(station, 'windSpeed', 6)
  const windGust = stationNumber(station, 'windGust', 9)
  const uv = stationNumber(station, 'uv', 2)
  const high = Math.max(72, Math.round(temp))
  const low = 58

  return {
    temp,
    feelsLike,
    humidity,
    pressure,
    wind,
    windGust,
    uv,
    high,
    low,
    forecast: normalizeForecast(periods)
  }
}

export function normalizeForecast(periods: ForecastPeriod[]) {
  if (!Array.isArray(periods) || periods.length === 0) return fallbackForecast

  const days: typeof fallbackForecast = []
  for (let index = 0; index < periods.length && days.length < 5; index += 2) {
    const day = periods[index]
    const night = periods[index + 1]
    const fallback = fallbackForecast[days.length]
    days.push({
      day: days.length === 0 ? 'TODAY' : (day?.name ?? fallback.day).toUpperCase(),
      high: pickNumber(day?.temperature, fallback.high) ?? fallback.high,
      low: pickNumber(night?.temperature, fallback.low) ?? fallback.low,
      condition: day?.shortForecast ?? fallback.condition,
      precip: pickNumber(day?.probabilityOfPrecipitation?.value, fallback.precip) ?? fallback.precip
    })
  }

  return days.length === 5 ? days : fallbackForecast
}
