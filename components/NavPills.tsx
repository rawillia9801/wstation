'use client'
import { useEffect, useState } from 'react'

export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']
  const [showSettings, setShowSettings] = useState(false)
  const [showAlarms, setShowAlarms] = useState(false)
  const [emails, setEmails] = useState('')
  const [phones, setPhones] = useState('')

  useEffect(() => {
    fetch('/api/save-settings').then(r => r.json()).then(data => {
      setEmails((data.notification_emails || []).join('\n'))
      setPhones((data.notification_phones || []).join('\n'))
    })
  }, [])

  async function saveSettings() {
    await fetch('/api/save-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification_emails: emails.split('\n').filter(Boolean),
        notification_phones: phones.split('\n').filter(Boolean),
        daily_report_time: '07:00',
        daily_report_enabled: true,
        abnormal_alerts_enabled: true
      })
    })
    alert('Settings saved to cloud notification center.')
  }

  async function sendTest() {
    await fetch('/api/send-daily-report')
    alert('Test forecast email dispatched.')
  }

  function handleClick(pill:string) {
    if (pill === 'DASHBOARD') {
      setShowSettings(false)
      setShowAlarms(false)
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
      <div className="flex gap-2 justify-end relative z-50">
        {pills.map((pill, index) => (
          <button key={pill} onClick={() => handleClick(pill)} className={`w-[92px] h-[54px] rounded-2xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 ${((pill === 'SETTINGS' && showSettings) || (pill === 'ALARMS' && showAlarms)) ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : index === 0 ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : 'border-cyan-400/20 text-slate-300'} bg-black/40 backdrop-blur-md`}><div className="text-xs">{icons[index]}</div><div className="text-[9px] tracking-[0.18em]">{pill}</div></button>
        ))}
      </div>

      {showSettings && (
        <div className="absolute right-4 top-24 w-[520px] max-w-[90vw] rounded-3xl border border-cyan-300/30 bg-slate-950/95 backdrop-blur-xl p-5 z-[100] shadow-[0_0_30px_rgba(0,217,255,0.25)] text-white">
          <div className="text-cyan-300 text-lg font-bold mb-4 tracking-[0.2em]">NOTIFICATION SETTINGS CENTER</div>
          <div className="mb-4"><div className="text-cyan-200 text-sm mb-2">Daily Forecast Email Recipients</div><textarea value={emails} onChange={e => setEmails(e.target.value)} className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" /></div>
          <div className="mb-4"><div className="text-cyan-200 text-sm mb-2">SMS Alert Recipients</div><textarea value={phones} onChange={e => setPhones(e.target.value)} className="w-full rounded-xl bg-black/50 border border-cyan-400/20 px-3 py-2 text-sm h-20" /></div>
          <div className="grid grid-cols-2 gap-3"><button onClick={saveSettings} className="rounded-xl bg-cyan-500/20 border border-cyan-300/30 py-2 text-sm">Save Preferences</button><button onClick={sendTest} className="rounded-xl bg-green-500/20 border border-green-300/30 py-2 text-sm">Send Test Alert</button></div>
        </div>
      )}

      {showAlarms && (
        <div className="absolute right-4 top-24 w-[760px] max-w-[94vw] rounded-3xl border border-red-300/20 bg-slate-950/95 backdrop-blur-xl p-6 z-[100] shadow-[0_0_30px_rgba(255,80,80,0.18)] text-white max-h-[78vh] overflow-y-auto">
          <div className="text-red-300 text-xl font-bold mb-4 tracking-[0.2em]">SMART WEATHER ALARM CONTROL CENTER</div>
          {alarmRow('Morning Forecast Dispatch', '7:00 AM EST')}
          {alarmRow('Thunderstorm Probability', '>40%')}
          {alarmRow('Wind Gust Threshold', '>30 mph')}
          {alarmRow('Rapid Temp Spike/Drop', '>10° in 2hr')}
          {alarmRow('Freeze / Black Ice', '32° + precip')}
          {alarmRow('Snow Accumulation', '>1 inch')}
          {alarmRow('Tornado Warning', 'Instant')}
          {alarmRow('Flood / Heavy Rain', '>1in/hr')}
          {alarmRow('UV Burn Risk', 'UV >7')}
        </div>
      )}
    </>
  )
}
