import { CloudLightning, CloudRain, CloudSun, Droplet, Sun } from 'lucide-react'
import { resolveWeatherVisual } from '@/lib/weather-visual-map'
import type { ForecastPeriod } from '@/types/dashboard'

function getNightLow(periods: ForecastPeriod[], index: number) {
  const nextNight = periods.slice(index + 1).find((period) => period.isDaytime === false)
  return nextNight?.temperature
}

function WeatherIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase()
  if (lower.includes('thunder')) return <CloudLightning size={52} />
  if (lower.includes('rain') || lower.includes('shower')) return <CloudRain size={52} />
  if (lower.includes('cloud')) return <CloudSun size={52} />
  return <Sun size={52} />
}

export default function ForecastStrip({ periods }: { periods: ForecastPeriod[] }) {
  const days = periods.filter((period) => period.isDaytime !== false).slice(0, 5)
  const fallback = ['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday'].map((name, index) => ({
    name,
    temperature: [72, 69, 69, 60, 63][index],
    shortForecast: ['Showers', "T'storms", 'Partly Cloudy', 'Sunny', 'Mostly Sunny'][index],
    probabilityOfPrecipitation: { value: [40, 60, 20, 10, 10][index] }
  }))

  const cards = days.length ? days : fallback

  return (
    <section className="forecast-strip panel">
      <span className="panel-kicker">5 Day Forecast</span>
      <div className="forecast-cards">
        {cards.map((period, index) => {
          const condition = period.shortForecast || 'Partly Cloudy'
          const visual = resolveWeatherVisual(condition)
          const low = getNightLow(periods, index) ?? [58, 53, 49, 41, 45][index]
          return (
            <article key={`${period.name}-${index}`} className="forecast-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(3,10,18,.2), rgba(2,8,15,.94)), url(${visual.hero})` }}>
              <strong>{period.name}</strong>
              <WeatherIcon condition={condition} />
              <div><b>{period.temperature ?? '--'}F</b><span>{low ?? '--'}F</span></div>
              <p>{condition}</p>
              <small><Droplet size={13} /> {period.probabilityOfPrecipitation?.value ?? 10}%</small>
            </article>
          )
        })}
      </div>
    </section>
  )
}
