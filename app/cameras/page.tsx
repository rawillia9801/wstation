import Link from 'next/link'
import LorexCameraFeed from '@/components/LorexCameraFeed'

export default function CamerasRoute() {
  return (
    <main className="dashboard-shell cameras-route-shell">
      <section className="dashboard-main cameras-route-main">
        <header className="top-band cameras-route-header">
          <div className="title-cluster">
            <div className="eyebrow">LIVE CAMERA SYSTEM</div>
            <h1>Station Cameras</h1>
            <div className="subhead">Lorex video feed <span>•</span> Frigate / Home Assistant ready <span>•</span> <b className="live-text">LIVE</b></div>
          </div>
          <div className="header-actions">
            <nav className="top-nav">
              <Link href="/">Dashboard</Link>
              <Link href="/maps">Maps</Link>
              <Link href="/settings">Settings</Link>
            </nav>
          </div>
        </header>
        <LorexCameraFeed />
      </section>
    </main>
  )
}
