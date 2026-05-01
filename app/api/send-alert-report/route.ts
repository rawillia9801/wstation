import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendSevereWeatherAlert } from '@/lib/resend-alerts'

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, stage: 'env_missing', error: 'Notification service is not configured' })
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const body = await req.json()
  const { type, message } = body

  const { data: settings } = await supabase.from('station_settings').select('*').limit(1).single()
  if (!settings) return NextResponse.json({ ok:false, error:'No settings found' })

  const recipients = [...(settings.notification_emails || [])]
  const result = await sendSevereWeatherAlert(settings, type, message)

  return NextResponse.json({ ok:true, sent:type, recipients, result })
}
