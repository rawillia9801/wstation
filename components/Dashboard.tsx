'use client'

import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import TopStatusBar from './TopStatusBar'
import MoonPhasePanel from './MoonPhasePanel'
import HeroConditionPanel from './HeroConditionPanel'
import ForecastStrip from './ForecastStrip'
import NavPills from './NavPills'
import UVPanel from './UVPanel'
import RadarPanel from './RadarPanel'
import SunMoonPanel from './SunMoonPanel'

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
    <main className='min-h-screen telemetry-grid relative overflow-hidden px-4 py-3'>
      <div className='scanline absolute inset-0 pointer-events-none' />
      <section className='relative z-10 max-w-[1500px] mx-auto space-y-3'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 items-start'>
          <div>
            <div className='text-cyan-400 tracking-[0.35em] text-sm mb-1'>LIVE PERSONAL WEATHER STATION</div>
            <h1 className='text-7xl xl:text-8xl font-black leading-none'>Staley Street Weather</h1>
            <p className='text-slate-300 mt-2 text-xl'>Marion, Virginia • Station KVAMARIO42 • <span className='text-green-400'>LIVE</span></p>
          </div>
          <div className='space-y-3'>
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-3'>
          <div className='lg:col-span-7'>
            <HeroConditionPanel condition='Rain' temperature={station?.imperial?.temp ?? '--'} />
          </div>
          <div className='lg:col-span-5 grid grid-cols-2 gap-3'>
            <MetricCard title='Humidity' value={station?.humidity ?? '--'} unit='%' />
            <MetricCard title='Pressure' value={station?.imperial?.pressure ?? '--'} unit='inHg' />
            <MetricCard title='Wind' value={station?.imperial?.windSpeed ?? '--'} unit='mph' />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-3'>
          <div className='lg:col-span-8'><ForecastStrip periods={forecast} /></div>
          <div className='lg:col-span-4'><MoonPhasePanel moonPhase='Waning Gibbous' illumination='76%' /></div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-3'>
          <div className='lg:col-span-4'><RadarPanel /></div>
          <div className='lg:col-span-3'><UVPanel uv={station?.uv ?? 2} /></div>
          <div className='lg:col-span-5'><SunMoonPanel /></div>
        </div>
      </section>
    </main>
  )
}