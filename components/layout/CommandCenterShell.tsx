'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import BottomStatusRail from './BottomStatusRail'
import { SideCommandRail } from './CommandNavPills'
import TopCommandHeader from './TopCommandHeader'
import DashboardPage from '@/components/pages/DashboardPage'
import HistoryPage from '@/components/pages/HistoryPage'
import AlarmsPage from '@/components/pages/AlarmsPage'
import ReportsPage from '@/components/pages/ReportsPage'
import SettingsPage from '@/components/pages/SettingsPage'
import { mapDashboardData } from '@/lib/dashboard-data'
import type { CommandPage, ForecastPeriod, StationObservation, StationSettings } from '@/types/dashboard'

const CACHE_KEY = 'wstation:last-valid-dashboard-sources'

function hasObjectData(value: unknown) {
  return Boolean(value && typeof value === 'object' && Object.keys(value as Record<string, unknown>).length)
}

export default function CommandCenterShell() {
  const [activePage, setActivePage] = useState<CommandPage>('dashboard')
  const [station, setStation] = useState<StationObservation | null>(null)
  const [forecast, setForecast] = useState<ForecastPeriod[]>([])
  const [settings, setSettings] = useState<StationSettings>({})
  const [updatedAt, setUpdatedAt] = useState('')
  const [cacheHydrated, setCacheHydrated] = useState(false)

  const load = useCallback(async () => {
    const [stationResult, forecastResult, settingsResult] = await Promise.allSettled([
      fetch('/api/station', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/forecast', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/save-settings', { cache: 'no-store' }).then((response) => response.json())
    ])

    if (stationResult.status === 'fulfilled' && !stationResult.value?.error && hasObjectData(stationResult.value)) setStation(stationResult.value)
    if (forecastResult.status === 'fulfilled' && Array.isArray(forecastResult.value) && forecastResult.value.length) setForecast(forecastResult.value)
    if (settingsResult.status === 'fulfilled' && !settingsResult.value?.error && hasObjectData(settingsResult.value)) setSettings(settingsResult.value)
    setUpdatedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  }, [])

  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached) as { station?: StationObservation; forecast?: ForecastPeriod[]; settings?: StationSettings; updatedAt?: string }
        if (hasObjectData(parsed.station)) setStation(parsed.station ?? null)
        if (Array.isArray(parsed.forecast) && parsed.forecast.length) setForecast(parsed.forecast)
        if (hasObjectData(parsed.settings)) setSettings(parsed.settings ?? {})
        if (parsed.updatedAt) setUpdatedAt(parsed.updatedAt)
      }
    } catch {
      window.localStorage.removeItem(CACHE_KEY)
    }
    setCacheHydrated(true)

    load()
    const timer = window.setInterval(load, 8000)
    return () => window.clearInterval(timer)
  }, [load])

  const data = useMemo(() => mapDashboardData({ station, forecast, settings, updatedAt }), [station, forecast, settings, updatedAt])

  useEffect(() => {
    if (!cacheHydrated) return
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ station, forecast, settings, updatedAt }))
    } catch {
      // Storage can be unavailable in private browsing; live rendering should continue.
    }
  }, [cacheHydrated, station, forecast, settings, updatedAt])

  return (
    <main className="command-center-shell">
      <div className="weather-backdrop" />
      <SideCommandRail activePage={activePage} onPageChange={setActivePage} />
      <section className="command-main">
        <TopCommandHeader data={data} activePage={activePage} onPageChange={setActivePage} />
        <div className="command-content">
          {activePage === 'dashboard' ? <DashboardPage data={data} /> : null}
          {activePage === 'history' ? <HistoryPage data={data} /> : null}
          {activePage === 'alarms' ? <AlarmsPage data={data} /> : null}
          {activePage === 'reports' ? <ReportsPage data={data} /> : null}
          {activePage === 'settings' ? <SettingsPage data={data} /> : null}
        </div>
        <BottomStatusRail data={data} />
      </section>
    </main>
  )
}
