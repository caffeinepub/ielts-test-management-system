# Specification

## Summary
**Goal:** Restore test creation functionality to its previous working state.

**Planned changes:**
- Revert recent changes that broke the test creation flow in CreateTestPanel and useTestForm
- Fix CreateTest mutation to properly handle authentication and backend requests
- Ensure QuestionBuilder component correctly processes all question types and media uploads

**User-visible outcome:** Users can successfully create tests with all question types, add media, and save tests without errors.
