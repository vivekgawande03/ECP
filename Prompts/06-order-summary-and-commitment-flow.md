# Order Summary and Commitment Flow

## Prompt

Add an order summary page that treats a committed quote as the current order.

The page should turn a saved quote into a production commitment view.

Requirements:

1. Create an `/order-summary` route.
2. Load the active quote from persisted configurator state and/or the quote API.
3. If there is no saved build, show a clear empty state with a link back to the configurator.
4. Show the build in an order-style layout, including:
   - order reference
   - order SKU
   - market and dealer
   - selected vehicle specs
   - selected options and packages
   - price breakdown
   - production stages or timeline
5. Add a **production commitment** action that commits the quote.

After commitment:

- treat the quote as a committed order in the POC
- show a confirmation state
- hide the rest of the order summary page once confirmation is shown
- show a centered confirmation card with:
  - order reference
  - SKU
  - committed timestamp
  - market and dealer
  - order summary
  - total value
  - next milestone
- add a **Back to configurator** button on the confirmation card