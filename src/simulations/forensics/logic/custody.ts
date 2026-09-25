/**
 * OMEGA V12 — Chain of Custody Ledger & Validation Engine
 * Maintains an immutable log of evidence collection, transfers, and verifications.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface CustodyRecord {
  id: string;
  evidenceId: string;
  virtualTime: number;

  action:
    | 'COLLECTED'
    | 'TRANSFERRED'
    | 'VERIFIED'
    | 'WORKING_COPY_CREATED'
    | 'ANALYZED';

  actor: string;
  notes: string;
}

export interface CustodyValidationResult {
  valid: boolean;
  missingCollector: boolean;
  missingAcquisitionTime: boolean;
  missingIntegrityVerification: boolean;
  unauthorizedModification: boolean;
  reasonsEn: string[];
  reasonsAr: string[];
}

/**
 * Adds a new custody record to the chain
 */
export function addCustodyRecord(
  records: CustodyRecord[],
  newRecord: Omit<CustodyRecord, 'id'>
): CustodyRecord[] {
  const id = `CUST-${newRecord.evidenceId}-${records.length + 1}`;
  return [...records, { ...newRecord, id }];
}

/**
 * Validates chain of custody completeness and integrity for a given evidence item
 */
export function validateCustodyChain(
  evidenceId: string,
  records: CustodyRecord[],
  originalHash: string,
  currentHash: string
): CustodyValidationResult {
  const itemRecords = records.filter((r) => r.evidenceId === evidenceId);

  const collectedRecord = itemRecords.find((r) => r.action === 'COLLECTED');
  const verifiedRecord = itemRecords.find((r) => r.action === 'VERIFIED');

  const missingCollector = !collectedRecord || !collectedRecord.actor || collectedRecord.actor.trim() === '';
  const missingAcquisitionTime = !collectedRecord || collectedRecord.virtualTime < 0;
  const missingIntegrityVerification = !verifiedRecord;
  const unauthorizedModification = originalHash !== currentHash;

  const reasonsEn: string[] = [];
  const reasonsAr: string[] = [];

  if (missingCollector) {
    reasonsEn.push(`Missing designated evidence collector for item ${evidenceId}`);
    reasonsAr.push(`عدم تحديد المجمع المسؤول عن الدليل ${evidenceId}`);
  }
  if (missingAcquisitionTime) {
    reasonsEn.push(`Missing acquisition timestamp for item ${evidenceId}`);
    reasonsAr.push(`غياب وقت الاستحواذ الموثق للدليل ${evidenceId}`);
  }
  if (missingIntegrityVerification) {
    reasonsEn.push(`Missing documented hash integrity verification step for item ${evidenceId}`);
    reasonsAr.push(`عدم وجود توثيق لعملية التحقق من السلامة والتجزئة للدليل ${evidenceId}`);
  }
  if (unauthorizedModification) {
    reasonsEn.push(`Hash mismatch detected on item ${evidenceId} (Evidence modified after acquisition)`);
    reasonsAr.push(`اكتشاف تباين في التجزئة للدليل ${evidenceId} (تم تعديل الدليل بعد الاستحواذ)`);
  }

  const valid =
    !missingCollector &&
    !missingAcquisitionTime &&
    !missingIntegrityVerification &&
    !unauthorizedModification;

  return {
    valid,
    missingCollector,
    missingAcquisitionTime,
    missingIntegrityVerification,
    unauthorizedModification,
    reasonsEn,
    reasonsAr,
  };
}
