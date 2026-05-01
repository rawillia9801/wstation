import { NextResponse } from 'next/server'
import { sendSevereWeatherAlert, severeThresholds } from '@/lib/resend-alerts'
import { readSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function numberSetting(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export async function GET() {
  const settings = await readSettings()
  if ('error' in settings) return NextResponse.json({ ok:false, error: settings.error, triggers: [] })

  const triggers = severeThresholds({
    wind: numberSetting(settings.current_wind),
    uv: numberSetting(settings.current_uv),
    tempDrop: numberSetting(settings.current_temp_drop),
    stormProbability: numberSetting(settings.current_storm_probability)
  })

  for (const trigger of triggers) {
    await sendSevereWeatherAlert(settings, trigger, `${trigger} exceeded configured abnormal weather threshold at Marion station.`)
  }

  return NextResponse.json({ ok:true, triggers })
}
