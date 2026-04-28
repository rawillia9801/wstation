'use client'

import { motion } from 'framer-motion'

export default function MetricCard({ title, value, unit }: { title: string, value: string | number, unit: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className='glass-panel rounded-3xl p-6 border border-cyan-400/20'>
      <div className='flex items-center justify-between'>
        <div className='text-cyan-400 text-xs tracking-[0.3em] uppercase'>{title}</div>
        <div className='w-10 h-1 rounded-full bg-cyan-400/60' />
      </div>
      <div className='text-5xl font-black mt-4'>{value}<span className='text-xl ml-2'>{unit}</span></div>
      <div className='text-slate-400 text-xs mt-3'>Live sensor telemetry</div>
    </motion.div>
  )
}