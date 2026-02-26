# Specification

## Summary
**Goal:** Require username and password authentication before a student response can be deleted in ResponseViewer.

**Planned changes:**
- When the delete button is clicked on a response in ResponseViewer, open the existing AuthModal to collect username and password credentials.
- Only proceed with the deletion if the provided credentials are valid; otherwise show an error message and cancel the deletion.

**User-visible outcome:** Users must successfully enter a valid username and password in an authentication modal before any student response is deleted. Deletion without authentication is no longer possible.
