export type CommandPage = 'dashboard' | 'history' | 'alarms' | 'reports' | 'settings'

export interface StationObservation {
  obsTimeLocal?: string
  obsTimeUtc?: string
  neighborhood?: string
  stationID?: string
  humidity?: number
  uv?: number
  solarRadiation?: number
  imperial?: {
    temp?: number
    heatIndex?: number
    windChill?: number
    dewpt?: number
    pressure?: number
    precipRate?: number
    precipTotal?: number
    elev?: number
    windSpeed?: number
    windGust?: number
    tempHigh?: number
    tempLow?: number
  }
  winddir?: number
  [key: string]: unknown
}

export interface ForecastPeriod {
  number?: number
  name?: string
  startTime?: string
  endTime?: string
  isDaytime?: boolean
  temperature?: number
  temperatureUnit?: string
  probabilityOfPrecipitation?: {
    value?: number | null
    unitCode?: string
  }
  windSpeed?: string
  windDirection?: string
  icon?: string
  shortForecast?: string
  detailedForecast?: string
}

export interface StationSettings {
  id?: string | number
  notification_emails?: string[]
  notification_phones?: string[]
  daily_report_time?: string
  daily_report_enabled?: boolean
  abnormal_alerts_enabled?: boolean
  current_temp?: number
  current_humidity?: number
  current_pressure?: number
  current_wind?: number
  current_uv?: number
  current_feels_like?: number
  forecast_high?: number
  forecast_low?: number
  forecast_summary?: string
  today_precip?: number
  week_precip?: number
  month_precip?: number
  year_precip?: number
  precip_month?: number
  precip_year?: number
  lightning_total?: number
  lightning_near?: number
  lightning_cloud?: number
  lightning_ground?: number
  water_temp?: number
  water_quality?: string
  uv_risk?: string
  camera_url?: string
  radar_url?: string
  [key: string]: unknown
}

export interface TelemetryMetric {
  id: string
  title: string
  value: string
  unit: string
  detail: string
  sparkline: number[]
  scale: [number, number]
  tone: 'cyan' | 'green' | 'blue' | 'amber' | 'rose'
  source: string
}

export interface MoonData {
  phase: string
  illumination: number
  age: number
  waxing: boolean
  sunrise?: string
  sunset?: string
  daylight?: string
  moonrise: string
  moonset: string
  visibleHours: string
}

export interface AirQualityData {
  index: number | null
  label: string
  source: string
  values: Array<{
    label: string
    value: number | string | null
    unit?: string
  }>
}

export interface RadarData {
  imageUrl: string
  source: string
  updatedLabel: string
}

export interface DashboardPayload {
  station: StationObservation | null
  forecast: ForecastPeriod[]
  settings: StationSettings
  updatedAt: string
  current: {
    temperature: number
    feelsLike: number
    high: number
    low: number
    condition: string
    windDirection: string
    location: string
    stationId: string
  }
  telemetry: TelemetryMetric[]
  moon: MoonData
  precipitation: {
    today: number
    week: number
    month: number
    year: number
  }
  lightning: {
    total: number
    near: number
    cloud: number
    ground: number
  }
  airQuality: AirQualityData
  radar: RadarData
  cameraUrl: string | null
  trends: Array<{
    time: string
    temp: number
    feels: number
  }>
  alerts: Array<{
    title: string
    severity: 'watch' | 'advisory' | 'warning'
  }>
}
