import AirQualityPanel from '@/components/dashboard/AirQualityPanel'
import AlertBanner from '@/components/dashboard/AlertBanner'
import ForecastStrip from '@/components/dashboard/ForecastStrip'
import HeroCurrentConditions from '@/components/dashboard/HeroCurrentConditions'
import LightningStatsPanel from '@/components/dashboard/LightningStatsPanel'
import MetricStatCard from '@/components/dashboard/MetricStatCard'
import MoonPhasePanel from '@/components/dashboard/MoonPhasePanel'
import PrecipStatsPanel from '@/components/dashboard/PrecipStatsPanel'
import RadarPanel from '@/components/dashboard/RadarPanel'
import StationCameraPanel from '@/components/dashboard/StationCameraPanel'
import SunMoonArcPanel from '@/components/dashboard/SunMoonArcPanel'
import TrendChartPanel from '@/components/dashboard/TrendChartPanel'
import type { DashboardPayload } from '@/types/dashboard'

export default function DashboardPage({ data }: { data: DashboardPayload }) {
  return (
    <div className="dashboard-page">
      <AlertBanner alerts={data.alerts} />

      <section className="hero-telemetry-row">
        <HeroCurrentConditions data={data} />
        <div className="telemetry-card-grid">
          {data.telemetry.map((metric) => <MetricStatCard key={metric.id} metric={metric} />)}
        </div>
      </section>

      <section className="forecast-moon-row">
        <ForecastStrip periods={data.forecast} />
        <MoonPhasePanel moon={data.moon} />
      </section>

      <section className="intelligence-row">
        <RadarPanel radar={data.radar} />
        <AirQualityPanel airQuality={data.airQuality} />
        <SunMoonArcPanel moon={data.moon} />
        <TrendChartPanel data={data.trends} />
      </section>

      <section className="lower-row">
        <PrecipStatsPanel precipitation={data.precipitation} />
        <LightningStatsPanel lightning={data.lightning} />
        <StationCameraPanel cameraUrl={data.cameraUrl} condition={data.current.condition} />
      </section>
    </div>
  )
}
