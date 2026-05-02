import { Resend } from 'resend'
import type { LiveDashboardPayload } from './live-data'
import type { StationSettings } from '@/types/dashboard'

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

function uniquePhones(values: unknown[]) {
  return Array.from(new Set(values.flatMap((value) => String(value || '').split(/[,\n]/)).map((value) => value.trim()).filter(Boolean)))
}

export function resolvePhones(settings: { notification_phones?: string[] } = {}, explicit?: string) {
  return uniquePhones([explicit, ...(settings.notification_phones || [])])
}

function percentChange(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) return 0
  return Math.abs(((current - previous) / previous) * 100)
}

export function severeThresholds(data: LiveDashboardPayload, settings: StationSettings = {}) {
  const triggers: string[] = []
  const thresholds = settings.alarm_thresholds || {}
  const windGust = data.current.windGust
  const windSpeed = data.current.windSpeed
  const pressure = data.current.pressure
  const uv = data.current.uv
  const windMph = thresholds.windMph ?? 30
  const tempPercent = thresholds.tempPercent ?? 10
  const humidityPercent = thresholds.humidityPercent ?? 15
  const freezeTempF = thresholds.freezeTempF ?? 32
  const previous = data.history[0]

  if ((windGust !== null && windGust >= windMph) || (windSpeed !== null && windSpeed >= windMph)) triggers.push('Wind Threshold')
  if (pressure !== null && pressure <= 29.4) triggers.push('Low Pressure')
  if (uv !== null && uv >= 8) triggers.push('High UV Exposure')
  if (percentChange(data.current.temperature, previous?.temp ?? null) >= tempPercent) triggers.push('Rapid Temperature Change')
  if (percentChange(data.current.humidity, previous?.humidity ?? null) >= humidityPercent) triggers.push('Rapid Humidity Change')
  if (data.current.temperature !== null && data.current.temperature <= freezeTempF && (data.current.precipToday ?? 0) > 0) triggers.push('Freeze / Ice Risk')
  if (data.current.condition && /\bsnow|sleet|ice\b/i.test(data.current.condition)) triggers.push('Winter Weather')

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
  return `<tr><td style="padding:8px 10px;border-bottom:1px solid rgba(103,232,249,.18);color:#9eeaf5;">${label}</td><td style="padding:8px 10px;border-bottom:1px solid rgba(103,232,249,.18);font-weight:700;">${content}</td></tr>`
}

function section(title: string, body: string) {
  return `<section style="margin-top:18px;padding:16px;border:1px solid rgba(34,211,238,.28);border-radius:12px;background:rgba(2,16,29,.78);"><h2 style="color:#67e8f9;margin:0 0 12px;font-size:17px;letter-spacing:.08em;text-transform:uppercase;">${title}</h2>${body}</section>`
}

