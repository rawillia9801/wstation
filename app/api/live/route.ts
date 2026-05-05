import { NextResponse } from 'next/server'
import { getLiveDashboardPayload } from '@/lib/live-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

let cachedPayload: any = null
let cachedAt = 0
const CACHE_MS = 60000

export async function GET() {
  const now = Date.now()

  if (cachedPayload && now - cachedAt < CACHE_MS) {
    return NextResponse.json(cachedPayload, {
      headers: {
        'Cache-Control': 'public, max-age=20, stale-while-revalidate=40'
      }
    })
  }

  const payload = await getLiveDashboardPayload()
  cachedPayload = payload
  cachedAt = now

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, max-age=20, stale-while-revalidate=40'
    }
  })
}
