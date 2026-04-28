export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']

  return (
    <div className="flex flex-wrap gap-3 justify-end">
      {pills.map((pill, index) => (
        <div
          key={pill}
          className={`w-[98px] h-[58px] rounded-2xl border flex flex-col items-center justify-center gap-1 ${index === 0 ? 'border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(0,217,255,0.3)]' : 'border-cyan-400/25 text-slate-300'} bg-black/35`}
        >
          <div className="text-sm">{icons[index]}</div>
          <div className="text-[10px] tracking-[0.18em]">{pill}</div>
        </div>
      ))}
    </div>
  )
}