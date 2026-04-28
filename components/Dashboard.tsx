'use client'

import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import TopStatusBar from './TopStatusBar'
import MoonPhasePanel from './MoonPhasePanel'
import HeroConditionPanel from './HeroConditionPanel'
import ForecastStrip from './ForecastStrip'

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [updatedAt, setUpdatedAt] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const stationResponse = await fetch('/api/station')
        const forecastResponse = await fetch('/api/forecast')

        setStation(await stationResponse.json())
        setForecast(await forecastResponse.json())
        setUpdatedAt(new Date().toLocaleTimeString())
      } catch (e) {
        console.error(e)
      }
    }

    load()
    const timer = setInterval(load, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className='min-h-screen telemetry-grid relative overflow-hidden p-8'>
      <div className='scanline absolute inset-0 pointer-events-none' />
      <section className='relative z-10 max-w-7xl mx-auto space-y-8'>
        <TopStatusBar updatedAt={updatedAt} />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <HeroConditionPanel
              condition={station?.solarRadiation ? 'Live Atmospheric Conditions' : 'Loading conditions'}
              temperature={station?.imperial?.temp ?? '--'}
            />
          </div>
          <MoonPhasePanel moonPhase='Waxing Gibbous' illumination='71%' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <MetricCard title='Temperature' value={station?.imperial?.temp ?? '--'} unit='°F' />
          <MetricCard title='Humidity' value={station?.humidity ?? '--'} unit='%' />
          <MetricCard title='Pressure' value={station?.imperial?.pressure ?? '--'} unit='inHg' />
          <MetricCard title='Wind' value={station?.imperial?.windSpeed ?? '--'} unit='mph' />
        </div>

        <ForecastStrip periods={forecast} />
      </section>
    </main>
  )
}