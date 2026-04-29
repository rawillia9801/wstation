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
    <main className="h-screen telemetry-grid overflow-hidden px-3 py-2">
      <section className="h-full w-full flex flex-col gap-2">
        <div className="h-[8%] grid grid-cols-2 gap-2">
          <div className="flex flex-col justify-center">
            <div className="text-cyan-400 tracking-[0.24em] text-[9px] mb-0.5">LIVE PERSONAL WEATHER STATION</div>
            <h1 className="text-3xl xl:text-5xl font-black leading-none">Staley Street Weather</h1>
            <p className="text-slate-300 text-xs mt-0.5">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
          </div>
          <div className="flex flex-col justify-center gap-1">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>
        <div className="h-[28%] grid grid-cols-12 gap-2">
          <div className="col-span-5 h-full">
            <HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} />
          </div>
          <div className="col-span-7 h-full grid grid-cols-4 gap-2">
            <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
            <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
            <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>
        <div className="h-[27%] grid grid-cols-12 gap-2">
          <div className="col-span-9 h-full">
            <ForecastStrip periods={forecast} />
          </div>
          <div className="col-span-3 h-full">
            <MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" />
          </div>
        </div>
        <div className="h-[19%] grid grid-cols-12 gap-2">
          <div className="col-span-4 h-full"><RadarPanel /></div>
          <div className="col-span-2 h-full"><UVPanel uv={station?.uv ?? 2} /></div>
          <div className="col-span-6 h-full"><SunMoonPanel /></div>
        </div>
      </section>
    </main>
  )
}
