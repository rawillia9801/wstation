'use client'

import { motion } from 'framer-motion'

export default function MetricCard({ title, value, unit }: { title: string, value: string | number, unit: string }) {
  const icons: any = {
    Humidity: '◔',
    Pressure: '◌',
    Wind: '≋'
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} className='glass-panel rounded-3xl p-5 min-h-[330px] border border-cyan-400/30 shadow-[0_0_24px_rgba(0,217,255,0.18)] flex flex-col justify-between'>
      <div>
        <div className='text-cyan-400 text-sm tracking-[0.25em] uppercase'>{title}</div>
        <div className='text-4xl mt-5'>{icons[title] || '◦'}</div>
        <div className='text-7xl font-black mt-4 leading-none'>{value}<span className='text-2xl ml-1'>{unit}</span></div>
        <div className='text-slate-200 mt-4 text-2xl'>Live sensor telemetry</div>
      </div>
      <div className='h-3 rounded-full bg-black/30 overflow-hidden'>
        <div className='h-full w-1/2 bg-cyan-400' />
      </div>
    </motion.div>
  )
}