export default function SunMoonPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[220px] border border-cyan-400/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-cyan-400" />
      <div className="relative z-10">
        <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Sun & Moon Cycle</div>
        <div className="text-slate-200">Sunrise 6:16 AM</div>
        <div className="text-slate-200">Sunset 8:28 PM</div>
        <div className="mt-4 h-2 rounded-full bg-black/30 overflow-hidden">
          <div className="h-full w-2/3 bg-cyan-400" />
        </div>
        <div className="text-slate-300 mt-5">Moonrise 12:58 AM</div>
        <div className="text-slate-300">Moonset 2:43 PM</div>
      </div>
    </div>
  )
}