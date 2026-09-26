/**
 * OMEGA V14 — Kubernetes Secrets Security Engine
 * Evaluates Secrets encryption at rest in etcd, External Secrets Operator (Vault), and memory volumes.
 */

import { KubernetesSecret } from './types';

export function getInitialClusterSecrets(): KubernetesSecret[] {
  return [
    {
      id: 'secret-db-creds',
      name: 'postgres-db-credentials',
      namespace: 'production',
      secretType: 'Opaque',
      encryptedAtRest: false, // Plaintext Base64 in etcd!
      encryptionProvider: 'none',
      managedByExternalVault: false,
      keys: [
        { key: 'DB_USER', valueMasked: 'admin_root', sensitive: false },
        { key: 'DB_PASSWORD', valueMasked: 'P@ssw0rd_Production_2026!#', sensitive: true },
        { key: 'ENCRYPTION_KEY', valueMasked: '7f9a2b8c9d1e434f09823aa3241bc19e', sensitive: true },
      ],
    },
    {
      id: 'secret-payment-api-token',
      name: 'stripe-live-secret-token',
      namespace: 'payments-secure',
      secretType: 'Opaque',
      encryptedAtRest: false,
      encryptionProvider: 'none',
      managedByExternalVault: false,
      keys: [
        { key: 'API_SECRET_KEY', valueMasked: 'sk_live_51M0...994z1', sensitive: true },
        { key: 'WEBHOOK_SECRET', valueMasked: 'whsec_98ab76cd54ef', sensitive: true },
      ],
    },
  ];
}

export function auditSecretsSecurity(secrets: KubernetesSecret[], isEtcdKmsActive: boolean): {
  totalSecrets: number;
  unencryptedCount: number;
  vaultManagedCount: number;
  securityScore: number;
  recommendationsAr: string[];
  recommendationsEn: string[];
} {
  let unencryptedCount = 0;
  let vaultManagedCount = 0;
  const recommendationsAr: string[] = [];
  const recommendationsEn: string[] = [];

  for (const s of secrets) {
    if (!s.encryptedAtRest && !isEtcdKmsActive) {
      unencryptedCount++;
    }
    if (s.managedByExternalVault) {
      vaultManagedCount++;
    }
  }

  if (!isEtcdKmsActive) {
    recommendationsAr.push('تفعيل موفر التشفير EncryptionConfiguration (KMS Envelope) لحماية كافة أسرار etcd.');
    recommendationsEn.push('Enable EncryptionConfiguration (KMS Envelope) to encrypt all secrets at rest in etcd.');
  }

  if (vaultManagedCount < secrets.length) {
    recommendationsAr.push('استخدام External Secrets Operator لربط الحاويات مع HashiCorp Vault وتوليد أسرار مؤقتة ديناميكية.');
    recommendationsEn.push('Deploy External Secrets Operator to sync ephemeral dynamic credentials from HashiCorp Vault.');
  }

  let securityScore = 100;
  if (!isEtcdKmsActive) securityScore -= 50;
  if (vaultManagedCount === 0) securityScore -= 20;
  securityScore = Math.max(0, Math.min(100, securityScore));

  return {
    totalSecrets: secrets.length,
    unencryptedCount: isEtcdKmsActive ? 0 : unencryptedCount,
    vaultManagedCount,
    securityScore,
    recommendationsAr,
    recommendationsEn,
  };
}
