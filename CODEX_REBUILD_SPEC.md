# CODEX_REBUILD_SPEC

## Goal
Rebuild the WStation frontend into a premium cinematic weather command center matching the supplied target dashboard image as closely as possible.

## Preserve
Do not break backend APIs, Supabase, Resend, NOAA/Ambient weather routes, environment variables, database contracts, or notification logic.

## Replace
Rebuild the frontend presentation layer: dashboard shell, command navigation, panels, forecast cards, moon panel, history, alarms, reports, and settings pages.

## Visual Target
Dark cinematic NOAA-style command center with glass panels, neon cyan borders, premium weather imagery, broadcast typography, large telemetry cards, forecast image tiles, radar, UV gauge, moon panel, trend charts, and polished status rails.

## Layout
Use a locked responsive viewport dashboard:
- Header command band
- Current conditions + telemetry band
- Forecast + moon band
- Intelligence lower grid
- Footer/status rail

Must fit 1366x768 laptop and large TV fullscreen at 100% browser zoom. No overflow, clipping, hidden nav, or row collisions.

## Required Pages
Dashboard, History, Alarms, Reports, Settings. All must share the same cinematic visual language.

## Implementation Rules
Do not tweak the old shell. Replace it. Use modular components, clamp typography, grid minmax contracts, aspect-ratio panels, and CSS variables. Avoid browser zoom hacks.

## Validation
Run build and lint if available. Fix all TypeScript, import, and hydration errors before finishing.

## Commit
Commit as: FULL CINEMATIC COMMAND CENTER FRONTEND REBUILD
