import axios from 'axios'

const LAT = process.env.LATITUDE || '36.845'
const LON = process.env.LONGITUDE || '-81.507'
const REQUEST_TIMEOUT_MS = Number(process.env.WEATHER_REQUEST_TIMEOUT_MS || 8000)

export async function fetchNOAAForecast() {
  const headers = { 'User-Agent': 'StaleyClimate/1.0 staleyclimate.info' }
  const points = await axios.get(`https://api.weather.gov/points/${LAT},${LON}`, { headers, timeout: REQUEST_TIMEOUT_MS })
  const forecastUrl = points.data.properties.forecast
  const forecast = await axios.get(forecastUrl, { headers, timeout: REQUEST_TIMEOUT_MS })
  return forecast.data.properties.periods || []
}
