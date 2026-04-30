import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildDailyForecastEmail } from '@/lib/resendTemplates'

function getClients() {
  const resendKey = process.env.RESEND_API_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!resendKey || !supabaseUrl || !supabaseKey) {
    return { error: 'Missing RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY' }
  }

  return {
    resend: new Resend(resendKey),
    supabase: createClient(supabaseUrl, supabaseKey)
  }
}

export async function GET() {
  const clients = getClients()
  if ('error' in clients) return NextResponse.json({ ok:false, stage:'env_check', error: clients.error }, { status: 503 })

  const { data: settings, error: settingsError } = await clients.supabase.from('station_settings').select('*').limit(1).single()

  if (settingsError) return NextResponse.json({ ok:false, stage:'supabase_read', error: settingsError.message })
  if (!settings) return NextResponse.json({ ok:false, stage:'settings_missing', error:'No settings found' })

  const recipients = [...(settings.notification_emails || [])]

  if (!recipients.length) {
    return NextResponse.json({ ok:false, stage:'recipient_check', error:'No email recipients saved', recipients })
  }

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

  try {
    const resendResult = await clients.resend.emails.send({
      from: 'Staley Climate <alerts@staleyclimate.info>',
      to: recipients,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })

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
