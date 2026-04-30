Codex: Existing app/page.tsx currently routes to legacy Dashboard component.

Your migration target is to replace this orchestration with the new command center shell architecture using the newly scaffolded components.

Do not continue expanding the legacy Dashboard monolith.

Transition root page rendering into:
- CommandCenterShell
- TopCommandHeader
- active page modules
- BottomStatusRail

Legacy Dashboard should be treated as deprecated once migration is complete.
