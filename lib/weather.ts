import axios from 'axios'

const API_KEY = process.env.WEATHER_API_KEY
const RAW_STATION_ID = process.env.STATION_ID || 'KVAMARI042'
const STATION_ID = RAW_STATION_ID === 'KVAMARIO42' ? 'KVAMARI042' : RAW_STATION_ID
const STATION_KEY = process.env.STATION_KEY

export async function fetchCurrentStationWeather() {
  if (!API_KEY || !STATION_ID) {
    console.warn('Weather station API credentials are not configured')
    return null
  }

  const url = `https://api.weather.com/v2/pws/observations/current?stationId=${STATION_ID}&format=json&units=e&numericPrecision=decimal&apiKey=${API_KEY}`
  const { data } = await axios.get(url, {
    headers: {
      'X-Station-Key': STATION_KEY || ''
    }
  })
  return data.observations?.[0] || null
}
