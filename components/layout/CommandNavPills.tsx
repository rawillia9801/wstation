'use client'

import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bell, FileText, History, LayoutDashboard, MapPin, Settings, Video } from 'lucide-react'
import type { CommandPage } from '@/types/dashboard'

const topItems: Array<{ id: CommandPage; label: string; icon: LucideIcon; badge?: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: History },
  { id: 'alarms', label: 'Alarms', icon: Bell, badge: '2' },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const railItems = [
  ...topItems,
  { id: 'maps' as const, label: 'Maps', icon: MapPin },
  { id: 'cameras' as const, label: 'Cameras', icon: Video }
]

export function SideCommandRail({
  activePage,
  onPageChange
}: {
  activePage: CommandPage
  onPageChange: (page: CommandPage) => void
}) {
  return (
    <aside className="command-rail">
      <div className="rail-mark">
        <BarChart3 aria-hidden />
      </div>

      <div className="rail-links">
        {railItems.map((item) => {
          const Icon = item.icon
          const isPage = ['dashboard', 'history', 'alarms', 'reports', 'settings'].includes(item.id)
          const active = activePage === item.id
          return (
            <button
              key={item.id}
              className={`rail-button ${active ? 'is-active' : ''}`}
              type="button"
              onClick={() => isPage && onPageChange(item.id as CommandPage)}
              title={item.label}
            >
              <Icon size={20} strokeWidth={1.7} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default function CommandNavPills({
  activePage,
  onPageChange
}: {
  activePage: CommandPage
  onPageChange: (page: CommandPage) => void
}) {
  return (
    <nav className="command-pills" aria-label="Command center sections">
      {topItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            className={`command-pill ${activePage === item.id ? 'is-active' : ''}`}
            type="button"
            onClick={() => onPageChange(item.id)}
          >
            {item.badge ? <span className="pill-badge">{item.badge}</span> : null}
            <Icon size={24} strokeWidth={1.65} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
