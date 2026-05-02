'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import {
  AlarmClock,
  Bell,
  Camera,
  CloudLightning,
  CloudRain,
  Droplets,
  FileText,
  Gauge,
  Grid2X2,
  History,
  Home,
  Info,
  MapPin,
  Navigation,
  Settings,
  Signal,
  Sun,
  Wind,
  Zap
} from 'lucide-react'
import type { LiveDashboardPayload, LiveNumber } from '@/lib/live-data'

const panel = 'border border-cyan-300/30 bg-[#03101a]/82 shadow-[0_0_18px_rgba(0,221,255,0.18),inset_0_0_30px_rgba(0,190,255,0.045)] backdrop-blur-md'
const pageMap: Record<string, string> = { '/': 'dashboard', '/history': 'history', '/alarms': 'alarms', '/reports': 'reports', '/maps': 'maps', '/cameras': 'cameras', '/settings': 'settings', '/command-center': 'dashboard' }

const forecastImages = [
  'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1000&auto=format&fit=crop'
]

const topNav = [
  { label: 'Dashboard', href: '/', icon: Grid2X2 },
  { label: 'History', href: '/history', icon: History },
  { label: 'Alarms', href: '/alarms', icon: Bell, badge: '2' },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings }
]

const railItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'History', href: '/history', icon: History },
  { label: 'Alarms', href: '/alarms', icon: Bell },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Maps', href: '/maps', icon: MapPin },
  { label: 'Cameras', href: '/cameras', icon: Camera },
  { label: 'Settings', href: '/settings', icon: Settings }
]

const protectedPages = new Set(['history', 'alarms', 'reports', 'maps', 'cameras', 'settings'])

function unavailable() {
  return <span className="unavailable">Live Data Unavailable</span>
}

function num(value: LiveNumber, digits = 0) {
  if (value === null) return null
  return value.toFixed(digits)
}

function temp(value: LiveNumber, digits = 0) {
  const formatted = num(value, digits)
  return formatted === null ? unavailable() : <>{formatted}°</>
}

function isSunOnly(condition: string | null | undefined) {
  return Boolean(condition && /\b(clear|sunny|mostly clear|mostly sunny)\b/i.test(condition))
}

function historySeries(data: LiveDashboardPayload | null, key: 'humidity' | 'pressure' | 'wind') {
  const values = data?.history.map((row) => row[key]).filter((value): value is number => value !== null) ?? []
  return values.length >= 3 ? values.slice(-22) : []
}

function useLiveData() {
  const [data, setData] = useState<LiveDashboardPayload | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await fetch('/api/live', { cache: 'no-store' })
        const payload = await response.json()
        if (!cancelled) {
          setData(payload)
          setError('')
        }
      } catch {
        if (!cancelled) setError('Live Data Unavailable')
      }
    }

    load()
    const timer = window.setInterval(load, 30000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return { data, error }
}

