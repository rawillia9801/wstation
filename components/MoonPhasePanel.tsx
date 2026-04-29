type MoonPhasePanelProps = {
  moonPhase: string
  illumination: string
}

function moonAsset(phase: string) {
  const p = phase.toLowerCase()
  if (p.includes('new')) return '🌑'
  if (p.includes('waxing crescent')) return '🌒'
  if (p.includes('first quarter')) return '🌓'
  if (p.includes('waxing gibbous')) return '🌔'
  if (p.includes('full')) return '🌕'
  if (p.includes('waning gibbous')) return '🌖'
  if (p.includes('last quarter')) return '🌗'
  if (p.includes('waning crescent')) return '🌘'
  return '🌖'
}

export default function MoonPhasePanel({ moonPhase, illumination }: MoonPhasePanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-2 h-full min-h-0 relative overflow-hidden border border-cyan-400/30 shadow-[0_0_18px_rgba(0,217,255,0.2)]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1400&auto=format&fit=crop')] bg-cover bg-center opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/70" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="text-cyan-400 tracking-[0.2em] uppercase text-[9px]">CURRENT MOON</div>
        <div className="text-6xl text-center leading-none drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]">{moonAsset(moonPhase)}</div>
        <div>
          <div className="text-lg font-black leading-tight">{moonPhase}</div>
          <div className="text-slate-200 mt-1 text-[9px]">Illumination: {illumination}</div>
          <div className="text-slate-300 mt-1 text-[9px]">Age: 18.1 days</div>
        </div>
      </div>
    </div>
  )
}