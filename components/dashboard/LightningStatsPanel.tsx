import { Zap } from 'lucide-react'
import type { DashboardPayload } from '@/types/dashboard'

export default function LightningStatsPanel({ lightning }: { lightning: DashboardPayload['lightning'] }) {
  const entries = [
    ['Total Strikes', lightning.total],
    ['Near Station', lightning.near],
    ['Cloud Strikes', lightning.cloud],
    ['Cloud to Ground', lightning.ground]
  ]

  return (
    <section className="mini-stats-panel panel">
      <span className="panel-kicker"><Zap size={15} /> Lightning <small>(24h)</small></span>
      <div className="mini-stat-grid">
        {entries.map(([label, value]) => (
          <div key={label}>
            <strong>{value ?? '--'}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
