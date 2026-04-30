import axios from 'axios'

const LAT = process.env.LATITUDE
const LON = process.env.LONGITUDE

export async function fetchNOAAForecast() {
  if (!LAT || !LON) {
    console.warn('NOAA forecast coordinates are not configured')
    return []
  }

  const points = await axios.get(`https://api.weather.gov/points/${LAT},${LON}`)
  const forecastUrl = points.data.properties.forecast
  const forecast = await axios.get(forecastUrl)
  return forecast.data.properties.periods || []
}
