export default function RadarPanel() {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[220px]">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">Live Radar</div>
      <div className="h-[150px] rounded-2xl bg-black/30 flex items-center justify-center text-slate-500">
        Regional radar layer
      </div>
    </div>
  )
}