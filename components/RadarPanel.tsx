export default function RadarPanel() {
  return (
    <div className="glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/20 overflow-hidden">
      <div className="text-cyan-400 tracking-[0.22em] uppercase text-[10px] mb-2">LIVE RADAR</div>
      <div className="h-[calc(100%-18px)] rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-95 bg-[url('https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute bottom-1 left-3 right-3 h-2 rounded-full bg-black/50 overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
        </div>
      </div>
    </div>
  )
}