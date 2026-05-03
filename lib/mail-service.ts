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

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function value(value: number | null, suffix = '', digits = 0) {
  return value === null ? 'Unavailable' : `${value.toFixed(digits)}${suffix}`
}

function insight(data: LiveDashboardPayload) {
  const temp = data.current.temperature
  const wind = data.current.windGust ?? data.current.windSpeed
  const humidity = data.current.humidity
  const condition = data.current.condition || 'weather'

  if (wind !== null && wind >= 30) return `Heads up: gusts are elevated today, so secure anything lightweight outside. Expect ${escapeHtml(condition).toLowerCase()} around ${escapeHtml(data.current.location || 'the station')}.`
  if (temp !== null && temp <= 36) return `Bundle up this morning. It is starting cold, and sheltered spots may feel sharper than the number on the station.`
  if (humidity !== null && humidity >= 80) return `Moist air is parked over the station today, so fog, drizzle, or a damp feel may linger even between showers.`
  if (temp !== null && temp >= 85) return `It is shaping up warm. Keep an eye on hydration and sun exposure if you are outside for long stretches.`
  return `A quick, personal read on the day: ${escapeHtml(condition)} is the headline, with the station watching the details as they move.`
}

function statCard(label: string, content: string, detail: string, accent = '#2563eb') {
  return `
    <td style="width:50%;padding:7px;">
      <div style="background:#ffffff;border:1px solid #dbeafe;border-radius:16px;padding:16px;box-shadow:0 8px 24px rgba(15,23,42,.06);">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b;font-weight:800;">${escapeHtml(label)}</div>
        <div style="font-size:26px;line-height:1.1;color:#0f172a;font-weight:900;margin-top:8px;">${content}</div>
        <div style="height:4px;background:${accent};border-radius:999px;width:54px;margin:12px 0 8px;"></div>
        <div style="font-size:13px;line-height:1.45;color:#475569;">${detail}</div>
      </div>
    </td>
  `
}

function section(title: string, body: string, subtitle = '') {
  return `
    <section style="margin-top:18px;background:#ffffff;border:1px solid #dbeafe;border-radius:18px;padding:20px;box-shadow:0 10px 28px rgba(15,23,42,.06);">
      <h2 style="font-size:18px;line-height:1.2;color:#0f172a;margin:0;font-weight:900;">${escapeHtml(title)}</h2>
      ${subtitle ? `<p style="margin:6px 0 16px;color:#64748b;font-size:13px;line-height:1.5;">${escapeHtml(subtitle)}</p>` : ''}
      ${body}
    </section>
  `
}

function bar(label: string, valueText: string, percent: number, color: string) {
  const width = Math.max(0, Math.min(100, percent))
  return `
    <div style="margin:12px 0;">
      <div style="display:flex;justify-content:space-between;font-size:13px;color:#334155;margin-bottom:7px;">
        <span style="font-weight:800;">${escapeHtml(label)}</span>
        <span>${escapeHtml(valueText)}</span>
      </div>
      <div style="height:9px;background:#e2e8f0;border-radius:999px;overflow:hidden;">
        <div style="height:9px;width:${width}%;background:${color};border-radius:999px;"></div>
      </div>
    </div>
  `
}

function forecastTile(day: LiveDashboardPayload['forecast'][number]) {
  return `
    <div style="padding:14px 0;border-bottom:1px solid #e2e8f0;">
      <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#2563eb;font-weight:900;">${escapeHtml(day.day)}</div>
      <div style="font-size:16px;color:#0f172a;font-weight:800;margin:4px 0;">${escapeHtml(day.condition || 'Forecast unavailable')}</div>
      <div style="font-size:13px;color:#475569;">High ${value(day.high, 'F')} / Low ${value(day.low, 'F')} / Rain chance ${value(day.precip, '%')}</div>
    </div>
  `
}

