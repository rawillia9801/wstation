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
  Moon,
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
  radarSource: 'weather.gov',
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
    <section className={`rounded-[20px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(6,18,33,0.96),rgba(1,7,15,0.96))] shadow-[0_0_0_1px_rgba(0,255,255,0.04),0_0_14px_rgba(0,220,255,0.08),inset_0_0_24px_rgba(0,170,255,0.04)] backdrop-blur-xl ${className}`}>
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

        if (!response.ok) return

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

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col lg:flex-row gap-3 px-3 py-3">
        <aside className="w-full lg:w-[88px] shrink-0 rounded-[20px] border border-cyan-300/10 bg-black/20 p-2 backdrop-blur-xl">
          <div className="flex lg:flex-col items-center gap-2 overflow-x-auto lg:overflow-visible">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/5 shadow-[0_0_14px_rgba(0,255,255,0.18)]">
              <CloudRain className="h-7 w-7 text-cyan-300" />
            </div>

            {leftNav.map(({ icon: Icon, label, href }, i) => (
              <Link
                key={label}
                href={href}
                className={`flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-2 py-2 ${
                  i === 0
                    ? 'border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_10px_rgba(0,255,255,0.18)]'
                    : 'border-cyan-300/10 bg-white/[0.02]'
                }`}
              >
                <Icon className={`h-4 w-4 ${i === 0 ? 'text-cyan-300' : 'text-slate-300'}`} />
                <span className={`text-[9px] tracking-[0.1em] ${i === 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <header className="mb-3 flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3">
            <div>
              <div className="text-[10px] md:text-xs tracking-[0.18em] text-cyan-300">LIVE PERSONAL WEATHER STATION</div>
              <h1 className="mt-1 text-3xl md:text-5xl font-semibold leading-tight">Staley Street Weather</h1>
              <div className="mt-1 text-xs md:text-sm text-slate-300">
                Marion, Virginia • SOURCE: {weather.source.toUpperCase()}
              </div>
            </div>

            <GlassCard className="flex items-center gap-3 px-4 py-2 self-start">
              <div className="text-sm text-slate-300">{formattedTime}</div>
              <div className="text-slate-500">•</div>
              <div className="text-sm text-slate-300">{formattedDate}</div>
              <div className="text-sm text-lime-400">● LIVE</div>
            </GlassCard>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
            <GlassCard className="xl:col-span-6 min-h-[250px] p-5">
              <div className="text-lg md:text-xl tracking-[0.12em] text-cyan-300">CURRENT CONDITIONS</div>

              <div className="mt-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div>
                  <div className="text-5xl md:text-7xl font-semibold leading-none">
                    {weather.temperature}
                    <span className="ml-2 text-2xl md:text-3xl">°F</span>
                  </div>

                  <div className="mt-2 text-lg md:text-2xl text-slate-300">{weather.condition}</div>

                  <div className="mt-5 flex flex-wrap gap-5 text-sm md:text-base text-slate-300">
                    <div>Humidity {weather.humidity}%</div>
                    <div>{weather.windDirection} {weather.windSpeed} mph</div>
                    <div>{weather.pressure} inHg</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <CloudRain className="h-20 w-20 md:h-24 md:w-24 text-cyan-200 drop-shadow-[0_0_16px_rgba(0,255,255,0.35)]" />
                  <div className="mt-2 text-2xl">{weather.condition}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="xl:col-span-3 min-h-[250px] p-5 overflow-hidden">
              <div className="mb-4 flex items-center gap-2 text-lg tracking-[0.12em] text-cyan-300">
                CURRENT MOON <Moon className="h-5 w-5" />
              </div>

              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-36 w-36 rounded-full bg-cyan-300/10 blur-3xl" />

                  <div className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-500/40 bg-[#040816] shadow-[0_0_20px_rgba(255,255,255,0.08)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,#f8f8f8,#b8b8b8_38%,#5d5d5d_62%,#090909_100%)]" />
                    <div className="absolute inset-y-0 right-0 w-[38%] rounded-l-full bg-black/75" />
                  </div>
                </div>

                <div className="mt-4 text-2xl font-semibold">Waning Gibbous</div>
                <div className="mt-1 text-sm text-slate-400">Illumination: 76%</div>
              </div>
            </GlassCard>

            <GlassCard className="xl:col-span-3 min-h-[250px] p-4 overflow-hidden">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg tracking-[0.12em] text-cyan-300">LIVE RADAR</div>
                <div className="text-[10px] uppercase text-slate-400">{weather.radarSource}</div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-cyan-300/10 bg-black/40">
                <img
                  src={weather.radarUrl}
                  alt="Weather radar"
                  className="h-[205px] w-full object-cover"
                />
              </div>
            </GlassCard>

            <div className="xl:col-span-4">
              <StationCameraPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
