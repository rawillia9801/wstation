export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']
  const icons = ['▦', '◔', '◌', '⚙']

  return (
    <div className="flex gap-2 justify-end">
      {pills.map((pill, index) => (
        <div
          key={pill}
          className={`w-[92px] h-[54px] rounded-2xl border flex flex-col items-center justify-center gap-1 ${index === 0 ? 'border-cyan-300 text-cyan-200 shadow-[0_0_22px_rgba(0,217,255,0.45)]' : 'border-cyan-400/20 text-slate-300'} bg-black/40 backdrop-blur-md`}
        >
          <div className="text-xs">{icons[index]}</div>
          <div className="text-[9px] tracking-[0.18em]">{pill}</div>
        </div>
      ))}
    </div>
  )
}