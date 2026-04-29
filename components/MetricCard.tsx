'use client'

import { motion } from 'framer-motion'

export default function MetricCard({ title, value, unit }: { title: string, value: string | number, unit: string }) {
  const icons: any = {
    Humidity: '◔',
    Pressure: '◌',
    Wind: '≋'
  }

  return (
    <motion.div whileHover={{ scale: 1.005 }} className='glass-panel rounded-2xl p-2 h-full min-h-0 border border-cyan-400/30 shadow-[0_0_14px_rgba(0,217,255,0.16)] flex flex-col justify-between overflow-hidden'>
      <div>
        <div className='text-cyan-400 text-[9px] tracking-[0.18em] uppercase'>{title}</div>
        <div className='text-lg mt-1'>{icons[title] || '◦'}</div>
        <div className='text-2xl xl:text-3xl font-black mt-1 leading-none'>{value}<span className='text-xs ml-1'>{unit}</span></div>
        <div className='text-slate-300 mt-1 text-[9px]'>Live sensor telemetry</div>
      </div>
      <div className='h-1.5 rounded-full bg-black/30 overflow-hidden mt-1'>
        <div className='h-full w-1/2 bg-cyan-400' />
      </div>
    </motion.div>
  )
}