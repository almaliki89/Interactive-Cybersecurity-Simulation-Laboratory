# OMEGA MAX - Firestore Security Specification

## 1. Data Invariants
- Users can only read and write their own profile and progress.
- Telemetry logs are write-only for authenticated users (append only).
- Immutable fields like `uid` and `createdAt` must never change.
- `language` must be either 'ar' or 'en'.

## 2. The "Dirty Dozen" Payloads (Unauthorized)
1. **Identity Spoofing**: Attempt to write a profile for another UID.
2. **Progress Theft**: Attempt to read another user's `completedChallenges`.
3. **Ghost Field Injection**: Adding `isAdmin: true` to a profile.
4. **ID Poisoning**: Using a 2KB string as a `uid`.
5. **PII Blanket Leak**: Attempting to list all users.
6. **State Skipping**: Manually setting `completedLessons` to include everything without verification.
7. **Telemetry Modification**: Attempting to update or delete a telemetry log.
8. **Invalid Language**: Setting `language: "fr"`.
9. **Timestamp Forgery**: Manually setting `createdAt` to a past date instead of `request.time`.
10. **Resource Exhaustion**: Sending a 2MB telemetry detail object.
11. **Orphaned Progress**: Creating progress for a non-existent user.
12. **Unverified Auth**: Attempting to write without `email_verified == true`.

## 3. Test Runner (Draft)
I will verify these in the rules logic using `isValidUserProfile` and `isValidUserProgress` helpers.
