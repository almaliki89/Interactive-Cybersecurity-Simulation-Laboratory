/**
 * OMEGA V13 — Cloud Security World
 * logic/storage.ts
 *
 * Deterministic Cloud Object Storage (S3 / Blob / Cloud Storage) model.
 * Models Buckets, Block Public Access (BPA), Bucket Policies, Encryption at Rest (KMS),
 * and object sensitivity.
 * Zero non-deterministic functions.
 */

import { CloudPolicy } from './policies';

export interface PublicAccessBlockConfig {
  blockPublicAcls: boolean;
  ignorePublicAcls: boolean;
  blockPublicPolicy: boolean;
  restrictPublicBuckets: boolean;
}

export interface CloudStorageObject {
  id: string;
  bucketName: string;
  key: string; // e.g. 'reports/Q3_Financial_Audit.xlsx'
  sizeBytes: number;
  sensitivityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  isEncrypted: boolean;
  kmsKeyId?: string;
  checksumSha256: string;
  contentPreview: string;
}

export interface CloudStorageBucket {
  id: string;
  name: string;
  accountId: string;
  region: string;
  arn: string; // ncrn:nexora:storage:::bucket-name
  publicAccessBlock: PublicAccessBlockConfig;
  bucketPolicy?: CloudPolicy;
  versioningEnabled: boolean;
  encryption: {
    enabled: boolean;
    kmsKeyId?: string;
    algorithm: 'AES256' | 'NEXORA_KMS';
    enforceTls: boolean;
  };
  objects: CloudStorageObject[];
  tags: Record<string, string>;
  isPubliclyExposed: boolean;
}

export function evaluateBucketPublicExposure(bucket: CloudStorageBucket): {
  isPublic: boolean;
  riskSeverity: 'CRITICAL' | 'SAFE';
  reasonsEn: string[];
  reasonsAr: string[];
} {
  const bpa = bucket.publicAccessBlock;
  const isBpaActive = bpa.blockPublicAcls && bpa.ignorePublicAcls && bpa.blockPublicPolicy && bpa.restrictPublicBuckets;

  const reasonsEn: string[] = [];
  const reasonsAr: string[] = [];

  if (isBpaActive) {
    return {
      isPublic: false,
      riskSeverity: 'SAFE',
      reasonsEn: ['Block Public Access (BPA) is fully enforced on all 4 controls. Public access impossible.'],
      reasonsAr: ['خاصية حظر الوصول العام (BPA) مفعلة بالكامل بجميع ضوابطها الأربعة. الوصول العام مستحيل.'],
    };
  }

  // Check if bucket policy contains wildcard principal
  let policyAllowsPublic = false;
  if (bucket.bucketPolicy) {
    bucket.bucketPolicy.statements.forEach((stmt) => {
      if (stmt.effect === 'ALLOW' && (stmt.resources.includes('*') || stmt.resources.includes(bucket.name) || stmt.resources.some((r) => r.includes(bucket.name)))) {
        // If blockPublicPolicy is false, this allows public
        if (!bpa.blockPublicPolicy) {
          policyAllowsPublic = true;
          reasonsEn.push(`Bucket policy statement '${stmt.id}' permits access and 'BlockPublicPolicy' is disabled.`);
          reasonsAr.push(`بند سياسة الحاوية '${stmt.id}' يسمح بالوصول وخيار 'حظر السياسات العامة' معطل.`);
        }
      }
    });
  }

  if (!bpa.blockPublicPolicy || !bpa.restrictPublicBuckets || policyAllowsPublic) {
    return {
      isPublic: true,
      riskSeverity: 'CRITICAL',
      reasonsEn: reasonsEn.length > 0 ? reasonsEn : ['One or more Block Public Access controls are disabled with open exposure.'],
      reasonsAr: reasonsAr.length > 0 ? reasonsAr : ['أحد ضوابط حظر الوصول العام معطل مما يتيح التعرض الخارجي.'],
    };
  }

  return {
    isPublic: false,
    riskSeverity: 'SAFE',
    reasonsEn: ['Bucket is private.'],
    reasonsAr: ['الحاوية خاصة ومحمية.'],
  };
}

