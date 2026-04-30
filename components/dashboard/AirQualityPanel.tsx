import { CheckCircle2 } from 'lucide-react'
import type { AirQualityData } from '@/types/dashboard'

export default function AirQualityPanel({ airQuality }: { airQuality: AirQualityData }) {
  const score = airQuality.index
  const gaugeValue = score === null ? 0 : Math.min(score, 150) / 1.5
  return (
    <section className="air-panel panel">
      <span className="panel-kicker">Air Quality</span>
      <div className="aqi-layout">
        <div className="aqi-gauge" style={{ '--aqi': `${gaugeValue}%` } as React.CSSProperties} title={airQuality.source}>
          <strong>{score ?? '--'}</strong>
          <span>{airQuality.label}</span>
          <small>{score === null ? 'NO SENSOR' : 'AQI (US)'}</small>
        </div>
        <div className="aqi-values">
          {airQuality.values.map((item) => (
            <span key={item.label}>{item.label} <b>{item.value ?? '--'}</b></span>
          ))}
        </div>
      </div>
      <p><CheckCircle2 size={18} /> {airQuality.source}</p>
    </section>
  )
}
