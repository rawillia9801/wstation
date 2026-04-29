'use client'
import { useState } from 'react'

export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']
  const [showSettings, setShowSettings] = useState(false)

  function handleClick(pill:string) {
    if (pill === 'DASHBOARD') {
      setShowSettings(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (pill === 'HISTORY') alert('Weather history module loading...')
    if (pill === 'ALARMS') alert('No active weather alarms.')
    if (pill === 'SETTINGS') setShowSettings(!showSettings)
  }

  return (
    <>
      <style jsx global>{`
        body {
          zoom: clamp(0.72, 100vw / 1600, 1);
        }
      `}</style>

      <div className="flex gap-2 justify-end relative z-50">
        {pills.map((pill, index) => (
          <button
            key={pill}
            onClick={() => handleClick(pill)}
            className={`w-[92px] h-[54px] rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${pill === 'SETTINGS' && showSettings ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : index === 0 ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : 'border-cyan-400/20 text-slate-300'} bg-black/40 backdrop-blur-md`}
          >
            <div className="text-xs">{icons[index]}</div>
            <div className="text-[9px] tracking-[0.18em]">{pill}</div>
          </button>
        ))}
      </div>

      {showSettings && (
        <div className="absolute right-4 top-24 w-[520px] max-w-[90vw] rounded-3xl border border-cyan-300/30 bg-slate-950/95 backdrop-blur-xl p-5 z-[100] shadow-[0_0_30px_rgba(0,217,255,0.25)] text-white">
          <div className="text-cyan-300 text-lg font-bold mb-4 tracking-[0.2em]">NOTIFICATION SETTINGS CENTER</div>

          <div className="mb-4">
            <div className="text-cyan-200 text-sm mb-2">Daily Forecast Email Recipients</div>
            <textarea className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" placeholder="name@email.com&#10;second@email.com&#10;third@email.com" />
          </div>

          <div className="mb-4">
            <div className="text-cyan-200 text-sm mb-2">SMS Alert Recipients</div>
            <textarea className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" placeholder="276-555-1234&#10;276-555-5678" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Morning Forecast</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Evening Forecast</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Severe Alerts</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Swim Advisory</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> UV Warning</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Freeze Alert</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl bg-cyan-500/20 border border-cyan-300/30 py-2 text-sm">Save Preferences</button>
            <button className="rounded-xl bg-green-500/20 border border-green-300/30 py-2 text-sm">Send Test Alert</button>
          </div>
        </div>
      )}
    </>
  )
}
