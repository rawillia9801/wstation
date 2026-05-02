import { sendWeatherAlert } from './mail-service'
import { readSettings } from './settings-store'

export async function evaluateWeatherAlerts(observation: any) {
  if (!observation) return

  const pressure = observation.imperial?.pressure || 0
  const windGust = observation.imperial?.windGust || 0

  if (pressure < 29.4 || windGust > 35) {
    const settings = await readSettings()
    if (!('error' in settings)) {
      await sendWeatherAlert(settings, 'Station Threshold Alert', 'A live station pressure or wind threshold was exceeded.')
    }
  }
}
