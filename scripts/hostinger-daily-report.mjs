const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://staleyclimate.info'
const secret = process.env.CRON_SECRET

async function call(path) {
  const url = new URL(path, baseUrl)

  if (secret) {
    url.searchParams.set('secret', secret)
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'Hostinger-Cron/StaleyClimate'
    }
  })

  const body = await response.text()

  console.log(`${path}: ${body}`)

  if (!response.ok) {
    process.exitCode = 1
  }
}

await call('/api/send-daily-report')
await call('/api/evaluate-alarms')
