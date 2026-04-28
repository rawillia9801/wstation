export default function ForecastStrip({ periods }: { periods: any[] }) {
  return (
    <div className='glass-panel rounded-3xl p-6 border border-cyan-400/20'>
      <div className='text-cyan-400 tracking-[0.3em] text-xs uppercase mb-4'>5 DAY FORECAST</div>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        {periods.slice(0,5).map((p, i) => (
          <div key={i} className='rounded-2xl bg-black/25 border border-cyan-400/10 p-4 min-h-[150px]'>
            <div className='font-bold text-sm text-cyan-200'>{p.name}</div>
            <div className='text-4xl font-black mt-3'>{p.temperature}°</div>
            <div className='text-slate-300 text-xs mt-3'>{p.shortForecast}</div>
            <div className='mt-4 text-cyan-400 text-xs'>Atmospheric trend stable</div>
          </div>
        ))}
      </div>
    </div>
  )
}