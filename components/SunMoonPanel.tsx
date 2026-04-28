export default function SunMoonPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[220px]">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Sun & Moon</div>
      <div className="text-slate-300">Sunrise 6:16 AM</div>
      <div className="text-slate-300">Sunset 8:28 PM</div>
      <div className="text-slate-300 mt-4">Moonrise 12:58 AM</div>
      <div className="text-slate-300">Moonset 2:43 PM</div>
    </div>
  )
}