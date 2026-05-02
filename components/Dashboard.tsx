'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
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
  Lock,
  Mail,
  MapPin,
  Navigation,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Smartphone,
  Sun,
  Wind,
  Zap
} from 'lucide-react'
import { getMoonDetails } from '@/lib/moon'
import { normalizeWeather } from '@/lib/dashboardData'

const panel = 'border border-cyan-300/30 bg-[#03101a]/82 shadow-[0_0_18px_rgba(0,221,255,0.18),inset_0_0_30px_rgba(0,190,255,0.045)] backdrop-blur-md'

const metricLines = {
  humidity: [58.8, 59.1, 58.9, 59.2, 58.7, 58.9, 58.5, 59.1, 58.8, 59, 58.6, 58.7, 59.4, 59.1, 59.3, 58.9, 59, 59.5, 58.9, 59.2, 59, 59.1],
  pressure: [29.94, 29.94, 29.93, 29.94, 29.93, 29.93, 29.93, 29.94, 29.93, 29.93, 29.92, 29.93, 29.89, 29.92, 29.93, 29.94, 29.93, 29.94, 29.94, 29.95, 29.94, 29.95],
  wind: [4, 5, 6, 5, 6, 8, 7, 8, 9, 7, 8, 10, 9, 11, 10, 8, 10, 9, 11, 10, 9, 10]
}

const forecastImages = [
  'https://images.unsplash.com/photo-1519692933481-e162a57d6721?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1000&auto=format&fit=crop'
]

const navItems = [
  { label: 'Dashboard', icon: Grid2X2 },
  { label: 'History', icon: History },
  { label: 'Alarms', icon: Bell, badge: '2' },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings }
]

const railItems = [
  { label: 'Dashboard', icon: Home },
  { label: 'History', icon: History },
  { label: 'Alarms', icon: Bell },
  { label: 'Reports', icon: FileText },
  { label: 'Maps', icon: MapPin },
  { label: 'Cameras', icon: Camera },
  { label: 'Settings', icon: Settings }
]

const protectedTabs = new Set(['History', 'Alarms', 'Reports', 'Maps', 'Cameras', 'Settings'])