export function createDefaultStorageBuckets(accountId = 'acc-prod-003'): CloudStorageBucket[] {
  const secureFinanceBucket: CloudStorageBucket = {
    id: 'bkt-nexora-finance-vault',
    name: 'nexora-finance-vault-prod',
    accountId,
    region: 'nx-east-1',
    arn: 'ncrn:nexora:storage:::nexora-finance-vault-prod',
    publicAccessBlock: {
      blockPublicAcls: true,
      ignorePublicAcls: true,
      blockPublicPolicy: true,
      restrictPublicBuckets: true,
    },
    versioningEnabled: true,
    encryption: {
      enabled: true,
      kmsKeyId: 'kms-key-finance-cmk',
      algorithm: 'NEXORA_KMS',
      enforceTls: true,
    },
    isPubliclyExposed: false,
    tags: { Classification: 'Restricted', Compliance: 'SOX' },
    objects: [
      {
        id: 'obj-fin-001',
        bucketName: 'nexora-finance-vault-prod',
        key: 'reports/Q3_Earnings_Ledger.xlsx',
        sizeBytes: 1542000,
        sensitivityLevel: 'RESTRICTED',
        isEncrypted: true,
        kmsKeyId: 'kms-key-finance-cmk',
        checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        contentPreview: 'Confidential Nexora Corp Q3 Financial Statements & Revenue Projections',
      },
      {
        id: 'obj-fin-002',
        bucketName: 'nexora-finance-vault-prod',
        key: 'audit/2026_Internal_Controls.pdf',
        sizeBytes: 4210000,
        sensitivityLevel: 'RESTRICTED',
        isEncrypted: true,
        kmsKeyId: 'kms-key-finance-cmk',
        checksumSha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        contentPreview: 'Internal Audit Assessment and Material Weakness Evaluation',
      },
    ],
  };

  const vulnerablePublicBucket: CloudStorageBucket = {
    id: 'bkt-nexora-customer-data-leaked',
    name: 'nexora-analytics-raw-bucket',
    accountId,
    region: 'nx-east-1',
    arn: 'ncrn:nexora:storage:::nexora-analytics-raw-bucket',
    publicAccessBlock: {
      blockPublicAcls: false,
      ignorePublicAcls: false,
      blockPublicPolicy: false,
      restrictPublicBuckets: false,
    },
    bucketPolicy: {
      id: 'pol-open-world-read',
      name: 'AllowPublicReadRawBucket',
      type: 'CUSTOMER_MANAGED',
      version: '2026-01-01',
      descriptionEn: 'CRITICAL FLAW: Grants anonymous public GET access to raw analytics records.',
      descriptionAr: 'ثغرة حرجة: يمنح وصول قراءة عام لجميع المستخدمين المجهولين.',
      statements: [
        {
          id: 'Stmt-Public-Get',
          effect: 'ALLOW',
          actions: ['storage:GetObject'],
          resources: ['nexora-analytics-raw-bucket/*'],
        },
      ],
    },
    versioningEnabled: false,
    encryption: {
      enabled: false,
      algorithm: 'AES256',
      enforceTls: false,
    },
    isPubliclyExposed: true,
    tags: { Environment: 'Staging' },
    objects: [
      {
        id: 'obj-leak-001',
        bucketName: 'nexora-analytics-raw-bucket',
        key: 'customers/export_pii_dump_2026.csv',
        sizeBytes: 25800000,
        sensitivityLevel: 'CONFIDENTIAL',
        isEncrypted: false,
        checksumSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        contentPreview: 'User ID, Email, Full Name, Billing Address, Hash, Cleartext Token',
      },
    ],
  };

  const centralAuditLogBucket: CloudStorageBucket = {
    id: 'bkt-nexora-central-audit-logs',
    name: 'nexora-central-audit-logs-immutable',
    accountId: 'acc-audit-002',
    region: 'nx-east-1',
    arn: 'ncrn:nexora:storage:::nexora-central-audit-logs-immutable',
    publicAccessBlock: {
      blockPublicAcls: true,
      ignorePublicAcls: true,
      blockPublicPolicy: true,
      restrictPublicBuckets: true,
    },
    versioningEnabled: true,
    encryption: {
      enabled: true,
      kmsKeyId: 'kms-key-audit-cmk',
      algorithm: 'NEXORA_KMS',
      enforceTls: true,
    },
    isPubliclyExposed: false,
    tags: { Classification: 'AuditLogs', Retention: '7Years' },
    objects: [],
  };

  return [secureFinanceBucket, vulnerablePublicBucket, centralAuditLogBucket];
}
