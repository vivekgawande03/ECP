# Market, Dealer, Rules, and Explanations

## Prompt

Update the configurator so it shows market-specific and dealer-specific behavior.

Add market and dealer context to the app state and show that context throughout the flow.

Requirements:

1. Add market options such as:
   - US
   - California
   - EU
2. Add dealer options such as:
   - Premium Dealer
   - Discount Dealer
   - EV Dealer
3. Save the selected market and dealer with the working configuration.
4. Show the selected market and dealer in the summary and review screens.

Add business rules such as:

- California does not allow Diesel
- Electric excludes Tow Package
- Base trim excludes Red Interior
- EV Dealer applies a sample EV incentive
- Premium Dealer applies a premium package or discount rule

Rule behavior:

- Disabled options should clearly look unavailable.
- If an upstream change makes a downstream choice invalid, remove it automatically.
- Record warnings and rule notes so the user can see what changed.
- Add a rule explanation or notification area that explains the reason.

Pricing behavior:

- pricing should react to the selected market and dealer
- dealer incentives should be reflected in the total
- warnings and notes should match the actual configuration changes
