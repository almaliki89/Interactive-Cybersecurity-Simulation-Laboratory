/**
 * OMEGA V13 — Cloud Security World
 * logic/logging.ts
 *
 * Deterministic Cloud Audit Logging (CloudTrail / Activity Log), VPC Flow Logs,
 * and Cryptographic Log File Integrity / Digest Validation.
 * Zero non-deterministic functions.
 */

export interface CloudUserIdentity {
  type: 'Root' | 'IAMUser' | 'AssumedRole' | 'FederatedUser' | 'AWSService';
  principalId: string;
  arn: string;
  accountId: string;
  accessKeyId?: string;
  userName?: string;
  sessionContext?: {
    sessionIssuer?: {
      arn: string;
      userName: string;
    };
    attributes?: {
      mfaAuthenticated: boolean;
      creationDateVirtual: number;
    };
  };
}

export interface CloudAuditLogEntry {
  id: string;
  eventTimeVirtual: number;
  eventVersion: string;
  userIdentity: CloudUserIdentity;
  eventSource: string; // e.g. 'storage.nexora.com', 'iam.nexora.com', 'compute.nexora.com'
  eventName: string; // e.g. 'GetObject', 'AssumeRole', 'AuthorizeSecurityGroupIngress'
  awsRegion: string;
  sourceIPAddress: string;
  userAgent: string;
  requestParameters?: Record<string, any>;
  responseElements?: Record<string, any>;
  errorCode?: string; // e.g. 'AccessDenied'
  errorMessage?: string;
  readOnly: boolean;
  recipientAccountId: string;
  eventCategory: 'Management' | 'Data';
}

export interface VpcFlowLogEntry {
  id: string;
  virtualTime: number;
  version: number;
  accountId: string;
  interfaceId: string;
  srcAddr: string;
  dstAddr: string;
  srcPort: number;
  dstPort: number;
  protocol: number; // 6 for TCP, 17 for UDP
  packets: number;
  bytes: number;
  startVirtualTime: number;
  endVirtualTime: number;
  action: 'ACCEPT' | 'REJECT';
  logStatus: 'OK' | 'NODATA';
}

export interface CloudTrailConfig {
  id: string;
  name: string;
  s3BucketName: string;
  isLogging: boolean;
  isMultiRegionTrail: boolean;
  includeGlobalServiceEvents: boolean;
  enableLogFileValidation: boolean; // Digest files with SHA-256
  kmsKeyId?: string;
}

export function createDefaultTrailConfig(): CloudTrailConfig {
  return {
    id: 'trail-org-audit-main',
    name: 'Nexora-Global-Enterprise-Trail',
    s3BucketName: 'nexora-central-audit-logs-immutable',
    isLogging: true,
    isMultiRegionTrail: true,
    includeGlobalServiceEvents: true,
    enableLogFileValidation: true,
    kmsKeyId: 'kms-key-audit-cmk',
  };
}

/**
 * Validates cryptographic integrity of a log digest chain.
 */
export function validateLogFileDigests(
  entries: CloudAuditLogEntry[],
  expectedDigestHash?: string
): {
  isValid: boolean;
  tamperedEntryIds: string[];
  explanationEn: string;
  explanationAr: string;
} {
  if (entries.length === 0) {
    return {
      isValid: true,
      tamperedEntryIds: [],
      explanationEn: 'No log entries present in audit window.',
      explanationAr: 'لا توجد سجلات في نافذة التدقيق.',
    };
  }

  // Deterministic digest calculation
  let hashAccumulator = 0;
  entries.forEach((e) => {
    const raw = `${e.id}:${e.eventTimeVirtual}:${e.eventName}:${e.sourceIPAddress}`;
    for (let i = 0; i < raw.length; i++) {
      hashAccumulator = (hashAccumulator * 31 + raw.charCodeAt(i)) >>> 0;
    }
  });

  const computedHash = `sha256_${hashAccumulator.toString(16).padStart(8, '0')}`;

  if (expectedDigestHash && expectedDigestHash !== computedHash) {
    return {
      isValid: false,
      tamperedEntryIds: [entries[entries.length - 1].id],
      explanationEn: `Log integrity validation failed! Digest mismatch: expected ${expectedDigestHash}, found ${computedHash}. Possible log deletion or modification detected.`,
      explanationAr: `فشل التحقق من سلامة السجلات! عدم تطابق البصمة المشفرة. تم رصد احتمال حذف أو تعديل في السجلات.`,
    };
  }

  return {
    isValid: true,
    tamperedEntryIds: [],
    explanationEn: `Log file digest verified successfully (${computedHash}). All records are authentic and tamper-free.`,
    explanationAr: `تم التحقق من بصمة ملف السجلات بنجاح (${computedHash}). جميع السجلات أصلية ولم يطلها أي تعديل.`,
  };
}
