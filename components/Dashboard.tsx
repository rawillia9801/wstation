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
    <main className="min-h-screen w-screen overflow-hidden px-2 lg:px-4 2xl:px-6 py-2 lg:py-3 bg-gradient-to-b from-slate-900 to-black flex flex-col gap-2 lg:gap-3">

      <div className="grid grid-cols-2 items-start gap-2 lg:gap-4">
        <div>
          <div className="text-cyan-400 tracking-[0.22em] text-[9px] lg:text-[11px] 2xl:text-[13px] mb-1">LIVE PERSONAL WEATHER STATION</div>
          <h1 className="font-black leading-none text-[38px] lg:text-[54px] 2xl:text-[72px]">Staley Street Weather</h1>
          <p className="text-slate-300 text-[11px] lg:text-[13px] 2xl:text-[17px]">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <TopStatusBar updatedAt={updatedAt} />
          <NavPills />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 lg:gap-3 flex-shrink-0">
        <div className="col-span-5 h-[160px] lg:h-[190px] 2xl:h-[250px]"><HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} /></div>
        <div className="col-span-7 grid grid-cols-4 gap-2 lg:gap-3 h-[160px] lg:h-[190px] 2xl:h-[250px]">
          <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
          <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
          <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
          <UVPanel uv={station?.uv ?? 2} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 lg:gap-3 flex-shrink-0">
        <div className="col-span-9 h-[120px] lg:h-[145px] 2xl:h-[185px]"><ForecastStrip periods={forecast} /></div>
        <div className="col-span-3 h-[120px] lg:h-[145px] 2xl:h-[185px]"><MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" /></div>
      </div>

      <div className="rounded-xl border border-fuchsia-400/20 bg-slate-950/70 overflow-hidden py-2 whitespace-nowrap">
        <div className="animate-[marquee_45s_linear_infinite] text-[11px] lg:text-[13px] 2xl:text-[16px] text-fuchsia-200 font-medium px-4">
          ✦ HUNGRY MOTHER SWIM ADVISORY: Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM ✦ GEMINI: Fresh communication opens an unexpected opportunity today. Keep plans flexible. ✦ CANCER: Family energy is nurturing and calm; a good day for home-centered joy and emotional resets. ✦ LIBRA: Balance returns in finances and relationships — trust the slower pace and avoid rushed decisions. ✦
        </div>
      </div>

      <div className="mt-auto h-[22px] lg:h-[26px] flex items-center justify-between text-[10px] lg:text-[12px] 2xl:text-[14px] text-cyan-300 px-2 border-t border-cyan-400/20">
        <span>Station Online • Ambient Weather API • NOAA Forecast Sync • Daily Zodiac Feed</span>
        <span>Auto Refresh 8s</span>
      </div>

    </main>
  )
}
