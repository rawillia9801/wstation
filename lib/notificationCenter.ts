import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildAlertEmail, buildDailyForecastEmail } from './resendTemplates'
import { fetchCurrentStationWeather } from './weather'
import { fetchNOAAForecast } from './forecast'
import { archiveObservation } from './archive'
import { normalizeWeather } from './dashboardData'

export type AlarmThresholds = {
  windMph: number
  tempPercent: number
  humidityPercent: number
  changeWindowMinutes: number
  snowInches: number
  precipRateInches: number
  freezeTempF: number
}

export type StationSettings = {
  id?: string
  notification_emails: string[]
  notification_phones: string[]
  daily_report_time: string
  daily_report_enabled: boolean
  abnormal_alerts_enabled: boolean
  site_title: string
  station_label: string
  station_location: string
  timezone: string
  sms_enabled: boolean
  alarm_thresholds: AlarmThresholds
  last_daily_report_date?: string | null
}

export const defaultAlarmThresholds: AlarmThresholds = {
  windMph: 30,
  tempPercent: 10,
  humidityPercent: 15,
  changeWindowMinutes: 60,
  snowInches: 1,
  precipRateInches: 1,
  freezeTempF: 32
}

export const defaultSettings: StationSettings = {
  notification_emails: [],
  notification_phones: [],
  daily_report_time: '07:00',
  daily_report_enabled: true,
  abnormal_alerts_enabled: true,
  site_title: 'Staley Street Weather',
  station_label: 'KVAMARI042',
  station_location: 'Marion, Virginia',
  timezone: 'America/New_York',
  sms_enabled: false,
  alarm_thresholds: defaultAlarmThresholds,
  last_daily_report_date: null
}

export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function boolValue(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function numberValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback
}

export function normalizeSettings(row: any): StationSettings {
  const thresholds = row?.alarm_thresholds ?? {}

  return {
    ...defaultSettings,
    ...row,
    notification_emails: arrayOfStrings(row?.notification_emails),
    notification_phones: arrayOfStrings(row?.notification_phones),
    daily_report_time: String(row?.daily_report_time || defaultSettings.daily_report_time),
    daily_report_enabled: boolValue(row?.daily_report_enabled, defaultSettings.daily_report_enabled),
    abnormal_alerts_enabled: boolValue(row?.abnormal_alerts_enabled, defaultSettings.abnormal_alerts_enabled),
    site_title: String(row?.site_title || defaultSettings.site_title),
    station_label: String(row?.station_label || defaultSettings.station_label),
    station_location: String(row?.station_location || defaultSettings.station_location),
    timezone: String(row?.timezone || defaultSettings.timezone),
    sms_enabled: boolValue(row?.sms_enabled, defaultSettings.sms_enabled),
    alarm_thresholds: {
      windMph: numberValue(thresholds.windMph, defaultAlarmThresholds.windMph),
      tempPercent: numberValue(thresholds.tempPercent, defaultAlarmThresholds.tempPercent),
      humidityPercent: numberValue(thresholds.humidityPercent, defaultAlarmThresholds.humidityPercent),
      changeWindowMinutes: numberValue(thresholds.changeWindowMinutes, defaultAlarmThresholds.changeWindowMinutes),
      snowInches: numberValue(thresholds.snowInches, defaultAlarmThresholds.snowInches),
      precipRateInches: numberValue(thresholds.precipRateInches, defaultAlarmThresholds.precipRateInches),
      freezeTempF: numberValue(thresholds.freezeTempF, defaultAlarmThresholds.freezeTempF)
    },
    last_daily_report_date: row?.last_daily_report_date ?? null
  }
}

export async function loadStationSettings() {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { settings: defaultSettings, supabase: null, error: null as string | null }

  const query = await supabase.from('station_settings').select('*').limit(1).maybeSingle()
  if (query.error) return { settings: defaultSettings, supabase, error: query.error.message }

  return { settings: normalizeSettings(query.data || {}), supabase, error: null as string | null }
}

export async function saveStationSettings(input: Partial<StationSettings>) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return { ok: false, stage: 'env_missing', error: 'Settings service is not configured' }

  const payload = normalizeSettings(input)
  const existingQuery = await supabase.from('station_settings').select('id').limit(1).maybeSingle()

  if (existingQuery.error) return { ok: false, stage: 'read_existing', error: existingQuery.error.message }

  const savePayload = {
    notification_emails: payload.notification_emails,
    notification_phones: payload.notification_phones,
    daily_report_time: payload.daily_report_time,
    daily_report_enabled: payload.daily_report_enabled,
    abnormal_alerts_enabled: payload.abnormal_alerts_enabled,
    site_title: payload.site_title,
    station_label: payload.station_label,
    station_location: payload.station_location,
    timezone: payload.timezone,
    sms_enabled: payload.sms_enabled,
    alarm_thresholds: payload.alarm_thresholds
  }

  const writeQuery = existingQuery.data?.id
    ? await supabase.from('station_settings').update(savePayload).eq('id', existingQuery.data.id)
    : await supabase.from('station_settings').insert(savePayload)

  if (writeQuery.error) return { ok: false, stage: 'write_settings', error: writeQuery.error.message, payload: savePayload }

  const verifyQuery = await supabase.from('station_settings').select('*').limit(1).maybeSingle()
  return { ok: true, saved: normalizeSettings(verifyQuery.data || savePayload) }
}

