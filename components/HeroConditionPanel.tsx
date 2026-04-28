type HeroConditionPanelProps = {
  condition: string
  temperature: string | number
}

export default function HeroConditionPanel({ condition, temperature }: HeroConditionPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-5 min-h-[330px] relative overflow-hidden border border-cyan-400/30 shadow-[0_0_25px_rgba(0,217,255,0.2)]">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1800&auto=format&fit=crop')] bg-cover bg-center opacity-55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/60" />
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-cyan-400 tracking-[0.25em] uppercase text-sm mb-4">CURRENT CONDITIONS</div>
          <div className="text-8xl font-black leading-none">{temperature}<span className="text-4xl ml-1">°F</span></div>
          <div className="text-2xl mt-3 text-slate-200">Feels Like {temperature}°</div>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex gap-10 text-3xl">
            <div><span className="text-red-400">↑</span> 72°</div>
            <div><span className="text-cyan-300">↓</span> 58°</div>
          </div>
          <div className="text-4xl">🌧️</div>
          <div className="text-3xl font-semibold">{condition}</div>
        </div>
      </div>
    </div>
  )
}