import { NextRequest, NextResponse } from 'next/server'
import { sendSevereWeatherAlert } from '@/lib/resend-alerts'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const emails = String(body.email || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
  const result = await sendSevereWeatherAlert(
    {
      notification_emails: emails,
      abnormal_alerts_enabled: body.severe !== false
    },
    'Manual Test Alert',
    'This is a Resend wiring test from the Staley Street Weather alarm center.',
    emails[0]
  )

  return NextResponse.json(result)
}
