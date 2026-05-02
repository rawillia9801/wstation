import { NextResponse } from 'next/server'
import { loadStationSettings, sendDailyReport } from '@/lib/notificationCenter'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { settings, error } = await loadStationSettings()
  if (error) return NextResponse.json({ ok: false, stage: 'settings_read', error })

  try {
    return NextResponse.json(await sendDailyReport(settings))
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      stage: 'send_daily_report',
      error: err?.message || 'Unknown report failure'
    })
  }
}
