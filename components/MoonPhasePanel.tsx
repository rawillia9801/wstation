type MoonPhasePanelProps = {
  moonPhase: string
  illumination: string
}

export default function MoonPhasePanel({ moonPhase, illumination }: MoonPhasePanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-3 h-full min-h-0 relative overflow-hidden border border-cyan-400/30 shadow-[0_0_18px_rgba(0,217,255,0.2)]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/75" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="text-cyan-400 tracking-[0.22em] uppercase text-[10px]">CURRENT MOON</div>
        <div className="text-5xl leading-none">🌔</div>
        <div>
          <div className="text-lg xl:text-2xl font-black leading-tight">{moonPhase}</div>
          <div className="text-slate-200 mt-1 text-[10px]">Illumination: {illumination}</div>
          <div className="text-slate-400 mt-1 text-[10px]">Age: 18.1 days</div>
        </div>
      </div>
    </div>
  )
}