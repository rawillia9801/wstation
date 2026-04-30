import { FileText, Mail, Send } from 'lucide-react'
import type { DashboardPayload } from '@/types/dashboard'

export default function ReportsPage({ data }: { data: DashboardPayload }) {
  const recipients = data.settings.notification_emails || []

  return (
    <section className="subpage-grid">
      <div className="subpage-hero panel">
        <span className="panel-kicker">Reports</span>
        <h2>Daily Weather Intelligence</h2>
        <p>Resend delivery remains handled by the existing backend route and saved settings.</p>
      </div>
      <div className="panel report-card">
        <FileText size={34} />
        <strong>{data.settings.daily_report_time || '07:00'}</strong>
        <span>Daily report schedule</span>
      </div>
      <div className="panel subpage-list wide">
        <div><strong><Mail size={18} /> Recipients</strong><span>{recipients.length ? recipients.join(', ') : 'No saved recipients'}</span></div>
        <div><strong><Send size={18} /> Forecast Summary</strong><span>{data.current.condition}</span></div>
      </div>
    </section>
  )
}
