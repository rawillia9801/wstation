import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardPayload } from '@/types/dashboard'

export default function TrendChartPanel({ data }: { data: DashboardPayload['trends'] }) {
  return (
    <section className="trend-panel panel">
      <span className="panel-kicker">Temperature Trend <small>(24h)</small></span>
      <ResponsiveContainer width="100%" height="82%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
          <XAxis dataKey="time" tick={{ fill: '#8aa4b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#8aa4b8', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#06111d', border: '1px solid rgba(32,247,255,.3)', color: '#fff' }} />
          <Line dataKey="temp" stroke="#ff8617" strokeWidth={3} dot={false} isAnimationActive={false} />
          <Line dataKey="feels" stroke="#1fa3ff" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  )
}
