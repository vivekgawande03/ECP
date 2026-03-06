# 2-Day POC Enhancement Plan

## Goal
Improve the current car configurator proof of concept so it presents as a more realistic **enterprise sales configuration experience** within 2 days.

## POC Theme
Focus on **demo impact** over deep backend architecture.

We want the POC to clearly demonstrate:
- market-aware behavior
- dealer-aware behavior
- rule-based validation and auto-adjustment
- saveable quote workflow
- a stronger final review / presentation screen

## In Scope

### 1. Market + Dealer Context
- [ ] Add market selector (example: US, California, EU)
- [ ] Add dealer selector (example: Premium Dealer, Discount Dealer, EV Dealer)
- [ ] Store selected market and dealer in app state
- [ ] Reflect market/dealer in summary and review screens

### 2. Demo Rules
- [ ] California excludes Diesel engine
- [ ] Electric engine excludes Tow Package
- [ ] Base trim excludes Red Interior
- [ ] EV Dealer gives a sample EV incentive / discount
- [ ] Premium Dealer gives a sample luxury incentive or package discount

### 3. Rule Explanation / Notification UI
- [ ] Show why an option is disabled
- [ ] Show notification when an invalid selection is auto-removed
- [ ] Show rule explanation examples in a dedicated panel or message area

### 4. Quote Workflow
- [ ] Add Save Quote action
- [ ] Generate a quote ID
- [ ] Save quote in localStorage
- [ ] Load last saved quote
- [ ] Include quote metadata: market, dealer, selected configuration, total price

### 5. Enhanced Review Screen
- [ ] Show quote ID
- [ ] Show market and dealer
- [ ] Show rule notes / important adjustments
- [ ] Show polished price breakdown
- [ ] Make the final screen presentation-friendly

### 6. Persistence / Polish
- [ ] Persist current working configuration in localStorage
- [ ] Restore configuration on refresh
- [ ] Improve final demo flow for presentation

## Out of Scope for This 2-Day POC
- real database persistence
- full backend rule engine
- authentication / roles
- order workflow
- manufacturing planning integration
- full compliance engine
- production-grade infrastructure

## Suggested Timeline

### Day 1 - Business Realism
- [ ] Add market selector
- [ ] Add dealer selector
- [ ] Implement core demo rules
- [ ] Add rule explanation / warnings UI

### Day 2 - Demo Polish
- [ ] Add Save Quote
- [ ] Add Load Quote / restore flow
- [ ] Add quote ID
- [ ] Enhance review / summary screen
- [ ] Add local persistence
- [ ] Rehearse end-to-end demo story

## Demo Story
Use this flow during the presentation:

1. Start in US market
2. Select a diesel-compatible path
3. Switch to California
4. Show Diesel becomes unavailable with explanation
5. Select Electric engine
6. Try to add Tow Package
7. Show Tow Package is excluded with explanation
8. Finish configuration
9. Save quote
10. Present quote ID and final review screen

## Success Criteria
- [ ] Audience can clearly see market-specific behavior
- [ ] Audience can clearly see dealer-specific pricing or incentives
- [ ] Audience can understand why invalid combinations are blocked or auto-adjusted
- [ ] Audience sees a complete business flow from configuration to saved quote
- [ ] Final screen looks polished enough for a stakeholder demo

## Priority Order
1. Market + Dealer Context
2. Rule Explanation UI
3. Save Quote
4. Enhanced Review Screen
5. Local Persistence

## Notes
- Keep implementation simple and deterministic
- Prefer localStorage over real backend persistence for the demo
- Optimize for clarity during presentation, not architectural completeness
- Every change should make the demo feel more like an enterprise sales tool