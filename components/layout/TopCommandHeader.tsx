'use client'

import { Clock3, RadioTower } from 'lucide-react'
import CommandNavPills from './CommandNavPills'
import type { CommandPage, DashboardPayload } from '@/types/dashboard'

export default function TopCommandHeader({
  data,
  activePage,
  onPageChange
}: {
  data: DashboardPayload
  activePage: CommandPage
  onPageChange: (page: CommandPage) => void
}) {
  return (
    <header className="top-command-header">
      <div className="title-stack">
        <div className="eyebrow"><span>Live</span> Personal Weather Station</div>
        <h1>Staley Street Weather</h1>
        <p>
          {data.current.location} <span /> Station {data.current.stationId} <strong>Live</strong>
        </p>
      </div>

      <div className="header-controls">
        <div className="micro-status">
          <span><Clock3 size={15} /> {data.updatedAt}</span>
          <span>Apr 29, 2026</span>
          <strong><RadioTower size={14} /> Live</strong>
        </div>
        <CommandNavPills activePage={activePage} onPageChange={onPageChange} />
      </div>
    </header>
  )
}
