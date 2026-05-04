'use client'

import { useEffect, useMemo, useState } from 'react'
import { Camera, ExternalLink, RefreshCw, ShieldCheck, Video } from 'lucide-react'

type CameraStatus = {
  name?: string
  configured?: boolean
  feedType?: string
  streamPath?: string | null
  snapshotPath?: string | null
  rtspConfigured?: boolean
  rtspBrowserPlayable?: boolean
  message?: string
}

const panel = 'border border-cyan-300/30 bg-[#03101a]/82 shadow-[0_0_18px_rgba(0,221,255,0.18),inset_0_0_30px_rgba(0,190,255,0.045)] backdrop-blur-md'

export default function LorexCameraFeed() {
  const [status, setStatus] = useState<CameraStatus | null>(null)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadStatus() {
      try {
        const response = await fetch('/api/lorex-camera?status=1', { cache: 'no-store' })
        const payload = await response.json()
        if (!cancelled) {
          setStatus(payload)
          setError('')
        }
      } catch {
        if (!cancelled) setError('Camera status unavailable.')
      }
    }

    loadStatus()
    const timer = window.setInterval(loadStatus, 30000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const feedSrc = useMemo(() => {
    if (!status?.streamPath) return ''
    const separator = status.streamPath.includes('?') ? '&' : '?'
    return `${status.streamPath}${separator}v=${reloadKey}`
  }, [reloadKey, status?.streamPath])

  const isHls = status?.feedType === 'hls' || status?.streamPath?.includes('.m3u8')
  const isStillImage = status?.feedType === 'snapshot' || status?.feedType === 'jpg' || status?.feedType === 'jpeg'

  function refreshFeed() {
    setLoaded(false)
    setReloadKey((value) => value + 1)
  }

  return (
    <section className={`${panel} lorex-camera-card`}>
      <div className="lorex-camera-heading">
        <div>
          <div className="panel-title">LOREX VIDEO FEED</div>
          <h2>{status?.name || 'Lorex Camera'}</h2>
          <p>{error || status?.message || 'Loading Lorex camera status...'}</p>
        </div>
        <div className="lorex-camera-actions">
          <button type="button" onClick={refreshFeed}><RefreshCw size={16} /> Refresh</button>
          {status?.streamPath && <a href={status.streamPath} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open Feed</a>}
        </div>
      </div>

      <div className="lorex-video-shell">
        {status?.configured && feedSrc ? (
          <>
            {!loaded && <div className="lorex-loading"><Video size={36} /> Connecting to Lorex feed...</div>}
            {isHls ? (
              <video key={feedSrc} src={feedSrc} controls muted autoPlay playsInline onCanPlay={() => setLoaded(true)} />
            ) : isStillImage ? (
              <img key={feedSrc} src={feedSrc} alt={`${status?.name || 'Lorex'} camera snapshot`} onLoad={() => setLoaded(true)} />
            ) : (
              <img key={feedSrc} src={feedSrc} alt={`${status?.name || 'Lorex'} live camera feed`} onLoad={() => setLoaded(true)} />
            )}
          </>
        ) : (
          <div className="lorex-placeholder">
            <Camera size={54} strokeWidth={1.5} />
            <strong>Lorex feed not configured</strong>
            <span>Set LOREX_CAMERA_FEED_URL to a browser-playable HTTP/MJPEG/HLS feed exposed by Frigate, Home Assistant, or the Lorex NVR.</span>
          </div>
        )}
      </div>

      <div className="lorex-status-grid">
        <div><ShieldCheck size={18} /> Browser feed <b>{status?.configured ? 'Configured' : 'Missing'}</b></div>
        <div><Video size={18} /> Feed type <b>{status?.feedType || 'mjpeg'}</b></div>
        <div><Camera size={18} /> RTSP source <b>{status?.rtspConfigured ? 'Saved server-side' : 'Optional'}</b></div>
      </div>
    </section>
  )
}
