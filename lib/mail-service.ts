import { Resend } from 'resend'
import type { LiveDashboardPayload } from './live-data'

const FROM = 'Staley Climate <alerts@staleyclimate.info>'

let resendClient: Resend | null = null

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  if (!resendClient) resendClient = new Resend(key)
  return resendClient
}

function uniqueEmails(values: unknown[]) {
  return Array.from(new Set(values.flatMap((value) => String(value || '').split(/[,\n]/)).map((value) => value.trim()).filter(Boolean)))
}

function resultError(result: unknown) {
  const candidate = result as { error?: { message?: string } | string } | null
  if (!candidate?.error) return null
  return typeof candidate.error === 'string' ? candidate.error : candidate.error.message || 'Resend rejected the request'
}

export function resolveRecipients(settings: { notification_emails?: string[] } = {}, explicit?: string) {
  return uniqueEmails([explicit, ...(settings.notification_emails || []), process.env.ALERT_EMAIL])
}

export function severeThresholds(data: LiveDashboardPayload) {
  const triggers: string[] = []
  const windGust = data.current.windGust
  const pressure = data.current.pressure
  const uv = data.current.uv

  if (windGust !== null && windGust >= 35) triggers.push('High Wind Gust')
  if (pressure !== null && pressure <= 29.4) triggers.push('Low Pressure')
  if (uv !== null && uv >= 8) triggers.push('High UV Exposure')

  return triggers
}

function value(value: number | null, suffix = '') {
  return value === null ? 'Live Data Unavailable' : `${value}${suffix}`
}

type ReportSettings = {
  daily_report_sections?: {
    current?: boolean
    forecast?: boolean
    airQuality?: boolean
    astronomy?: boolean
    precipitation?: boolean
    stationStatus?: boolean
    alerts?: boolean
  }
}

function row(label: string, content: string) {
  return `<tr><td style="padding:7px 10px;border-bottom:1px solid rgba(103,232,249,.18);color:#9eeaf5;">${label}</td><td style="padding:7px 10px;border-bottom:1px solid rgba(103,232,249,.18);">${content}</td></tr>`
}

export function buildDailyReportEmail(data: LiveDashboardPayload, settings: ReportSettings = {}) {
  const sections = settings.daily_report_sections || {}
  const enabled = (key: keyof NonNullable<ReportSettings['daily_report_sections']>) => sections[key] !== false
  const subject = `Staley Street Weather Daily Report - ${new Date().toLocaleDateString()}`
  const currentRows = [
    row('Temperature', value(data.current.temperature, 'F')),
    row('Feels Like', value(data.current.feelsLike, 'F')),
    row('Humidity', value(data.current.humidity, '%')),
    row('Pressure', value(data.current.pressure, ' inHg')),
    row('Wind', `${value(data.current.windSpeed, ' mph')} gust ${value(data.current.windGust, ' mph')}`),
    row('Dewpoint', value(data.current.dewpoint, 'F')),
    row('UV', value(data.current.uv)),
    row('Today High / Low', `${value(data.current.high, 'F')} / ${value(data.current.low, 'F')}`)
  ].join('')
  const html = `
    <div style="font-family:Arial,sans-serif;background:#06111d;color:#ffffff;padding:28px;">
      <h1 style="color:#67e8f9;margin:0 0 12px;">Staley Street Weather</h1>
      <p style="color:#a7f3d0;margin:0 0 18px;">Source: ${data.source} | Updated: ${data.updatedAt || 'Live Data Unavailable'}</p>
      ${enabled('stationStatus') ? `<h2 style="color:#67e8f9;">Station Status</h2><p>${data.stationOnline ? 'Online' : 'Live Data Unavailable'} | ${data.current.stationId}</p>` : ''}
      ${enabled('current') ? `<h2 style="color:#67e8f9;">Current Conditions</h2><table style="width:100%;border-collapse:collapse;color:#fff;">${currentRows}</table>` : ''}
      ${enabled('precipitation') ? `<h2 style="color:#67e8f9;">Precipitation</h2><p>Today: ${value(data.current.precipToday, ' in')}</p>` : ''}
      ${enabled('forecast') ? `<h2 style="color:#67e8f9;">Forecast</h2>${data.forecast.length ? data.forecast.map((day) => `<p><strong>${day.day}</strong>: ${day.condition || 'Live Data Unavailable'} | High ${value(day.high, 'F')} | Low ${value(day.low, 'F')} | Precip ${value(day.precip, '%')}</p>`).join('') : '<p>Live Data Unavailable</p>'}` : ''}
      ${enabled('airQuality') ? `<h2 style="color:#67e8f9;">Air Quality</h2><p>AQI: ${value(data.aqi.value)} ${data.aqi.label || ''}</p>` : ''}
      ${enabled('astronomy') ? `<h2 style="color:#67e8f9;">Sun & Moon</h2><p>Sunrise ${data.astronomy.sunrise || 'Live Data Unavailable'} | Sunset ${data.astronomy.sunset || 'Live Data Unavailable'} | Moon ${data.astronomy.moon.phaseName} ${data.astronomy.moon.illumination}%</p>` : ''}
      ${enabled('alerts') ? `<h2 style="color:#67e8f9;">Alerts</h2>${data.alerts.map((alert) => `<p>${alert.title}</p>`).join('')}` : ''}
    </div>
  `
  const text = `Staley Street Weather | Temp ${value(data.current.temperature, 'F')} | Humidity ${value(data.current.humidity, '%')} | Pressure ${value(data.current.pressure, ' inHg')}`
  return { subject, html, text }
}

export function buildAlertEmail(type: string, message: string) {
  return {
    subject: `Weather Alert Triggered: ${type}`,
    html: `<div style="font-family:Arial,sans-serif;background:#1e0404;color:#fff;padding:28px;"><h1 style="color:#f87171;">Staley Climate Alert Center</h1><p><strong>${type}</strong></p><p>${message}</p></div>`,
    text: `${type}: ${message}`
  }
}

export async function sendEmail({ to, subject, html, text }: { to: string[]; subject: string; html: string; text?: string }) {
  const resend = getResend()
  if (!resend) return { ok: false, error: 'RESEND_API_KEY is not configured' }
  if (!to.length) return { ok: false, error: 'No email recipients saved' }

  const result = await resend.emails.send({ from: FROM, to, subject, html, text })
  const error = resultError(result)
  if (error) return { ok: false, error, result }
  return { ok: true, result }
}

export async function sendDailyReport(settings: { notification_emails?: string[] } & ReportSettings, data: LiveDashboardPayload, explicitEmail?: string) {
  const recipients = resolveRecipients(settings, explicitEmail)
  const email = buildDailyReportEmail(data, settings)
  const send = await sendEmail({ to: recipients, ...email })
  return { ...send, recipients }
}

export async function sendWeatherAlert(settings: { notification_emails?: string[] }, type: string, message: string, explicitEmail?: string) {
  const recipients = resolveRecipients(settings, explicitEmail)
  const email = buildAlertEmail(type, message)
  const send = await sendEmail({ to: recipients, ...email })
  return { ...send, recipients }
}
