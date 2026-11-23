# Firestore Security and Trust-Boundary Specification

## 1. Trust boundary

The React application is a client-side SPA. Browser state, local storage, simulation validators, and client-generated completion events are under the user's control. They are useful for learning-flow integrity and accidental-corruption resistance, but they are not cryptographic proof of achievement.

The current repository does not contain a server-authoritative challenge evaluator. Therefore, client-side lesson or challenge completion must not be represented as an accredited certificate, compliance attestation, or tamper-proof result.

## 2. User profiles

- A verified Firebase user may read only their own `users/{uid}` document.
- Profile creation and updates are owner-only and require a verified account.
- The document UID must equal the authenticated UID.
- Only the explicitly allowed profile fields are accepted.
- The creation timestamp is fixed to `request.time`; the creation timestamp and UID cannot be changed later.
- A supplied email must match the verified Firebase token email.
- Collection listing is denied by default.

## 3. Learning progress

- A verified owner may read their own `users/{uid}/progress/current` document.
- Browser clients are denied create, update, and delete access to progress documents.
- The browser listens for progress supplied by a trusted backend, but does not upload local progress or client-asserted completion results.
- Older progress snapshots are sanitized before they are applied to the UI: lesson/challenge identifiers are allowlisted, lesson ordering is checked, completion requires explicit quiz and task pass flags, and guided onboarding requires both expected activities.
- Sanitization protects display state only. It does not make an existing client-created record authoritative.
- A future trusted evaluator must validate server-side evidence and write progress using a narrowly scoped service identity / Firebase Admin SDK. Admin SDK writes bypass Firestore Security Rules and must be protected by backend authorization and validation.

## 4. Telemetry

- Only verified users may append telemetry records.
- Telemetry is write-only from clients; reads, updates, and deletes are denied.
- The accepted record has a fixed field allowlist, bounded non-empty `simulationId` and `action` strings, a server timestamp equal to `request.time`, and an optional `details` map capped at 20 top-level fields.
- Do not place passwords, OAuth tokens, session cookies, private keys, or unnecessary personal data in telemetry details.

## 5. Operational requirements

- Deploy `firestore.rules` to the exact Firebase project/database used by the application. A repository change does not deploy rules automatically.
- Restrict the Firebase web API key in Google Cloud to the required Firebase APIs and approved application referrers. Firebase web configuration is public client configuration, not an authorization boundary.
- Enable Firebase App Check for supported services and configure production enforcement after validating the application.
- For authoritative grading, add a server-side evaluator and issue certificates only from server-verified records.
- Add Firebase Emulator Suite integration tests before expanding the Firestore write surface.

## 6. Verification status

The repository's Vitest tests include static contract checks for the Firestore policy and unit tests for cloud-progress sanitization. These are regression guards, not substitutes for running the Firebase Emulator Suite against the deployed rules.