const defaultSettingsState = {
  notification_emails: '',
  notification_phones: '',
  daily_report_time: '07:00',
  daily_report_enabled: true,
  abnormal_alerts_enabled: true,
  site_title: 'Staley Street Weather',
  station_label: 'KVAMARI042',
  station_location: 'Marion, Virginia',
  timezone: 'America/New_York',
  sms_enabled: false,
  alarm_thresholds: {
    windMph: 30,
    tempPercent: 10,
    humidityPercent: 15,
    changeWindowMinutes: 60,
    snowInches: 1,
    precipRateInches: 1,
    freezeTempF: 32
  }
}

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [time, setTime] = useState('3:00 PM')
  const [activeView, setActiveView] = useState('Dashboard')
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [pendingView, setPendingView] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [settings, setSettings] = useState(defaultSettingsState)
  const [status, setStatus] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [stationResponse, forecastResponse] = await Promise.all([
          fetch('/api/station'),
          fetch('/api/forecast')
        ])
        setStation(await stationResponse.json())
        setForecast(await forecastResponse.json())
      } catch {
        setStation({})
        setForecast([])
      }
    }

    load()
    const weatherTimer = setInterval(load, 8000)
    const clockTimer = setInterval(() => {
      setTime(new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date()))
    }, 30000)
    return () => {
      clearInterval(weatherTimer)
      clearInterval(clockTimer)
    }
  }, [])

  useEffect(() => {
    fetch('/api/save-settings')
      .then((response) => response.json())
      .then((data) => {
        setSettings({
          notification_emails: (data.notification_emails || []).join('\n'),
          notification_phones: (data.notification_phones || []).join('\n'),
          daily_report_time: data.daily_report_time || defaultSettingsState.daily_report_time,
          daily_report_enabled: data.daily_report_enabled ?? defaultSettingsState.daily_report_enabled,
          abnormal_alerts_enabled: data.abnormal_alerts_enabled ?? defaultSettingsState.abnormal_alerts_enabled,
          site_title: data.site_title || defaultSettingsState.site_title,
          station_label: data.station_label || defaultSettingsState.station_label,
          station_location: data.station_location || defaultSettingsState.station_location,
          timezone: data.timezone || defaultSettingsState.timezone,
          sms_enabled: data.sms_enabled ?? defaultSettingsState.sms_enabled,
          alarm_thresholds: { ...defaultSettingsState.alarm_thresholds, ...(data.alarm_thresholds || {}) }
        })
      })
      .catch(() => undefined)
  }, [])

  const weather = useMemo(() => normalizeWeather(station, forecast), [station, forecast])
  const moon = useMemo(() => getMoonDetails(), [])
  const pageTitle = settings.site_title || 'Staley Street Weather'

  function openView(label: string) {
    if (protectedTabs.has(label) && !unlocked) {
      setPendingView(label)
      setPassword('')
      setAuthError('')
      return
    }

    setActiveView(label)
  }

  function unlock() {
    if (password === 'Today2020') {
      setUnlocked(true)
      setActiveView(pendingView || 'Dashboard')
      setPendingView(null)
      setPassword('')
      setAuthError('')
      return
    }

    setAuthError('Incorrect password.')
  }

  async function saveSettings() {
    setStatus('Saving preferences...')
    const response = await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...settings,
        notification_emails: settings.notification_emails.split('\n').map((item) => item.trim()).filter(Boolean),
        notification_phones: settings.notification_phones.split('\n').map((item) => item.trim()).filter(Boolean)
      })
    })
    const data = await response.json()
    setStatus(data.ok ? 'Preferences saved.' : `Save failed: ${data.error || data.stage || 'Unknown error'}`)
  }

  async function sendDailyTest() {
    setStatus('Sending daily report test...')
    const response = await fetch('/api/send-daily-report')
    const data = await response.json()
    setStatus(data.ok ? `Daily report sent to ${data.recipients?.length || 0} recipient(s).` : `Report failed: ${data.error || data.stage}`)
  }

  async function sendAlarmTest() {
    setStatus('Sending alarm test...')
    const response = await fetch('/api/send-alert-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'Manual Weather Alarm Test',
        message: 'Manual trigger test from the Staley Street Weather alarm center.'
      })
    })
    const data = await response.json()
    setStatus(data.ok ? 'Alarm notification test sent.' : `Alarm test failed: ${data.error || data.stage}`)
  }

  function updateThreshold(key: keyof typeof defaultSettingsState.alarm_thresholds, value: string) {
    setSettings((current) => ({
      ...current,
      alarm_thresholds: {
        ...current.alarm_thresholds,
        [key]: Number(value)
      }
    }))
  }

  return (
    <main className="dashboard-shell">
      <aside className="command-rail">
        <div className="rail-logo">
          <CloudLightning size={42} strokeWidth={1.9} />
        </div>
        <nav className="rail-nav">
          {railItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.label} onClick={() => openView(item.label)} className={`rail-button ${activeView === item.label ? 'active' : ''}`} aria-label={item.label}>
                <Icon size={24} strokeWidth={1.7} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="rail-bottom">
          <RailBlock title="Station Status">
            <div className="online-dot"><span /> ONLINE</div>
            <div className="mini-row">Signal: 98% <Signal size={16} className="text-green-400" /></div>
            <div className="mini-row">Uptime: 15d 4h</div>
            <div className="mini-row">Last Restart:<br />Apr 13, 1:22 AM</div>
          </RailBlock>
          <RailBlock title="Data Quality">
            <div className="text-green-300">Excellent</div>
            <div className="quality-percent">100%</div>
            <div className="quality-bar"><span /></div>
          </RailBlock>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="top-band">
          <div>
            <div className="eyebrow">LIVE PERSONAL WEATHER STATION</div>
            <h1>{pageTitle}</h1>
            <div className="subhead">Marion, Virginia <span>•</span> Station KVAMARI042 <span>•</span> <b className="live-text">LIVE</b></div>
          </div>
          <div className="header-actions">
            <div className="clock-pill"><AlarmClock size={16} /> {time} <span>•</span> Apr 28, 2026</div>
            <div className="live-pill"><span /> LIVE</div>
            <nav className="top-nav">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.label} onClick={() => openView(item.label)} className={activeView === item.label ? 'active' : ''}>
                    {item.badge && <i>{item.badge}</i>}
                    <Icon size={26} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="alert-banner">
              <span><Bell size={18} /> Slight Chance of Rain Showers After 5PM</span>
              <button>VIEW ALERTS <Navigation size={15} /></button>
            </div>
          </div>
        </header>

        {activeView === 'Dashboard' ? (
          <div className="content-grid">
            <Hero weather={weather} />
            <div className="metrics-grid">
              <Metric title="Humidity" icon={<Droplets />} value={Math.round(weather.humidity)} unit="%" note="Comfortable" series={metricLines.humidity} min="0" max="100" />
              <Metric title="Pressure" icon={<Gauge />} value={weather.pressure.toFixed(2)} unit="inHg" note="Steady" series={metricLines.pressure} min="28.5" max="30.5" />
              <Metric title="Wind" icon={<Wind />} value={Math.round(weather.wind)} unit="mph" note={`WNW  Gust ${Math.round(weather.windGust)} mph`} series={metricLines.wind} min="0" max="30" />
              <UVMetric value={Math.round(weather.uv)} />
            </div>

            <ForecastPanel days={weather.forecast} />
            <MoonPanel moon={moon} />

            <RadarPanel />
            <AqiPanel />
            <SunMoonPanel />
            <TrendPanel />

            <StationDetails />
            <PrecipPanel />
            <LightningPanel />
            <CameraPanel />
          </div>
        ) : (
          <ControlView
            activeView={activeView}
            settings={settings}
            setSettings={setSettings}
            status={status}
            saveSettings={saveSettings}
            sendDailyTest={sendDailyTest}
            sendAlarmTest={sendAlarmTest}
            updateThreshold={updateThreshold}
          />
        )}
      </section>
      {pendingView && (
        <div className="lock-overlay">
          <div className={`${panel} lock-panel`}>
            <Lock size={34} />
            <div>
              <div className="panel-title">PASSWORD REQUIRED</div>
              <p>{pendingView} is protected.</p>
            </div>
            <input value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && unlock()} type="password" autoFocus placeholder="Password" />
            {authError && <span>{authError}</span>}
            <div className="lock-actions">
              <button onClick={() => setPendingView(null)}>Cancel</button>
              <button onClick={unlock}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function ControlView({
  activeView,
  settings,
  setSettings,
  status,
  saveSettings,
  sendDailyTest,
  sendAlarmTest,
  updateThreshold
}: {
  activeView: string
  settings: typeof defaultSettingsState
  setSettings: Dispatch<SetStateAction<typeof defaultSettingsState>>
  status: string
  saveSettings: () => void
  sendDailyTest: () => void
  sendAlarmTest: () => void
  updateThreshold: (key: keyof typeof defaultSettingsState.alarm_thresholds, value: string) => void
}) {
  if (activeView === 'Settings') {
    return (
      <section className={`${panel} control-page`}>
        <ControlHeader icon={<SlidersHorizontal />} title="Website Settings" detail="Site identity, report schedule, and delivery settings" />
        <div className="control-grid two">
          <Field label="Website title" value={settings.site_title} onChange={(value) => setSettings((current) => ({ ...current, site_title: value }))} />
          <Field label="Station label" value={settings.station_label} onChange={(value) => setSettings((current) => ({ ...current, station_label: value }))} />
          <Field label="Station location" value={settings.station_location} onChange={(value) => setSettings((current) => ({ ...current, station_location: value }))} />
          <Field label="Timezone" value={settings.timezone} onChange={(value) => setSettings((current) => ({ ...current, timezone: value }))} />
          <Field label="Daily report time" type="time" value={settings.daily_report_time} onChange={(value) => setSettings((current) => ({ ...current, daily_report_time: value }))} />
          <Toggle label="Daily reports enabled" checked={settings.daily_report_enabled} onChange={(checked) => setSettings((current) => ({ ...current, daily_report_enabled: checked }))} />
        </div>
        <div className="recipient-grid">
          <TextArea icon={<Mail />} label="Email mailing list" value={settings.notification_emails} onChange={(value) => setSettings((current) => ({ ...current, notification_emails: value }))} />
          <TextArea icon={<Smartphone />} label="SMS phone list" value={settings.notification_phones} onChange={(value) => setSettings((current) => ({ ...current, notification_phones: value }))} />
        </div>
        <div className="control-actions">
          <button onClick={saveSettings}><Save size={16} /> Save Preferences</button>
          <button onClick={sendDailyTest}><Send size={16} /> Send Daily Test</button>
          {status && <span>{status}</span>}
        </div>
      </section>
    )
  }

  if (activeView === 'Alarms') {
    return (
      <section className={`${panel} control-page`}>
        <ControlHeader icon={<Bell />} title="Alarm Control Center" detail="Abnormal weather triggers and automatic notifications" />
        <div className="control-grid two">
          <Toggle label="Abnormal alarms enabled" checked={settings.abnormal_alerts_enabled} onChange={(checked) => setSettings((current) => ({ ...current, abnormal_alerts_enabled: checked }))} />
          <Toggle label="SMS enabled" checked={settings.sms_enabled} onChange={(checked) => setSettings((current) => ({ ...current, sms_enabled: checked }))} />
          <Threshold label="Wind threshold" unit="mph" value={settings.alarm_thresholds.windMph} onChange={(value) => updateThreshold('windMph', value)} />
          <Threshold label="Temp spike/drop" unit="%" value={settings.alarm_thresholds.tempPercent} onChange={(value) => updateThreshold('tempPercent', value)} />
          <Threshold label="Humidity spike/drop" unit="%" value={settings.alarm_thresholds.humidityPercent} onChange={(value) => updateThreshold('humidityPercent', value)} />
          <Threshold label="Change window" unit="min" value={settings.alarm_thresholds.changeWindowMinutes} onChange={(value) => updateThreshold('changeWindowMinutes', value)} />
          <Threshold label="Heavy rain" unit="in/hr" value={settings.alarm_thresholds.precipRateInches} onChange={(value) => updateThreshold('precipRateInches', value)} />
          <Threshold label="Snow accumulation" unit="in" value={settings.alarm_thresholds.snowInches} onChange={(value) => updateThreshold('snowInches', value)} />
          <Threshold label="Freeze risk temp" unit="F" value={settings.alarm_thresholds.freezeTempF} onChange={(value) => updateThreshold('freezeTempF', value)} />
        </div>
        <div className="alarm-summary">
          <span>Alarms email everyone in the mailing list automatically.</span>
          <span>SMS uses the same trigger list when Twilio environment variables are configured.</span>
        </div>
        <div className="control-actions">
          <button onClick={saveSettings}><Save size={16} /> Save Alarm Rules</button>
          <button onClick={sendAlarmTest}><Send size={16} /> Send Alarm Test</button>
          {status && <span>{status}</span>}
        </div>
      </section>
    )
  }

  if (activeView === 'Reports') {
    return (
      <section className={`${panel} control-page compact`}>
        <ControlHeader icon={<FileText />} title="Reports" detail="Automatic dispatch is handled by the notification cron" />
        <div className="report-tile"><AlarmClock /> Daily report at {settings.daily_report_time} {settings.timezone}</div>
        <div className="control-actions">
          <button onClick={sendDailyTest}><Send size={16} /> Send Report Now</button>
          {status && <span>{status}</span>}
        </div>
      </section>
    )
  }

  return (
    <section className={`${panel} control-page compact`}>
      <ControlHeader icon={<ShieldCheck />} title={activeView} detail="Protected module unlocked" />
      <div className="report-tile">This protected section is ready for the next build-out.</div>
    </section>
  )
}

function ControlHeader({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="control-header">
      <div>{icon}</div>
      <div>
        <h2>{title}</h2>
        <span>{detail}</span>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return (
    <label className="control-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Threshold({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (value: string) => void }) {
  return (
    <label className="control-field threshold-field">
      <span>{label}</span>
      <div>
        <input type="number" value={value} onChange={(event) => onChange(event.target.value)} />
        <b>{unit}</b>
      </div>
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="toggle-field">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

function TextArea({ icon, label, value, onChange }: { icon: ReactNode; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="textarea-field">
      <span>{icon} {label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder="One per line" />
    </label>
  )
}

function RailBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rail-block">
      <div className="rail-title">{title}</div>
      {children}
    </div>
  )
}

function Hero({ weather }: { weather: ReturnType<typeof normalizeWeather> }) {
  return (
    <section className={`${panel} hero-panel`}>
      <div className="hero-bg" />
      <div className="panel-title">CURRENT CONDITIONS</div>
      <div className="hero-content">
        <div>
          <div className="temperature">{weather.temp.toFixed(1)}<sup>°F</sup></div>
          <div className="feels">Feels Like {Math.round(weather.feelsLike)}°</div>
          <div className="hi-lo">
            <div><b className="up">↑</b> {weather.high}°<span>TODAY HIGH</span></div>
            <div><b className="down">↓</b> {weather.low}°<span>TODAY LOW</span></div>
          </div>
        </div>
        <div className="condition-glyph">
          <CloudRain size={112} strokeWidth={1.7} />
          <strong>Rain</strong>
        </div>
      </div>
    </section>
  )
}

function Metric({ title, icon, value, unit, note, series, min, max }: { title: string; icon: ReactNode; value: string | number; unit: string; note: string; series: number[]; min: string; max: string }) {
  return (
    <section className={`${panel} metric-card`}>
      <div className="metric-title">{title}</div>
      <div className="metric-icon">{icon}</div>
      <div className="metric-value">{value}<span>{unit}</span></div>
      <div className="metric-note">{note}</div>
      <Sparkline values={series} />
      <div className="metric-scale"><span>{min}</span><span>{max}</span></div>
    </section>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100
    const y = 26 - ((value - min) / Math.max(max - min, 1)) * 18
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')

  return (
    <svg className="sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="rgba(42,255,126,.30)" strokeWidth="4" strokeLinecap="round" />
      <polyline points={points} fill="none" stroke="#42ff7e" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function UVMetric({ value }: { value: number }) {
  return (
    <section className={`${panel} metric-card`}>
      <div className="metric-title">UV Index</div>
      <div className="metric-icon"><Sun /></div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">Low</div>
      <div className="uv-bar">
        {['#37d85c', '#8be32e', '#ffd233', '#ff9124', '#ef394d'].map((color, index) => <span key={color} style={{ background: color }} className={index === 1 ? 'tick' : ''} />)}
      </div>
      <div className="metric-scale"><span>0</span><span>5</span><span>11+</span></div>
    </section>
  )
}

function ForecastPanel({ days }: { days: ReturnType<typeof normalizeWeather>['forecast'] }) {
  return (
    <section className={`${panel} forecast-panel`}>
      <div className="panel-title">5 DAY FORECAST</div>
      <div className="forecast-grid">
        {days.map((day, index) => (
          <article key={`${day.day}-${index}`} className="forecast-card">
            <div className="forecast-bg" style={{ backgroundImage: `url(${forecastImages[index]})` }} />
            <div className="forecast-shade" />
            <div className="forecast-day">{day.day}</div>
            <WeatherIcon index={index} />
            <div className="forecast-temps"><b>{Math.round(day.high)}°</b><span>{Math.round(day.low)}°</span></div>
            <div className="forecast-condition">{day.condition}</div>
            <div className="forecast-precip"><Droplets size={13} /> {day.precip}%</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function WeatherIcon({ index }: { index: number }) {
  if (index === 0) return <CloudRain className="forecast-icon rainy" size={72} />
  if (index === 1) return <CloudLightning className="forecast-icon storm" size={72} />
  return <Sun className="forecast-icon sunny" size={72} />
}

function MoonPanel({ moon }: { moon: ReturnType<typeof getMoonDetails> }) {
  const shadowSide = moon.waxing ? 'left' : 'right'
  return (
    <section className={`${panel} moon-panel`}>
      <div className="star-field" />
      <div className="panel-title">CURRENT MOON <Info size={13} /></div>
      <div className="moon-visual" aria-label={moon.phaseName}>
        <div className="moon-texture" />
        <div className={`moon-shadow ${shadowSide}`} style={{ width: `${moon.shadowWidth}px` }} />
      </div>
      <div className="moon-copy">
        <strong>{moon.phaseName}</strong>
        <span>Illumination: {moon.illumination}%</span>
        <span>Age: {moon.age} days</span>
      </div>
    </section>
  )
}

function RadarPanel() {
  return (
    <section className={`${panel} radar-panel`}>
      <div className="panel-title">LIVE RADAR</div>
      <div className="radar-map">
        <svg viewBox="0 0 520 250" preserveAspectRatio="none">
          <defs>
            <filter id="blur"><feGaussianBlur stdDeviation="4" /></filter>
          </defs>
          <rect width="520" height="250" fill="#06120f" />
          {Array.from({ length: 28 }).map((_, i) => <path key={i} d={`M${i * 22 - 60},250 C${120 + i * 5},${210 - i * 3} ${190 + i * 7},${90 + i * 4} 580,${20 + i * 8}`} stroke="rgba(38,120,84,.35)" strokeWidth="1" fill="none" />)}
          <path d="M0,55 C80,70 130,35 200,65 S330,110 520,70" stroke="rgba(198,119,58,.55)" fill="none" />
          <path d="M20,185 C100,150 145,180 210,145 S330,115 500,130" stroke="rgba(198,119,58,.42)" fill="none" />
          <path d="M230,0 C286,58 338,82 388,136 S460,212 525,238" stroke="rgba(39,255,113,.58)" strokeWidth="48" fill="none" filter="url(#blur)" />
          <path d="M280,0 C336,66 374,102 426,162 S480,220 525,245" stroke="rgba(239,255,35,.76)" strokeWidth="31" fill="none" filter="url(#blur)" />
          <path d="M337,26 C382,80 418,128 456,184 S492,220 526,246" stroke="rgba(255,117,18,.78)" strokeWidth="21" fill="none" filter="url(#blur)" />
          <path d="M376,68 C416,118 446,162 475,207 S504,232 526,248" stroke="rgba(239,36,35,.78)" strokeWidth="12" fill="none" filter="url(#blur)" />
          <circle cx="300" cy="135" r="10" fill="#2287ff" stroke="#fff" strokeWidth="2" />
        </svg>
        <span className="map-label bristol">Bristol</span>
        <span className="map-label abingdon">Abingdon</span>
        <span className="map-label wytheville">Wytheville</span>
      </div>
      <div className="radar-legend"><i /> <span>Light</span><span>Moderate</span><span>Heavy</span><span>Severe</span></div>
    </section>
  )
}

function AqiPanel() {
  return (
    <section className={`${panel} aqi-panel`}>
      <div className="panel-title">AIR QUALITY</div>
      <div className="aqi-content">
        <div className="aqi-gauge">
          <div className="aqi-ring" />
          <div className="aqi-value">28<span>Good</span><small>AQI (US)</small></div>
        </div>
        <div className="pollutants">
          {['PM2.5 12', 'PM10 18', 'OZONE 28', 'CO 0.3', 'NO₂ 8'].map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      <div className="aqi-note"><span>✓</span> Great day to be outside!</div>
    </section>
  )
}

function SunMoonPanel() {
  return (
    <section className={`${panel} astro-panel`}>
      <div className="panel-title">SUN & MOON</div>
      <svg viewBox="0 0 360 165" className="astro-svg">
        <path d="M35 88 Q180 -10 325 88" fill="none" stroke="#ffae19" strokeWidth="2" />
        <path d="M60 140 Q180 98 300 140" fill="none" stroke="#8ba4b6" strokeWidth="1.3" opacity=".7" />
        <line x1="25" y1="88" x2="335" y2="88" stroke="rgba(255,255,255,.18)" />
        {[35, 180, 325, 60, 180, 300].map((x, i) => <circle key={i} cx={x} cy={i < 3 ? (i === 1 ? 20 : 88) : (i === 4 ? 120 : 140)} r={i === 1 ? 12 : 4} fill={i < 3 ? '#ffae19' : '#dfe9f2'} />)}
      </svg>
      <div className="astro-times">
        <span>6:16 AM<br /><b>Sunrise</b></span><span>8h 12m<br /><b>Daylight</b></span><span>8:28 PM<br /><b>Sunset</b></span>
        <span>12:58 AM<br /><b>Moonrise</b></span><span>14h 45m<br /><b>Visible</b></span><span>2:43 PM<br /><b>Moonset</b></span>
      </div>
    </section>
  )
}

function TrendPanel() {
  const temp = [70, 66, 64, 65, 62, 61, 59, 57, 58, 55, 56, 60, 65, 63, 64, 67, 70, 73, 76, 82, 72]
  const feels = [60, 56, 54, 55, 52, 53, 51, 52, 49, 48, 51, 55, 56, 57, 58, 61, 64, 68, 72, 69, 62]
  return (
    <section className={`${panel} trend-panel`}>
      <div className="panel-title">TEMPERATURE TREND <span>(24H)</span></div>
      <div className="trend-legend"><span className="orange" /> Temp (°F) <span className="blue" /> Feels Like (°F)</div>
      <Chart a={temp} b={feels} />
      <div className="trend-axis"><span>3 PM</span><span>7 PM</span><span>11 PM</span><span>3 AM</span><span>7 AM</span><span>11 AM</span><span>3 PM</span></div>
    </section>
  )
}

function Chart({ a, b }: { a: number[]; b: number[] }) {
  const make = (values: number[]) => values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - 35) / 55) * 100}`).join(' ')
  return (
    <svg className="trend-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
      {[20, 40, 60, 80].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="rgba(255,255,255,.08)" />)}
      {[18, 40, 62, 84].map((x) => <line key={x} y1="0" y2="100" x1={x} x2={x} stroke="rgba(255,255,255,.06)" />)}
      <polyline points={make(a)} fill="none" stroke="#ff8a12" strokeWidth="1.8" />
      <polyline points={make(b)} fill="none" stroke="#168fff" strokeWidth="1.6" />
    </svg>
  )
}

function StationDetails() {
  return (
    <section className={`${panel} station-details`}>
      <div className="panel-title">STATION DETAILS</div>
      <span>Station: <b>KVAMARI042</b></span>
      <span>Location: <b>Marion, Virginia</b></span>
      <span>Elevation: <b>1,476 ft</b></span>
      <span>Lat / Lon: <b>36.7484° N, 81.5396° W</b></span>
    </section>
  )
}

function PrecipPanel() {
  return <TelemetryPanel className="precip-panel" title="PRECIPITATION" icon={<Droplets size={17} />} stats={[['0.62', 'in', 'TODAY'], ['1.34', 'in', 'WEEK'], ['3.21', 'in', 'MONTH'], ['12.77', 'in', 'YEAR']]} />
}

function LightningPanel() {
  return <TelemetryPanel className="lightning-panel" title="LIGHTNING (24H)" icon={<Zap size={17} />} stats={[['12', '', 'Total Strikes'], ['3', '', 'Near Station'], ['7', '', 'Cloud Strikes'], ['2', '', 'Cloud to Ground']]} />
}

function TelemetryPanel({ className, title, icon, stats }: { className: string; title: string; icon: ReactNode; stats: string[][] }) {
  return (
    <section className={`${panel} telemetry-panel ${className}`}>
      <div className="panel-title">{icon} {title}</div>
      <div className="telemetry-cards">
        {stats.map(([value, unit, label]) => <div key={label}><strong>{value}<small>{unit}</small></strong><span>{label}</span></div>)}
      </div>
    </section>
  )
}

function CameraPanel() {
  return (
    <section className={`${panel} camera-panel`}>
      <div className="camera-bg" />
      <div className="panel-title">STATION CAMERA</div>
      <div className="camera-live"><span /> LIVE</div>
      <button>VIEW CAMERA <Navigation size={14} /></button>
    </section>
  )
}
