export const LOREX_CAMERA_STATUS_ENDPOINT = '/api/lorex-camera?status=1'
export const LOREX_CAMERA_SNAPSHOT_ENDPOINT = '/api/lorex-camera?kind=snapshot'
export const LOREX_CAMERA_STREAM_ENDPOINT = '/api/lorex-camera?kind=stream'

export function lorexCameraUrl() {
  return `${LOREX_CAMERA_SNAPSHOT_ENDPOINT}&ts=${Date.now()}`
}

export function nextLorexCameraUrl(refreshKey: number) {
  return `${LOREX_CAMERA_SNAPSHOT_ENDPOINT}&ts=${refreshKey}`
}

export function lorexCameraStatusUrl() {
  return `${LOREX_CAMERA_STATUS_ENDPOINT}&ts=${Date.now()}`
}

export const lorexCameraLabel = 'Cars Camera'
