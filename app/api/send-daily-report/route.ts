import { NextRequest, NextResponse } from 'next/server'
import { runDailyReport } from '@/lib/daily-report'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get('force') === '1'
    const result = await runDailyReport({ force, source: force ? 'manual_force' : 'http_cron' })
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
