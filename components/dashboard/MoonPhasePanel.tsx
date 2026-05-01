import { Info } from 'lucide-react'
import type { MoonData } from '@/types/dashboard'

export default function MoonPhasePanel({ moon }: { moon: MoonData }) {
  const phase = moon.phaseFraction ?? moon.age / 29.530588853
  const terminator = Math.cos(2 * Math.PI * phase)
  const shadowScale = Math.max(0.08, Math.abs(terminator))
  const shadowShift = `${moon.waxing ? -28 : 28}%`

  return (
    <section className="moon-panel panel">
      <span className="panel-kicker">Current Moon <Info size={13} /></span>
      <div className="moon-scene">
        <div
          className={`moon-orb ${moon.waxing ? 'is-waxing' : 'is-waning'}`}
          style={{ '--moon-scale': shadowScale, '--moon-shift': shadowShift } as React.CSSProperties}
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
