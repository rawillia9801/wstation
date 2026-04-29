import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildDailyForecastEmail } from '@/lib/resendTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  const { data: settings } = await supabase.from('station_settings').select('*').limit(1).single()
  if (!settings) return NextResponse.json({ ok:false, error:'No settings found' })

  const recipients = [...(settings.notification_emails || [])]
  const payload = buildDailyForecastEmail({
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
  })

  if (recipients.length) {
    await resend.emails.send({
      from: 'Staley Climate <alerts@staleyclimate.info>',
      to: recipients,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  }

  return NextResponse.json({ ok:true, recipients })
}
