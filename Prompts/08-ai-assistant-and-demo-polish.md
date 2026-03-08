# AI Assistant and Demo Polish

## Prompt

Add a lightweight in-app AI assistant panel and improve the overall demo experience.

Assistant requirements:

1. Add a floating assistant button.
2. Open a chat-style side or floating panel.
3. Provide suggested prompts such as:
   - summarize my current build
   - why are there warnings?
   - make it more sporty
   - help me lower the price
4. Use deterministic, preset-based recommendation logic instead of a real LLM.
5. The assistant should use live configurator context:
   - current configuration
   - current step
   - warnings
   - rule notes
   - price
6. Allow recommendations to apply a new core build and move the user to the right step.