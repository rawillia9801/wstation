import { Droplets, Gauge, SunMedium, Wind } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import type { TelemetryMetric } from '@/types/dashboard'

const icons = {
  humidity: Droplets,
  pressure: Gauge,
  wind: Wind,
  uv: SunMedium
}

export default function MetricStatCard({ metric }: { metric: TelemetryMetric }) {
  const Icon = icons[metric.id as keyof typeof icons] ?? Gauge
  const points = metric.sparkline.map((value, index) => ({ index, value }))

  return (
    <article className={`metric-stat-card tone-${metric.tone}`}>
      <header>
        <span>{metric.title}</span>
        <Icon size={28} strokeWidth={1.55} />
      </header>
      <div className="metric-value">
        {metric.value}<small>{metric.unit}</small>
      </div>
      <p>{metric.detail}</p>
      <div className="metric-chart" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points}>
            <Area type="monotone" dataKey="value" stroke="currentColor" fill="currentColor" fillOpacity={0.18} strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="metric-scale">
        <span>{metric.scale[0]}</span>
        <span>{metric.scale[1]}</span>
      </div>
    </article>
  )
}
