import { MapPin } from 'lucide-react'
import type { RadarData } from '@/types/dashboard'

export default function RadarPanel({ radar }: { radar: RadarData }) {
  return (
    <section className="radar-panel panel">
      <span className="panel-kicker">Live Radar</span>
      <div className="radar-map" style={{ backgroundImage: `linear-gradient(180deg, rgba(0, 8, 13, 0.18), rgba(0, 8, 13, 0.34)), url(${radar.imageUrl})` }}>
        <span className="city bristol">Bristol</span>
        <span className="city abingdon">Abingdon</span>
        <span className="city wytheville">Wytheville</span>
        <span className="station-dot"><MapPin size={15} /></span>
      </div>
      <div className="radar-scale" title={radar.source}><span>Light</span><span>Moderate</span><span>Heavy</span><span>{radar.updatedLabel}</span></div>
    </section>
  )
}
