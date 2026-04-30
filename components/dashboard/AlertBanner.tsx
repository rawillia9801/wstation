import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { DashboardPayload } from '@/types/dashboard'

export default function AlertBanner({ alerts }: { alerts: DashboardPayload['alerts'] }) {
  const alert = alerts[0]

  return (
    <section className="alert-ribbon">
      <div>
        <AlertTriangle size={18} />
        <strong>{alert?.title || 'Weather operations nominal'}</strong>
      </div>
      <button type="button">
        View Alerts
        <ArrowRight size={15} />
      </button>
    </section>
  )
}
