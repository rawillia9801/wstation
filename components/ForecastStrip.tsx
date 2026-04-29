export default function ForecastStrip({ periods }: { periods: any[] }) {
  const images = [
    'https://images.unsplash.com/photo-1501691223387-dd0500403074?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=900&auto=format&fit=crop'
  ]

  return (
    <div className='glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/25 overflow-hidden'>
      <div className='text-cyan-400 tracking-[0.22em] text-[10px] uppercase mb-2'>5 DAY FORECAST</div>
      <div className='grid grid-cols-5 gap-2 h-[calc(100%-18px)]'>
        {periods.slice(0,5).map((p, i) => (
          <div key={i} className='rounded-xl h-full min-h-0 relative overflow-hidden border border-cyan-400/20'>
            <div className='absolute inset-0 bg-cover bg-center opacity-55' style={{ backgroundImage: `url(${images[i]})` }} />
            <div className='absolute inset-0 bg-gradient-to-b from-black/20 to-black/80' />
            <div className='relative z-10 p-2 h-full flex flex-col justify-between'>
              <div className='font-bold text-[10px] xl:text-xs'>{p.name}</div>
              <div>
                <div className='text-2xl xl:text-3xl font-black'>{p.temperature}°</div>
                <div className='text-slate-200 text-[8px] mt-1 leading-tight'>{p.shortForecast}</div>
                <div className='text-cyan-300 text-[8px] mt-1'>💧 {10 + i * 10}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}