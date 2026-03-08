# Core Configurator Step Flow

## Prompt

Implement a multi-step vehicle configurator flow for the ECP app.

The flow should include these steps in order:

1. Model
2. Engine
3. Transmission
4. Trim
5. Exterior
6. Interior
7. Wheels
8. Packages
9. Review

Requirements:

- Put each step in its own component.
- Build a step wizard with previous and next navigation.
- Show clear progress so the user knows where they are.
- Do not allow the user to continue if the current step is not valid.
- If the user changes an upstream choice, reset any incompatible downstream choices.
- Show option cards with a description, price impact, disabled state, and selected state.
- Keep the flow fast and predictable.
- Store the current step in Zustand so the flow can survive refresh and hydration.

For the review step:

- Show a full summary of the build.
- Show market, dealer, and the main vehicle selections.
- Show selected options and packages.
- Show the final price breakdown.

For the final action:

- Let the wizard trigger a completion action from the review step.
- Keep the flow flexible so the final button can later be used for:
  - saving a new quote
  - opening the order summary
  - resuming a saved quote or order flow
