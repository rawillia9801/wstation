'use client'

import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import ForecastStrip from './ForecastStrip'

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      try {
        const s = await fetch('/api/station-data').then(r => r.json())
        const f = await fetch('/api/forecast-data').then(r => r.json())
        setStation(s)
        setForecast(f)
      } catch {}
    }
    load()
    const timer = setInterval(load, 60000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className='min-h-screen telemetry-grid relative overflow-hidden p-8'>
      <div className='scanline absolute inset-0 pointer-events-none' />
      <section className='relative z-10 max-w-7xl mx-auto space-y-8'>
        <div>
          <div className='text-cyan-400 tracking-[0.4em] text-sm mb-3'>LIVE PERSONAL WEATHER STATION</div>
          <h1 className='text-6xl font-black'>WSTATION COMMAND</h1>
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