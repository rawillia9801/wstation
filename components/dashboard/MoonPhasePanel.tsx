import { Info } from 'lucide-react'
import type { MoonData } from '@/types/dashboard'

export default function MoonPhasePanel({ moon }: { moon: MoonData }) {
  return (
    <section className="moon-panel panel">
      <span className="panel-kicker">Current Moon <Info size={13} /></span>
      <div className="moon-scene">
        <div className="moon-orb" />
      </div>
      <strong>{moon.phase}</strong>
      <div className="moon-stats">
        <span>Illumination: {moon.illumination}%</span>
        <span>Age: {moon.age} days</span>
      </div>
    </section>
  )
}