export function todayInTimezone(timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
}

export function currentTimeInTimezone(timezone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date())
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
    results.push({ phone, ok: response.ok, status: response.status })
  }

  return { skipped: false, results }
}

export async function sendDailyReport(settings: StationSettings) {
  if (!process.env.RESEND_API_KEY) return { ok: false, stage: 'env_missing', error: 'RESEND_API_KEY is missing' }
  if (!settings.notification_emails.length) return { ok: false, stage: 'recipient_check', error: 'No email recipients saved' }

  const [station, forecast] = await Promise.all([fetchCurrentStationWeather(), fetchNOAAForecast()])
  await archiveObservation(station)
  const weather = normalizeWeather(station, forecast)
  const payload = buildDailyForecastEmail({
    temp: weather.temp.toFixed(1),
    humidity: Math.round(weather.humidity),
    pressure: weather.pressure.toFixed(2),
    wind: Math.round(weather.wind),
    uv: Math.round(weather.uv),
    high: Math.round(weather.high),
    low: Math.round(weather.low),
    summary: weather.forecast[0]?.condition || 'No summary',
    waterTemp: 67,
    waterQuality: 'GOOD',
    uvRisk: weather.uv > 7 ? 'HIGH' : 'LOW'
  })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const resendResult = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Staley Climate <alerts@staleyclimate.info>',
    to: settings.notification_emails,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  })

  return { ok: true, recipients: settings.notification_emails, resendResult }
}

async function getHistoricalComparison(settings: StationSettings) {
  const supabase = getSupabaseAdmin()
  if (!supabase) return null

  const since = new Date(Date.now() - settings.alarm_thresholds.changeWindowMinutes * 60 * 1000).toISOString()
  const query = await supabase
    .from('weather_observations')
    .select('temp, humidity, created_at')
    .lte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return query.data || null
}

function percentChange(current: number, previous: number) {
  if (!Number.isFinite(previous) || previous === 0) return 0
  return Math.abs(((current - previous) / previous) * 100)
}

export async function evaluateAlarmTriggers(settings: StationSettings) {
  if (!settings.abnormal_alerts_enabled) return []

  const station = await fetchCurrentStationWeather()
  await archiveObservation(station)
  const current = normalizeWeather(station, [])
  const thresholds = settings.alarm_thresholds
  const triggers: Array<{ type: string; message: string }> = []

  if (current.windGust >= thresholds.windMph || current.wind >= thresholds.windMph) {
    triggers.push({
      type: 'Wind Threshold',
      message: `Wind reached ${Math.round(Math.max(current.wind, current.windGust))} mph, meeting the ${thresholds.windMph} mph threshold.`
    })
  }

  const precipRate = station?.imperial?.precipRate ?? 0
  if (precipRate >= thresholds.precipRateInches) {
    triggers.push({
      type: 'Heavy Rain',
      message: `Precipitation rate reached ${precipRate} in/hr, meeting the ${thresholds.precipRateInches} in/hr threshold.`
    })
  }

  if (current.temp <= thresholds.freezeTempF && precipRate > 0) {
    triggers.push({
      type: 'Freeze / Ice Risk',
      message: `Temperature is ${current.temp.toFixed(1)}F with active precipitation.`
    })
  }

  const snow = station?.imperial?.snow ?? station?.imperial?.snowDepth ?? 0
  if (snow >= thresholds.snowInches) {
    triggers.push({
      type: 'Snow Accumulation',
      message: `Snow accumulation reached ${snow} inches, meeting the ${thresholds.snowInches} inch threshold.`
    })
  }

  const previous = await getHistoricalComparison(settings)
  if (previous) {
    const tempMove = percentChange(current.temp, Number(previous.temp))
    const humidityMove = percentChange(current.humidity, Number(previous.humidity))

    if (tempMove >= thresholds.tempPercent) {
      triggers.push({
        type: 'Rapid Temperature Change',
        message: `Temperature moved ${tempMove.toFixed(1)}% within ${thresholds.changeWindowMinutes} minutes.`
      })
    }

    if (humidityMove >= thresholds.humidityPercent) {
      triggers.push({
        type: 'Rapid Humidity Change',
        message: `Humidity moved ${humidityMove.toFixed(1)}% within ${thresholds.changeWindowMinutes} minutes.`
      })
    }
  }

  return triggers
}

export async function sendAlarmNotification(settings: StationSettings, type: string, message: string) {
  const payload = buildAlertEmail(type, message)
  const results: Record<string, unknown> = {}

  if (process.env.RESEND_API_KEY && settings.notification_emails.length) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    results.email = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Staley Climate <alerts@staleyclimate.info>',
      to: settings.notification_emails,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  }

  if (settings.sms_enabled) {
    results.sms = await sendSms(settings.notification_phones, payload.text)
  }

  return {
    ok: true,
    type,
    emailRecipients: settings.notification_emails,
    smsRecipients: settings.sms_enabled ? settings.notification_phones : [],
    results
  }
}
