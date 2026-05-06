'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CloudRain,
  Home,
  History,
  Bell,
  FileText,
  Settings,
  MapPinned,
  Camera,
} from 'lucide-react'
import StationCameraPanel from '@/components/StationCameraPanel'
import type { WeatherPayload } from '@/lib/weather-provider'

const leftNav = [
  { icon: Home, label: 'DASHBOARD', href: '/' },
  { icon: History, label: 'HISTORY', href: '/history' },
  { icon: Bell, label: 'ALARMS', href: '/alarms' },
  { icon: FileText, label: 'REPORTS', href: '/reports' },
  { icon: MapPinned, label: 'MAPS', href: '/maps' },
  { icon: Camera, label: 'CAMERAS', href: '/cameras' },
  { icon: Settings, label: 'SETTINGS', href: '/settings' },
]

const initialWeather: WeatherPayload = {
  source: 'fallback',
  stale: false,
  temperature: 71,
  humidity: 59,
  pressure: 29.93,
  windSpeed: 6,
  windDirection: 'WNW',
  uvIndex: 2,
  condition: 'Rain',
  radarUrl: 'https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif',
  forecast: [],
}

function useClock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return now
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[22px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(6,18,33,0.96),rgba(1,7,15,0.96))] shadow-[0_0_0_1px_rgba(0,255,255,0.04),0_0_18px_rgba(0,220,255,0.08),inset_0_0_35px_rgba(0,170,255,0.04)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  )
}

export default function Dashboard() {
  const now = useClock()
  const [weather, setWeather] = useState<WeatherPayload>(initialWeather)

  useEffect(() => {
    let mounted = true

    async function loadWeather() {
      try {
        const response = await fetch('/api/weather', {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()

        if (mounted) {
          setWeather(data)
        }
      } catch (error) {
        console.error('Weather fetch failed', error)
      }
    }

    loadWeather()

    const interval = setInterval(loadWeather, 120000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const formattedTime = useMemo(
    () => now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    [now]
  )

  const formattedDate = useMemo(
    () => now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    [now]
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#020813] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,180,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(0,130,255,0.12),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(0,220,255,0.05),transparent_35%)]" />

      <div className="relative z-10 flex flex-col lg:flex-row max-w-[1800px] mx-auto">
        <aside className="w-full lg:w-[104px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-cyan-300/10 bg-black/20 px-3 py-4 backdrop-blur-xl">
          <div className="flex lg:flex-col items-center gap-3 lg:gap-6 overflow-x-auto lg:overflow-visible">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/5 shadow-[0_0_18px_rgba(0,255,255,0.18)]">
              <CloudRain className="h-8 w-8 text-cyan-300" />
            </div>

            {leftNav.map(({ icon: Icon, label, href }, i) => (
              <Link
                key={label}
                href={href}
                className={`flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 ${
                  i === 0
                    ? 'border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_16px_rgba(0,255,255,0.18)]'
                    : 'border-cyan-300/10 bg-white/[0.02]'
                }`}
              >
                <Icon className={`h-5 w-5 ${i === 0 ? 'text-cyan-300' : 'text-slate-300'}`} />
                <span className={`text-[10px] tracking-[0.12em] ${i === 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex-1 px-3 md:px-5 py-4 overflow-y-auto">
          <header className="mb-4 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
            <div>
              <div className="text-xs md:text-sm font-medium tracking-[0.18em] text-cyan-300">LIVE PERSONAL WEATHER STATION</div>
              <h1 className="mt-1 text-3xl md:text-5xl xl:text-6xl font-semibold leading-tight">Staley Street Weather</h1>
              <div className="mt-2 text-sm md:text-lg text-slate-300">
                Marion, Virginia • SOURCE: {weather.source.toUpperCase()}
              </div>
            </div>

            <GlassCard className="flex items-center gap-4 px-5 py-3 self-start xl:self-auto">
              <div className="text-slate-300">{formattedTime}</div>
              <div className="text-slate-500">•</div>
              <div className="text-slate-300">{formattedDate}</div>
              <div className="text-lime-400">● LIVE</div>
            </GlassCard>
          </header>

          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
            <GlassCard className="2xl:col-span-7 min-h-[280px] p-5 md:p-7">
              <div className="text-xl md:text-2xl font-semibold tracking-[0.14em] text-cyan-300">CURRENT CONDITIONS</div>

              <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="text-6xl md:text-7xl xl:text-8xl font-semibold leading-none">
                    {weather.temperature}
                    <span className="ml-2 text-2xl md:text-4xl">°F</span>
                  </div>

                  <div className="mt-3 text-lg md:text-2xl text-slate-300">{weather.condition}</div>

                  <div className="mt-6 flex gap-8 text-slate-300">
                    <div>Humidity {weather.humidity}%</div>
                    <div>{weather.windDirection} {weather.windSpeed} mph</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <CloudRain className="h-24 w-24 md:h-28 md:w-28 text-cyan-200" />
                  <div className="mt-4 text-3xl md:text-4xl">{weather.condition}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="2xl:col-span-5 p-5">
              <div className="mb-4 text-xl tracking-[0.14em] text-cyan-300">LIVE RADAR</div>

              <div className="overflow-hidden rounded-2xl border border-cyan-300/10">
                <img
                  src={weather.radarUrl}
                  alt="Weather radar"
                  className="w-full h-[280px] object-cover"
                />
              </div>
            </GlassCard>

            <div className="2xl:col-span-4">
              <StationCameraPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
