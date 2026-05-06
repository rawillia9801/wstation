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
  Gauge,
  Wind,
  Droplets,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react'
import StationCameraPanel from '@/components/StationCameraPanel'

const forecast = [
  { day: 'TODAY', icon: '🌧️', high: 72, low: 58, rain: 40, summary: 'Showers' },
  { day: 'TOMORROW', icon: '⛈️', high: 69, low: 53, rain: 60, summary: 'T-storms' },
  { day: 'WEDNESDAY', icon: '⛅', high: 69, low: 49, rain: 20, summary: 'Partly Cloudy' },
  { day: 'THURSDAY', icon: '☀️', high: 60, low: 41, rain: 10, summary: 'Sunny' },
  { day: 'FRIDAY', icon: '🌤️', high: 63, low: 45, rain: 10, summary: 'Mostly Sunny' },
]

const leftNav = [
  { icon: Home, label: 'DASHBOARD', href: '/' },
  { icon: History, label: 'HISTORY', href: '/history' },
  { icon: Bell, label: 'ALARMS', href: '/alarms' },
  { icon: FileText, label: 'REPORTS', href: '/reports' },
  { icon: MapPinned, label: 'MAPS', href: '/maps' },
  { icon: Camera, label: 'CAMERAS', href: '/cameras' },
  { icon: Settings, label: 'SETTINGS', href: '/settings' },
]

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
      <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(0,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.12)_1px,transparent_1px)] bg-[size:44px_44px]" />

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
                Marion, Virginia • Station KVAMARIO42 <span className="ml-3 text-lime-400">● LIVE</span>
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
            <GlassCard className="2xl:col-span-7 min-h-[280px] bg-[linear-gradient(120deg,rgba(6,18,33,0.9),rgba(3,10,20,0.82))] p-5 md:p-7">
              <div className="text-xl md:text-2xl font-semibold tracking-[0.14em] text-cyan-300">CURRENT CONDITIONS</div>
              <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="text-6xl md:text-7xl xl:text-8xl font-semibold leading-none">
                    71.4<span className="ml-2 text-2xl md:text-4xl">°F</span>
                  </div>
                  <div className="mt-3 text-lg md:text-2xl text-slate-300">Feels Like 71°</div>
                  <div className="mt-6 flex gap-8">
                    <div className="text-xl md:text-2xl text-orange-300">↑ 72°</div>
                    <div className="text-xl md:text-2xl text-cyan-300">↓ 58°</div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <CloudRain className="h-24 w-24 md:h-28 md:w-28 text-cyan-200 drop-shadow-[0_0_18px_rgba(0,255,255,0.4)]" />
                  <div className="mt-4 text-3xl md:text-4xl">Rain</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="2xl:col-span-5 p-5">
              <div className="mb-4 text-xl tracking-[0.14em] text-cyan-300">CURRENT MOON</div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl" />
                  <div className="relative h-40 w-40 overflow-hidden rounded-full border border-slate-500/40 bg-[#050816] shadow-[0_0_30px_rgba(255,255,255,0.12)]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,#f4f4f4,#b8b8b8_35%,#5e5e5e_62%,#0b0b0b_100%)]" />
                    <div className="absolute inset-y-0 right-0 w-[42%] bg-black/72 rounded-l-full" />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="text-3xl md:text-4xl font-semibold">Waning Gibbous</div>
                  <div className="mt-3 text-slate-300">Illumination: 76%</div>
                  <div className="text-slate-400">Moon Age: 18.1 days</div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-cyan-300 to-slate-100" />
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="2xl:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                ['HUMIDITY', '59', '%', 'Comfortable'],
                ['PRESSURE', '29.93', 'inHg', 'Steady'],
                ['WIND', '6', 'mph', 'WNW • Gust 9'],
                ['UV INDEX', '2', '', 'Low'],
              ].map(([title, value, unit, sub]) => (
                <GlassCard key={title} className="p-5 min-h-[160px]">
                  <div className="text-xs tracking-[0.16em] text-cyan-300">{title}</div>
                  <div className="mt-6 text-5xl font-semibold">{value}<span className="ml-1 text-lg text-slate-400">{unit}</span></div>
                  <div className="mt-3 text-slate-400">{sub}</div>
                </GlassCard>
              ))}
            </div>

            <div className="2xl:col-span-4">
              <StationCameraPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
