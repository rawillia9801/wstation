import { NextResponse } from 'next/server'
import { sendWeatherAlert, severeThresholds } from '@/lib/mail-service'
import { getLiveDashboardPayload } from '@/lib/live-data'
import { readSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const settings = await readSettings()
  if ('error' in settings) return NextResponse.json({ ok:false, error: settings.error, triggers: [] })

  const live = await getLiveDashboardPayload()
  const triggers = severeThresholds(live)

  for (const trigger of triggers) {
    await sendWeatherAlert(settings, trigger, `${trigger} exceeded configured abnormal weather threshold at Marion station.`)
  }

  return NextResponse.json({ ok:true, triggers })
}
