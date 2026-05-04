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

function upstreamHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'user-agent': 'wstation-lorex-camera/1.3'
  }

  if (lorexPass) {
    const token = Buffer.from(`${lorexUser}:${lorexPass}`).toString('base64')
    headers.Authorization = `Basic ${token}`
  }

  return headers
}

function healthyStatus(message: string) {
  return NextResponse.json({
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

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') === 'snapshot' ? 'snapshot' : 'stream'

  if (request.nextUrl.searchParams.get('status') === '1') {
    return healthyStatus((streamUrl || snapshotUrl) ? 'Lorex camera feed online.' : 'Lorex camera awaiting external feed URL configuration.')
  }

  const sourceUrl = getSourceUrl(kind)

  if (!sourceUrl) {
    return NextResponse.redirect('https://placehold.co/1280x720/06141d/7ef9ff?text=CAMERA+OFFLINE', 302)
  }

  try {
    const upstream = await fetch(sourceUrl, {
      cache: 'no-store',
      headers: upstreamHeaders()
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.redirect('https://placehold.co/1280x720/06141d/7ef9ff?text=CAMERA+OFFLINE', 302)
    }

    return new Response(upstream.body, {
      status: 200,
      headers: headersFromResponse(upstream)
    })
  } catch {
    return NextResponse.redirect('https://placehold.co/1280x720/06141d/7ef9ff?text=CAMERA+OFFLINE', 302)
  }
}
