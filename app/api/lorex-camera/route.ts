import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type FeedKind = 'stream' | 'snapshot'

const cameraName = process.env.LOREX_CAMERA_NAME || 'Lorex Camera'
const feedType = (process.env.LOREX_CAMERA_FEED_TYPE || 'mjpeg').toLowerCase()
const streamUrl = process.env.LOREX_CAMERA_FEED_URL || ''
const snapshotUrl = process.env.LOREX_CAMERA_SNAPSHOT_URL || ''
const rtspUrl = process.env.LOREX_RTSP_URL || ''

function getSourceUrl(kind: FeedKind) {
  if (kind === 'snapshot') return snapshotUrl || streamUrl
  return streamUrl
}

function isRtsp(url: string) {
  return /^rtsp:\/\//i.test(url)
}

function headersFromResponse(response: Response) {
  const headers = new Headers()
  const contentType = response.headers.get('content-type')
  const cacheControl = response.headers.get('cache-control')

  if (contentType) headers.set('content-type', contentType)
  if (cacheControl) headers.set('cache-control', cacheControl)
  else headers.set('cache-control', 'no-store, max-age=0')

  return headers
}

export async function GET(request: NextRequest) {
  const kind = request.nextUrl.searchParams.get('kind') === 'snapshot' ? 'snapshot' : 'stream'

  if (request.nextUrl.searchParams.get('status') === '1') {
    return NextResponse.json({
      name: cameraName,
      configured: Boolean(streamUrl || snapshotUrl),
      feedType,
      streamPath: streamUrl ? '/api/lorex-camera?kind=stream' : null,
      snapshotPath: (snapshotUrl || streamUrl) ? '/api/lorex-camera?kind=snapshot' : null,
      rtspConfigured: Boolean(rtspUrl),
      rtspBrowserPlayable: false,
      message: streamUrl
        ? 'Lorex camera feed is configured.'
        : rtspUrl
          ? 'RTSP is configured, but browsers cannot play RTSP directly. Point LOREX_CAMERA_FEED_URL at a Frigate, Home Assistant, or NVR HTTP/MJPEG/HLS output.'
          : 'Set LOREX_CAMERA_FEED_URL to an HTTP/MJPEG/HLS camera feed.'
    })
  }

  const sourceUrl = getSourceUrl(kind)

  if (!sourceUrl) {
    return NextResponse.json({ error: 'Lorex camera feed is not configured.' }, { status: 503 })
  }

  if (isRtsp(sourceUrl)) {
    return NextResponse.json(
      { error: 'RTSP streams cannot be proxied directly to the browser. Use Frigate or Home Assistant to expose the Lorex stream over HTTP/MJPEG/HLS, then set LOREX_CAMERA_FEED_URL.' },
      { status: 415 }
    )
  }

  try {
    const upstream = await fetch(sourceUrl, {
      cache: 'no-store',
      headers: {
        'user-agent': 'wstation-lorex-camera/1.0'
      }
    })

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: `Lorex camera feed returned ${upstream.status}.` }, { status: upstream.status || 502 })
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: headersFromResponse(upstream)
    })
  } catch {
    return NextResponse.json({ error: 'Lorex camera feed could not be reached.' }, { status: 502 })
  }
}
