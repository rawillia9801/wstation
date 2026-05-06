import { NextResponse } from 'next/server'
import { getWeatherData } from '@/lib/weather-provider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const weather = await getWeatherData()
  return NextResponse.json(weather, {
    headers: {
      'cache-control': 'no-store, max-age=0'
    }
  })
}
