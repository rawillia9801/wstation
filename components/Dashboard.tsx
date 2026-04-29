'use client'
import { useEffect, useState } from 'react'
import MetricCard from './MetricCard'
import TopStatusBar from './TopStatusBar'
import MoonPhasePanel from './MoonPhasePanel'
import HeroConditionPanel from './HeroConditionPanel'
import ForecastStrip from './ForecastStrip'
import NavPills from './NavPills'
import UVPanel from './UVPanel'

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
    const timer = setInterval(load, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="h-screen telemetry-grid overflow-hidden px-2 py-2 scale-[0.72] origin-top-left w-[138%]">
      <section className="h-full w-full flex flex-col gap-2">
        <div className="h-[14%] grid grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center pt-1">
            <div className="text-cyan-400 tracking-[0.22em] text-[8px] mb-1">LIVE PERSONAL WEATHER STATION</div>
            <h1 className="text-2xl xl:text-4xl font-black leading-none">Staley Street Weather</h1>
            <p className="text-slate-300 text-[10px] mt-1">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
          </div>
          <div className="flex flex-col justify-center gap-1 pt-1">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>
        <div className="h-[34%] grid grid-cols-12 gap-1.5 mt-2">
          <div className="col-span-5 h-full">
            <HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} />
          </div>
          <div className="col-span-7 h-full grid grid-cols-4 gap-1.5">
            <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
            <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
            <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>
        <div className="h-[34%] grid grid-cols-12 gap-1.5 mt-1">
          <div className="col-span-9 h-full">
            <ForecastStrip periods={forecast} />
          </div>
          <div className="col-span-3 h-full">
            <MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" />
          </div>
        </div>
        <div className="h-[4%] mt-1 flex items-center justify-between text-[8px] text-cyan-300 px-2 border-t border-cyan-400/20">
          <span>Station Online • Ambient Weather API • NOAA Forecast Sync</span>
          <span>Auto Refresh 8s</span>
        </div>
      </section>
    </main>
  )
}
