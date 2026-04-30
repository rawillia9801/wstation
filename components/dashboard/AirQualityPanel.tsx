import { CheckCircle2 } from 'lucide-react'

export default function AirQualityPanel({ uv }: { uv: number }) {
  const score = Math.max(18, Math.round(34 - uv * 2))

  return (
    <section className="air-panel panel">
      <span className="panel-kicker">Air Quality</span>
      <div className="aqi-layout">
        <div className="aqi-gauge" style={{ '--aqi': `${Math.min(score, 50) * 2}%` } as React.CSSProperties}>
          <strong>{score}</strong>
          <span>Good</span>
          <small>AQI (US)</small>
        </div>
        <div className="aqi-values">
          <span>PM2.5 <b>12</b></span>
          <span>PM10 <b>18</b></span>
          <span>OZONE <b>{Math.round(20 + uv * 4)}</b></span>
          <span>CO <b>0.3</b></span>
          <span>NO2 <b>8</b></span>
        </div>
      </div>
      <p><CheckCircle2 size={18} /> Great day to be outside!</p>
    </section>
  )
}
