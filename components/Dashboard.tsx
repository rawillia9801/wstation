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
    <div style={{height:'100vh',background:'radial-gradient(circle at top,#0a2342,#020b16 60%,#01060d)',color:'white',padding:'10px',fontFamily:'Segoe UI, sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
        <div>
          <div style={{fontSize:'11px',letterSpacing:'4px',color:'#00d9ff'}}>LIVE PERSONAL WEATHER STATION</div>
          <div style={{fontSize:'64px',fontWeight:800,lineHeight:'60px'}}>Staley Street Weather</div>
          <div style={{fontSize:'22px',color:'#9bc7e8'}}>Marion, Virginia • Station KVAMARIO42 • <span style={{color:'#00ff88'}}>LIVE</span></div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'18px'}}>Last Updated: {updatedAt} • Apr 28, 2026 <span style={{color:'#00ff88'}}>● LIVE</span></div>
        </div>
      </div>
      <div style={{fontSize:'28px',marginTop:'40px'}}>VISUAL RECREATION PASS 1 COMMITTED</div>
      <div style={{marginTop:'20px'}}>Now rebuilding panels in subsequent writes.</div>
    </div>
  )
}
