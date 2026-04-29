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
    <main className="h-screen telemetry-grid overflow-hidden px-4 py-3">
      <section className="h-full w-full flex flex-col gap-3">
        <div className="h-[10%] grid grid-cols-2 gap-3">
          <div className="flex flex-col justify-center">
            <div className="text-cyan-400 tracking-[0.28em] text-[10px] mb-1">
              LIVE PERSONAL WEATHER STATION
            </div>
            <h1 className="text-4xl xl:text-6xl font-black leading-none">
              Staley Street Weather
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span>
            </p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>
        <div className="h-[32%] grid grid-cols-12 gap-3">
          <div className="col-span-7 h-full">
            <HeroConditionPanel
              condition="Rain"
              temperature={station?.imperial?.temp ?? '--'}
            />
          </div>
          <div className="col-span-5 h-full grid grid-cols-2 gap-3">
            <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
            <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
            <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>
        <div className="h-[30%] grid grid-cols-12 gap-3">
          <div className="col-span-8 h-full">
            <ForecastStrip periods={forecast} />
          </div>
          <div className="col-span-4 h-full">
            <MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" />
          </div>
        </div>
        <div className="h-[20%] grid grid-cols-12 gap-3">
          <div className="col-span-4 h-full">
            <RadarPanel />
          </div>
          <div className="col-span-3 h-full">
            <UVPanel uv={station?.uv ?? 2} />
          </div>
          <div className="col-span-5 h-full">
            <SunMoonPanel />
          </div>
        </div>
      </section>
    </main>
  )
}
