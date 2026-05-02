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