export function buildDailyReportEmail(data: LiveDashboardPayload, settings: ReportSettings = {}) {
  const sections = settings.daily_report_sections || {}
  const enabled = (key: keyof NonNullable<ReportSettings['daily_report_sections']>) => sections[key] !== false
  const subject = `Staley Street Weather Daily Weather Report - ${new Date().toLocaleDateString()}`
  const currentRows = [
    row('Temperature', value(data.current.temperature, 'F')),
    row('Feels Like', value(data.current.feelsLike, 'F')),
    row('Humidity', value(data.current.humidity, '%')),
    row('Pressure', value(data.current.pressure, ' inHg')),
    row('Wind', `${value(data.current.windSpeed, ' mph')} gust ${value(data.current.windGust, ' mph')}`),
    row('Dewpoint', value(data.current.dewpoint, 'F')),
    row('Condition', data.current.condition || 'Live Data Unavailable'),
    row('UV Index', `${value(data.current.uv)}${data.current.uvSource ? ` (${data.current.uvSource})` : ''}`),
    row('Today High / Low', `${value(data.current.high, 'F')} / ${value(data.current.low, 'F')}`)
  ].join('')
  const uvBody = `<p style="font-size:34px;line-height:1;margin:0 0 6px;font-weight:900;">${value(data.current.uv)}</p><p style="margin:0;color:#cbd5e1;">${data.current.uv === null ? 'Live Data Unavailable' : data.current.uv >= 8 ? 'High UV exposure' : data.current.uv >= 5 ? 'Moderate UV exposure' : 'Low UV exposure'}${data.current.uvSource ? ` | Source: ${data.current.uvSource}` : ''}</p>`
  const forecastBody = data.forecast.length
    ? data.forecast.slice(0, 5).map((day) => `<div style="padding:9px 0;border-bottom:1px solid rgba(103,232,249,.14);"><strong>${day.day}</strong><br/><span style="color:#dbeafe;">${day.condition || 'Live Data Unavailable'}</span><br/><span>High ${value(day.high, 'F')} | Low ${value(day.low, 'F')} | Precip ${value(day.precip, '%')}</span></div>`).join('')
    : '<p>Live Data Unavailable</p>'
  const html = `
    <div style="font-family:Arial,sans-serif;background:radial-gradient(circle at 50% 0%,#12304a 0,#020812 34%,#000 100%);color:#ffffff;padding:32px;">
      <div style="max-width:720px;margin:0 auto;">
        <p style="color:#67e8f9;letter-spacing:.18em;text-transform:uppercase;margin:0 0 8px;">Live Personal Weather Station</p>
        <h1 style="color:#ffffff;margin:0 0 12px;font-size:30px;">Staley Street Weather Daily Report</h1>
        <p style="color:#a7f3d0;margin:0 0 18px;">Source: ${data.source} | Updated: ${data.updatedAt || 'Live Data Unavailable'} | Station ${data.current.stationId}</p>
        <div style="padding:18px;border:1px solid rgba(103,232,249,.38);border-radius:16px;background:linear-gradient(135deg,rgba(6,30,48,.92),rgba(0,5,12,.88));box-shadow:0 0 28px rgba(34,211,238,.18);">
          <div style="font-size:48px;font-weight:900;line-height:1;">${value(data.current.temperature, 'F')}</div>
          <div style="font-size:18px;color:#e5faff;margin-top:6px;">${data.current.condition || 'Live Data Unavailable'} | Feels like ${value(data.current.feelsLike, 'F')}</div>
          <div style="color:#b6c8d6;margin-top:8px;">High ${value(data.current.high, 'F')} | Low ${value(data.current.low, 'F')} | Humidity ${value(data.current.humidity, '%')} | Pressure ${value(data.current.pressure, ' inHg')}</div>
        </div>
        ${enabled('stationStatus') ? section('Station Status', `<p>${data.stationOnline ? 'Online' : 'Live Data Unavailable'} | ${data.current.location || 'Marion, Virginia'}</p>`) : ''}
        ${enabled('current') ? section('Daily Weather', `<table style="width:100%;border-collapse:collapse;color:#fff;">${currentRows}</table>`) : ''}
        ${section('UV Index', uvBody)}
        ${enabled('forecast') ? section('Forecast', forecastBody) : section('Forecast', forecastBody)}
        ${enabled('precipitation') ? section('Precipitation', `<p>Today: ${value(data.current.precipToday, ' in')}</p>`) : ''}
        ${enabled('airQuality') ? section('Air Quality', `<p>AQI: ${value(data.aqi.value)} ${data.aqi.label || ''}</p>`) : ''}
        ${enabled('astronomy') ? section('Sun & Moon', `<p>Sunrise ${data.astronomy.sunrise || 'Live Data Unavailable'} | Sunset ${data.astronomy.sunset || 'Live Data Unavailable'} | Moon ${data.astronomy.moon.phaseName} ${data.astronomy.moon.illumination}%</p>`) : ''}
        ${enabled('alerts') ? section('Alerts', data.alerts.length ? data.alerts.map((alert) => `<p>${alert.title}</p>`).join('') : '<p>No active alerts.</p>') : ''}
      </div>
    </div>
  `
  const text = `Staley Street Weather Daily Report | Weather: ${value(data.current.temperature, 'F')}, feels like ${value(data.current.feelsLike, 'F')} | UV: ${value(data.current.uv)} | Forecast: ${data.forecast.slice(0, 5).map((day) => `${day.day} ${day.condition || 'Unavailable'} high ${value(day.high, 'F')} low ${value(day.low, 'F')}`).join('; ')}`
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

async function sendSms(to: string[], body: string) {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    TWILIO_FROM_NUMBER
  } = process.env
  const authSid = TWILIO_API_KEY_SID || TWILIO_ACCOUNT_SID
  const authSecret = TWILIO_API_KEY_SECRET || TWILIO_AUTH_TOKEN

  if (!TWILIO_ACCOUNT_SID || !authSid || !authSecret || !TWILIO_FROM_NUMBER || !to.length) {
    return { skipped: true, reason: 'twilio_not_configured' }
  }

  const auth = Buffer.from(`${authSid}:${authSecret}`).toString('base64')
  const results = []

  for (const phone of to) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: TWILIO_FROM_NUMBER,
        To: phone,
        Body: body.slice(0, 1500)
      })
    })
    results.push({ phone, ok: response.ok, status: response.status, body: await response.text().catch(() => '') })
  }

  return { skipped: false, results }
}

export async function sendDailyReport(settings: { notification_emails?: string[] } & ReportSettings, data: LiveDashboardPayload, explicitEmail?: string) {
  const recipients = resolveRecipients(settings, explicitEmail)
  const email = buildDailyReportEmail(data, settings)
  const send = await sendEmail({ to: recipients, ...email })
  return { ...send, recipients }
}

export async function sendWeatherAlert(settings: StationSettings, type: string, message: string, explicitEmail?: string, explicitPhone?: string) {
  const recipients = resolveRecipients(settings, explicitEmail)
  const phoneRecipients = settings.sms_enabled ? resolvePhones(settings, explicitPhone) : []
  const email = buildAlertEmail(type, message)
  const send = await sendEmail({ to: recipients, ...email })
  const sms = settings.sms_enabled ? await sendSms(phoneRecipients, email.text) : { skipped: true, reason: 'sms_disabled' }
  return { ...send, recipients, phoneRecipients, sms }
}
