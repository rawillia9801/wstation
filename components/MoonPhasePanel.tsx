type MoonPhasePanelProps = {
  moonPhase: string
  illumination: string
}

export default function MoonPhasePanel({ moonPhase, illumination }: MoonPhasePanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[280px] relative overflow-hidden border border-cyan-400/20">
      <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" />
      <div className="relative z-10">
        <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Current Moon</div>
        <div className="text-5xl mb-5">🌖</div>
        <div className="text-2xl font-black">{moonPhase}</div>
        <div className="text-slate-300 mt-2">Illumination: {illumination}</div>
        <div className="text-slate-400 mt-2">Age: 18.1 days</div>
      </div>
    </div>
  )
}