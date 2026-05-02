import { NextResponse } from 'next/server'
import { fetchCurrentStationWeather } from '@/lib/weather'
import { archiveObservation } from '@/lib/archive'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const station = await fetchCurrentStationWeather()

    try {
      await archiveObservation(station)
    } catch (archiveError) {
      console.error('Observation archive failed', archiveError)
    }

    return NextResponse.json(station ?? {})
  } catch (error) {
    console.error('Station weather fetch failed', error)
    return NextResponse.json(
      { error: 'Unable to fetch station weather' },
      { status: 500 }
    )
  }
}
