import { NextResponse } from 'next/server'
import { sendDailyWeatherSummary } from '@/lib/resend-alerts'
import { readSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const settings = await readSettings()
  if ('error' in settings) return NextResponse.json({ ok:false, stage:'settings_read', error: settings.error })

  const recipients = [...(settings.notification_emails || [])]

  if (!recipients.length) {
    return NextResponse.json({ ok:false, stage:'recipient_check', error:'No email recipients saved', recipients })
  }

  const payload = {
    temp: settings.current_temp || 0,
    humidity: settings.current_humidity || 0,
    pressure: settings.current_pressure || 0,
    wind: settings.current_wind || 0,
    uv: settings.current_uv || 0,
    high: settings.forecast_high || 0,
    low: settings.forecast_low || 0,
    summary: settings.forecast_summary || 'No summary',
    waterTemp: settings.water_temp || 67,
    waterQuality: settings.water_quality || 'GOOD',
    uvRisk: settings.uv_risk || 'LOW'
  }

  try {
    const resendResult = await sendDailyWeatherSummary(settings, payload)

    return NextResponse.json({
      ok:true,
      stage:'resend_send',
      recipients,
      resendResult
    })
  } catch (err:any) {
    return NextResponse.json({
      ok:false,
      stage:'resend_exception',
      recipients,
      error: err?.message || 'Unknown resend failure'
    })
  }
}
