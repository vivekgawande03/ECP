# Saved Orders and Loaded Quote UX

## Prompt

Add a dedicated **Saved Orders** page and update the configurator behavior when a saved quote is reopened.

Important rule:

- a quote with `productionCommitment` should be treated as a saved order

### Part A - Saved Orders page

Create a `/saved-orders` page that:

1. lists only quotes that already have a production commitment
2. shows order details such as:
   - order or quote reference
   - saved timestamp
   - committed timestamp
   - model
   - market
   - dealer
   - total value
3. includes a button or link to open the selected order in `/order-summary`
4. applies the selected saved quote into configurator state before opening the order summary
5. includes empty, loading, and error states

### Part B - Loaded saved quote behavior in the configurator

When a user opens a previously saved quote, the review step should not behave like a new configuration flow.

Requirements:

- add explicit store state to detect when the current build came from a loaded saved quote
- hide `Save quote` and `Load latest quote` on the review step for loaded saved quotes
- hide the `Ready to proceed` helper text for loaded saved quotes
- replace the final `Complete configuration` action with `View order summary` for loaded saved quotes
- keep normal behavior for newly created in-session quotes
- if the user edits the loaded configuration, reset the special saved-quote state so the flow becomes normal again