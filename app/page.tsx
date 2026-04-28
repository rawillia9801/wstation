export default function HomePage() {
  return (
    <main className='min-h-screen telemetry-grid relative overflow-hidden p-8'>
      <div className='scanline absolute inset-0 pointer-events-none' />

      <section className='relative z-10 max-w-7xl mx-auto'>
        <div className='mb-10'>
          <div className='text-cyan-400 tracking-[0.4em] text-sm mb-3'>WEATHER INTELLIGENCE COMMAND</div>
          <h1 className='text-6xl font-black'>WSTATION</h1>
          <p className='text-slate-400 mt-4 text-lg'>Personal atmospheric telemetry • automated forecasting • alert dispatch</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='glass-panel rounded-3xl p-8 h-56'>Initializing live station telemetry...</div>
          <div className='glass-panel rounded-3xl p-8 h-56'>Loading atmospheric forecast engine...</div>
          <div className='glass-panel rounded-3xl p-8 h-56'>Preparing alert automation network...</div>
        </div>
      </section>
    </main>
  )
}