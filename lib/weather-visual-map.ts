const storm = 'https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1400&q=80'
const rain = 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1400&q=80'
const clouds = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80'
const sun = 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80'
const snow = 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?auto=format&fit=crop&w=1400&q=80'
const night = 'https://images.unsplash.com/photo-1505322022379-7c3353ee6291?auto=format&fit=crop&w=1400&q=80'

export function resolveWeatherVisual(condition = '') {
  const value = condition.toLowerCase()

  if (value.includes('thunder') || value.includes('storm')) {
    return { hero: storm, icon: 'CloudLightning', accent: 'violet' }
  }

  if (value.includes('rain') || value.includes('shower') || value.includes('drizzle')) {
    return { hero: rain, icon: 'CloudRain', accent: 'cyan' }
  }

  if (value.includes('snow') || value.includes('sleet') || value.includes('ice')) {
    return { hero: snow, icon: 'CloudSnow', accent: 'sky' }
  }

  if (value.includes('cloud') || value.includes('overcast') || value.includes('fog')) {
    return { hero: clouds, icon: 'CloudSun', accent: 'blue' }
  }

  if (value.includes('night')) {
    return { hero: night, icon: 'Moon', accent: 'indigo' }
  }

  return { hero: sun, icon: 'Sun', accent: 'amber' }
}

export function forecastVisuals(periods: string[]) {
  return periods.map(resolveWeatherVisual)
}
