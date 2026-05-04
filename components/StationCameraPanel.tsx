'use client'

import { useEffect, useState } from 'react'
import { lorexCameraLabel, nextLorexCameraUrl } from '@/lib/lorexCamera'

const panel = 'border border-cyan-300/30 bg-[radial-gradient(circle_at_top,rgba(0,180,255,0.14),rgba(2,9,18,0.92)_58%)] shadow-[0_0_22px_rgba(0,221,255,0.2),inset_0_0_34px_rgba(0,190,255,0.05)] backdrop-blur-md'

export default function StationCameraPanel() {
  const [refreshKey, setRefreshKey] = useState(Date.now())
  const [modalOpen, setModalOpen] = useState(false)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshKey(Date.now()), 6000)
    return () => window.clearInterval(timer)
  }, [])

  const imageUrl = nextLorexCameraUrl(refreshKey)

  return (
    <>
      <section className={`${panel} camera-panel`}>
        <div className="panel-title flex items-center justify-between">
          <span>STATION CAMERA</span>
          <span className="camera-live-badge">LIVE FEED</span>
        </div>

        <div className="camera-feed-shell enhanced">
          {!offline ? (
            <img
              src={imageUrl}
              alt={lorexCameraLabel}
              className="camera-feed-image"
              onError={() => setOffline(true)}
              onLoad={() => setOffline(false)}
            />
          ) : (
            <div className="camera-offline-state">CAMERA LINK UNAVAILABLE</div>
          )}

          <div className="camera-scanlines" />
          <div className="camera-feed-overlay" />

          <div className="camera-feed-footer">
            <div>
              <div className="camera-feed-label">{lorexCameraLabel}</div>
              <div className="camera-feed-subtext">Lorex secured perimeter channel</div>
            </div>
            <button type="button" className="camera-view-button" onClick={() => setModalOpen(true)}>
              EXPAND ↗
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="camera-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="camera-modal-shell" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="camera-modal-close" onClick={() => setModalOpen(false)}>
              ×
            </button>
            {!offline ? (
              <img src={imageUrl} alt={lorexCameraLabel} className="camera-modal-image" onError={() => setOffline(true)} />
            ) : (
              <div className="camera-offline-state large">CAMERA LINK UNAVAILABLE</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
