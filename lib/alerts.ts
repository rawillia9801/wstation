import { sendDailyForecastEmail } from './mailer'

export async function evaluateWeatherAlerts(observation: any) {
  if (!observation) return

  const pressure = observation.imperial?.pressure || 0
  const windGust = observation.imperial?.windGust || 0

  if (pressure < 29.4 || windGust > 35) {
    await sendDailyForecastEmail()
  }
}