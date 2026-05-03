import { NextRequest, NextResponse } from 'next/server'
import { runDailyReport } from '@/lib/daily-report'
import { getLiveDashboardPayload } from '@/lib/live-data'
import { sendWeatherAlert, severeThresholds } from '@/lib/mail-service'
import { readSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function authorized(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET
  if (!configuredSecret) return true

  const suppliedSecret = req.nextUrl.searchParams.get('secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  return suppliedSecret === configuredSecret
}

async function runAlarmCheck() {
  const settings = await readSettings()
  const live = await getLiveDashboardPayload()
  const triggers = severeThresholds(live, settings)
  const results = []

  for (const trigger of triggers) {
    results.push(await sendWeatherAlert(settings, trigger, `${trigger} exceeded configured abnormal weather threshold at Marion station.`))
  }

  return {
    ok: results.every((result) => result.ok),
    triggers,
    sentCount: results.filter((result) => result.ok).length,
    results
  }
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'Invalid cron secret' }, { status: 401 })
  }

  const startedAt = new Date().toISOString()
  const dailyReport = await runDailyReport({ source: 'hostinger_cron_url' }).catch((error: any) => ({
    ok: false,
    error: error?.message || 'Daily report cron failed'
  }))
  const alarms = await runAlarmCheck().catch((error: any) => ({
    ok: false,
    error: error?.message || 'Alarm cron failed',
    triggers: []
  }))

  return NextResponse.json({
    ok: Boolean(dailyReport.ok) && Boolean(alarms.ok),
    startedAt,
    finishedAt: new Date().toISOString(),
    dailyReport,
    alarms
  })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
