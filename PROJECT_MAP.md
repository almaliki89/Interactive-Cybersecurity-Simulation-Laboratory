# Project Map (ZORG Platform)

## Architectural Overview
ZORG is an enterprise-grade cybersecurity simulation and Iraqi national curriculum platform built as a React SPA with Vite, TypeScript, Tailwind CSS, and Firebase persistence.

## Directory Structure
- `/src/components/`: UI components, landing pages, cyber range, curriculum views, and simulation viewports.
- `/src/stores/`: Zustand state stores (`simulationStore.ts`, `devSecOpsStore.ts`, etc.).
- `/src/engine/`: Simulation runtime, event bus, and digital twin stores.
- `/src/simulations/`: Registered simulation worlds (60 living worlds).
- `/src/data/`: Curriculum data (`curriculumData.ts`).
- `/src/i18n/`: Bilingual localization (`translations.ts`).
- `/src/context/`: Firebase context and authentication providers.

## Key Files & State
- `src/App.tsx`: Main entry component with theme syncing (modern, dark, light classes applied to root) and error boundaries.
- `src/stores/simulationStore.ts`: Central simulation state, safe theme parsing (`safeParseTheme`), telemetry, curriculum progress, and challenge tracking.
- `src/stores/__tests__/themeEngine.test.ts`: TDD unit test suite verifying theme validation, persistence, and storage rehydration.
- `src/components/ui/Header.tsx`: Linear/Calm-Tech navigation header with authoritative ZORG branding, tri-theme toggle (Modern/Dark/Light), language switcher, and streamlined lab switchers.
- `src/components/landing/InteractiveEnterpriseHero.tsx`: Mission-first Command Deck with uncluttered visual hierarchy, smooth packet stream, and calm student journey hub.
- `src/index.css`: Tri-theme CSS architecture with dynamic surface, background, and text overrides for light, modern, and dark palettes.

