import { ArrowRight, Circle } from 'lucide-react'
import { resolveWeatherVisual } from '@/lib/weather-visual-map'

export default function StationCameraPanel({ cameraUrl, condition }: { cameraUrl: string | null; condition: string }) {
  const visual = resolveWeatherVisual(condition)
  const background = cameraUrl || visual.hero

  return (
    <section className={`camera-panel panel ${cameraUrl ? 'has-feed' : 'has-atmosphere'}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(3,10,18,.42), rgba(3,10,18,.78)), url(${background})` }}>
      <div className="camera-live"><Circle size={10} fill="currentColor" /> {cameraUrl ? 'Live' : 'Weather View'}</div>
      <span className="panel-kicker">Station Camera</span>
      <strong>{condition}</strong>
      <button type="button">{cameraUrl ? 'View Camera' : 'Condition View'} <ArrowRight size={15} /></button>
    </section>
  )
}
