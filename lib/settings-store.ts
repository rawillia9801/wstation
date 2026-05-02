import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { StationSettings } from '@/types/dashboard'

const STORE_PATH = path.join(process.cwd(), '.data', 'station-settings.json')

function cleanEmails(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)))
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

export function normalizeSettings(input: StationSettings = {}): StationSettings {
  return {
    ...input,
    notification_emails: cleanEmails(input.notification_emails),
    notification_phones: Array.isArray(input.notification_phones) ? input.notification_phones : [],
    daily_report_time: String(input.daily_report_time || '07:00'),
    daily_report_enabled: input.daily_report_enabled !== false,
    daily_report_sections: {
      ...defaultSections,
      ...(typeof input.daily_report_sections === 'object' && input.daily_report_sections ? input.daily_report_sections : {})
    },
    abnormal_alerts_enabled: input.abnormal_alerts_enabled !== false
  }
}

async function readFileSettings() {
  try {
    return normalizeSettings(JSON.parse(await readFile(STORE_PATH, 'utf8')))
  } catch {
    return {}
  }
}

async function writeFileSettings(settings: StationSettings) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true })
  await writeFile(STORE_PATH, JSON.stringify(settings, null, 2))
}

async function saveToFile(payload: StationSettings, source = 'file') {
  await writeFileSettings(payload)
  return { ok: true, saved: payload, source }
}

export async function readSettings() {
  return readFileSettings()
}

export async function saveSettings(input: StationSettings) {
  const payload = normalizeSettings(input)
  return saveToFile(payload)
}
