const RADAR_URL = 'https://radar.weather.gov/?settings=v1_eyJhZ2VuZGEiOnsiaWQiOiJ3ZWF0aGVyIiwiY2VudGVyIjpbLTgzLjAzOCwzNi43OTNdLCJsb2NhdGlvbiI6Wy04Mi4xMTIsMzYuODg1XSwiem9vbSI6Ni43NjY4NDI4ODAzNDQ1ODksImxheWVyIjoiYnJlZl9xY2QifSwiYW5pbWF0aW5nIjp0cnVlLCJiYXNlIjoic3RhbmRhcmQiLCJhcnRjYyI6ZmFsc2UsImNvdW50eSI6ZmFsc2UsImN3YSI6ZmFsc2UsInJmYyI6ZmFsc2UsInN0YXRlIjpmYWxzZSwibWVudSI6dHJ1ZSwic2hvcnRGdXNlZE9ubHkiOmZhbHNlLCJvcGFjaXR5Ijp7ImFsZXJ0cyI6MC44LCJsb2NhbCI6MC42LCJsb2NhbFN0YXRpb25zIjowLjgsIm5hdGlvbmFsIjowLjZ9fQ%3D%3D'

export default function RadarPanel() {
  return (
    <div className="glass-panel rounded-2xl p-3 h-full min-h-0 border border-cyan-400/20 overflow-hidden">
      <div className="text-cyan-400 tracking-[0.22em] uppercase text-[10px] mb-2">LIVE RADAR</div>
      <div className="h-[calc(100%-18px)] rounded-xl overflow-hidden relative bg-black/40">
        <iframe
          title="NOAA live radar"
          src={RADAR_URL}
          className="absolute inset-0 h-full w-full border-0 scale-[1.18] origin-center"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/75 to-transparent" />
      </div>
    </div>
  )
}
