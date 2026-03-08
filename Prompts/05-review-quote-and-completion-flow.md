# Review, Quote, and Completion Flow

## Prompt

Update the review and completion flow so it supports a more realistic quote workflow.

For the review step:

1. Add a **Quote workflow** section.
2. Add actions to:
   - save the current quote
   - load the latest saved quote
3. When a quote is active, show:
   - quote id
   - saved timestamp
   - quoted total
4. If the build has not been saved yet, show a clear empty state.

For final completion:

- Completing the build should save or create a quote if needed.
- The completion screen should show the quote id and version details.
- Include actions such as:
  - Place Order / View Order Summary
  - Start New Configuration

State handling:

- keep track of the active quote id in the Zustand store
- persist enough state to survive refresh and route changes
- support loading a saved quote back into the configurator