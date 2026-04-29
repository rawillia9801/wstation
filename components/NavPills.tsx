'use client'
import { useState } from 'react'

export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']
  const [showSettings, setShowSettings] = useState(false)
  const [showAlarms, setShowAlarms] = useState(false)

  function handleClick(pill:string) {
    if (pill === 'DASHBOARD') {
      setShowSettings(false)
      setShowAlarms(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (pill === 'HISTORY') alert('Weather history module loading...')
    if (pill === 'ALARMS') {
      setShowAlarms(!showAlarms)
      setShowSettings(false)
    }
    if (pill === 'SETTINGS') {
      setShowSettings(!showSettings)
      setShowAlarms(false)
    }
  }

  const alarmRow = (title:string, placeholder:string) => (
    <div className="grid grid-cols-3 gap-3 items-center border-b border-cyan-400/10 py-2 text-sm">
      <div>{title}</div>
      <input className="rounded-lg bg-black/50 border border-cyan-400/20 px-2 py-1" placeholder={placeholder} />
      <div className="flex gap-3 text-xs"><label><input type="checkbox" defaultChecked /> SMS</label><label><input type="checkbox" defaultChecked /> Email</label></div>
    </div>
  )

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
            className={`w-[92px] h-[54px] rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${((pill === 'SETTINGS' && showSettings) || (pill === 'ALARMS' && showAlarms)) ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : index === 0 ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : 'border-cyan-400/20 text-slate-300'} bg-black/40 backdrop-blur-md`}
          >
            <div className="text-xs">{icons[index]}</div>
            <div className="text-[9px] tracking-[0.18em]">{pill}</div>
          </button>
        ))}
      </div>

      {showSettings && (
        <div className="absolute right-4 top-24 w-[520px] max-w-[90vw] rounded-3xl border border-cyan-300/30 bg-slate-950/95 backdrop-blur-xl p-5 z-[100] shadow-[0_0_30px_rgba(0,217,255,0.25)] text-white">
          <div className="text-cyan-300 text-lg font-bold mb-4 tracking-[0.2em]">NOTIFICATION SETTINGS CENTER</div>
          <div className="mb-4"><div className="text-cyan-200 text-sm mb-2">Daily Forecast Email Recipients</div><textarea className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" /></div>
          <div className="mb-4"><div className="text-cyan-200 text-sm mb-2">SMS Alert Recipients</div><textarea className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" /></div>
          <div className="grid grid-cols-2 gap-3"><button className="rounded-xl bg-cyan-500/20 border border-cyan-300/30 py-2 text-sm">Save Preferences</button><button className="rounded-xl bg-green-500/20 border border-green-300/30 py-2 text-sm">Send Test Alert</button></div>
        </div>
      )}

      {showAlarms && (
        <div className="absolute right-4 top-24 w-[760px] max-w-[94vw] rounded-3xl border border-red-300/20 bg-slate-950/95 backdrop-blur-xl p-6 z-[100] shadow-[0_0_30px_rgba(255,80,80,0.18)] text-white max-h-[78vh] overflow-y-auto">
          <div className="text-red-300 text-xl font-bold mb-4 tracking-[0.2em]">SMART WEATHER ALARM CONTROL CENTER</div>
          {alarmRow('Morning Forecast Dispatch', '7:00 AM EST')}
          {alarmRow('Evening Forecast Dispatch', '7:00 PM EST')}
          {alarmRow('Thunderstorm Probability', '>40%')}
          {alarmRow('Wind Gust Threshold', '>30 mph')}
          {alarmRow('Rapid Temp Spike/Drop', '>10° in 2hr')}
          {alarmRow('Freeze / Black Ice', '32° + precip')}
          {alarmRow('Snow Accumulation', '>1 inch')}
          {alarmRow('Tornado Warning', 'Instant')}
          {alarmRow('Flood / Heavy Rain', '>1in/hr')}
          {alarmRow('UV Burn Risk', 'UV >7')}
          {alarmRow('Hungry Mother Swim Advisory', 'custom lake trigger')}

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button className="rounded-xl bg-red-500/20 border border-red-300/30 py-2 text-sm">Save Alarm Rules</button>
            <button className="rounded-xl bg-amber-500/20 border border-amber-300/30 py-2 text-sm">Send Trigger Test</button>
          </div>
        </div>
      )}
    </>
  )
}
