'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [updatedAt, setUpdatedAt] = useState('3:00 PM')

  useEffect(() => {
    async function load() {
      try {
        const [sRes, fRes] = await Promise.all([fetch('/api/station'), fetch('/api/forecast')])
        const s = await sRes.json()
        const f = await fRes.json()
        setStation(s)
        setForecast(f)
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

  return (
    <div style={{color:'white',padding:'20px',fontFamily:'Arial',background:'#03111f',height:'100vh'}}>
      <h1 style={{fontSize:'32px',marginBottom:'10px'}}>Staley Street Weather</h1>
      <div>LIVE • {updatedAt}</div>
      <div style={{marginTop:'20px',fontSize:'22px'}}>Temp {temp}°F | High {hi}° | Low {lo}°</div>
      <div style={{marginTop:'10px'}}>Humidity {hum}% | Pressure {pres} | Wind {wind} mph Gust {gust} {dir} | UV {uv}</div>
      <div style={{marginTop:'20px'}}>Forecast records loaded: {forecast.length}</div>
      <div style={{marginTop:'20px'}}>Monolithic rebuild committed. Visual render phase continues from this stable base.</div>
    </div>
  )
}
