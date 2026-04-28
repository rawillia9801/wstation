type TopStatusBarProps = {
  updatedAt: string
}

export default function TopStatusBar({ updatedAt }: TopStatusBarProps) {
  return (
    <div className="flex items-center justify-end gap-5 text-sm">
      <div className="text-slate-200">Last Updated: {updatedAt || '--:--:--'} • Apr 28, 2026</div>
      <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-400 text-green-300 font-semibold shadow-[0_0_14px_rgba(34,197,94,0.35)]">● LIVE</div>
    </div>
  )
}