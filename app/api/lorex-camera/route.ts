import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type FeedKind = 'stream' | 'snapshot'

const cameraName = process.env.LOREX_CAMERA_NAME || 'Cars Camera'
const feedType = (process.env.LOREX_CAMERA_FEED_TYPE || 'snapshot').toLowerCase()
const streamUrl = process.env.LOREX_CAMERA_FEED_URL || ''
const snapshotUrl = process.env.LOREX_CAMERA_SNAPSHOT_URL || process.env.LOREX_CAMERA_FEED_URL || ''
const rtspUrl = process.env.LOREX_RTSP_URL || ''
const lorexUser = process.env.LOREX_USER || 'admin'
const lorexPass = process.env.LOREX_PASS || ''

function getSourceUrl(kind: FeedKind) {
  if (kind === 'snapshot') return snapshotUrl || streamUrl
  return streamUrl || snapshotUrl
}

function headersFromResponse(response: Response) {
  const headers = new Headers()
  headers.set('content-type', response.headers.get('content-type') || 'image/jpeg')
  headers.set('cache-control', 'no-store, max-age=0')
  return headers
}

function healthyStatus(message: string, ok = true) {
  return NextResponse.json({
    ok,
    name: cameraName,
    configured: Boolean(streamUrl || snapshotUrl),
    feedType,
    streamPath: '/api/lorex-camera?kind=stream',
    snapshotPath: '/api/lorex-camera?kind=snapshot',
    rtspConfigured: Boolean(rtspUrl),
    rtspBrowserPlayable: false,
    message
  })
}

async function tryFetch(url: string, init?: RequestInit) {
  try {
    const response = await fetch(url, { cache: 'no-store', ...init })
    if (response.ok && response.body) return response
  } catch {}
  return null
}

async function fetchLorex(url: string) {
  if (lorexPass) {
    const token = Buffer.from(`${lorexUser}:${lorexPass}`).toString('base64')

    const headerAuth = await tryFetch(url, {
      headers: {
        Authorization: `Basic ${token}`,
        'user-agent': 'wstation-lorex-camera/2.0'
      }
    })
    if (headerAuth) return headerAuth

    try {
      const authUrl = new URL(url)
      authUrl.username = lorexUser
      authUrl.password = lorexPass
      const embeddedAuth = await tryFetch(authUrl.toString(), {
        headers: { 'user-agent': 'wstation-lorex-camera/2.0' }
      })
      if (embeddedAuth) return embeddedAuth
    } catch {}
  }

  return await tryFetch(url, {
    headers: { 'user-agent': 'wstation-lorex-camera/2.0' }
  })
}

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') === 'snapshot' ? 'snapshot' : 'stream'
  const sourceUrl = getSourceUrl(kind)

  if (request.nextUrl.searchParams.get('status') === '1') {
    if (!sourceUrl) return healthyStatus('Lorex camera URL missing.', false)
    const probe = await fetchLorex(sourceUrl)
    return probe ? healthyStatus('Lorex camera endpoint responding.', true) : healthyStatus('Lorex upstream unreachable or authentication rejected.', false)
  }

  if (!sourceUrl) {
    return NextResponse.redirect('https://placehold.co/1280x720/06141d/7ef9ff?text=CAMERA+OFFLINE', 302)
  }

  const upstream = await fetchLorex(sourceUrl)

  if (!upstream) {
    return NextResponse.redirect('https://placehold.co/1280x720/06141d/7ef9ff?text=CAMERA+OFFLINE', 302)
  }

  return new Response(upstream.body, {
    status: 200,
    headers: headersFromResponse(upstream)
  })
}
