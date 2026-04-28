'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [updatedAt, setUpdatedAt] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [sRes, fRes] = await Promise.all([fetch('/api/station'), fetch('/api/forecast')])
        setStation(await sRes.json())
        setForecast(await fRes.json())
        setUpdatedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      } catch (e) { console.error(e) }
    }
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  const temp = station?.imperial?.temp ?? '71.4'
  const hi = station?.imperial?.tempHigh ?? '72'
  const lo = station?.imperial?.tempLow ?? '58'
  const hum = station?.humidity ?? '59'
  const pres = station?.imperial?.pressure ?? '29.93'
  const wind = station?.imperial?.windSpeed ?? '6'
  const gust = station?.imperial?.windGust ?? '9'
  const dir = station?.winddir ?? 'WNW'
  const uv = station?.uv ?? 2

  return <div style={{color:'white',padding:'20px'}}>FULL BODY PATCH LANDING</div>
}
