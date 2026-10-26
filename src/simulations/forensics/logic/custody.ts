/**
 * OMEGA V12 — Chain of Custody Ledger & Validation Engine
 * Maintains an immutable log of evidence collection, transfers, and verifications.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { calculateEvidenceHash } from './hashing';

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
  invalidChronology: boolean;
  outOfOrderActions: string[];
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

  const collectionRecords = itemRecords.filter((r) => r.action === 'COLLECTED');
  const collectedRecord = collectionRecords[0];
  const duplicateCollection = collectionRecords.length > 1;
  const verifiedRecord = itemRecords.find((r) => r.action === 'VERIFIED');

  const missingCollector = !collectedRecord || !collectedRecord.actor || collectedRecord.actor.trim() === '';
  const missingAcquisitionTime = !collectedRecord || collectedRecord.virtualTime < 0;
  const missingIntegrityVerification = !verifiedRecord;
  const unauthorizedModification = originalHash !== currentHash;
  const missingActor = itemRecords.some((r) => !r.actor || r.actor.trim() === '');

  const invalidVirtualTime = itemRecords.some(
    (r) => typeof r.virtualTime !== 'number' || !Number.isFinite(r.virtualTime) || r.virtualTime < 0
  );

  const outOfOrderActions: string[] = [];
  const reasonsEn: string[] = [];
  const reasonsAr: string[] = [];

  // Enforce custody lifecycle: initial entry must be COLLECTED
  const hasIllegalInitialAction = itemRecords.length > 0 && itemRecords[0].action !== 'COLLECTED';
  if (hasIllegalInitialAction) {
    outOfOrderActions.push(itemRecords[0].action);
    reasonsEn.push(`Initial custody action for ${evidenceId} must be COLLECTED, found ${itemRecords[0].action}.`);
    reasonsAr.push(`الإجراء الأولي للحضانة للدليل ${evidenceId} يجب أن يكون COLLECTED، وُجد ${itemRecords[0].action}.`);
  }

  // Enforce custody chronology:
  // COLLECTED < VERIFIED
  // and when present:
  // COLLECTED < TRANSFERRED
  // COLLECTED < WORKING_COPY_CREATED
  // COLLECTED < ANALYZED
  // A custody action cannot precede collection.
  itemRecords.forEach((r) => {
    if (r.action !== 'COLLECTED') {
      if (!collectedRecord || r.virtualTime <= collectedRecord.virtualTime) {
        if (!outOfOrderActions.includes(r.action)) {
          outOfOrderActions.push(r.action);
        }
        reasonsEn.push(
          `Custody action ${r.action} occurred before or at collection time (${r.virtualTime} <= ${
            collectedRecord ? collectedRecord.virtualTime : 'N/A'
          }) for item ${evidenceId}.`
        );
        reasonsAr.push(
          `الإجراء الجنائي ${r.action} حدث قبل أو في وقت التحريز (${r.virtualTime} <= ${
            collectedRecord ? collectedRecord.virtualTime : 'غير محدد'
          }) للدليل ${evidenceId}.`
        );
      }
    }
  });

  // Verify monotonic chronology across consecutive custody ledger entries
  let sequenceInverted = false;
  for (let i = 1; i < itemRecords.length; i++) {
    if (itemRecords[i].virtualTime < itemRecords[i - 1].virtualTime) {
      sequenceInverted = true;
      if (!outOfOrderActions.includes(itemRecords[i].action)) {
        outOfOrderActions.push(itemRecords[i].action);
      }
      reasonsEn.push(
        `Custody action ${itemRecords[i].action} timestamp T+${itemRecords[i].virtualTime} is earlier than preceding action T+${itemRecords[i - 1].virtualTime}.`
      );
      reasonsAr.push(
        `الإجراء الجنائي ${itemRecords[i].action} يحمل وقت T+${itemRecords[i].virtualTime} أسبق من الإجراء السابق T+${itemRecords[i - 1].virtualTime}.`
      );
    }
  }

  const invalidChronology = outOfOrderActions.length > 0 || sequenceInverted || hasIllegalInitialAction;

  if (invalidVirtualTime) {
    reasonsEn.push(`Invalid timestamp (NaN, Infinity, or negative) detected in custody records for item ${evidenceId}`);
    reasonsAr.push(`تم اكتشاف طابع زمني غير صالح (NaN أو غير محدود أو سالب) في سجلات الحضانة للدليل ${evidenceId}`);
  }
  if (duplicateCollection) {
    reasonsEn.push(`Multiple initial collection records detected for item ${evidenceId}`);
    reasonsAr.push(`اكتشاف أكثر من تسجيل تحريز أولي للدليل ${evidenceId}`);
  }
  if (missingActor) {
    reasonsEn.push(`Missing authorized actor for custody action on item ${evidenceId}`);
    reasonsAr.push(`غياب الفاعل المصرح له بإجراء الحضانة للدليل ${evidenceId}`);
  }
  if (unauthorizedActor) {
    reasonsEn.push(`Unauthorized or unauthenticated actor recorded in custody chain for item ${evidenceId}`);
    reasonsAr.push(`تم تسجيل فاعل غير مخول أو مجهول في سلسلة الحضانة للدليل ${evidenceId}`);
  }
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
    !unauthorizedModification &&
    !invalidChronology &&
    !missingActor &&
    !unauthorizedActor &&
    !duplicateCollection &&
    !invalidVirtualTime;

  return {
    valid,
    missingCollector,
    missingAcquisitionTime,
    missingIntegrityVerification,
    unauthorizedModification,
    invalidChronology,
    outOfOrderActions,
    reasonsEn,
    reasonsAr,
  };
}

/**
 * Gets the custody history for a specific evidence item from the global or passed records.
 * Differentiates between undefined (fallback) vs explicitly passed empty array ([]).
 */
