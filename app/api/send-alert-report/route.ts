import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildAlertEmail } from '@/lib/resendTemplates'

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

export async function POST(req: NextRequest) {
  const clients = getClients()
  if ('error' in clients) return NextResponse.json({ ok:false, error: clients.error }, { status: 503 })

  const body = await req.json()
  const { type, message } = body

  const { data: settings } = await clients.supabase.from('station_settings').select('*').limit(1).single()
  if (!settings) return NextResponse.json({ ok:false, error:'No settings found' })

  const recipients = [...(settings.notification_emails || [])]
  const payload = buildAlertEmail(type, message)

  if (recipients.length) {
    await clients.resend.emails.send({
      from: 'Staley Climate <alerts@staleyclimate.info>',
      to: recipients,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  }

  return NextResponse.json({ ok:true, sent:type, recipients })
}
