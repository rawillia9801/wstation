import { NextResponse } from 'next/server'
import { evaluateAlarmTriggers, loadStationSettings, sendAlarmNotification } from '@/lib/notificationCenter'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { settings, error } = await loadStationSettings()
  if (error) return NextResponse.json({ ok: false, stage: 'settings_read', error })

  try {
    const triggers = await evaluateAlarmTriggers(settings)
    const notifications = []

    for (const trigger of triggers) {
      notifications.push(await sendAlarmNotification(settings, trigger.type, trigger.message))
    }

    return NextResponse.json({ ok: true, triggers, notifications })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      stage: 'evaluate_alarms',
      error: err?.message || 'Unknown alarm evaluation failure'
    })
  }
}
