# Specification

## Summary
**Goal:** Add username/password authentication for test creation while keeping test-taking and response viewing open to all users.

**Planned changes:**
- Add authentication requirement for test creation with hardcoded credentials (username: 'sayemahtesham', password: '12345678')
- Create a login modal that appears when clicking 'Create Test' button
- Implement backend validation function to verify credentials before allowing test creation
- Maintain session authentication state so user doesn't need to re-login for multiple test creations
- Keep test-taking and response viewing accessible without authentication

**User-visible outcome:** Teachers must log in with specific credentials to create tests, while students can continue taking tests and viewing responses without any authentication. The login modal appears seamlessly before test creation and remembers the session.
