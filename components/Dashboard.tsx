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
    <main className="h-[100dvh] w-[100dvw] overflow-hidden bg-gradient-to-br from-[#06111d] via-[#071827] to-[#02060d] text-white px-[1vw] py-[1vh]">
      <section className="h-full w-full grid gap-[1vh]" style={{ gridTemplateRows: '12dvh 28dvh 25dvh 5dvh 4dvh 3dvh' }}>
        <header className="min-h-0 flex items-start justify-between gap-[2vw] overflow-visible">
          <div className="min-w-0 flex-1 max-w-[55vw]">
            <div className="text-cyan-400 tracking-[0.22em] text-[clamp(8px,0.72vw,13px)] mb-[0.4vh]">LIVE PERSONAL WEATHER STATION</div>
            <h1 className="font-black tracking-tight leading-[0.9] text-[clamp(34px,4.3vw,74px)]">Staley Street Weather</h1>
            <p className="text-slate-300 text-[clamp(10px,0.95vw,16px)] mt-[0.4vh]">Marion, Virginia • Station KVAMARIO42 • <span className="text-green-400">LIVE</span></p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-[0.7vh] relative z-50">
            <TopStatusBar updatedAt={updatedAt} />
            <NavPills />
          </div>
        </header>

        <div className="min-h-0 grid grid-cols-12 gap-[0.8vw] overflow-hidden">
          <div className="col-span-5 min-w-0 min-h-0 overflow-hidden"><HeroConditionPanel condition="Rain" temperature={station?.imperial?.temp ?? '--'} /></div>
          <div className="col-span-7 min-w-0 min-h-0 grid grid-cols-4 gap-[0.8vw] overflow-hidden">
            <MetricCard title="Humidity" value={station?.humidity ?? '--'} unit="%" />
            <MetricCard title="Pressure" value={station?.imperial?.pressure ?? '--'} unit="inHg" />
            <MetricCard title="Wind" value={station?.imperial?.windSpeed ?? '--'} unit="mph" />
            <UVPanel uv={station?.uv ?? 2} />
          </div>
        </div>

        <div className="min-h-0 grid grid-cols-12 gap-[0.8vw] overflow-hidden">
          <div className="col-span-9 min-w-0 min-h-0 overflow-hidden"><ForecastStrip periods={forecast} /></div>
          <div className="col-span-3 min-w-0 min-h-0 overflow-hidden"><MoonPhasePanel moonPhase="Waning Gibbous" illumination="76%" /></div>
        </div>

        <div className="min-h-0 rounded-xl border border-cyan-400/25 bg-slate-950/70 px-[1vw] flex items-center overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_34s_linear_infinite] text-[clamp(11px,0.9vw,17px)] text-white font-semibold">
            ✦ HUNGRY MOTHER SWIM ADVISORY: Water Temp 67°F • Water Quality GOOD • UV Exposure {station?.uv ?? 2} LOW RISK • Safe Swim Window Noon–5PM • No harmful algae advisories reported •
          </div>
        </div>

        <div className="min-h-0 rounded-xl border border-fuchsia-400/25 bg-slate-950/70 px-[1vw] flex items-center overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_44s_linear_infinite] text-[clamp(10px,0.82vw,15px)] text-fuchsia-200 font-medium">
            ✦ GEMINI: Fresh communication opens an unexpected opportunity today. Keep plans flexible. ✦ CANCER: Family energy is nurturing and calm; home-centered joy restores balance. ✦ LIBRA: Balance returns in relationships and a delayed answer begins moving in your favor. ✦
          </div>
        </div>

        <footer className="min-h-0 flex items-center justify-between text-[clamp(9px,0.72vw,13px)] text-cyan-300 px-[0.5vw] border-t border-cyan-400/20 overflow-hidden">
          <span>Station Online • Ambient Weather API • NOAA Forecast Sync • Daily Zodiac Feed</span>
          <span>Auto Refresh 8s</span>
        </footer>
      </section>
    </main>
  )
}
