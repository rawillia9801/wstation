import { NextResponse } from 'next/server'
import { fetchNOAAForecast } from '@/lib/forecast'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const forecast = await fetchNOAAForecast()
    return NextResponse.json(forecast ?? [])
  } catch (error) {
    console.error('Forecast fetch failed', error)
    return NextResponse.json([], { status: 500 })
  }
}
