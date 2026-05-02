import { NextRequest, NextResponse } from 'next/server'
import { loadStationSettings, saveStationSettings } from '@/lib/notificationCenter'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = await saveStationSettings(body)
  return NextResponse.json(result)
}

export async function GET() {
  const { settings, error } = await loadStationSettings()
  return NextResponse.json(error ? { ...settings, ok: false, error } : settings)
}