export function buildDailyReportEmail(data: LiveDashboardPayload, settings: ReportSettings = {}) {
  const sections = settings.daily_report_sections || {}
  const enabled = (key: keyof NonNullable<ReportSettings['daily_report_sections']>) => sections[key] !== false
  const subject = `Your Staley Street Weather Brief - ${new Date().toLocaleDateString()}`
  const condition = data.current.condition || 'Weather update'
  const greeting = 'Good morning, my weather crew. Here is your daily weather brief:'
  const temp = value(data.current.temperature, 'F', 1)
  const feels = value(data.current.feelsLike, 'F', 1)
  const uvLabel = data.current.uv === null ? 'Unavailable' : data.current.uv >= 8 ? 'High' : data.current.uv >= 5 ? 'Moderate' : 'Low'
  const comfortBody = [
    bar('Humidity', value(data.current.humidity, '%'), data.current.humidity ?? 0, '#06b6d4'),
    bar('Wind gust', value(data.current.windGust, ' mph'), ((data.current.windGust ?? 0) / 45) * 100, '#f97316'),
    bar('UV index', `${value(data.current.uv)} - ${uvLabel}`, ((data.current.uv ?? 0) / 11) * 100, '#eab308'),
    bar('Pressure', value(data.current.pressure, ' inHg', 2), (((data.current.pressure ?? 29.8) - 28.5) / 2) * 100, '#22c55e')
  ].join('')
  const forecastBody = data.forecast.length
    ? data.forecast.slice(0, 5).map(forecastTile).join('')
    : '<p style="color:#475569;margin:0;">Forecast unavailable.</p>'
  const alertBody = data.alerts.length
    ? data.alerts.map((alert) => `<p style="margin:8px 0;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;color:#9a3412;font-weight:800;">${escapeHtml(alert.title)}</p>`).join('')
    : '<p style="margin:0;color:#475569;">No active alerts showing right now.</p>'
  const html = `
    <div style="margin:0;padding:0;background:#eef6ff;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(greeting)} ${escapeHtml(condition)}, ${temp}, feels like ${feels}.</div>
      <div style="max-width:760px;margin:0 auto;padding:28px 14px;">
        <div style="background:linear-gradient(135deg,#e0f2fe 0%,#f8fafc 48%,#dcfce7 100%);border:1px solid #bfdbfe;border-radius:26px;overflow:hidden;box-shadow:0 18px 55px rgba(30,64,175,.16);">
          <div style="padding:28px 28px 18px;">
            <p style="margin:0 0 8px;color:#2563eb;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:900;">Live personal weather station</p>
            <h1 style="margin:0;color:#0f172a;font-size:34px;line-height:1.08;font-weight:900;">Staley Street Weather Daily Brief</h1>
            <p style="font-size:17px;line-height:1.55;color:#334155;margin:16px 0 0;">${escapeHtml(greeting)}</p>
          </div>

          <div style="padding:0 28px 28px;">
            <div style="background:#ffffff;border-radius:24px;padding:26px;border:1px solid #dbeafe;box-shadow:0 10px 30px rgba(15,23,42,.08);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:62px;line-height:.95;font-weight:900;color:#0f172a;">${temp}</div>
                    <div style="font-size:18px;color:#2563eb;font-weight:900;margin-top:10px;">${escapeHtml(condition)}</div>
                    <div style="font-size:14px;color:#475569;margin-top:7px;">Feels like ${feels} in ${escapeHtml(data.current.location || 'Marion, Virginia')}.</div>
                  </td>
                  <td style="vertical-align:top;text-align:right;">
                    <div style="display:inline-block;padding:12px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;color:#1d4ed8;font-weight:900;">Station ${escapeHtml(data.current.stationId)}</div>
                    <div style="font-size:12px;color:#64748b;margin-top:12px;">Updated ${escapeHtml(data.updatedAt || 'Unavailable')}</div>
                    <div style="font-size:12px;color:#64748b;">Source: ${escapeHtml(data.source)}</div>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;padding:16px 18px;background:#f8fafc;border-left:5px solid #38bdf8;border-radius:14px;color:#334155;font-size:15px;line-height:1.55;">${insight(data)}</p>
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
              <tr>
                ${statCard('High / Low', `${value(data.current.high, 'F')} / ${value(data.current.low, 'F')}`, 'The daily temperature range from the station and forecast blend.', '#ef4444')}
                ${statCard('Wind', `${value(data.current.windSpeed, ' mph')} / ${value(data.current.windGust, ' mph')}`, 'Sustained wind first, gust second. Good for porch-item decisions.', '#f97316')}
              </tr>
              <tr>
                ${statCard('Air Quality', `${value(data.aqi.value)} ${escapeHtml(data.aqi.label || '')}`, 'A quick read on outdoor comfort and breathing conditions.', '#22c55e')}
                ${statCard('UV', `${value(data.current.uv)} ${uvLabel}`, escapeHtml(data.current.uvSource || 'Daily UV guidance'), '#eab308')}
              </tr>
            </table>

            ${enabled('current') ? section('Comfort Dashboard', comfortBody, 'A more human read on what the raw numbers mean outside.') : ''}
            ${enabled('forecast') ? section('Five-Day Outlook', forecastBody, 'The next few days at a glance.') : ''}
            ${enabled('precipitation') ? section('Rain And Ground Conditions', `<p style="margin:0;color:#334155;font-size:15px;line-height:1.55;">Rain today: <strong>${value(data.current.precipToday, ' in', 2)}</strong>. Current condition: <strong>${escapeHtml(condition)}</strong>.</p>`) : ''}
            ${enabled('astronomy') ? section('Sun And Moon', `<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:8px;color:#475569;">Sunrise<br><strong style="color:#0f172a;">${escapeHtml(data.astronomy.sunrise || 'Unavailable')}</strong></td><td style="padding:8px;color:#475569;">Sunset<br><strong style="color:#0f172a;">${escapeHtml(data.astronomy.sunset || 'Unavailable')}</strong></td><td style="padding:8px;color:#475569;">Moon<br><strong style="color:#0f172a;">${escapeHtml(data.astronomy.moon.phaseName)} ${data.astronomy.moon.illumination}%</strong></td></tr></table>`) : ''}
            ${enabled('alerts') ? section('Alerts And Notes', alertBody, 'Anything worth your attention before the day gets moving.') : ''}
            ${enabled('stationStatus') ? section('Station Status', `<p style="margin:0;color:#334155;">${data.stationOnline ? 'Online and reporting' : 'Station data unavailable'} from ${escapeHtml(data.current.location || 'Marion, Virginia')}.</p>`) : ''}

            <p style="text-align:center;color:#64748b;font-size:12px;line-height:1.5;margin:24px 0 0;">Sent automatically by Staley Street Weather. Keep being ridiculous, hydrated, and weather-aware.</p>
          </div>
        </div>
      </div>
    </div>
  `
  const text = `${greeting} Weather: ${value(data.current.temperature, 'F', 1)}, feels like ${value(data.current.feelsLike, 'F', 1)}. Condition: ${condition}. UV: ${value(data.current.uv)}. Forecast: ${data.forecast.slice(0, 5).map((day) => `${day.day} ${day.condition || 'Unavailable'} high ${value(day.high, 'F')} low ${value(day.low, 'F')}`).join('; ')}`
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
