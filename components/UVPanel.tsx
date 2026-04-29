type UVPanelProps = {
  uv: string | number
}

export default function UVPanel({ uv }: UVPanelProps) {
  return (
    <div className="glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/30 shadow-[0_0_18px_rgba(0,217,255,0.18)] flex flex-col justify-between overflow-hidden">
      <div>
        <div className="text-cyan-400 tracking-[0.22em] uppercase text-[10px]">UV INDEX</div>
        <div className="text-2xl mt-2">☼</div>
        <div className="text-3xl xl:text-4xl font-black mt-1">{uv}</div>
        <div className="text-slate-200 mt-1 text-xs">Low</div>
        <div className="text-slate-400 mt-1 text-[10px]">Live sensor telemetry</div>
      </div>
      <div className="h-2 rounded-full bg-black/30 overflow-hidden"><div className="h-full w-1/3 bg-green-400" /></div>
    </div>
  )
}