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
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/20'

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
    <section className={`${panel} relative overflow-hidden rounded-2xl p-5`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(32,245,255,.15),transparent_35%),linear-gradient(180deg,rgba(5,25,40,.82),rgba(0,7,14,.9))]" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="panel-title">LOREX VIDEO FEED</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">{status?.name || 'Lorex Camera'}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{error || status?.message || 'Loading Lorex camera status...'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={buttonClass} type="button" onClick={refreshFeed}><RefreshCw size={16} /> Refresh</button>
          {status?.streamPath && <a className={buttonClass} href={status.streamPath} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open Feed</a>}
        </div>
      </div>

      <div className="relative z-10 mt-5 aspect-video overflow-hidden rounded-xl border border-cyan-300/25 bg-black/45 shadow-[inset_0_0_32px_rgba(0,0,0,.55)]">
        {status?.configured && feedSrc ? (
          <>
            {!loaded && <div className="absolute inset-0 z-10 grid place-items-center gap-3 bg-black/55 text-cyan-100"><Video size={36} /> Connecting to Lorex feed...</div>}
            {isHls ? (
              <video className="h-full w-full object-cover" key={feedSrc} src={feedSrc} controls muted autoPlay playsInline onCanPlay={() => setLoaded(true)} />
            ) : isStillImage ? (
              <img className="h-full w-full object-cover" key={feedSrc} src={feedSrc} alt={`${status?.name || 'Lorex'} camera snapshot`} onLoad={() => setLoaded(true)} />
            ) : (
              <img className="h-full w-full object-cover" key={feedSrc} src={feedSrc} alt={`${status?.name || 'Lorex'} live camera feed`} onLoad={() => setLoaded(true)} />
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-300">
            <Camera size={54} strokeWidth={1.5} />
            <strong className="text-xl text-white">Lorex feed not configured</strong>
            <span className="max-w-2xl text-sm leading-6">Set LOREX_CAMERA_FEED_URL to a browser-playable HTTP/MJPEG/HLS feed exposed by Frigate, Home Assistant, or the Lorex NVR.</span>
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4 grid gap-3 md:grid-cols-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-300/20 bg-black/20 p-4 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><ShieldCheck size={18} /> Browser feed</span><b className="text-cyan-100">{status?.configured ? 'Configured' : 'Missing'}</b></div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-300/20 bg-black/20 p-4 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Video size={18} /> Feed type</span><b className="text-cyan-100">{status?.feedType || 'mjpeg'}</b></div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-cyan-300/20 bg-black/20 p-4 text-sm text-slate-300"><span className="inline-flex items-center gap-2"><Camera size={18} /> RTSP source</span><b className="text-cyan-100">{status?.rtspConfigured ? 'Saved server-side' : 'Optional'}</b></div>
      </div>
    </section>
  )
}
