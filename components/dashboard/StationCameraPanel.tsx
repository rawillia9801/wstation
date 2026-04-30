import { ArrowRight, Circle } from 'lucide-react'
import { resolveWeatherVisual } from '@/lib/weather-visual-map'

export default function StationCameraPanel({ condition }: { condition: string }) {
  const visual = resolveWeatherVisual(condition)

  return (
    <section className="camera-panel panel" style={{ backgroundImage: `linear-gradient(90deg, rgba(3,10,18,.6), rgba(3,10,18,.9)), url(${visual.hero})` }}>
      <div className="camera-live"><Circle size={10} fill="currentColor" /> Live</div>
      <span className="panel-kicker">Station Camera</span>
      <button type="button">View Camera <ArrowRight size={15} /></button>
    </section>
  )
}
