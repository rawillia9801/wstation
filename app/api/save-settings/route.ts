import { NextRequest, NextResponse } from 'next/server'
import { readSettings, saveSettings } from '@/lib/settings-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const result = await saveSettings(body)
  return NextResponse.json(result)
}

export async function GET() {
  const settings = await readSettings()
  return NextResponse.json(settings)
}
