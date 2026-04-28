import { supabase } from './supabase'

export async function archiveObservation(observation: any) {
  if (!observation) return

  await supabase.from('weather_observations').insert({
    station_id: observation.stationID,
    temp: observation.imperial?.temp,
    humidity: observation.humidity,
    pressure: observation.imperial?.pressure,
    wind_speed: observation.imperial?.windSpeed,
    wind_gust: observation.imperial?.windGust,
    precip_rate: observation.imperial?.precipRate,
    precip_total: observation.imperial?.precipTotal,
    obs_time_utc: observation.obsTimeUtc
  })
}