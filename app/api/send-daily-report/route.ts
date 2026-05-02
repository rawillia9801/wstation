import { NextRequest, NextResponse } from 'next/server'
import { runDailyReport } from '@/lib/daily-report'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const configuredSecret = process.env.CRON_SECRET
    const suppliedSecret = req.nextUrl.searchParams.get('secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (configuredSecret && suppliedSecret !== configuredSecret) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        sentCount: 0,
        skippedCount: 0,
        errors: ['Invalid cron secret'],
        source: 'hostinger_cron'
      }, { status: 401 })
    }

    const force = req.nextUrl.searchParams.get('force') === '1'
    const result = await runDailyReport({ force, source: force ? 'manual_force' : 'hostinger_cron' })
    return NextResponse.json(result)
  } catch (err:any) {
    return NextResponse.json({
      ok:false,
      stage:'daily_report_exception',
      error: err?.message || 'Unknown resend failure'
    })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
