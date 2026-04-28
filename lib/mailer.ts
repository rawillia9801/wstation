import { Resend } from 'resend'
import { getLiveWeatherPayload } from './live'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export async function sendDailyForecastEmail() {
  if (!process.env.RESEND_API_KEY) return { dormant: true }

  const payload = await getLiveWeatherPayload()

  const station = payload.station
  const forecast = payload.forecast?.slice(0, 3) || []

  const html = `
    <div style="font-family:Arial;background:#06111f;color:white;padding:30px;">
      <h1 style="color:#00d9ff;">WSTATION DAILY FORECAST</h1>
      <p>Current Temperature: ${station?.imperial?.temp ?? '--'}°F</p>
      <p>Humidity: ${station?.humidity ?? '--'}%</p>
      <p>Pressure: ${station?.imperial?.pressure ?? '--'} inHg</p>
      <hr/>
      ${forecast.map((f:any) => `<p><strong>${f.name}</strong>: ${f.temperature}° - ${f.shortForecast}</p>`).join('')}
    </div>
  `

  return await resend.emails.send({
    from: 'WStation <onboarding@resend.dev>',
    to: process.env.ALERT_EMAIL as string,
    subject: 'Daily Weather Forecast Report',
    html
  })
}