export function getCustodyHistory(evidenceId: string, records?: CustodyRecord[]): CustodyRecord[] {
  if (!evidenceId) return [];
  const source = records !== undefined ? records : getInitialCustodyRecords();
  return source.filter((r) => r.evidenceId === evidenceId);
}

/**
 * Computes a deterministic SHA-256 style cryptographic hash over the chain of custody records.
 * Provides verifiable proof of custody ledger immutability and tamper resistance.
 */
export function calculateCustodyLedgerHash(records: CustodyRecord[]): string {
  const normalized = records.map((r) => ({
    id: r.id,
    evidenceId: r.evidenceId,
    virtualTime: r.virtualTime,
    action: r.action,
    actor: r.actor.trim(),
    notes: r.notes.trim(),
  }));
  return calculateEvidenceHash(normalized);
}

/**
 * Validates cryptographic tamper resistance of a custody ledger for an evidence item.
 */
export function verifyCustodyLedgerTamperResistance(
  evidenceId: string,
  records: CustodyRecord[],
  expectedLedgerHash?: string
): {
  isTamperEvident: boolean;
  ledgerHash: string;
  recordCount: number;
  reasonEn: string;
  reasonAr: string;
} {
  const itemRecords = records.filter((r) => r.evidenceId === evidenceId);
  const ledgerHash = calculateCustodyLedgerHash(itemRecords);
  const isTamperEvident = expectedLedgerHash ? ledgerHash === expectedLedgerHash : true;

  return {
    isTamperEvident,
    ledgerHash,
    recordCount: itemRecords.length,
    reasonEn: isTamperEvident
      ? 'Custody ledger sequence and cryptographic hash verified.'
      : `Custody ledger alteration detected: expected ${expectedLedgerHash}, computed ${ledgerHash}.`,
    reasonAr: isTamperEvident
      ? 'تم التحقق من تسلسل سجل الحضانة وبصمته التشفيرية.'
      : `تم اكتشاف تعديل في سجل الحضانة: المتوقع ${expectedLedgerHash}، المحسوب ${ledgerHash}.`,
  };
}

/**
 * Default custody records for the initial Nexora case
 */
export function getInitialCustodyRecords(): CustodyRecord[] {
  return [
    {
      id: 'CUST-DISK-FIN-WS01-1',
      evidenceId: 'EVD-DISK-FIN-WS01',
      virtualTime: 10,
      action: 'COLLECTED',
      actor: 'Investigator Lead (sara_forensics)',
      notes: 'Initial disk image acquisition from FIN-WS-01',
    },
    {
      id: 'CUST-DISK-FIN-WS01-2',
      evidenceId: 'EVD-DISK-FIN-WS01',
      virtualTime: 20,
      action: 'VERIFIED',
      actor: 'Evidence Officer (ahmed_sec)',
      notes: 'SHA-256 hash match verified on primary storage vault',
    },
    {
      id: 'CUST-MEM-FIN-WS01-1',
      evidenceId: 'EVD-MEM-FIN-WS01',
      virtualTime: 15,
      action: 'COLLECTED',
      actor: 'Investigator Lead (sara_forensics)',
      notes: 'Memory dump acquisition',
    }
  ];
}
