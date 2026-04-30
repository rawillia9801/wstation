# DESIGN_MAP

## Required Architecture

app/page.tsx = root data orchestrator only

components/layout/
- CommandCenterShell
- TopCommandHeader
- CommandNavPills
- BottomStatusRail

components/pages/
- DashboardPage
- HistoryPage
- AlarmsPage
- ReportsPage
- SettingsPage

components/dashboard/
- HeroConditionsBand
- CurrentConditionsHero
- TelemetryCardGrid
- TelemetryCard
- ForecastMoonBand
- ForecastStrip
- ForecastCard
- MoonPanel
- IntelligenceLowerBand
- RadarPanel
- AirUvGaugePanel
- SunMoonArcPanel
- TempTrendPanel

components/modules/
- AlarmToggleRow
- ReportActionCard
- RecipientManager

lib/
- dashboardTheme.ts
- dashboardDataMapper.ts

## Data Flow
app/page.tsx should normalize all existing weather/settings/alarm data and pass props downward. Avoid duplicate refetching in every page.

## Styling
Global cinematic CSS token system in globals.css. Use neon cyan glass panel contracts, responsive grid bands, clamp typography, and viewport-safe layout math.

## Mandatory Pages
Dashboard, History, Alarms, Reports, Settings all in one cohesive command-center visual language.
