import TrendChartPanel from '@/components/dashboard/TrendChartPanel'
import type { DashboardPayload } from '@/types/dashboard'

export default function HistoryPage({ data }: { data: DashboardPayload }) {
  return (
    <section className="subpage-grid">
      <div className="subpage-hero panel">
        <span className="panel-kicker">Historical Telemetry</span>
        <h2>Station Archive</h2>
        <p>Latest observation archived through the existing Supabase observation pipeline.</p>
      </div>
      <TrendChartPanel data={data.trends} />
      <div className="panel subpage-list">
        <span className="panel-kicker">Recent Signals</span>
        {data.trends.slice(-6).map((trend) => (
          <div key={trend.time}><strong>{trend.time}</strong><span>{trend.temp}F observed / {trend.feels}F feels</span></div>
        ))}
      </div>
    </section>
  )
}
