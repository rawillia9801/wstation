import { NextRequest, NextResponse } from 'next/server'
import {
  currentTimeInTimezone,
  evaluateAlarmTriggers,
  loadStationSettings,
  sendAlarmNotification,
  sendDailyReport,
  todayInTimezone
} from '@/lib/notificationCenter'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}` || req.nextUrl.searchParams.get('secret') === secret
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { settings, supabase, error } = await loadStationSettings()
  if (error) return NextResponse.json({ ok: false, stage: 'settings_read', error })

  const today = todayInTimezone(settings.timezone)
  const now = currentTimeInTimezone(settings.timezone)
  const work: Record<string, unknown> = {
    timezone: settings.timezone,
    checkedAt: now,
    dailyReport: 'skipped',
    alarms: []
  }

  if (
    settings.daily_report_enabled &&
    now === settings.daily_report_time &&
    settings.last_daily_report_date !== today
  ) {
    work.dailyReport = await sendDailyReport(settings)

    if (supabase && settings.id) {
      await supabase
        .from('station_settings')
        .update({ last_daily_report_date: today })
        .eq('id', settings.id)
    }
  }

  const triggers = await evaluateAlarmTriggers(settings)
  const notifications = []
  for (const trigger of triggers) {
    notifications.push(await sendAlarmNotification(settings, trigger.type, trigger.message))
  }
  work.alarms = notifications

  return NextResponse.json({ ok: true, ...work })
}
