const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT || 3000)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const schedulerBaseUrl = process.env.INTERNAL_SCHEDULER_URL || `http://127.0.0.1:${port}`
const schedulerSecret = process.env.CRON_SECRET
const schedulerTimeoutMs = Number(process.env.INTERNAL_SCHEDULER_TIMEOUT_MS || 25000)
let schedulerRunning = false

async function callScheduledRoute(path) {
  const url = new URL(path, schedulerBaseUrl)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), schedulerTimeoutMs)

  if (schedulerSecret) {
    url.searchParams.set('secret', schedulerSecret)
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'StaleyWeather-InAppScheduler'
      }
    })
    const body = await response.text()
    console.log(`[scheduler] ${path} -> ${response.status} ${body.slice(0, 240)}`)
  } catch (error) {
    console.error(`[scheduler] ${path} failed`, error)
  } finally {
    clearTimeout(timeout)
  }
}

async function runScheduledRoutes() {
  if (schedulerRunning) {
    console.log('[scheduler] previous run still active; skipping this interval')
    return
  }

  schedulerRunning = true
  try {
    await Promise.allSettled([
      callScheduledRoute('/api/send-daily-report'),
      callScheduledRoute('/api/evaluate-alarms')
    ])
  } finally {
    schedulerRunning = false
  }
}

function startScheduler() {
  if (dev || process.env.ENABLE_INTERNAL_SCHEDULER !== '1') return

  const intervalMinutes = Number(process.env.INTERNAL_SCHEDULER_MINUTES || 5)
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000

  setTimeout(runScheduledRoutes, 30 * 1000)

  setInterval(runScheduledRoutes, intervalMs)
}

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res)
  }).listen(port, hostname, () => {
    console.log(`Staley Weather app listening on http://${hostname}:${port}`)
    startScheduler()
  })
}).catch((error) => {
  console.error('Failed to start Staley Weather app', error)
  process.exit(1)
})
