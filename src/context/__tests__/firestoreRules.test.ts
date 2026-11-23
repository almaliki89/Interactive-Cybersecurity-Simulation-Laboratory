import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const firestoreRules = readFileSync(
  new URL('../../../firestore.rules', import.meta.url),
  'utf8'
);

describe('Firestore security policy contract', () => {
  it('keeps the default-deny rule in place', () => {
    expect(firestoreRules).toMatch(/match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
  });

  it('allows progress reads only to the verified owner and blocks all browser writes', () => {
    expect(firestoreRules).toMatch(
      /match \/users\/\{uid\}\/progress\/current \{\s*allow get: if isOwner\(uid\);\s*allow create, update, delete: if false;/
    );
  });

  it('limits profile writes to the verified owner and the declared schema', () => {
    expect(firestoreRules).toMatch(/allow create: if isOwner\(uid\) &&\s*isValidUserProfile\(request\.resource\.data\)/);
    expect(firestoreRules).toMatch(/allow update: if isOwner\(uid\) &&\s*isValidUserProfile\(request\.resource\.data\)/);
    expect(firestoreRules).toMatch(/data\.keys\(\)\.hasOnly\(\[/);
  });

  it('keeps telemetry append-only and rejects unbounded top-level detail maps', () => {
    expect(firestoreRules).toMatch(/data\.details is map && data\.details\.size\(\) <= 20/);
    expect(firestoreRules).toMatch(/allow create: if isVerified\(\) && isValidTelemetry\(request\.resource\.data\)/);
    expect(firestoreRules).toMatch(/allow get, list, update, delete: if false/);
  });
});
