import { NextResponse } from 'next/server'
import { getLiveDashboardPayload } from '@/lib/live-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const payload = await getLiveDashboardPayload()
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
