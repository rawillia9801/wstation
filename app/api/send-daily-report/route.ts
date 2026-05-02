import { NextResponse } from 'next/server'
import { sendDailyReport } from '@/lib/mail-service'
import { getLiveDashboardPayload } from '@/lib/live-data'
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

  try {
    const live = await getLiveDashboardPayload()
    const resendResult = await sendDailyReport(settings, live)

    return NextResponse.json({
      ok:resendResult.ok,
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
