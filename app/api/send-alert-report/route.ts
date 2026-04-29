import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { buildAlertEmail } from '@/lib/resendTemplates'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, message } = body

  const { data: settings } = await supabase.from('station_settings').select('*').limit(1).single()
  if (!settings) return NextResponse.json({ ok:false, error:'No settings found' })

  const recipients = [...(settings.notification_emails || [])]
  const payload = buildAlertEmail(type, message)

  if (recipients.length) {
    await resend.emails.send({
      from: 'Staley Climate <alerts@staleyclimate.info>',
      to: recipients,
      subject: payload.subject,
      html: payload.html,
      text: payload.text
    })
  }

  return NextResponse.json({ ok:true, sent:type, recipients })
}
