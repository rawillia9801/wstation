export default function ForecastStrip({ periods }: { periods: any[] }) {
  return (
    <div className='glass-panel rounded-3xl p-6'>
      <div className='text-cyan-400 tracking-[0.3em] text-xs uppercase mb-4'>NOAA FORECAST</div>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
        {periods.slice(0,5).map((p, i) => (
          <div key={i} className='rounded-2xl bg-black/20 p-4'>
            <div className='font-bold text-sm'>{p.name}</div>
            <div className='text-3xl font-black mt-2'>{p.temperature}°</div>
            <div className='text-slate-400 text-xs mt-2'>{p.shortForecast}</div>
          </div>
        ))}
      </div>
    </div>
  )
}