import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { StationSettings } from '@/types/dashboard'

const STORE_PATH = path.join(process.cwd(), '.data', 'station-settings.json')

function supabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function cleanEmails(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.map((item) => String(item).trim()).filter(Boolean)))
}

export function normalizeSettings(input: StationSettings = {}): StationSettings {
  return {
    ...input,
    notification_emails: cleanEmails(input.notification_emails),
    notification_phones: Array.isArray(input.notification_phones) ? input.notification_phones : [],
    daily_report_time: String(input.daily_report_time || '07:00'),
    daily_report_enabled: input.daily_report_enabled !== false,
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

export async function readSettings() {
  const supabase = supabaseClient()
  if (!supabase) return readFileSettings()

  const { data, error } = await supabase.from('station_settings').select('*').limit(1).maybeSingle()
  if (error) {
    const fileSettings = await readFileSettings()
    return Object.keys(fileSettings).length ? fileSettings : { ok: false, error: error.message }
  }

  return normalizeSettings(data || await readFileSettings())
}

export async function saveSettings(input: StationSettings) {
  const payload = normalizeSettings(input)
  const supabase = supabaseClient()

  if (supabase) {
    const existing = await supabase.from('station_settings').select('id').limit(1).maybeSingle()
    if (existing.error) return { ok: false, stage: 'read_existing', error: existing.error.message }

    const query = existing.data?.id
      ? await supabase.from('station_settings').update(payload).eq('id', existing.data.id).select('*').single()
      : await supabase.from('station_settings').insert(payload).select('*').single()

    if (query.error) return { ok: false, stage: existing.data?.id ? 'update_existing' : 'insert_new', error: query.error.message, payload }

    await writeFileSettings(normalizeSettings(query.data || payload)).catch(() => undefined)
    return { ok: true, saved: normalizeSettings(query.data || payload), source: 'supabase' }
  }

  await writeFileSettings(payload)
  return { ok: true, saved: payload, source: 'file' }
}
