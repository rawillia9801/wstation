import { NextResponse } from 'next/server'
import { fetchCurrentStationWeather } from '@/lib/weather'
import { archiveObservation, fetchLatestArchivedObservation } from '@/lib/archive'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function safeArchivedStation() {
  try {
    return await fetchLatestArchivedObservation()
  } catch (error) {
    console.error('Station archive recovery failed', error)
    return null
  }
}

export async function GET() {
  try {
    const station = await fetchCurrentStationWeather()

    try {
      await archiveObservation(station)
    } catch (archiveError) {
      console.error('Observation archive failed', archiveError)
    }

    if (station && Object.keys(station).length) {
      return NextResponse.json(station, {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      })
    }

    const archivedStation = await safeArchivedStation()
    return NextResponse.json(archivedStation ?? { error: 'Live station observation unavailable' }, {
      status: archivedStation ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error) {
    console.error('Station weather fetch failed', error)
    const archivedStation = await safeArchivedStation()
    return NextResponse.json(archivedStation ?? { error: 'Live station observation unavailable' }, {
      status: archivedStation ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  }
}
