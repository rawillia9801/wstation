export default function NavPills() {
  const pills = ['DASHBOARD', 'HISTORY', 'ALARMS', 'SETTINGS']

  return (
    <div className="flex flex-wrap gap-3 justify-end">
      {pills.map((pill, index) => (
        <div
          key={pill}
          className={`px-6 py-4 rounded-2xl border text-sm tracking-[0.2em] ${index === 0 ? 'border-cyan-400 text-cyan-300 shadow-[0_0_18px_rgba(0,217,255,0.25)]' : 'border-cyan-400/20 text-slate-300'}`}
        >
          {pill}
        </div>
      ))}
    </div>
  )
}