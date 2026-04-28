'use client'

import { motion } from 'framer-motion'

export default function MetricCard({ title, value, unit }: { title: string, value: string | number, unit: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} className='glass-panel rounded-3xl p-6 shadow-neon'>
      <div className='text-cyan-400 text-xs tracking-[0.3em] uppercase'>{title}</div>
      <div className='text-5xl font-black mt-4'>{value}<span className='text-xl ml-2'>{unit}</span></div>
    </motion.div>
  )
}