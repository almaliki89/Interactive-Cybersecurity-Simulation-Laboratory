/**
 * OMEGA V14 — Kubernetes Control Plane Security & CIS Benchmark Engine
 * Evaluates kube-apiserver, etcd encryption at rest, kubelet node restriction, and CIS K8s benchmark.
 */

import { ControlPlaneConfig } from './types';

export function getInitialControlPlaneConfig(): ControlPlaneConfig {
  return {
    anonymousAuthDisabled: false, // Insecure default
    insecurePortDisabled: false, // Deprecated insecure port 8080 listening
    etcdTlsClientAuthEnabled: false, // Plaintext etcd
    etcdEncryptionConfigEnabled: false, // Secrets plaintext in etcd
    auditLoggingEnabled: false,
    kubeletNodeRestrictionEnabled: false,
    kubeletAlwaysPullImagesEnabled: false,
    cisBenchmarkScore: 28,
  };
}

export interface CisCheckItem {
  id: string;
  section: string;
  nameAr: string;
  nameEn: string;
  flagName: string;
  passed: boolean;
  impactScore: number;
  recommendationAr: string;
  recommendationEn: string;
}

export function evaluateCisKubernetesBenchmark(config: ControlPlaneConfig): {
  score: number;
  grade: 'CRITICAL_FAIL' | 'POOR' | 'PASSING' | 'CIS_COMPLIANT';
  checks: CisCheckItem[];
  remediationsNeededAr: string[];
  remediationsNeededEn: string[];
} {
  const checks: CisCheckItem[] = [
    {
      id: 'CIS-1.2.1',
      section: 'Control Plane - API Server',
      nameAr: 'تعطيل المصادقة المجهولة (--anonymous-auth=false)',
      nameEn: 'Ensure that the --anonymous-auth argument is set to false',
      flagName: 'anonymousAuthDisabled',
      passed: config.anonymousAuthDisabled,
      impactScore: 20,
      recommendationAr: 'اضبط --anonymous-auth=false لمنع الوصول غير الموثق لنقاط نهاية API Server.',
      recommendationEn: 'Set --anonymous-auth=false on kube-apiserver to reject unauthenticated requests.',
    },
    {
      id: 'CIS-1.2.18',
      section: 'Control Plane - API Server',
      nameAr: 'تعطيل المنفذ غير الآمن (--insecure-port=0)',
      nameEn: 'Ensure that the --insecure-port argument is set to 0',
      flagName: 'insecurePortDisabled',
      passed: config.insecurePortDisabled,
      impactScore: 15,
      recommendationAr: 'عطل المنفذ غير الآمن 8080 بشكل نهائي لفرض الاتصال المشفر عبر TLS (منفذ 6443).',
      recommendationEn: 'Set --insecure-port=0 to eliminate plaintext unauthenticated HTTP communication.',
    },
    {
      id: 'CIS-1.2.29',
      section: 'Control Plane - etcd',
      nameAr: 'تشفير أسرار Kubernetes أثناء التخزين في etcd (EncryptionConfiguration KMS)',
      nameEn: 'Ensure that the EncryptionConfiguration file is configured to encrypt Secrets at rest in etcd',
      flagName: 'etcdEncryptionConfigEnabled',
      passed: config.etcdEncryptionConfigEnabled,
      impactScore: 25,
      recommendationAr: 'فعل EncryptionConfiguration باستخدام موفر aescbc أو KMS Envelope لمنع قراءة الأسرار مباشرة من قاعدة بيانات etcd.',
      recommendationEn: 'Enable EncryptionConfiguration with AES-GCM or KMS envelope provider to protect secrets in etcd.',
    },
    {
      id: 'CIS-2.1.1',
      section: 'Control Plane - etcd',
      nameAr: 'فرض مصادقة العميل المتبادلة لـ etcd (--client-cert-auth=true)',
      nameEn: 'Ensure that the --client-cert-auth argument is set to true for etcd',
      flagName: 'etcdTlsClientAuthEnabled',
      passed: config.etcdTlsClientAuthEnabled,
      impactScore: 15,
      recommendationAr: 'اضبط --client-cert-auth=true لفرض شهادات mTLS عند الاتصال بمجموعة etcd.',
      recommendationEn: 'Require client certificates for etcd cluster communication.',
    },
    {
      id: 'CIS-1.2.22',
      section: 'Control Plane - Audit',
      nameAr: 'تفعيل سجلات التدقيق المتقدمة (--audit-log-path و --audit-policy-file)',
      nameEn: 'Ensure that the --audit-log-path and --audit-policy-file are configured',
      flagName: 'auditLoggingEnabled',
      passed: config.auditLoggingEnabled,
      impactScore: 10,
      recommendationAr: 'فعل سجلات التدقيق لتتبع كافة العمليات والطلبات الموجهة للـ API Server.',
      recommendationEn: 'Enable comprehensive API server audit logs forwarded to SOC SIEM.',
    },
    {
      id: 'CIS-1.2.16',
      section: 'Control Plane - Admission',
      nameAr: 'تفعيل ملحق تقييد العقد NodeRestriction',
      nameEn: 'Ensure that the NodeRestriction admission plugin is enabled',
      flagName: 'kubeletNodeRestrictionEnabled',
      passed: config.kubeletNodeRestrictionEnabled,
      impactScore: 10,
      recommendationAr: 'فعل NodeRestriction لمنع العقد المخترقة من تعديل Pods التابعة لعقد أخرى.',
      recommendationEn: 'Enable NodeRestriction plugin to limit kubelet modification scope to its own node.',
    },
    {
      id: 'CIS-4.2.6',
      section: 'Worker Nodes - Kubelet',
      nameAr: 'فرض إعادة سحب الصور للتحقق AlwaysPullImages',
      nameEn: 'Ensure that the AlwaysPullImages admission plugin is enabled',
      flagName: 'kubeletAlwaysPullImagesEnabled',
      passed: config.kubeletAlwaysPullImagesEnabled,
      impactScore: 5,
      recommendationAr: 'فعل AlwaysPullImages لمنع الحاويات من استخدام نسخ كاش محلية لصور قديمة غير مصرح بها.',
      recommendationEn: 'Enable AlwaysPullImages to validate registry authentication on every pod startup.',
    },
  ];

  let score = 0;
  const remediationsNeededAr: string[] = [];
  const remediationsNeededEn: string[] = [];

  for (const check of checks) {
    if (check.passed) {
      score += check.impactScore;
    } else {
      remediationsNeededAr.push(check.recommendationAr);
      remediationsNeededEn.push(check.recommendationEn);
    }
  }

  score = Math.min(100, Math.max(0, score));

  let grade: 'CRITICAL_FAIL' | 'POOR' | 'PASSING' | 'CIS_COMPLIANT' = 'CRITICAL_FAIL';
  if (score >= 90) grade = 'CIS_COMPLIANT';
  else if (score >= 70) grade = 'PASSING';
  else if (score >= 45) grade = 'POOR';

  return {
    score,
    grade,
    checks,
    remediationsNeededAr,
    remediationsNeededEn,
  };
}
