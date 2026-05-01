import { NextResponse } from 'next/server'
import { fetchCurrentStationWeather } from '@/lib/weather'
import { archiveObservation, fetchLatestArchivedObservation } from '@/lib/archive'

async function safeArchivedStation() {
  try {
    return await fetchLatestArchivedObservation()
  } catch (error) {
    console.error('Station archive fallback failed', error)
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
      return NextResponse.json(station)
    }

    const archivedStation = await safeArchivedStation()
    return NextResponse.json(archivedStation ?? {})
  } catch (error) {
    console.error('Station weather fetch failed', error)
    const archivedStation = await safeArchivedStation()
    return NextResponse.json(archivedStation ?? {})
  }
}
