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
    <main className="h-screen w-screen overflow-hidden px-3 py-3 scale-[0.70] origin-top-left" style={{ width: '142vw' }}>
      <div className="grid h-full w-full gap-3" style={{ gridTemplateRows: '12% 22% 18% 7% 3% 38%' }}>
        <div className="grid grid-cols-2 gap-2 items-center">
          <div>
            <div className="text-cyan-400 tracking-[0.24em] text-[8px] mb-1">LIVE PERSONAL WEATHER STATION</div>
            <h1 className="text-3xl xl:text-5xl font-black leading-none">Staley Street Weather</h1>
            <p className="text-slate-300 text-[10px] mt-1">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
          </div>
          <div className="flex flex-col gap-1 justify-center">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-5 h-full"><HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} /></div>
          <div className="col-span-7 h-full grid grid-cols-4 gap-2">
            <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
            <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
            <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-2 mt-2">
          <div className="col-span-9 h-full"><ForecastStrip periods={forecast} /></div>
          <div className="col-span-3 h-full"><MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" /></div>
        </div>
        <div className="rounded-lg border border-cyan-400/20 bg-slate-950/50 px-3 flex items-center overflow-hidden text-[10px] text-white font-semibold whitespace-nowrap animate-[marquee_26s_linear_infinite]">
          Hungry Mother Swim Advisory • Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM • Families can expect cool but comfortable shoreline conditions today • No harmful algae advisories reported •
        </div>
        <div className="flex items-center justify-between text-[8px] text-cyan-300 px-2 border-t border-cyan-400/20">
          <span>Station Online • Ambient Weather API • NOAA Forecast Sync</span>
          <span>Auto Refresh 8s</span>
        </div>
        <div></div>
      </div>
    </main>
  )
}
