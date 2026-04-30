import { Moon, Sun } from 'lucide-react'
import type { MoonData } from '@/types/dashboard'

export default function SunMoonArcPanel({ moon }: { moon: MoonData }) {
  return (
    <section className="sunmoon-panel panel">
      <span className="panel-kicker">Sun & Moon</span>
      <div className="sun-arc">
        <Sun size={25} className="sun-node" />
      </div>
      <div className="arc-times">
        <span>6:16 AM<small>Sunrise</small></span>
        <span>8h 12m<small>Daylight</small></span>
        <span>8:28 PM<small>Sunset</small></span>
      </div>
      <div className="moon-arc">
        <Moon size={24} />
      </div>
      <div className="arc-times">
        <span>{moon.moonrise}<small>Moonrise</small></span>
        <span>{moon.visibleHours}<small>Visible</small></span>
        <span>{moon.moonset}<small>Moonset</small></span>
      </div>
    </section>
  )
}
