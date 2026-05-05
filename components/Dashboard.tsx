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

type ForecastDay = {
  day: string
  icon: string
  high: number
  low: number
  rain: number
  summary: string
}

const forecast: ForecastDay[] = [
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

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-[22px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(6,18,33,0.96),rgba(1,7,15,0.96))] shadow-[0_0_0_1px_rgba(0,255,255,0.04),0_0_18px_rgba(0,220,255,0.08),inset_0_0_35px_rgba(0,170,255,0.04)] backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  )
}

function MiniStat({
  icon: Icon,
  title,
  value,
  unit,
  sub,
}: {
  icon: any
  title: string
  value: string
  unit?: string
  sub: string
}) {
  return (
    <GlassCard className="min-h-[170px] p-5">
      <div className="mb-4 text-xs font-semibold tracking-[0.18em] text-cyan-300">{title}</div>
      <Icon className="mb-3 h-7 w-7 text-cyan-200 opacity-90" />
      <div className="text-5xl font-semibold leading-none text-white">
        {value}
        <span className="ml-1 text-xl text-slate-300">{unit}</span>
      </div>
      <div className="mt-2 text-sm text-slate-400">{sub}</div>
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-lime-400" />
      </div>
    </GlassCard>
  )
}

export default function Dashboard() {
  const now = useClock()

  const formattedTime = useMemo(
    () =>
      now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [now]
  )

  const formattedDate = useMemo(
    () =>
      now.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [now]
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020813] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,180,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(0,130,255,0.12),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(0,220,255,0.05),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.12)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.07]" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2000')] bg-cover bg-center opacity-[0.14]" />

      <div className="relative z-10 flex">
        <aside className="min-h-screen w-[104px] border-r border-cyan-300/10 bg-black/20 px-3 py-5 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/5 shadow-[0_0_18px_rgba(0,255,255,0.18)]">
            <CloudRain className="h-8 w-8 text-cyan-300" />
          </div>

          <nav className="mt-8 space-y-4">
            {leftNav.map(({ icon: Icon, label, href }, i) => (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center gap-2 rounded-2xl border py-3 ${
                  i === 0
                    ? 'border-cyan-300/40 bg-cyan-400/10 shadow-[0_0_16px_rgba(0,255,255,0.18)]'
                    : 'border-cyan-300/10 bg-white/[0.02]'
                }`}
              >
                <Icon className={`h-5 w-5 ${i === 0 ? 'text-cyan-300' : 'text-slate-300'}`} />
                <span className={`text-[11px] tracking-[0.12em] ${i === 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          <GlassCard className="mt-8 p-3">
            <div className="text-[11px] tracking-[0.14em] text-cyan-300">STATION STATUS</div>
            <div className="mt-3 text-sm font-medium text-lime-400">● ONLINE</div>
            <div className="mt-4 text-xs text-slate-400">Signal: 98%</div>
            <div className="text-xs text-slate-400">Uptime: 15d 4h</div>
            <div className="mt-4 text-[11px] tracking-[0.14em] text-cyan-300">DATA QUALITY</div>
            <div className="mt-1 text-lg font-semibold text-lime-300">100%</div>
          </GlassCard>
        </aside>

        <section className="flex-1 px-5 py-4">
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-medium tracking-[0.18em] text-cyan-300">LIVE PERSONAL WEATHER STATION</div>
              <h1 className="mt-1 text-6xl font-semibold leading-tight">Staley Street Weather</h1>
              <div className="mt-2 text-lg text-slate-300">
                Marion, Virginia • Station KVAMARIO42 <span className="ml-3 text-lime-400">● LIVE</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <GlassCard className="flex items-center gap-4 px-5 py-3">
                <div className="text-slate-300">{formattedTime}</div>
                <div className="text-slate-500">•</div>
                <div className="text-slate-300">{formattedDate}</div>
                <div className="text-lime-400">● LIVE</div>
              </GlassCard>

              <div className="flex gap-3">
                {['DASHBOARD', 'HISTORY', 'ALARMS', 'REPORTS', 'SETTINGS'].map((item, idx) => (
                  <GlassCard
                    key={item}
                    className={`px-6 py-4 text-sm tracking-[0.14em] ${
                      idx === 0 ? 'text-cyan-300 shadow-[0_0_20px_rgba(0,255,255,0.18)]' : 'text-slate-300'
                    }`}
                  >
                    {item}
                  </GlassCard>
                ))}
              </div>
            </div>
          </header>

          <GlassCard className="mb-4 flex items-center justify-between border-amber-300/20 px-5 py-3 shadow-[0_0_14px_rgba(255,180,0,0.08)]">
            <div className="font-medium text-amber-300">⚠ Slight Chance of Rain Showers After 5PM</div>
            <div className="flex items-center gap-2 text-sm text-amber-200">
              VIEW ALERTS <ChevronRight className="h-4 w-4" />
            </div>
          </GlassCard>

          <div className="grid grid-cols-12 gap-4">
            <GlassCard className="col-span-6 min-h-[290px] bg-[linear-gradient(120deg,rgba(6,18,33,0.9),rgba(3,10,20,0.82)),url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2000')] bg-cover bg-center p-6">
              <div className="text-2xl font-semibold tracking-[0.14em] text-cyan-300">CURRENT CONDITIONS</div>
              <div className="mt-5 grid grid-cols-2">
                <div>
                  <div className="text-8xl font-semibold">
                    71.4<span className="ml-2 text-4xl">°F</span>
                  </div>
                  <div className="mt-2 text-2xl text-slate-300">Feels Like 71°</div>
                  <div className="mt-7 flex gap-8">
                    <div className="text-2xl text-orange-300">↑ 72°</div>
                    <div className="text-2xl text-cyan-300">↓ 58°</div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <CloudRain className="h-24 w-24 text-cyan-200 drop-shadow-[0_0_14px_rgba(0,255,255,0.35)]" />
                  <div className="mt-3 text-4xl">Rain</div>
                </div>
              </div>
            </GlassCard>

            <div className="col-span-6 grid grid-cols-4 gap-4">
              <MiniStat icon={Droplets} title="HUMIDITY" value="59" unit="%" sub="Comfortable" />
              <MiniStat icon={Gauge} title="PRESSURE" value="29.93" unit="inHg" sub="Steady" />
              <MiniStat icon={Wind} title="WIND" value="6" unit="mph" sub="WNW • Gust 9 mph" />
              <MiniStat icon={Sun} title="UV INDEX" value="2" sub="Low" />
            </div>

            <GlassCard className="col-span-8 p-5">
              <div className="mb-4 text-2xl tracking-[0.14em] text-cyan-300">5 DAY FORECAST</div>
              <div className="grid grid-cols-5 gap-4">
                {forecast.map((item) => (
                  <div key={item.day} className="min-h-[190px] rounded-2xl border border-cyan-300/15 bg-cyan-400/[0.03] p-4">
                    <div className="text-sm tracking-[0.12em] text-slate-300">{item.day}</div>
                    <div className="mt-4 text-5xl">{item.icon}</div>
                    <div className="mt-5 flex justify-between text-3xl">
                      <span>{item.high}°</span>
                      <span className="text-cyan-300">{item.low}°</span>
                    </div>
                    <div className="mt-2 text-slate-400">{item.summary}</div>
                    <div className="mt-2 text-sm text-cyan-300">💧 {item.rain}%</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="col-span-4 flex min-h-[280px] flex-col justify-between p-5">
              <div className="flex items-center gap-2 text-2xl tracking-[0.14em] text-cyan-300">
                CURRENT MOON <Moon className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-center">
                <div className="h-44 w-44 rounded-full bg-[radial-gradient(circle_at_35%_35%,#d9d9d9,#777_50%,#050505_52%)] shadow-[0_0_20px_rgba(255,255,255,0.08)]" />
              </div>
              <div>
                <div className="text-4xl">Waning Gibbous</div>
                <div className="mt-2 text-slate-400">Illumination: 76% &nbsp; • &nbsp; Age: 18.1 days</div>
              </div>
            </GlassCard>

            <GlassCard className="col-span-4 min-h-[220px] p-5">
              <div className="mb-4 text-2xl tracking-[0.14em] text-cyan-300">LIVE RADAR</div>
              <div className="h-[150px] rounded-2xl border border-cyan-300/10 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.22),rgba(255,255,0,0.12),rgba(255,0,0,0.12),rgba(0,0,0,0.3))]" />
            </GlassCard>

            <GlassCard className="col-span-3 min-h-[220px] p-5">
              <div className="mb-4 text-2xl tracking-[0.14em] text-cyan-300">AIR QUALITY</div>
              <div className="text-7xl font-semibold text-lime-300">28</div>
              <div className="text-2xl text-lime-400">Good</div>
              <div className="mt-4 text-slate-400">Great day to be outside!</div>
            </GlassCard>

            <GlassCard className="col-span-3 min-h-[220px] p-5">
              <div className="mb-4 text-2xl tracking-[0.14em] text-cyan-300">SUN & MOON</div>
              <div className="mt-8 h-24 rounded-full border-t-2 border-amber-300/50" />
              <div className="mt-6 text-sm text-slate-400">Sunrise 6:16 AM • Sunset 8:28 PM</div>
            </GlassCard>

            <GlassCard className="col-span-4 min-h-[220px] p-5">
              <div className="mb-4 text-2xl tracking-[0.14em] text-cyan-300">TEMPERATURE TREND (24H)</div>
              <div className="relative h-[150px] overflow-hidden rounded-2xl border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
                <div className="absolute inset-x-0 top-10 h-[2px] rotate-[8deg] bg-orange-300/70" />
                <div className="absolute inset-x-0 bottom-10 h-[2px] -rotate-[6deg] bg-cyan-300/70" />
              </div>
            </GlassCard>

            <GlassCard className="col-span-3 min-h-[180px] p-5">
              <div className="mb-4 text-xl tracking-[0.14em] text-cyan-300">PRECIPITATION</div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-3xl">0.62</div>
                  <div className="text-slate-400">TODAY</div>
                </div>
                <div>
                  <div className="text-3xl">1.34</div>
                  <div className="text-slate-400">WEEK</div>
                </div>
                <div>
                  <div className="text-3xl">3.21</div>
                  <div className="text-slate-400">MONTH</div>
                </div>
                <div>
                  <div className="text-3xl">12.77</div>
                  <div className="text-slate-400">YEAR</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="col-span-3 min-h-[180px] p-5">
              <div className="mb-4 text-xl tracking-[0.14em] text-cyan-300">LIGHTNING (24H)</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[12, 3, 7, 2].map((v, i) => (
                  <div key={i}>
                    <div className="text-3xl">{v}</div>
                    <div className="text-[10px] text-slate-500">{['TOTAL', 'NEAR', 'CLOUD', 'GROUND'][i]}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="col-span-2">
              <StationCameraPanel />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
