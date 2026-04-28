type UVPanelProps = {
  uv: string | number
}

export default function UVPanel({ uv }: UVPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-6 min-h-[180px]">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs mb-4">UV Index</div>
      <div className="text-6xl font-black">{uv}</div>
      <div className="text-slate-400 mt-3">Low Risk</div>
    </div>
  )
}