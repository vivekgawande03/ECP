# Enterprise Car Configuration Platform (ECP)

This repository contains a proof of concept for a modern automotive sales configurator built with Next.js.

The app demonstrates a guided vehicle configuration experience with rule-aware selections, live pricing, quote creation, order-style review, saved orders, and a lightweight in-app assistant.

## What the app supports

- Multi-step vehicle configuration flow:
  - Model
  - Engine
  - Transmission
  - Trim
  - Exterior
  - Interior
  - Wheels
  - Packages
  - Review
- Market-aware and dealer-aware behavior
- Rule-based validation and disabled-option explanations
- Live pricing updates during configuration
- Quote save and retrieval flow
- Order summary and production commitment flow
- Saved orders screen for committed quotes
- 3D vehicle preview with configurable visual changes
- Lightweight assistant support based on deterministic recommendation logic

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- tRPC
- TanStack React Query
- Zod + SuperJSON
- Three.js with `@react-three/fiber` and `@react-three/drei`
- SQLite-backed quote persistence for the POC
- Jest + Testing Library

## Installation

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Then open:

- `http://localhost:3000` - main configurator
- `http://localhost:3000/order-summary` - order summary flow
- `http://localhost:3000/saved-orders` - saved committed orders

## Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

## Project structure

- `app/` - Next.js routes
- `src/components/` - UI and configurator components
- `src/lib/` - configurator logic, rules, pricing, assistant helpers
- `src/store/` - Zustand state management
- `src/server/` - server-side routers and repositories
- `tests/` - Jest test coverage

## Notes

- This is a demo-oriented POC focused on user flow and presentation value.
- It is not intended to represent a full production-grade enterprise implementation.
- The repository includes a local SQLite database file used for the quote/order workflow in the POC.

## Presentation content

If you need deck material for this project, see:

- `ECP_PPT_Content.md`