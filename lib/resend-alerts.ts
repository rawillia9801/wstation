import { Resend } from 'resend'
import { buildAlertEmail, buildDailyForecastEmail } from './resendTemplates'

const FROM = 'Staley Climate <alerts@staleyclimate.info>'

export type AlertPreferences = {
  notification_emails?: string[]
  daily_report_enabled?: boolean
  abnormal_alerts_enabled?: boolean
}

function recipientsFrom(preferences?: AlertPreferences, explicitEmail?: string) {
  const values = [explicitEmail, ...(preferences?.notification_emails ?? []), process.env.ALERT_EMAIL]
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))))
}

function client() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

function resendError(result: unknown) {
  const candidate = result as { error?: { message?: string } | string } | null
  if (!candidate?.error) return null
  if (typeof candidate.error === 'string') return candidate.error
  return candidate.error.message || 'Resend rejected the request'
}

export async function sendDailyWeatherSummary(preferences: AlertPreferences | undefined, data: any, explicitEmail?: string) {
  if (preferences?.daily_report_enabled === false) return { ok: false, skipped: true, reason: 'daily_disabled' }
  const resend = client()
  if (!resend) return { ok: false, skipped: true, error: 'RESEND_API_KEY is not configured' }
  const to = recipientsFrom(preferences, explicitEmail)
  if (!to.length) return { ok: false, skipped: true, error: 'No alert recipients configured' }
  const payload = buildDailyForecastEmail(data)
  const result = await resend.emails.send({ from: FROM, to, subject: payload.subject, html: payload.html, text: payload.text })
  const error = resendError(result)
  if (error) return { ok: false, to, error, result }
  return { ok: true, to, result }
}

export async function sendSevereWeatherAlert(preferences: AlertPreferences | undefined, type: string, message: string, explicitEmail?: string) {
  if (preferences?.abnormal_alerts_enabled === false) return { ok: false, skipped: true, reason: 'severe_disabled' }
  const resend = client()
  if (!resend) return { ok: false, skipped: true, error: 'RESEND_API_KEY is not configured' }
  const to = recipientsFrom(preferences, explicitEmail)
  if (!to.length) return { ok: false, skipped: true, error: 'No alert recipients configured' }
  const payload = buildAlertEmail(type, message)
  const result = await resend.emails.send({ from: FROM, to, subject: payload.subject, html: payload.html, text: payload.text })
  const error = resendError(result)
  if (error) return { ok: false, to, error, result }
  return { ok: true, to, result }
}

export function severeThresholds(data: { wind?: number; uv?: number; stormProbability?: number; tempDrop?: number }) {
  const triggers: string[] = []
  if ((data.wind ?? 0) > 30) triggers.push('Wind Advisory')
  if ((data.uv ?? 0) > 7) triggers.push('High UV Exposure')
  if ((data.tempDrop ?? 0) > 10) triggers.push('Rapid Temperature Drop')
  if ((data.stormProbability ?? 0) > 40) triggers.push('Thunderstorm Probability High')
  return triggers
}
