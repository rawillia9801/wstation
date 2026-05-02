import { NextRequest, NextResponse } from 'next/server'
import { sendWeatherAlert } from '@/lib/mail-service'
import { readSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, message } = body

  const settings = await readSettings()
  if ('error' in settings) return NextResponse.json({ ok:false, error: settings.error })

  const recipients = [...(settings.notification_emails || [])]
  const result = await sendWeatherAlert(settings, type, message)

  return NextResponse.json({ ok:result.ok, sent:type, recipients, result })
}
