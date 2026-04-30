import { ArrowDown, ArrowUp, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'
import { resolveWeatherVisual } from '@/lib/weather-visual-map'
import type { DashboardPayload } from '@/types/dashboard'

const iconMap = { CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun }

export default function HeroCurrentConditions({ data }: { data: DashboardPayload }) {
  const visual = resolveWeatherVisual(data.current.condition)
  const Icon = iconMap[visual.icon as keyof typeof iconMap] ?? CloudRain

  return (
    <section className="hero-current panel" style={{ backgroundImage: `linear-gradient(90deg, rgba(2,8,15,.92), rgba(2,8,15,.56)), url(${visual.hero})` }}>
      <div>
        <span className="panel-kicker">Current Conditions</span>
        <div className="hero-temp">
          {Number(data.current.temperature ?? 0).toFixed(1)}
          <small>F</small>
        </div>
        <p>Feels Like {Math.round(data.current.feelsLike ?? data.current.temperature ?? 0)}F</p>
        <div className="hero-high-low">
          <span><ArrowUp size={22} /> {Math.round(data.current.high ?? data.current.temperature ?? 0)}F <small>Today High</small></span>
          <span><ArrowDown size={22} /> {Math.round(data.current.low ?? data.current.temperature ?? 0)}F <small>Today Low</small></span>
        </div>
      </div>
      <div className="hero-condition-icon">
        <Icon size={96} strokeWidth={1.35} />
        <strong>{data.current.condition}</strong>
      </div>
    </section>
  )
}
