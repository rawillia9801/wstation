import { Info } from 'lucide-react'
import type { MoonData } from '@/types/dashboard'

export default function MoonPhasePanel({ moon }: { moon: MoonData }) {
  const shadowOffset = moon.waxing ? 100 - moon.illumination : moon.illumination - 100

  return (
    <section className="moon-panel panel">
      <span className="panel-kicker">Current Moon <Info size={13} /></span>
      <div className="moon-scene">
        <div
          className={`moon-orb ${moon.waxing ? 'is-waxing' : 'is-waning'}`}
          style={{ '--moon-shadow': `${shadowOffset}%`, '--moon-lit': `${moon.illumination}%` } as React.CSSProperties}
          title={`${moon.phase}, ${moon.illumination}% illuminated`}
        />
      </div>
      <strong>{moon.phase}</strong>
      <div className="moon-stats">
        <span>Illumination: {moon.illumination}%</span>
        <span>Age: {moon.age} days</span>
      </div>
    </section>
  )
}
