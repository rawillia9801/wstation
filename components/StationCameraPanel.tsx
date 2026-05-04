'use client'

import { useEffect, useState } from 'react'
import { lorexCameraLabel, nextLorexCameraUrl } from '@/lib/lorexCamera'

const panel = 'border border-cyan-300/30 bg-[#03101a]/82 shadow-[0_0_18px_rgba(0,221,255,0.18),inset_0_0_30px_rgba(0,190,255,0.045)] backdrop-blur-md'

export default function StationCameraPanel() {
  const [refreshKey, setRefreshKey] = useState(Date.now())
  const [modalOpen, setModalOpen] = useState(false)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshKey(Date.now()), 8000)
    return () => window.clearInterval(timer)
  }, [])

  const imageUrl = nextLorexCameraUrl(refreshKey)

  return (
    <>
      <section className={`${panel} camera-panel`}>
        <div className="panel-title">
          STATION CAMERA
          <span className="camera-live-badge">LIVE</span>
        </div>

        <div className="camera-feed-shell">
          {!offline ? (
            <img
              src={imageUrl}
              alt={lorexCameraLabel}
              className="camera-feed-image"
              onError={() => setOffline(true)}
              onLoad={() => setOffline(false)}
            />
          ) : (
            <div className="camera-offline-state">CAMERA OFFLINE</div>
          )}

          <div className="camera-feed-overlay" />

          <div className="camera-feed-footer">
            <div className="camera-feed-label">{lorexCameraLabel}</div>
            <button type="button" className="camera-view-button" onClick={() => setModalOpen(true)}>
              VIEW CAMERA →
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
              <div className="camera-offline-state large">CAMERA OFFLINE</div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
