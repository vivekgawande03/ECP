# Testing and Validation

## Prompt

For each meaningful feature added to the ECP, validate the work before marking it done.

Validation steps:

1. Run IDE diagnostics on the files that were changed.
2. Run `npm run typecheck`.
3. Run `npm run lint`.
4. When the logic is testable and there is a relevant test target, add or update Jest tests.
5. Use the smallest test scope that still proves the change.
6. Summarize the validation results clearly.

Testing guidance:

- focus tests on business behavior and UI state changes
- cover quote flow, store transitions, and rule behavior when practical
- avoid over-testing styling details
- prefer stable and deterministic assertions

Definition of done:

- implementation is complete
- no TypeScript errors
- no lint errors
- relevant tests are updated or confirmed when needed
- the final behavior is explained clearly
