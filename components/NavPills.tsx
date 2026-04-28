export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']

  return (
    <div className="flex flex-wrap gap-4 justify-end">
      {pills.map((pill, index) => (
        <div
          key={pill}
          className={`w-[120px] h-[78px] rounded-2xl border flex flex-col items-center justify-center gap-2 ${index === 0 ? 'border-cyan-400 text-cyan-300 shadow-[0_0_22px_rgba(0,217,255,0.35)]' : 'border-cyan-400/25 text-slate-300'} bg-black/35`}
        >
          <div className="text-2xl">{icons[index]}</div>
          <div className="text-xs tracking-[0.2em]">{pill}</div>
        </div>
      ))}
    </div>
  )
}