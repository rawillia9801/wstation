export default function RadarPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[220px] border border-cyan-400/20">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Regional Radar</div>
      <div className="h-[150px] rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 h-full flex items-center justify-center text-cyan-300 tracking-[0.2em]">PRECIPITATION RADAR</div>
      </div>
    </div>
  )
}