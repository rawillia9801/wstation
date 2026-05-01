import { Bell, CheckCircle2 } from 'lucide-react'
import AlertPreferencesForm from './AlertPreferencesForm'
import type { DashboardPayload } from '@/types/dashboard'

export default function AlarmsPage({ data }: { data: DashboardPayload }) {
  const alarms = [
    ['Abnormal alerts', data.settings.abnormal_alerts_enabled !== false],
    ['High wind advisory', Number(data.telemetry.find((item) => item.id === 'wind')?.value || 0) > 25],
    ['High UV exposure', Number(data.telemetry.find((item) => item.id === 'uv')?.value || 0) > 7],
    ['Daily report delivery', data.settings.daily_report_enabled !== false]
  ]

  return (
    <section className="subpage-grid">
      <div className="subpage-hero panel">
        <span className="panel-kicker">Alarm Matrix</span>
        <h2>Weather Alert Automation</h2>
        <p>Bound to saved station settings and the alert report delivery route.</p>
      </div>
      <div className="panel subpage-list wide">
        {alarms.map(([label, active]) => (
          <div key={String(label)}>
            <strong><Bell size={18} /> {label}</strong>
            <span className={active ? 'state-on' : 'state-off'}>{active ? 'Armed' : 'Idle'}</span>
          </div>
        ))}
      </div>
      <AlertPreferencesForm settings={data.settings} />
      <div className="panel report-card">
        <CheckCircle2 size={34} />
        <strong>{data.alerts[0]?.title}</strong>
        <span>Current advisory source: NOAA forecast feed</span>
      </div>
    </section>
  )
}
