type HeroConditionPanelProps = {
  condition: string
  temperature: string | number
}

export default function HeroConditionPanel({ condition, temperature }: HeroConditionPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-8 min-h-[320px] relative overflow-hidden border border-cyan-400/20">
      <div className="absolute inset-0 opacity-25 bg-[url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30" />
      <div className="relative z-10">
        <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Current Conditions</div>
        <div className="text-8xl font-black">{temperature}°F</div>
        <div className="text-xl mt-3 text-slate-300">Feels Like {temperature}°</div>
        <div className="mt-8 flex items-center gap-8 text-2xl">
          <div>↑ 72°</div>
          <div>↓ 58°</div>
          <div>{condition}</div>
        </div>
      </div>
    </div>
  )
}