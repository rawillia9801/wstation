import { NextRequest, NextResponse } from 'next/server'
import { sendSevereWeatherAlert } from '@/lib/resend-alerts'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const result = await sendSevereWeatherAlert(
    {
      notification_emails: body.email ? [body.email] : [],
      abnormal_alerts_enabled: body.severe !== false
    },
    'Manual Test Alert',
    'This is a Resend wiring test from the Staley Street Weather alarm center.',
    body.email
  )

  return NextResponse.json(result)
}
