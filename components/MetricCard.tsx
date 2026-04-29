'use client'

import { motion } from 'framer-motion'

export default function MetricCard({ title, value, unit }: { title: string, value: string | number, unit: string }) {
  const icons: any = {
    Humidity: '◔',
    Pressure: '◌',
    Wind: '≋'
  }

  return (
    <motion.div whileHover={{ scale: 1.01 }} className='glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/30 shadow-[0_0_18px_rgba(0,217,255,0.18)] flex flex-col justify-between overflow-hidden'>
      <div>
        <div className='text-cyan-400 text-[10px] tracking-[0.22em] uppercase'>{title}</div>
        <div className='text-xl mt-2'>{icons[title] || '◦'}</div>
        <div className='text-3xl xl:text-4xl font-black mt-2 leading-none'>{value}<span className='text-sm xl:text-base ml-1'>{unit}</span></div>
        <div className='text-slate-300 mt-2 text-[10px]'>Live sensor telemetry</div>
      </div>
      <div className='h-2 rounded-full bg-black/30 overflow-hidden mt-2'>
        <div className='h-full w-1/2 bg-cyan-400' />
      </div>
    </motion.div>
  )
}