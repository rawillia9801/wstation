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

export async function fetchLatestArchivedObservation() {
  const { data, error } = await supabase
    .from('weather_observations')
    .select('*')
    .order('obs_time_utc', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null

  return {
    stationID: data.station_id,
    obsTimeUtc: data.obs_time_utc,
    source: 'station_archive',
    humidity: data.humidity,
    imperial: {
      temp: data.temp,
      pressure: data.pressure,
      windSpeed: data.wind_speed,
      windGust: data.wind_gust,
      precipRate: data.precip_rate,
      precipTotal: data.precip_total
    }
  }
}
