type TopStatusBarProps = {
  updatedAt: string
}

export default function TopStatusBar({ updatedAt }: TopStatusBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <div className="text-slate-200">Last Updated: {updatedAt || '--:--:--'} • Apr 28, 2026</div>
      <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-400 text-green-300 font-semibold">● LIVE</div>
    </div>
  )
}