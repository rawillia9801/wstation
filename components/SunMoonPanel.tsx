export default function SunMoonPanel() {
  return (
    <div className="glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-cyan-400" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="text-cyan-400 tracking-[0.22em] uppercase text-[10px]">SUN & MOON CYCLE</div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="h-10 border-b border-yellow-300 rounded-t-full mb-1"></div>
            <div>6:16 AM Sunrise</div>
            <div>8:28 PM Sunset</div>
          </div>
          <div>
            <div className="h-10 border-b border-slate-200 rounded-t-full mb-1"></div>
            <div>12:58 AM Moonrise</div>
            <div>2:43 PM Moonset</div>
          </div>
        </div>
      </div>
    </div>
  )
}