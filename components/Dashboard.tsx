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
    <main className="h-[100dvh] w-[100dvw] overflow-hidden bg-gradient-to-b from-slate-900 to-black px-2 md:px-3 xl:px-5 py-2 md:py-3 flex flex-col">

      <div className="grid grid-cols-2 items-start gap-2 xl:gap-5 min-h-0">
        <div className="min-w-0">
          <div className="text-cyan-400 tracking-[0.2em] text-[8px] md:text-[10px] xl:text-[12px] mb-1">LIVE PERSONAL WEATHER STATION</div>
          <h1 className="font-black leading-[0.9] text-[30px] md:text-[42px] xl:text-[64px] 2xl:text-[76px] truncate">Staley Street Weather</h1>
          <p className="text-slate-300 text-[10px] md:text-[12px] xl:text-[15px]">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
        </div>
        <div className="flex flex-col gap-2 items-end min-w-0">
          <TopStatusBar updatedAt={updatedAt} />
          <NavPills />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 xl:gap-4 mt-2 min-h-0">
        <div className="col-span-5 h-[18dvh] md:h-[20dvh] xl:h-[24dvh] min-w-0 min-h-0"><HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} /></div>
        <div className="col-span-7 grid grid-cols-4 gap-2 xl:gap-4 h-[18dvh] md:h-[20dvh] xl:h-[24dvh] min-w-0 min-h-0">
          <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
          <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
          <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
          <UVPanel uv={station?.uv ?? 2} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 xl:gap-4 mt-2 min-h-0">
        <div className="col-span-9 h-[14dvh] md:h-[16dvh] xl:h-[19dvh] min-w-0 min-h-0"><ForecastStrip periods={forecast} /></div>
        <div className="col-span-3 h-[14dvh] md:h-[16dvh] xl:h-[19dvh] min-w-0 min-h-0"><MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" /></div>
      </div>

      <div className="mt-2 rounded-xl border border-fuchsia-400/20 bg-slate-950/70 overflow-hidden py-2 whitespace-nowrap flex-shrink-0">
        <div className="animate-[marquee_45s_linear_infinite] text-[10px] md:text-[12px] xl:text-[15px] text-fuchsia-200 font-medium px-4">
          ✦ HUNGRY MOTHER SWIM ADVISORY: Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM ✦ GEMINI: Fresh communication opens an unexpected opportunity today. ✦ CANCER: Family energy is nurturing and calm. ✦ LIBRA: Balance returns in finances and relationships. ✦
        </div>
      </div>

      <div className="mt-auto h-[20px] md:h-[24px] xl:h-[28px] flex items-center justify-between text-[9px] md:text-[11px] xl:text-[13px] text-cyan-300 px-2 border-t border-cyan-400/20 flex-shrink-0">
        <span>Station Online • Ambient Weather API • NOAA Forecast Sync • Daily Zodiac Feed</span>
        <span>Auto Refresh 8s</span>
      </div>

    </main>
  )
}
