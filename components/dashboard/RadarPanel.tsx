import { MapPin } from 'lucide-react'

export default function RadarPanel() {
  return (
    <section className="radar-panel panel">
      <span className="panel-kicker">Live Radar</span>
      <div className="radar-map">
        <span className="city bristol">Bristol</span>
        <span className="city abingdon">Abingdon</span>
        <span className="city wytheville">Wytheville</span>
        <span className="station-dot"><MapPin size={15} /></span>
        <div className="storm-cell cell-a" />
        <div className="storm-cell cell-b" />
        <div className="storm-cell cell-c" />
      </div>
      <div className="radar-scale"><span>Light</span><span>Moderate</span><span>Heavy</span><span>Severe</span></div>
    </section>
  )
}