export default function Dashboard() {
  const pathname = usePathname()
  const router = useRouter()
  const activePage = pageMap[pathname] ?? 'dashboard'
  const [time, setTime] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const { data, error } = useLiveData()

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date()))
    tick()
    const timer = window.setInterval(tick, 30000)
    return () => window.clearInterval(timer)
  }, [])

  const live = data?.stationOnline === true
  const stationId = data?.current.stationId || 'KVAMARIO42'
  const locked = protectedPages.has(activePage) && !unlocked

  function guardNavigation(event: MouseEvent<HTMLAnchorElement>, itemPage: string, href: string) {
    if (!protectedPages.has(itemPage) || unlocked) return
    event.preventDefault()
    setPendingHref(href)
    setPassword('')
    setAuthError('')
  }

  function unlock() {
    if (password === 'Today2020') {
      setUnlocked(true)
      setAuthError('')
      const href = pendingHref
      setPendingHref(null)
      if (href) router.push(href)
      return
    }

    setAuthError('Incorrect password.')
  }

  return (
    <main className="dashboard-shell">
      <aside className="command-rail">
        <Link className="rail-logo" href="/" aria-label="Dashboard home">
          <CloudLightning size={42} strokeWidth={1.9} />
        </Link>
        <nav className="rail-nav">
          {railItems.map((item) => {
            const Icon = item.icon
            const active = activePage === item.label.toLowerCase()
            return (
              <Link key={item.label} onClick={(event) => guardNavigation(event, item.label.toLowerCase(), item.href)} className={`rail-button ${active ? 'active' : ''}`} href={item.href}>
                <Icon size={24} strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="rail-bottom">
          <RailBlock title="Station Status">
            <div className="online-dot"><span /> {live ? 'ONLINE' : 'UNAVAILABLE'}</div>
            <div className="mini-row">Source: {data?.source || 'Live Data Unavailable'}</div>
            <div className="mini-row">Updated: {data?.updatedAt || 'Live Data Unavailable'}</div>
            <div className="mini-row">Station: {stationId}</div>
          </RailBlock>
          <RailBlock title="Data Quality">
            <div className={live ? 'text-green-300' : 'unavailable'}>{live ? 'Live PWS' : 'Unavailable'}</div>
            <div className="quality-percent">{live ? '100%' : '0%'}</div>
            <div className="quality-bar"><span style={{ width: live ? '100%' : '0%' }} /></div>
          </RailBlock>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="top-band">
          <div className="title-cluster">
            <div className="eyebrow">LIVE PERSONAL WEATHER STATION</div>
            <h1>Staley Street Weather</h1>
            <div className="subhead">Marion, Virginia <span>•</span> Station {stationId} <span>•</span> <b className="live-text">{live ? 'LIVE' : 'UNAVAILABLE'}</b></div>
          </div>
          <div className="header-actions">
            <div className="clock-pill"><AlarmClock size={16} /> {time || '--'} <span>•</span> {new Date().toLocaleDateString()}</div>
            <div className="live-pill"><span /> {live ? 'LIVE' : 'OFFLINE'}</div>
            <nav className="top-nav">
              {topNav.map((item) => {
                const Icon = item.icon
                const active = activePage === item.label.toLowerCase()
                return (
                  <Link key={item.label} onClick={(event) => guardNavigation(event, item.label.toLowerCase(), item.href)} href={item.href} className={active ? 'active' : ''}>
                    {item.badge && <i>{item.badge}</i>}
                    <Icon size={26} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="alert-banner">
              <button type="button" onClick={() => router.push('/alarms')}><Bell size={18} /> {data?.alerts[0]?.title || error || 'Live Data Unavailable'}</button>
              <button type="button" onClick={() => router.push('/alarms')}>VIEW ALERTS <Navigation size={15} /></button>
            </div>
          </div>
        </header>

        {activePage === 'dashboard' ? <DashboardGrid data={data} /> : <ModulePage page={activePage} data={data} />}
      </section>
      {(pendingHref || locked) && (
        <div className="lock-overlay">
          <div className={`${panel} lock-panel`}>
            <div className="panel-title">PASSWORD REQUIRED</div>
            <p>This section is protected.</p>
            <input value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && unlock()} type="password" autoFocus placeholder="Password" />
            {authError && <span>{authError}</span>}
            <div className="settings-actions">
              {pendingHref && <button type="button" onClick={() => setPendingHref(null)}>Cancel</button>}
              <button type="button" onClick={unlock}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function DashboardGrid({ data }: { data: LiveDashboardPayload | null }) {
  const humidity = data?.current.humidity ?? null
  const pressure = data?.current.pressure ?? null
  const windSpeed = data?.current.windSpeed ?? null
  const windGust = data?.current.windGust ?? null
  const uv = data?.current.uv ?? null

  return (
    <div className="content-grid">
      <Hero data={data} />
      <div className="metrics-grid">
        <Metric title="Humidity" icon={<Droplets />} value={humidity} unit="%" note={humidity === null ? null : humidity > 70 ? 'Moist air mass' : 'Comfortable'} series={historySeries(data, 'humidity')} min="0" max="100" />
        <Metric title="Pressure" icon={<Gauge />} value={pressure} unit="inHg" digits={2} note={pressure === null ? null : pressure < 29.7 ? 'Low pressure' : 'Steady'} series={historySeries(data, 'pressure')} min="28.5" max="30.5" />
        <Metric title="Wind" icon={<Wind />} value={windSpeed} unit="mph" note={windSpeed === null ? null : `${data?.current.windDirection || ''} gust ${num(windGust, 0) ?? 'unavailable'} mph`} series={historySeries(data, 'wind')} min="0" max="30" />
        <UVMetric value={uv} source={data?.current.uvSource ?? null} />
      </div>

      <ForecastPanel days={data?.forecast ?? []} />
      <MoonPanel moon={data?.astronomy.moon ?? null} />

      <RadarPanel tileUrl={data?.radar.tileUrl ?? null} source={data?.radar.source ?? null} />
      <AqiPanel aqi={data?.aqi ?? null} />
      <SunMoonPanel data={data} />
      <TrendPanel data={data} />

      <StationDetails data={data} />
      <PrecipPanel value={data?.current.precipToday ?? null} />
      <LightningPanel />
      <CameraPanel />
    </div>
  )
}

function ModulePage({ page, data }: { page: string; data: LiveDashboardPayload | null }) {
  if (page === 'settings' || page === 'alarms') return <AlertSettings title={page === 'alarms' ? 'Alarm Control Center' : 'Notification Settings'} />
  if (page === 'history') return <ModuleShell title="Weather History" subtitle="Weather Underground station observations"><MiniTable data={data} /></ModuleShell>
  if (page === 'reports') return <ModuleShell title="Reports" subtitle="Daily station summary and severe-weather dispatches"><ReportActions data={data} /></ModuleShell>
  if (page === 'maps') return <ModuleShell title="Maps" subtitle="RainViewer regional precipitation radar"><RadarPanel tileUrl={data?.radar.tileUrl ?? null} source={data?.radar.source ?? null} /></ModuleShell>
  if (page === 'cameras') return <ModuleShell title="Station Cameras" subtitle="Station camera feed"><CameraPanel /></ModuleShell>
  return null
}

function AlertSettings({ title }: { title: string }) {
  const [email, setEmail] = useState('')
  const [phones, setPhones] = useState('')
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [daily, setDaily] = useState(true)
  const [severe, setSevere] = useState(true)
  const [reportTime, setReportTime] = useState('07:00')
  const [thresholds, setThresholds] = useState({
    windMph: 30,
    tempPercent: 10,
    humidityPercent: 15,
    changeWindowMinutes: 60,
    snowInches: 1,
    precipRateInches: 1,
    freezeTempF: 32
  })
  const [sections, setSections] = useState({
    current: true,
    forecast: true,
    airQuality: true,
    astronomy: true,
    precipitation: true,
    stationStatus: true,
    alerts: true
  })
  const [status, setStatus] = useState('Loading saved alert preferences...')

  useEffect(() => {
    let cancelled = false
    async function loadSaved() {
      try {
        const response = await fetch('/api/save-settings', { cache: 'no-store' })
        const saved = await response.json()
        if (cancelled || saved?.error) return
        setEmail((saved.notification_emails || []).join('\n'))
        setPhones((saved.notification_phones || []).join('\n'))
        setSmsEnabled(saved.sms_enabled === true)
        setDaily(saved.daily_report_enabled !== false)
        setSevere(saved.abnormal_alerts_enabled !== false)
        setReportTime(saved.daily_report_time || '07:00')
        setThresholds((current) => ({ ...current, ...(saved.alarm_thresholds || {}) }))
        setSections((current) => ({ ...current, ...(saved.daily_report_sections || {}) }))
        setStatus(saved.notification_emails?.length ? 'Saved recipients loaded.' : 'No saved recipients yet.')
      } catch {
        if (!cancelled) setStatus('Saved preferences could not be loaded.')
      }
    }
    loadSaved()
    return () => {
      cancelled = true
    }
  }, [])

  async function savePreferences() {
    setStatus('Saving alert preferences...')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12000)

    try {
      const response = await fetch('/api/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          notification_emails: email.split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
          notification_phones: phones.split(/[,\n]/).map((item) => item.trim()).filter(Boolean),
          sms_enabled: smsEnabled,
          daily_report_enabled: daily,
          daily_report_time: reportTime,
          daily_report_sections: sections,
          abnormal_alerts_enabled: severe,
          alarm_thresholds: thresholds
        })
      })
      const result = await response.json().catch(() => ({ ok: false, error: 'Settings service returned an invalid response' }))
      setStatus(result.ok ? 'Alert preferences saved.' : result.error || `Settings service failed (${response.status}).`)
    } catch (error: any) {
      setStatus(error?.name === 'AbortError' ? 'Settings save timed out. Please try again.' : 'Settings save failed.')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  async function sendTest() {
    setStatus('Sending test alert...')
    const response = await fetch('/api/alerts/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, phones, daily, severe, sms_enabled: smsEnabled })
    })
    const result = await response.json()
    setStatus(result.ok ? 'Test alert dispatched.' : result.error || 'Alert service not configured.')
  }

  return (
    <ModuleShell title={title} subtitle="Recipients and threshold alerts">
      <div className="settings-grid">
        <label>Email recipients<textarea value={email} onChange={(event) => setEmail(event.target.value)} rows={5} /></label>
        <label>SMS phone numbers<textarea value={phones} onChange={(event) => setPhones(event.target.value)} rows={4} placeholder="+18555555555" /></label>
        <label>Daily report time<input type="time" value={reportTime} onChange={(event) => setReportTime(event.target.value)} /></label>
        <label><input type="checkbox" checked={daily} onChange={(event) => setDaily(event.target.checked)} /> Daily weather summary</label>
        <label><input type="checkbox" checked={severe} onChange={(event) => setSevere(event.target.checked)} /> Severe threshold alerts</label>
        <label><input type="checkbox" checked={smsEnabled} onChange={(event) => setSmsEnabled(event.target.checked)} /> SMS alarm alerts</label>
        {title.toLowerCase().includes('alarm') && (
          <div className="alarm-threshold-grid">
            <label>Wind threshold<input type="number" value={thresholds.windMph} onChange={(event) => setThresholds((current) => ({ ...current, windMph: Number(event.target.value) }))} /><span>mph</span></label>
            <label>Temp spike/drop<input type="number" value={thresholds.tempPercent} onChange={(event) => setThresholds((current) => ({ ...current, tempPercent: Number(event.target.value) }))} /><span>%</span></label>
            <label>Humidity spike/drop<input type="number" value={thresholds.humidityPercent} onChange={(event) => setThresholds((current) => ({ ...current, humidityPercent: Number(event.target.value) }))} /><span>%</span></label>
            <label>Change window<input type="number" value={thresholds.changeWindowMinutes} onChange={(event) => setThresholds((current) => ({ ...current, changeWindowMinutes: Number(event.target.value) }))} /><span>min</span></label>
            <label>Heavy rain<input type="number" value={thresholds.precipRateInches} onChange={(event) => setThresholds((current) => ({ ...current, precipRateInches: Number(event.target.value) }))} /><span>in/hr</span></label>
            <label>Snow accumulation<input type="number" value={thresholds.snowInches} onChange={(event) => setThresholds((current) => ({ ...current, snowInches: Number(event.target.value) }))} /><span>in</span></label>
            <label>Freeze risk<input type="number" value={thresholds.freezeTempF} onChange={(event) => setThresholds((current) => ({ ...current, freezeTempF: Number(event.target.value) }))} /><span>F</span></label>
          </div>
        )}
        <div className="report-section-grid">
          {[
            ['stationStatus', 'Station status'],
            ['current', 'Current conditions'],
            ['forecast', '5-day forecast'],
            ['precipitation', 'Precipitation'],
            ['airQuality', 'Air quality'],
            ['astronomy', 'Sun & moon'],
            ['alerts', 'Alerts']
          ].map(([key, label]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={sections[key as keyof typeof sections]}
                onChange={(event) => setSections((current) => ({ ...current, [key]: event.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
        <div className="settings-actions">
          <button type="button" onClick={savePreferences}>Save Preferences</button>
          <button type="button" onClick={sendTest}>Send Test Alert</button>
        </div>
        <div className="settings-status">{status}</div>
      </div>
    </ModuleShell>
  )
}

function ReportActions({ data }: { data: LiveDashboardPayload | null }) {
  const [status, setStatus] = useState('')
  async function triggerDaily() {
    setStatus('Triggering daily report...')
    const response = await fetch('/api/send-daily-report?force=1')
    const result = await response.json()
    setStatus(result.ok ? `Daily report sent to ${(result.recipients || []).join(', ')}.` : result.reason || result.error || result.stage || 'Report service pending configuration.')
  }
  return (
    <div className="settings-grid">
      <div>Current report source: {data?.source || 'Live Data Unavailable'}</div>
      <button className="module-action" type="button" onClick={triggerDaily}>Trigger Daily Report</button>
      <div className="settings-status">{status}</div>
    </div>
  )
}

function ModuleShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className={`${panel} module-page`}>
      <div className="module-heading">
        <div className="panel-title">{title}</div>
        <p>{subtitle}</p>
      </div>
      <div className="module-content">{children}</div>
    </section>
  )
}

function MiniTable({ data }: { data: LiveDashboardPayload | null }) {
  const rows = data?.history.slice(-8).reverse() ?? []
  return (
    <div className="history-table">
      {rows.length ? rows.map((row, index) => (
        <div key={`${row.time}-${index}`}><span>{row.time}</span><b>{temp(row.temp)}</b><span>{row.humidity === null ? unavailable() : `${row.humidity.toFixed(0)}%`}</span><span>{row.pressure === null ? unavailable() : `${row.pressure.toFixed(2)} inHg`}</span></div>
      )) : <div><span>Weather Underground history</span><b>{unavailable()}</b></div>}
    </div>
  )
}

function RailBlock({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rail-block"><div className="rail-title">{title}</div>{children}</div>
}

function Hero({ data }: { data: LiveDashboardPayload | null }) {
  const condition = data?.current.condition || 'Live Data Unavailable'
  const sunOnly = isSunOnly(data?.current.condition)
  return (
    <section className={`${panel} hero-panel`}>
      <div className="hero-bg" />
      <div className="panel-title">CURRENT CONDITIONS</div>
      <div className="hero-content">
        <div>
          <div className="temperature">{data?.current.temperature === null || !data ? unavailable() : <>{data.current.temperature.toFixed(1)}<sup>°F</sup></>}</div>
          <div className="feels">Feels Like {data?.current.feelsLike === null || !data ? unavailable() : `${Math.round(data.current.feelsLike)}°`}</div>
          <div className="hi-lo">
            <div><b className="up">↑</b> {temp(data?.current.high ?? null)}<span>TODAY HIGH</span></div>
            <div><b className="down">↓</b> {temp(data?.current.low ?? null)}<span>TODAY LOW</span></div>
          </div>
        </div>
        <div className="condition-glyph">
          {sunOnly && data?.current.isDaylight ? <Sun size={128} strokeWidth={1.7} /> : <CloudRain size={128} strokeWidth={1.7} />}
          <strong>{condition}</strong>
        </div>
      </div>
    </section>
  )
}

function Metric({ title, icon, value, unit, note, series, min, max, digits = 0 }: { title: string; icon: ReactNode; value: LiveNumber; unit: string; note: string | null; series: number[]; min: string; max: string; digits?: number }) {
  const valueText = value === null ? unavailable() : <>{value.toFixed(digits)}<span>{unit}</span></>
  return (
    <section className={`${panel} metric-card`}>
      <div className="metric-title">{title}</div>
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{valueText}</div>
      <div className="metric-note">{note || 'Live Data Unavailable'}</div>
      <Sparkline values={series} />
      <div className="metric-scale"><span>{min}</span><span>{max}</span></div>
    </section>
  )
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <div className="sparkline-empty">Live Data Unavailable</div>
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values.map((value, index) => `${((index / (values.length - 1)) * 100).toFixed(2)},${(26 - ((value - min) / Math.max(max - min, 1)) * 18).toFixed(2)}`).join(' ')
  return <svg className="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points={points} fill="none" stroke="rgba(42,255,126,.24)" strokeWidth="3" strokeLinecap="round" /><polyline points={points} fill="none" stroke="#42ff7e" strokeWidth="1.15" strokeLinecap="round" /></svg>
}

function UVMetric({ value, source }: { value: LiveNumber; source: string | null }) {
  return (
    <section className={`${panel} metric-card`}>
      <div className="metric-title">UV Index</div>
      <div className="metric-icon"><Sun /></div>
      <div className="metric-value">{value === null ? unavailable() : value.toFixed(0)}</div>
      <div className="metric-note">{value === null ? 'Live Data Unavailable' : `${value > 7 ? 'High' : value > 4 ? 'Moderate' : 'Low'}${source ? ` - ${source}` : ''}`}</div>
      <div className="uv-bar">{['#37d85c', '#8be32e', '#ffd233', '#ff9124', '#ef394d'].map((color, index) => <span key={color} style={{ background: color }} className={value !== null && Math.floor(value / 2) === index ? 'tick' : ''} />)}</div>
      <div className="metric-scale"><span>0</span><span>5</span><span>11+</span></div>
    </section>
  )
}

function ForecastPanel({ days }: { days: LiveDashboardPayload['forecast'] }) {
  return (
    <section className={`${panel} forecast-panel`}>
      <div className="panel-title">5 DAY FORECAST</div>
      <div className="forecast-grid">
        {Array.from({ length: 5 }).map((_, index) => {
          const day = days[index]
          return (
            <article key={index} className="forecast-card">
              <div className="forecast-bg" style={{ backgroundImage: `url(${forecastImages[index]})` }} />
              <div className="forecast-shade" />
              <div className="forecast-day">{day?.day || 'LIVE DATA'}</div>
              <WeatherIcon index={index} />
              <div className="forecast-temps"><b>{temp(day?.high ?? null)}</b><span>{temp(day?.low ?? null)}</span></div>
              <div className="forecast-condition">{day?.condition || 'Live Data Unavailable'}</div>
              <div className="forecast-precip"><Droplets size={13} /> {day?.precip === null || !day ? 'Live Data Unavailable' : `${day.precip}%`}</div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function WeatherIcon({ index }: { index: number }) {
  if (index === 0) return <CloudRain className="forecast-icon rainy" size={76} />
  if (index === 1) return <CloudLightning className="forecast-icon storm" size={76} />
  return <Sun className="forecast-icon sunny" size={76} />
}

function MoonPanel({ moon }: { moon: LiveDashboardPayload['astronomy']['moon'] | null }) {
  return (
    <section className={`${panel} moon-panel`}>
      <div className="star-field" />
      <div className="panel-title">CURRENT MOON <Info size={13} /></div>
      <div className="moon-visual" aria-label={moon?.phaseName || 'moon phase'}>
        {moon?.phaseImageUrl ? <img src={moon.phaseImageUrl} alt={moon.phaseName} /> : <div className="moon-unavailable">Live Data Unavailable</div>}
      </div>
      <div className="moon-copy"><strong>{moon?.phaseName || 'Live Data Unavailable'}</strong><span>Illumination: {moon ? `${moon.illumination}%` : 'Live Data Unavailable'}</span><span>Age: {moon ? `${moon.age} days` : 'Live Data Unavailable'}</span></div>
    </section>
  )
}

function RadarPanel({ tileUrl, source }: { tileUrl: string | null; source: string | null }) {
  return (
    <section className={`${panel} radar-panel`}>
      <div className="panel-title">LIVE RADAR</div>
      <div className="radar-map">
        {tileUrl ? <div className="radar-tile" style={{ backgroundImage: `url(${tileUrl})` }} /> : <div className="radar-unavailable">Live Radar Unavailable</div>}
        {tileUrl && <><span className="map-label bristol">Bristol</span><span className="map-label abingdon">Abingdon</span><span className="map-label wytheville">Wytheville</span></>}
      </div>
      <div className="radar-legend"><i /> <span>{source || 'Unavailable'}</span><span>Light</span><span>Moderate</span><span>Heavy</span></div>
    </section>
  )
}

function AqiPanel({ aqi }: { aqi: LiveDashboardPayload['aqi'] | null }) {
  const pollutants = [
    ['PM2.5', aqi?.pm25],
    ['PM10', aqi?.pm10],
    ['OZONE', aqi?.ozone],
    ['CO', aqi?.co],
    ['NO2', aqi?.no2]
  ]
  return <section className={`${panel} aqi-panel`}><div className="panel-title">AIR QUALITY</div><div className="aqi-content"><div className="aqi-gauge"><div className="aqi-ring" /><div className="aqi-value">{aqi?.value === null || !aqi ? '—' : Math.round(aqi.value)}<span>{aqi?.label || 'Unavailable'}</span><small>AQI (US)</small></div></div><div className="pollutants">{pollutants.map(([label, value]) => <span key={String(label)}>{label} {typeof value === 'number' ? Math.round(value) : 'Unavailable'}</span>)}</div></div><div className="aqi-note"><span>✓</span> {aqi?.label ? `${aqi.label} air quality` : 'Live Data Unavailable'}</div></section>
}

function SunMoonPanel({ data }: { data: LiveDashboardPayload | null }) {
  const astro = data?.astronomy
  return <section className={`${panel} astro-panel`}><div className="panel-title">SUN & MOON</div><svg viewBox="0 0 360 165" className="astro-svg"><path d="M35 88 Q180 -10 325 88" fill="none" stroke="#ffae19" strokeWidth="2" /><path d="M60 140 Q180 98 300 140" fill="none" stroke="#8ba4b6" strokeWidth="1.3" opacity=".7" /><line x1="25" y1="88" x2="335" y2="88" stroke="rgba(255,255,255,.18)" />{[35, 180, 325, 60, 180, 300].map((x, i) => <circle key={i} cx={x} cy={i < 3 ? (i === 1 ? 20 : 88) : (i === 4 ? 120 : 140)} r={i === 1 ? 12 : 4} fill={i < 3 ? '#ffae19' : '#dfe9f2'} />)}</svg><div className="astro-times"><span>{astro?.sunrise || 'Unavailable'}<br /><b>Sunrise</b></span><span>{astro?.daylight || 'Unavailable'}<br /><b>Daylight</b></span><span>{astro?.sunset || 'Unavailable'}<br /><b>Sunset</b></span><span>{astro?.moonrise || 'Unavailable'}<br /><b>Moonrise</b></span><span>{astro?.moonVisible || 'Unavailable'}<br /><b>Visible</b></span><span>{astro?.moonset || 'Unavailable'}<br /><b>Moonset</b></span></div></section>
}

function TrendPanel({ data }: { data: LiveDashboardPayload | null }) {
  const rows = data?.history.filter((row) => row.temp !== null && row.feels !== null).slice(-16) ?? []
  const labels = rows.filter((_, index) => index === 0 || index === rows.length - 1 || index % Math.max(1, Math.floor(rows.length / 5)) === 0)
  return <section className={`${panel} trend-panel`}><div className="panel-title">TEMPERATURE TREND <span>(24H)</span></div><div className="trend-legend"><span className="orange" /> Temp (°F) <span className="blue" /> Feels Like (°F)</div>{rows.length >= 4 ? <Chart rows={rows} /> : <div className="trend-empty">Live Trend Data Unavailable</div>}<div className="trend-axis">{rows.length >= 4 ? labels.map((row, index) => <span key={`${row.timestamp || row.time}-${index}`}>{row.time}</span>) : <span>Live Trend Data Unavailable</span>}</div></section>
}

function Chart({ rows }: { rows: Array<{ temp: number | null; feels: number | null }> }) {
  const a = rows.map((row) => row.temp as number)
  const b = rows.map((row) => row.feels as number)
  const values = [...a, ...b]
  const min = Math.min(...values) - 3
  const max = Math.max(...values) + 3
  const make = (series: number[]) => series.map((v, i) => `${(i / Math.max(series.length - 1, 1)) * 100},${100 - ((v - min) / Math.max(max - min, 1)) * 100}`).join(' ')
  return <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none">{[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.08)" />)}{[18, 40, 62, 84].map((x) => <line key={x} y1="0" y2="100" x1={x} x2={x} stroke="rgba(255,255,255,.06)" />)}<polyline points={make(a)} fill="none" stroke="#ff8a12" strokeWidth="1.8" /><polyline points={make(b)} fill="none" stroke="#168fff" strokeWidth="1.6" /></svg>
}

function StationDetails({ data }: { data: LiveDashboardPayload | null }) {
  return <section className={`${panel} station-details`}><div className="panel-title">STATION DETAILS</div><span>Station: <b>{data?.current.stationId || 'KVAMARIO42'}</b></span><span>Location: <b>{data?.current.location || 'Marion, Virginia'}</b></span><span>Elevation: <b>{data?.station?.imperial?.elev ? `${data.station.imperial.elev.toFixed(0)} ft` : 'Live Data Unavailable'}</b></span><span>Lat / Lon: <b>{data?.station?.lat && data?.station?.lon ? `${data.station.lat}° N, ${Math.abs(data.station.lon)}° W` : 'Live Data Unavailable'}</b></span></section>
}

function PrecipPanel({ value }: { value: LiveNumber }) {
  return <TelemetryPanel className="precip-panel" title="PRECIPITATION" icon={<Droplets size={17} />} stats={[[value === null ? 'Live Data Unavailable' : value.toFixed(2), value === null ? '' : 'in', 'TODAY'], ['Live Data Unavailable', '', 'WEEK'], ['Live Data Unavailable', '', 'MONTH'], ['Live Data Unavailable', '', 'YEAR']]} />
}

function LightningPanel() {
  return <TelemetryPanel className="lightning-panel" title="LIGHTNING (24H)" icon={<Zap size={17} />} stats={[['Live Data Unavailable', '', 'Total Strikes'], ['Live Data Unavailable', '', 'Near Station'], ['Live Data Unavailable', '', 'Cloud Strikes'], ['Live Data Unavailable', '', 'Cloud to Ground']]} />
}

function TelemetryPanel({ className, title, icon, stats }: { className: string; title: string; icon: ReactNode; stats: string[][] }) {
  return <section className={`${panel} telemetry-panel ${className}`}><div className="panel-title">{icon} {title}</div><div className="telemetry-cards">{stats.map(([value, unit, label]) => <div key={label}><strong>{value}<small>{unit}</small></strong><span>{label}</span></div>)}</div></section>
}

function CameraPanel() {
  return <section className={`${panel} camera-panel unavailable-camera`}><div className="panel-title">STATION CAMERA</div><div className="camera-unavailable">Camera bridge unavailable</div><div className="camera-copy">No live camera endpoint is configured.</div><Link href="/cameras">CAMERA STATUS <Navigation size={14} /></Link></section>
}
