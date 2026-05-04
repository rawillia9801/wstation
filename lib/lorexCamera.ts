export const LOREX_CAMERA_ENDPOINT = '/api/lorex-camera?kind=snapshot'

export function lorexCameraUrl() {
  return `${LOREX_CAMERA_ENDPOINT}&ts=${Date.now()}`
}

export function nextLorexCameraUrl(refreshKey: number) {
  return `${LOREX_CAMERA_ENDPOINT}&ts=${refreshKey}`
}

export const lorexCameraLabel = 'Cars Camera'
