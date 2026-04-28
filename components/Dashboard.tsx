'use client'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [station, setStation] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [updatedAt, setUpdatedAt] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [sRes, fRes] = await Promise.all([
          fetch('/api/station'),
          fetch('/api/forecast'),
        ])
        setStation(await sRes.json())
        setForecast(await fRes.json())
        setUpdatedAt(
          new Date().toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit',
          })
        )
      } catch (e) {
        console.error(e)
      }
    }
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [])

  const temp   = station?.imperial?.temp      ?? '71.4'
  const hi     = station?.imperial?.tempHigh  ?? '72'
  const lo     = station?.imperial?.tempLow   ?? '58'
  const hum    = station?.humidity            ?? '59'
  const pres   = station?.imperial?.pressure  ?? '29.93'
  const wind   = station?.imperial?.windSpeed ?? '6'
  const gust   = station?.imperial?.windGust  ?? '9'
  const dir    = station?.winddir             ?? 'WNW'
  const uv     = station?.uv                  ?? 2

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #020d1a; overflow: hidden; }
        .dash { display: grid; grid-template-rows: 68px 1fr 1fr 170px auto; gap: 8px; padding: 8px 10px 4px; height: 100vh; background: radial-gradient(ellipse at 20% 0%, #0a1f3a 0%, #020d1a 60%); font-family: 'Exo 2', sans-serif; color: #e0f0ff; }
        .top-bar { display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; }
        .eyebrow { font-family: 'Orbitron', monospace; font-size: 8px; letter-spacing: .3em; color: #00e5ff; text-transform: uppercase; margin-bottom: 2px; }
        h1 { font-family: 'Orbitron', monospace; font-size: clamp(20px, 3vw, 30px); font-weight: 900; color: #fff; line-height: 1; }
        .subtitle { font-size: 11px; color: #7fb8d4; margin-top: 2px; }
        .live-dot { display: inline-block; width: 7px; height: 7px; background: #00ff88; border-radius: 50%; margin-right: 4px; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }
        .top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .last-updated { font-size: 10px; color: #5a8aaa; display: flex; align-items: center; gap: 6px; }
        .live-badge { background: #00ff88; color: #001a00; font-size: 8px; font-weight: 700; padding: 2px 7px; border-radius: 10px; }
        .nav-pills { display: flex; gap: 4px; }
        .nav-pill { padding: 4px 10px; border-radius: 6px; font-size: 8px; font-family: 'Orbitron', monospace; letter-spacing: .05em; cursor: pointer; border: 1px solid #1a4060; color: #5a8aaa; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 2px; transition: all .2s; }
        .nav-pill.active { background: #0d2a44; border-color: #00e5ff; color: #00e5ff; }
        .card { background: linear-gradient(135deg, rgba(10,30,55,.9) 0%, rgba(5,18,38,.95) 100%); border: 1px solid rgba(0,180,255,.2); border-radius: 10px; overflow: hidden; position: relative; }
        .card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,180,255,.05) 0%, transparent 50%); pointer-events: none; }
        .card-label { font-family: 'Orbitron', monospace; font-size: 7.5px; letter-spacing: .2em; color: #00e5ff; text-transform: uppercase; margin-bottom: 4px; }
        .tbar { height: 2px; border-radius: 1px; margin-top: 8px; }
        .tbar-c { background: linear-gradient(90deg, #00e5ff, #0066aa); }
        .tbar-g { background: linear-gradient(90deg, #00ff88, #00aa44); }
        .tbar-b { background: linear-gradient(90deg, #4488ff, #0022aa); }
        .row2 { display: grid; grid-template-columns: 7fr 5fr; gap: 8px; min-height: 0; }
        .hero-card { padding: 12px 16px; display: flex; align-items: center; gap: 16px; }
        .hero-temp { font-family: 'Orbitron', monospace; font-size: clamp(40px,5vw,58px); font-weight: 900; color: #fff; line-height: 1; }
        .hero-temp sup { font-size: 22px; }
        .feels { font-size: 12px; color: #7fb8d4; margin-top: 2px; }
        .hl-row { display: flex; gap: 20px; margin-top: 8px; }
        .hl-val { font-size: 14px; font-weight: 700; }
        .hl-lbl { font-size: 8px; letter-spacing: .1em; color: #4a7a99; font-family: 'Orbitron', monospace; }
        .condition-name { font-size: 15px; font-weight: 600; color: #a0d0f0; margin-top: 4px; }
        .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .metric-card { padding: 10px 12px; display: flex; flex-direction: column; justify-content: space-between; }
        .metric-val { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 700; color: #fff; line-height: 1; }
        .metric-val sup { font-size: 13px; }
        .metric-sub { font-size: 10px; color: #5a8aaa; margin-top: 2px; }
        .metric-detail { font-size: 9px; color: #3a6a8a; }
        .row3 { display: grid; grid-template-columns: 8fr 4fr; gap: 8px; min-height: 0; }
        .forecast-card { padding: 10px 14px; }
        .forecast-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; margin-top: 8px; }
        .fp { background: rgba(0,50,100,.3); border: 1px solid rgba(0,150,220,.15); border-radius: 8px; padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; }
        .fp-lbl { font-family: 'Orbitron', monospace; font-size: 7px; letter-spacing: .08em; color: #5a8aaa; text-transform: uppercase; }
        .fp-temps { display: flex; gap: 5px; align-items: baseline; }
        .fp-hi { font-size: 14px; font-weight: 700; color: #e0f0ff; font-family: 'Orbitron', monospace; }
        .fp-lo { font-size: 11px; color: #55aaff; font-family: 'Orbitron', monospace; }
        .fp-desc { font-size: 7.5px; color: #5a8aaa; line-height: 1.3; }
        .fp-precip { font-size: 9px; color: #55aaff; }
        .moon-card { padding: 10px 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .moon-lbl-big { font-size: 14px; font-weight: 700; color: #e0f0ff; text-align: center; margin-top: 6px; }
        .moon-sub { font-size: 10px; color: #5a8aaa; text-align: center; margin-top: 2px; }
        .row4 { display: grid; grid-template-columns: 4fr 3fr 5fr; gap: 8px; min-height: 0; }
        .radar-card { padding: 8px 12px; display: flex; flex-direction: column; }
        .radar-inner { flex: 1; background: #030e1a; border-radius: 6px; margin-top: 6px; overflow: hidden; }
        .uv-card { padding: 8px 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .uv-val-big { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: #fff; }
        .uv-risk { font-size: 11px; color: #00ff88; font-weight: 600; margin-top: 2px; }
        .uv-desc { font-size: 9px; color: #5a8aaa; text-align: center; line-height: 1.4; margin-top: 2px; }
        .sunmoon-card { padding: 8px 14px; display: flex; flex-direction: column; }
        .arc-row { display: flex; justify-content: space-between; margin-top: 3px; }
        .arc-stat-val { font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; color: #e0f0ff; }
        .arc-stat-lbl { font-size: 8px; color: #4a7a99; text-align: center; }
        .status-bar { display: flex; justify-content: space-between; align-items: center; padding: 2px 10px; font-size: 10px; color: #3a6a8a; }
      `}</style>

      <div className="dash">
        <div className="top-bar">
          <div>
            <div className="eyebrow">Live Personal Weather Station</div>
            <h1>Staley Street Weather</h1>
            <div className="subtitle">Marion, Virginia • Station KVAMARIO42 • <span className="live-dot" /><span style={{color:'#00ff88'}}>LIVE</span></div>
          </div>
          <div className="top-right">
            <div className="last-updated">Last Updated: {updatedAt || '3:00 PM'} • Apr 28, 2026 <span className="live-badge">● LIVE</span></div>
            <div className="nav-pills">{['DASHBOARD','HISTORY','ALARMS','SETTINGS'].map((n,i) => (<button key={n} className={`nav-pill${i===0?' active':''}`}>{n}</button>))}</div>
          </div>
        </div>
      </div>
    </>
  )
}