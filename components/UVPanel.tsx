type UVPanelProps = {
  uv: string | number
}

export default function UVPanel({ uv }: UVPanelProps) {
  return (
    <div className="glass-panel rounded-3xl p-5 min-h-[330px] border border-cyan-400/30 shadow-[0_0_24px_rgba(0,217,255,0.18)] flex flex-col justify-between">
      <div>
        <div className="text-cyan-400 tracking-[0.25em] uppercase text-sm">UV INDEX</div>
        <div className="text-4xl mt-5">☼</div>
        <div className="text-7xl font-black mt-4">{uv}</div>
        <div className="text-slate-200 mt-4 text-2xl">Low</div>
        <div className="text-slate-400 mt-2">Live sensor telemetry</div>
      </div>
      <div className="h-3 rounded-full bg-black/30 overflow-hidden"><div className="h-full w-1/3 bg-green-400" /></div>
    </div>
  )
}