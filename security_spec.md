# Security Spec: SignalForge AI

## Data Invariants
1. A Project must have a valid `userId` matching the authenticated user.
2. A ContentPiece must belong to a valid Project and have a `projectId` that matches an existing Project owned by the user.
3. UserProfile must be restricted to the owner (the user whose UID matches the document ID).
4. `createdAt` must be the server timestamp and immutable.
5. `status` transitions are restricted (not fully enforced in MVP but logic is there).

## The Dirty Dozen Payloads
1. Create project with someone else's `userId`.
2. Update project `userId` to take ownership of someone else's project.
3. Access content piece of a project not owned by you.
4. Create user profile for another UID.
5. Update `createdAt` of an existing project.
6. Inject 1MB string into project name.
7. List all projects in the system (blanket read).
8. Create content piece without a valid project.
9. Delete another user's project.
10. Update a project status to a terminal state from an invalid current state.
11. Inject non-enum value into `platform` in ContentPiece.
12. Create a Project with a giant name (> 500 chars).

## Test Runner (Conceptual)
All the above must return PERMISSION_DENIED.
