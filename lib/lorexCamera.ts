export const LOREX_CAMERA_ENDPOINT = '/api/camera-feed'

export function lorexCameraUrl() {
  return `${LOREX_CAMERA_ENDPOINT}?ts=${Date.now()}`
}

export function nextLorexCameraUrl(refreshKey: number) {
  return `${LOREX_CAMERA_ENDPOINT}?ts=${refreshKey}`
}

export const lorexCameraLabel = 'Cars Camera'
