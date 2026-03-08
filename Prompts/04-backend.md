# Backend

## Prompt

Move the main configuration evaluation logic to a backend service layer and expose it through tRPC.

Goals:

- make pricing and rule evaluation feel server-backed
- prepare the app for quote persistence
- keep the setup simple enough for a POC

Requirements:

1. Add a `configuration` router with an evaluation query that takes the current configuration and returns:
   - normalized configuration
   - price breakdown
   - warnings
   - rule notes
   - configuration, catalog, rule, and pricing versions
2. Add a `quote` router with these procedures:
   - `create`
   - `list`
   - `getById`
   - `getLatest`
   - `commit`
3. Make sure quote creation runs backend evaluation before saving.
4. Generate a clear quote ID format.
5. Save quote metadata including:
   - quote id
   - saved timestamp
   - market
   - dealer
   - saved configuration
   - evaluated price
   - version metadata
   - production commitment when present

Persistence details:

- use a repository abstraction for quotes
- keep the implementation easy to swap if the demo storage changes later
- serialize dates safely for the client

Architecture notes:

- validation and pricing should no longer feel purely client-side
- the client should use tRPC hooks for quote operations
- keep the design open for a fuller order workflow later