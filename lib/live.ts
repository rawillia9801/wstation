import { fetchCurrentStationWeather } from './weather'
import { fetchNOAAForecast } from './forecast'
import { archiveObservation } from './archive'

export async function getLiveWeatherPayload() {
  const station = await fetchCurrentStationWeather()
  const forecast = await fetchNOAAForecast()

  await archiveObservation(station)

  return {
    station,
    forecast
  }
}