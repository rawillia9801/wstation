import { runDailyReport } from '@/lib/daily-report'

declare global {
  // eslint-disable-next-line no-var
  var __wstationDailyReportScheduler: NodeJS.Timeout | undefined
}

async function tick() {
  try {
    const result = await runDailyReport({ source: 'hostinger_node_scheduler' })
    if (!result.skipped) {
      console.log('[daily-report]', result.ok ? 'sent' : 'failed', result)
    }
  } catch (error) {
    console.error('[daily-report] scheduler error', error)
  }
}

export function startDailyReportScheduler() {
  if (process.env.DISABLE_DAILY_REPORT_SCHEDULER === 'true') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (globalThis.__wstationDailyReportScheduler) return

  globalThis.__wstationDailyReportScheduler = setInterval(tick, 60 * 1000)
  globalThis.__wstationDailyReportScheduler.unref?.()
  tick()
}

startDailyReportScheduler()
