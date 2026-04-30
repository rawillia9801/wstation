import { ArrowRight, Circle } from 'lucide-react'

export default function StationCameraPanel({ cameraUrl }: { cameraUrl: string | null }) {
  return (
    <section className="camera-panel panel" style={{ backgroundImage: cameraUrl ? `linear-gradient(90deg, rgba(3,10,18,.42), rgba(3,10,18,.78)), url(${cameraUrl})` : 'linear-gradient(90deg, rgba(3,10,18,.72), rgba(3,10,18,.94))' }}>
      <div className="camera-live"><Circle size={10} fill="currentColor" /> {cameraUrl ? 'Live' : 'No Feed'}</div>
      <span className="panel-kicker">Station Camera</span>
      <button type="button">{cameraUrl ? 'View Camera' : 'Camera URL Missing'} <ArrowRight size={15} /></button>
    </section>
  )
}
