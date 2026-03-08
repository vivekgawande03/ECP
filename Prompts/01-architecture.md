# Foundation and Architecture

## Prompt

Build a proof-of-concept called **Enterprise Car Configuration Platform (ECP)** using **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Zustand**, and **tRPC**.

The app should look like a real automotive sales configurator. Use a dark UI, a clean layout, and modular React components.

Main requirements:

1. Create a root page that shows the configurator as the main experience.
2. Use a split layout with:
   - a vehicle preview area
   - a main wizard area for steps and supporting panels
3. Define the main data model for:
   - markets
   - dealers
   - models
   - engines
   - transmissions
   - trims
   - exterior options
   - interior options
   - wheels
   - packages
   - price breakdown
   - warnings
   - rule notes
   - saved quotes
4. Keep the main configuration state in a Zustand store.
5. Reset downstream selections when an upstream choice changes.
6. Keep each configurator step in its own component.
7. Add reusable UI pieces like cards, buttons, grids, and summary blocks.
8. Use mock data that is simple, consistent, and good enough for a demo.

Project structure:

- Use App Router files under `app/`.
- Put configurator components under `src/components/configurator/`.
- Put mock data and helper logic under `src/lib/configurator/`.
- Put API routers under `src/server/api/routers/`.
- Put the global store in `src/store/configuration-store.ts`.
