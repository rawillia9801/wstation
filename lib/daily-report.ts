import { getLiveDashboardPayload } from '@/lib/live-data'
import { sendDailyReport } from '@/lib/mail-service'
import { patchSettings, readSettings } from '@/lib/settings-store'
import type { StationSettings } from '@/types/dashboard'

type RunDailyReportOptions = {
  force?: boolean
  source?: string
  now?: Date
}

const DEFAULT_ZONE = process.env.REPORT_TIME_ZONE || 'America/New_York'

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date)

  const value = (type: string) => parts.find((part) => part.type === type)?.value || '00'
  return {
    dateKey: `${value('year')}-${value('month')}-${value('day')}`,
    minutes: Number(value('hour')) * 60 + Number(value('minute'))
  }
}

function scheduledMinutes(settings: StationSettings) {
  const [hour = '7', minute = '0'] = String(settings.daily_report_time || '07:00').split(':')
  return Math.max(0, Math.min(23, Number(hour) || 0)) * 60 + Math.max(0, Math.min(59, Number(minute) || 0))
}

export function dailyReportDue(settings: StationSettings, now = new Date()) {
  const timeZone = settings.daily_report_timezone || DEFAULT_ZONE
  const local = localParts(now, timeZone)
  const scheduled = scheduledMinutes(settings)
  const scheduleWindow = Math.max(5, Number(process.env.REPORT_SEND_WINDOW_MINUTES || 7))
  const scheduledKey = `${local.dateKey}:${String(settings.daily_report_time || '07:00')}`

  return {
    due:
      settings.daily_report_enabled !== false &&
      local.minutes >= scheduled &&
      local.minutes < scheduled + scheduleWindow &&
      settings.last_daily_report_sent_key !== scheduledKey,
    dateKey: local.dateKey,
    scheduledKey,
    timeZone,
    localMinutes: local.minutes,
    scheduledMinutes: scheduled,
    scheduleWindow
  }
}

export async function runDailyReport(options: RunDailyReportOptions = {}) {
  const settings = await readSettings()
  const recipients = settings.notification_emails || []
  const due = dailyReportDue(settings, options.now || new Date())

  if (!settings.daily_report_enabled && !options.force) {
    return { ok: true, skipped: true, sentCount: 0, skippedCount: recipients.length, errors: [], reason: 'Daily report is disabled', due, recipients, source: options.source || 'manual' }
  }

  if (!recipients.length) {
    return { ok: false, skipped: true, sentCount: 0, skippedCount: 0, errors: ['No email recipients saved'], reason: 'No email recipients saved', due, recipients, source: options.source || 'manual' }
  }

  if (!options.force && !due.due) {
    return { ok: true, skipped: true, sentCount: 0, skippedCount: recipients.length, errors: [], reason: 'Daily report is not due yet', due, recipients, source: options.source || 'manual' }
  }

  const live = await getLiveDashboardPayload()
  const result = await sendDailyReport(settings, live)

  if (result.ok) {
    await patchSettings({
      last_daily_report_sent_date: due.dateKey,
      last_daily_report_sent_key: due.scheduledKey,
      last_daily_report_sent_at: new Date().toISOString()
    })
  }

  return {
    ok: result.ok,
    skipped: false,
    sentCount: result.ok ? recipients.length : 0,
    skippedCount: result.ok ? 0 : recipients.length,
    errors: result.ok ? [] : [result.error || 'Resend failed'],
    stage: 'resend_send',
    due,
    recipients,
    result,
    source: options.source || 'manual'
  }
}
