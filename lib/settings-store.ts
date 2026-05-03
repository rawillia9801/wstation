import { mkdir, readFile, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import type { StationSettings } from '@/types/dashboard'

const STORE_PATHS = [
  process.env.SETTINGS_STORE_PATH,
  process.env.HOME ? path.join(process.env.HOME, '.wstation', 'station-settings.json') : undefined,
  path.join(process.cwd(), '.data', 'station-settings.json'),
  path.join(os.tmpdir(), 'wstation-settings.json')
].filter(Boolean) as string[]

function cleanEmails(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)))
}

function cleanPhones(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)))
}

function numberValue(value: unknown, fallback: number) {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback
}

const defaultSections = {
  current: true,
  forecast: true,
  airQuality: true,
  astronomy: true,
  precipitation: true,
  stationStatus: true,
  alerts: true
}

const defaultAlarmThresholds = {
  windMph: 30,
  tempPercent: 10,
  humidityPercent: 15,
  changeWindowMinutes: 60,
  snowInches: 1,
  precipRateInches: 1,
  freezeTempF: 32
}

export function normalizeSettings(input: StationSettings = {}): StationSettings {
  const thresholds = typeof input.alarm_thresholds === 'object' && input.alarm_thresholds ? input.alarm_thresholds : {}

  return {
    ...input,
    notification_emails: cleanEmails(input.notification_emails),
    notification_phones: cleanPhones(input.notification_phones),
    sms_enabled: input.sms_enabled === true,
    daily_report_time: String(input.daily_report_time || '07:00'),
    daily_report_timezone: String(input.daily_report_timezone || process.env.REPORT_TIME_ZONE || 'America/New_York'),
    last_daily_report_sent_date: typeof input.last_daily_report_sent_date === 'string' ? input.last_daily_report_sent_date : undefined,
    last_daily_report_sent_key: typeof input.last_daily_report_sent_key === 'string' ? input.last_daily_report_sent_key : undefined,
    last_daily_report_sent_at: typeof input.last_daily_report_sent_at === 'string' ? input.last_daily_report_sent_at : undefined,
    daily_report_enabled: input.daily_report_enabled !== false,
    daily_report_sections: {
      ...defaultSections,
      ...(typeof input.daily_report_sections === 'object' && input.daily_report_sections ? input.daily_report_sections : {})
    },
    abnormal_alerts_enabled: input.abnormal_alerts_enabled !== false,
    alarm_thresholds: {
      windMph: numberValue(thresholds.windMph, defaultAlarmThresholds.windMph),
      tempPercent: numberValue(thresholds.tempPercent, defaultAlarmThresholds.tempPercent),
      humidityPercent: numberValue(thresholds.humidityPercent, defaultAlarmThresholds.humidityPercent),
      changeWindowMinutes: numberValue(thresholds.changeWindowMinutes, defaultAlarmThresholds.changeWindowMinutes),
      snowInches: numberValue(thresholds.snowInches, defaultAlarmThresholds.snowInches),
      precipRateInches: numberValue(thresholds.precipRateInches, defaultAlarmThresholds.precipRateInches),
      freezeTempF: numberValue(thresholds.freezeTempF, defaultAlarmThresholds.freezeTempF)
    },
    site_title: String(input.site_title || 'Staley Street Weather'),
    station_label: String(input.station_label || 'KVAMARIO42'),
    station_location: String(input.station_location || 'Marion, Virginia')
  }
}

async function readFileSettings() {
  for (const storePath of STORE_PATHS) {
    try {
      return normalizeSettings(JSON.parse(await readFile(storePath, 'utf8')))
    } catch {
      // Try the next configured store location.
    }
  }

  return normalizeSettings({})
}

async function writeFileSettings(settings: StationSettings) {
  const errors: string[] = []

  for (const storePath of STORE_PATHS) {
    try {
      await mkdir(path.dirname(storePath), { recursive: true })
      await writeFile(storePath, JSON.stringify(settings, null, 2))
      return storePath
    } catch (error: any) {
      errors.push(`${storePath}: ${error?.message || 'write failed'}`)
    }
  }

  throw new Error(errors.join('; ') || 'No writable settings store found')
}

async function saveToFile(payload: StationSettings, source = 'file') {
  try {
    const storePath = await writeFileSettings(payload)
    return { ok: true, saved: payload, source, store: storePath }
  } catch (error: any) {
    return { ok: false, saved: payload, source, error: error?.message || 'Settings store is not writable' }
  }
}

export async function readSettings() {
  return readFileSettings()
}

export async function saveSettings(input: StationSettings) {
  const payload = normalizeSettings(input)
  return saveToFile(payload)
}

export async function patchSettings(input: StationSettings) {
  const current = await readSettings()
  return saveSettings({ ...current, ...input })
}
