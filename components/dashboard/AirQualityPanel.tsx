import { CheckCircle2 } from 'lucide-react'
import type { AirQualityData } from '@/types/dashboard'

export default function AirQualityPanel({ airQuality }: { airQuality: AirQualityData }) {
  const score = airQuality.index ?? 32
  const gaugeValue = Math.min(score, 150) / 1.5
  return (
    <section className="air-panel panel">
      <span className="panel-kicker">Air Quality</span>
      <div className="aqi-layout">
        <div className="aqi-gauge" style={{ '--aqi': `${gaugeValue}%` } as React.CSSProperties} title={airQuality.source}>
          <strong>{score}</strong>
          <span>{airQuality.label}</span>
          <small>AQI (US)</small>
        </div>
        <div className="aqi-values">
          {airQuality.values.map((item) => (
            <span key={item.label}>{item.label} <b>{item.value}</b></span>
          ))}
        </div>
      </div>
      <p><CheckCircle2 size={18} /> {score <= 50 ? 'Great day to be outside!' : score <= 100 ? 'Air quality is acceptable.' : 'Limit prolonged outdoor exertion.'}</p>
    </section>
  )
}
