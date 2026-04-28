type TopStatusBarProps = {
  updatedAt: string
}

export default function TopStatusBar({ updatedAt }: TopStatusBarProps) {
  return (
    <div className="glass-panel rounded-2xl px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
      <div className="text-cyan-400 tracking-[0.3em] uppercase text-xs">Staley Street Weather Intelligence Network</div>
      <div className="text-slate-300">Station KVAMARIO42 • Marion, VA • Updated {updatedAt || '--:--:--'}</div>
    </div>
  )
}