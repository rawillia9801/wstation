import { Gauge, Mail, Settings } from 'lucide-react'
import AlertPreferencesForm from './AlertPreferencesForm'
import type { DashboardPayload } from '@/types/dashboard'

export default function SettingsPage({ data }: { data: DashboardPayload }) {
  return (
    <section className="subpage-grid">
      <div className="subpage-hero panel">
        <span className="panel-kicker">Settings</span>
        <h2>Station Configuration</h2>
        <p>Live display of persisted Supabase station settings.</p>
      </div>
      <div className="panel subpage-list wide">
        <div><strong><Settings size={18} /> Abnormal alerts</strong><span>{data.settings.abnormal_alerts_enabled !== false ? 'Enabled' : 'Disabled'}</span></div>
        <div><strong><Mail size={18} /> Daily reports</strong><span>{data.settings.daily_report_enabled !== false ? 'Enabled' : 'Disabled'}</span></div>
        <div><strong><Gauge size={18} /> UV Risk</strong><span>{data.settings.uv_risk || data.telemetry.find((item) => item.id === 'uv')?.detail}</span></div>
      </div>
      <AlertPreferencesForm settings={data.settings} />
      <div className="panel report-card">
        <strong>{data.current.stationId}</strong>
        <span>{data.current.location}</span>
      </div>
    </section>
  )
}
