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
    <main className="h-screen w-screen overflow-hidden px-[1vw] py-[1vh] flex flex-col justify-between">

      <div className="h-[14vh] grid grid-cols-2 gap-[1vw] items-center">
        <div>
          <div className="text-cyan-400 tracking-[0.24em] text-[0.6vw] mb-[0.3vh]">LIVE PERSONAL WEATHER STATION</div>
          <h1 className="font-black leading-none text-[3.2vw]">Staley Street Weather</h1>
          <p className="text-slate-300 mt-[0.4vh] text-[0.9vw]">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
        </div>
        <div className="flex flex-col gap-[0.8vh] justify-center">
          <TopStatusBar updatedAt={updatedAt} />
          <NavPills />
        </div>
      </div>

      <div className="h-[27vh] grid grid-cols-12 gap-[0.8vw] mt-[1vh]">
        <div className="col-span-5 h-full"><HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} /></div>
        <div className="col-span-7 h-full grid grid-cols-4 gap-[0.8vw]">
          <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
          <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
          <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
          <UVPanel uv={station?.uv ?? 2} />
        </div>
      </div>

      <div className="h-[22vh] grid grid-cols-12 gap-[0.8vw] mt-[1.2vh]">
        <div className="col-span-9 h-full"><ForecastStrip periods={forecast} /></div>
        <div className="col-span-3 h-full"><MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" /></div>
      </div>

      <div className="h-[7vh] mt-[1.2vh] rounded-xl border border-cyan-400/20 bg-slate-950/60 px-4 flex items-center overflow-hidden text-[1.05vw] text-white font-semibold whitespace-nowrap">
        Hungry Mother Swim Advisory • Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM • Families can expect comfortable shoreline conditions today • No harmful algae advisories reported •
      </div>

      <div className="h-[3vh] flex items-center justify-between text-[0.75vw] text-cyan-300 px-2 border-t border-cyan-400/20">
        <span>Station Online • Ambient Weather API • NOAA Forecast Sync</span>
        <span>Auto Refresh 8s</span>
      </div>

    </main>
  )
}
