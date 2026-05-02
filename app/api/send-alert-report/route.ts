import { NextRequest, NextResponse } from 'next/server'
import { loadStationSettings, sendAlarmNotification } from '@/lib/notificationCenter'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { settings, error } = await loadStationSettings()
  if (error) return NextResponse.json({ ok: false, stage: 'settings_read', error })

  const body = await req.json()
  const type = String(body.type || 'Weather Alarm')
  const message = String(body.message || 'A configured weather alarm was triggered.')

  try {
    return NextResponse.json(await sendAlarmNotification(settings, type, message))
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      stage: 'send_alarm_notification',
      error: err?.message || 'Unknown alarm notification failure'
    })
  }
}
