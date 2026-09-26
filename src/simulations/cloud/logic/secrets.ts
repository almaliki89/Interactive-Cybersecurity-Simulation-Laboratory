/**
 * OMEGA V13 — Cloud Security World
 * logic/secrets.ts
 *
 * Deterministic Cloud Secrets Manager, KMS Key Management, Auto-Rotation,
 * and Cleartext Credential Leak Detection.
 * Zero non-deterministic functions.
 */

export interface CloudKmsKey {
  id: string; // e.g. 'kms-key-finance-cmk'
  arn: string;
  alias: string;
  descriptionEn: string;
  descriptionAr: string;
  keyType: 'CUSTOMER_MANAGED' | 'SERVICE_MANAGED';
  keyState: 'ENABLED' | 'DISABLED' | 'PENDING_DELETION';
  autoRotationEnabled: boolean;
  creationVirtualTime: number;
}

export interface CloudSecretVersion {
  versionId: string;
  versionStage: 'CURRENT' | 'PREVIOUS' | 'DEPRECATED';
  createdVirtualTime: number;
}

export interface CloudSecret {
  id: string;
  name: string;
  arn: string; // ncrn:nexora:secretsmanager:nx-east-1:<account>:secret:prod/db/credentials
  descriptionEn: string;
  descriptionAr: string;
  kmsKeyId: string;
  rotationEnabled: boolean;
  rotationIntervalDays: number;
  lastRotatedVirtualTime: number;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPROMISED';
  versions: CloudSecretVersion[];
  tags: Record<string, string>;
}

export interface SecretLeakFinding {
  id: string;
  sourceType: 'ENV_VAR' | 'SOURCE_CODE' | 'STORAGE_OBJECT' | 'CONTAINER_SPEC';
  location: string;
  detectedPattern: string;
  severity: 'CRITICAL';
  secretNameGuess: string;
  remediationEn: string;
  remediationAr: string;
}

export function createDefaultKmsKeys(): CloudKmsKey[] {
  return [
    {
      id: 'kms-key-finance-cmk',
      arn: 'ncrn:nexora:kms:nx-east-1:acc-prod-003:key/cmk-finance-001',
      alias: 'alias/prod-finance-key',
      descriptionEn: 'Customer Managed Key for encrypting Finance vault objects.',
      descriptionAr: 'مفتاح مدار بواسطة العميل لتشفير مستندات خزينة المالية.',
      keyType: 'CUSTOMER_MANAGED',
      keyState: 'ENABLED',
      autoRotationEnabled: true,
      creationVirtualTime: 0,
    },
    {
      id: 'kms-key-audit-cmk',
      arn: 'ncrn:nexora:kms:nx-east-1:acc-audit-002:key/cmk-audit-002',
      alias: 'alias/central-audit-key',
      descriptionEn: 'Customer Managed Key for immutable audit logs encryption.',
      descriptionAr: 'مفتاح مدار بواسطة العميل لتشفير سجلات التدقيق غير القابلة للتعديل.',
      keyType: 'CUSTOMER_MANAGED',
      keyState: 'ENABLED',
      autoRotationEnabled: true,
      creationVirtualTime: 0,
    },
    {
      id: 'kms-key-default-cloud',
      arn: 'ncrn:nexora:kms:nx-east-1:acc-prod-003:key/default-nexora-storage',
      alias: 'alias/nexora/storage',
      descriptionEn: 'Default Nexora managed service encryption key.',
      descriptionAr: 'مفتاح التشفير الافتراضي المدار من مزود السحابة.',
      keyType: 'SERVICE_MANAGED',
      keyState: 'ENABLED',
      autoRotationEnabled: true,
      creationVirtualTime: 0,
    },
  ];
}

export function createDefaultSecrets(): CloudSecret[] {
  return [
    {
      id: 'sec-prod-db-postgres',
      name: 'prod/database/postgres-master',
      arn: 'ncrn:nexora:secretsmanager:nx-east-1:acc-prod-003:secret:prod/database/postgres-master',
      descriptionEn: 'Database master password with automated 30-day rotation enabled.',
      descriptionAr: 'كلمة مرور قاعدة البيانات الرئيسية مع تفعيل التدوير التلقائي كل 30 يومًا.',
      kmsKeyId: 'kms-key-finance-cmk',
      rotationEnabled: true,
      rotationIntervalDays: 30,
      lastRotatedVirtualTime: 200,
      status: 'ACTIVE',
      versions: [
        { versionId: 'v-002-current', versionStage: 'CURRENT', createdVirtualTime: 200 },
        { versionId: 'v-001-prev', versionStage: 'PREVIOUS', createdVirtualTime: 50 },
      ],
      tags: { Tier: 'Database', ManagedBy: 'SecretsManager' },
    },
    {
      id: 'sec-payment-gateway-api-key',
      name: 'prod/payment/gateway-api-key',
      arn: 'ncrn:nexora:secretsmanager:nx-east-1:acc-prod-003:secret:prod/payment/gateway-api-key',
      descriptionEn: 'CRITICAL FLAW: Third-party payment token with NO automated rotation and leaked in app env vars.',
      descriptionAr: 'خلل حرج: رمز بوابة الدفع بدون تدوير تلقائي وتم تسريبه في متغيرات بيئة التطبيق.',
      kmsKeyId: 'kms-key-default-cloud',
      rotationEnabled: false, // Security flaw
      rotationIntervalDays: 0,
      lastRotatedVirtualTime: 10,
      status: 'COMPROMISED',
      versions: [
        { versionId: 'v-001-stale', versionStage: 'CURRENT', createdVirtualTime: 10 },
      ],
      tags: { Tier: 'PaymentGateway' },
    },
  ];
}

/**
 * Deterministically scans configuration texts, environment variables, or files for cleartext cloud secrets.
 */
export function scanForCleartextSecrets(
  targetPayload: { location: string; textContent: string; sourceType: SecretLeakFinding['sourceType'] }[]
): SecretLeakFinding[] {
  const findings: SecretLeakFinding[] = [];

  const secretPatterns = [
    { regex: /NXAKIA[0-9A-Z]{10,20}/, name: 'Nexora Static IAM Access Key' },
    { regex: /NXASIA[0-9A-Z]{10,20}/, name: 'Nexora Temporary Session Key' },
    { regex: /sk_live_[0-9a-zA-Z]{20,32}/, name: 'Live Payment Secret Token' },
    { regex: /postgres:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9_!@#$%^&*]+@/, name: 'Database Connection String with Embedded Password' },
  ];

  targetPayload.forEach((target, index) => {
    secretPatterns.forEach((pat, pIndex) => {
      const match = pat.regex.exec(target.textContent);
      if (match) {
        findings.push({
          id: `LEAK-${index + 1}-${pIndex + 1}`,
          sourceType: target.sourceType,
          location: target.location,
          detectedPattern: match[0],
          severity: 'CRITICAL',
          secretNameGuess: pat.name,
          remediationEn: `Rotate credentials immediately, revoke the exposed key, and migrate secrets into Nexora Secrets Manager using IAM instance profiles.`,
          remediationAr: `قم بتدوير بيانات الاعتماد فورًا وإلغاء المفتاح المسرب ونقل الأسرار إلى مدير الأسرار باستخدام هويات أعباء العمل (Instance Profile).`,
        });
      }
    });
  });

  return findings;
}
