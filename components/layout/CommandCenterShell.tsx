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

export default function CommandCenterShell() {
  const [activePage, setActivePage] = useState<CommandPage>('dashboard')
  const [station, setStation] = useState<StationObservation | null>(null)
  const [forecast, setForecast] = useState<ForecastPeriod[]>([])
  const [settings, setSettings] = useState<StationSettings>({})
  const [updatedAt, setUpdatedAt] = useState('')

  const load = useCallback(async () => {
    const [stationResult, forecastResult, settingsResult] = await Promise.allSettled([
      fetch('/api/station', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/forecast', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/save-settings', { cache: 'no-store' }).then((response) => response.json())
    ])

    if (stationResult.status === 'fulfilled' && !stationResult.value?.error) setStation(stationResult.value)
    if (forecastResult.status === 'fulfilled' && Array.isArray(forecastResult.value)) setForecast(forecastResult.value)
    if (settingsResult.status === 'fulfilled' && !settingsResult.value?.error) setSettings(settingsResult.value)
    setUpdatedAt(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
  }, [])

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 8000)
    return () => window.clearInterval(timer)
  }, [load])

  const data = useMemo(() => mapDashboardData({ station, forecast, settings, updatedAt }), [station, forecast, settings, updatedAt])

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
