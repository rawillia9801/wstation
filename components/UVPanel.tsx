type UVPanelProps = {
  uv: string | number
}

export default function UVPanel({ uv }: UVPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[220px] border border-cyan-400/20">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">UV Radiation</div>
      <div className="text-7xl font-black">{uv}</div>
      <div className="mt-4 h-3 rounded-full bg-black/30 overflow-hidden">
        <div className="h-full w-1/4 bg-cyan-400" />
      </div>
      <div className="text-slate-400 mt-3">Current exposure low</div>
    </div>
  )
}