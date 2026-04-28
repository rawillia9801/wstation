type MoonPhasePanelProps = {
  moonPhase: string
  illumination: string
}

export default function MoonPhasePanel({ moonPhase, illumination }: MoonPhasePanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-6">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Night Sky</div>
      <div className="text-4xl mb-3">🌙</div>
      <div className="text-2xl font-black">{moonPhase}</div>
      <div className="text-slate-400 mt-2">Illumination {illumination}</div>
    </div>
  )
}