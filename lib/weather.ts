import axios from 'axios'

const PUBLIC_WU_API_KEY = 'e1f10a1e78da46f5b10a1e78da96f525'
const PRIMARY_STATION_ID = 'KVAMARIO42'
const STATION_KEY = process.env.STATION_KEY
const REQUEST_TIMEOUT_MS = Number(process.env.WEATHER_REQUEST_TIMEOUT_MS || 8000)

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))))
}

function candidateStationIds() {
  return unique([process.env.STATION_ID, PRIMARY_STATION_ID, 'KVAMARI042'])
}

function candidateApiKeys() {
  return unique([PUBLIC_WU_API_KEY, process.env.WEATHER_API_KEY])
}

function parseDashboardObservation(html: string) {
  const matches = Array.from(html.matchAll(/"stationID":"KVAMARIO42"[\s\S]{0,1400}?"imperial":\{[\s\S]{0,600}?\}/g))
  const raw = matches.at(-1)?.[0]
  if (!raw) return null

  try {
    return JSON.parse(`{${raw}}`)
  } catch {
    return null
  }
}

async function fetchFromDashboardPage() {
  const { data } = await axios.get(`https://www.wunderground.com/dashboard/pws/${PRIMARY_STATION_ID}`, {
    responseType: 'text',
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'User-Agent': 'Mozilla/5.0 StaleyClimate/1.0' }
  })

  return parseDashboardObservation(String(data))
}

async function fetchDailySummary(stationId: string, apiKey: string) {
  const url = `https://api.weather.com/v2/pws/observations/all/1day?stationId=${stationId}&format=json&units=e&numericPrecision=decimal&apiKey=${apiKey}`
  const { data } = await axios.get(url, {
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'X-Station-Key': STATION_KEY || ''
    }
  })
  const observations = Array.isArray(data.observations) ? data.observations : []
  if (!observations.length) return null

  const numbers = (path: string) => observations
    .map((item: any) => path.split('.').reduce((current, key) => current?.[key], item))
    .filter((value: unknown): value is number => typeof value === 'number' && Number.isFinite(value))

  const tempHighs = numbers('imperial.tempHigh')
  const tempLows = numbers('imperial.tempLow')
  const precipTotals = numbers('imperial.precipTotal')

  return {
    tempHigh: tempHighs.length ? Math.max(...tempHighs) : null,
    tempLow: tempLows.length ? Math.min(...tempLows) : null,
    precipTotal: precipTotals.length ? Math.max(...precipTotals) : null,
    observationCount: observations.length
  }
}

export async function fetchStationHistory() {
  let lastError: unknown = null

  for (const stationId of candidateStationIds()) {
    for (const apiKey of candidateApiKeys()) {
      try {
        const url = `https://api.weather.com/v2/pws/observations/all/1day?stationId=${stationId}&format=json&units=e&numericPrecision=decimal&apiKey=${apiKey}`
        const { data } = await axios.get(url, {
          timeout: REQUEST_TIMEOUT_MS,
          headers: {
            'X-Station-Key': STATION_KEY || ''
          }
        })
        return Array.isArray(data.observations) ? data.observations : []
      } catch (error) {
        lastError = error
      }
    }
  }

  throw lastError
}

export async function fetchCurrentStationWeather() {
  let lastError: unknown = null

  for (const stationId of candidateStationIds()) {
    for (const apiKey of candidateApiKeys()) {
      try {
        const url = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=e&numericPrecision=decimal&apiKey=${apiKey}`
        const { data } = await axios.get(url, {
          timeout: REQUEST_TIMEOUT_MS,
          headers: {
            'X-Station-Key': STATION_KEY || ''
          }
        })
        const observation = data.observations?.[0]
        if (observation?.stationID) {
          try {
            const daily = await fetchDailySummary(stationId, apiKey)
            return daily ? { ...observation, daily } : observation
          } catch {
            return observation
          }
        }
      } catch (error) {
        lastError = error
      }
    }
  }

  try {
    const observation = await fetchFromDashboardPage()
    if (observation?.stationID) return observation
  } catch (error) {
    lastError = error
  }

  throw lastError
}
