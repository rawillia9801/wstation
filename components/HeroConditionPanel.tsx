type HeroConditionPanelProps = {
  condition: string
  temperature: string | number
}

export default function HeroConditionPanel({ condition, temperature }: HeroConditionPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-8 min-h-[320px] relative overflow-hidden">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Current Sky Scene</div>
      <div className="text-7xl font-black">{temperature}°</div>
      <div className="text-2xl mt-3 text-slate-300">{condition || 'Loading conditions...'}</div>
      <div className="mt-8 text-slate-400 max-w-lg">Dynamic condition-reactive visual panel for rain, storms, snow, clear sky, and nighttime ambience.</div>
    </div>
  )
}