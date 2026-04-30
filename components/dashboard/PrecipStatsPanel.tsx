import { Droplet } from 'lucide-react'
import type { DashboardPayload } from '@/types/dashboard'

export default function PrecipStatsPanel({ precipitation }: { precipitation: DashboardPayload['precipitation'] }) {
  const entries = [
    ['Today', precipitation.today],
    ['Week', precipitation.week],
    ['Month', precipitation.month],
    ['Year', precipitation.year]
  ]

  return (
    <section className="mini-stats-panel panel">
      <span className="panel-kicker"><Droplet size={15} /> Precipitation</span>
      <div className="mini-stat-grid">
        {entries.map(([label, value]) => (
          <div key={label}>
            <strong>{Number(value).toFixed(2)}<small> in</small></strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
