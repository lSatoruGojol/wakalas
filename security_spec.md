# Security Specification - Statix Prime

## 1. Data Invariants
- A `User` document must have a `userId` that matches the document ID and the `request.auth.uid`.
- A `SolverReport` must belong to the user who created it (`userId` field must match `request.auth.uid`).
- Timestamps must be server-generated (`request.time`).
- String sizes must be constrained to prevent abuse.

## 2. The "Dirty Dozen" Payloads

| ID | Collection | Action | Payload | Expected Result |
|----|------------|--------|---------|-----------------|
| 1 | `users` | Create | `{ userId: 'other_user', email: 'attacker@evil.com' }` | `DENIED` (Identity Spoofing) |
| 2 | `users` | Update | `{ email: 'new@email.com' }` | `DENIED` (Key updates not whitelisted) |
| 3 | `users` | Create | `{ userId: 'me', email: 'me@me.com', longField: 'A' * 1000000 }` | `DENIED` (Size limit) |
| 4 | `reports` | Create | `{ userId: 'other', tension: 100 }` | `DENIED` (Identity Spoofing) |
| 5 | `reports` | Update | `{ tension: 0 }` | `DENIED` (Reports are immutable) |
| 6 | `reports` | Create | `{ reportId: '123', userId: 'me', tension: 'NaN' }` | `DENIED` (Type Safety) |
| 7 | `users` | Delete | `ANY` | `DENIED` (Users cannot delete profiles via client) |
| 8 | `reports` | List | `ANY` | `DENIED` (List without UID filter) |
| 9 | `users` | Create | `{ userId: 'me', email: 'me@me.com', email_verified: true }` | `DENIED` (Self-assigned verification) |
| 10| `reports` | Create | `{ ... }` without Auth | `DENIED` (Unauthenticated) |
| 11| `users` | Update | `{ hasSeenTutorial: true }` by another user | `DENIED` (Auth check) |
| 12| `reports` | Create | `{ reportId: '../hack', ... }` | `DENIED` (ID Poisoning) |

## 3. Test Runner
(Tests would be implemented in `firestore.rules.test.ts` if a test suite was requested, but I will focus on implementing the rules directly now.)
