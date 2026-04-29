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
    <main className="h-screen telemetry-grid overflow-hidden px-2 py-3 scale-[0.72] origin-top-left w-[138%]">
      <section className="h-full w-full flex flex-col gap-3">
        <div className="h-[18%] grid grid-cols-2 gap-1.5">
          <div className="flex flex-col justify-center pt-2">
            <div className="text-cyan-400 tracking-[0.22em] text-[8px] mb-1">LIVE PERSONAL WEATHER STATION</div>
            <h1 className="text-2xl xl:text-4xl font-black leading-none">Staley Street Weather</h1>
            <p className="text-slate-300 text-[10px] mt-1">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
          </div>
          <div className="flex flex-col justify-center gap-1 pt-2">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>
        <div className="h-[24%] grid grid-cols-12 gap-1.5 mt-1">
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
        <div className="h-[20%] grid grid-cols-12 gap-1.5 mt-1">
          <div className="col-span-9 h-full">
            <ForecastStrip periods={forecast} />
          </div>
          <div className="col-span-3 h-full">
            <MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" />
          </div>
        </div>
        <div className="h-[24%] rounded-2xl border border-cyan-400/30 bg-slate-950/70 px-5 py-4 flex flex-col justify-center overflow-hidden mt-1">
          <div className="text-cyan-400 tracking-[0.22em] text-[10px] mb-2">HUNGRY MOTHER STATE PARK SWIM ADVISORY</div>
          <div className="text-white text-lg font-bold mb-2">Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM</div>
          <div className="whitespace-nowrap animate-[marquee_28s_linear_infinite] text-slate-200 text-sm">
            Families can expect cool but comfortable shoreline conditions today • UV remains low for tanning with periodic cloud breaks • No harmful algae advisories reported • Light breeze across the lake • Surface temperature holding in the upper 60s • Best swimming conditions expected mid afternoon • Children should still use sunscreen during brighter intervals • Ambient Weather station and regional park conditions updating live every few seconds •
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
