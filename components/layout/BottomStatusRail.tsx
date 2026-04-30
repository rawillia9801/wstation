import { CheckCircle2, Database, Radio, ShieldCheck } from 'lucide-react'
import type { DashboardPayload } from '@/types/dashboard'

export default function BottomStatusRail({ data }: { data: DashboardPayload }) {
  return (
    <footer className="bottom-status-rail">
      <span><CheckCircle2 size={14} /> Station Online</span>
      <span><Radio size={14} /> Ambient Weather API</span>
      <span><ShieldCheck size={14} /> NOAA Forecast Sync</span>
      <span><Database size={14} /> Supabase Settings Bound</span>
      <strong>Auto refresh 8s</strong>
      <strong>{data.current.temperature ?? '--'}F / {data.current.condition}</strong>
    </footer>
  )
}
