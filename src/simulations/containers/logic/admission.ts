/**
 * OMEGA V14 — Kubernetes Admission Controller (OPA Gatekeeper / Kyverno)
 * Validates and mutates Pod and workload manifests before scheduling.
 */

import { KubernetesPod } from './types';

export interface AdmissionPolicyRule {
  id: string;
  name: string;
  engine: 'OPA_GATEKEEPER' | 'KYVERNO';
  descriptionAr: string;
  descriptionEn: string;
  enforceAction: 'DENY' | 'WARN' | 'DISABLED';
}

export function getInitialAdmissionPolicies(): AdmissionPolicyRule[] {
  return [
    {
      id: 'k8s-disallow-privileged',
      name: 'Disallow Privileged Containers',
      engine: 'OPA_GATEKEEPER',
      descriptionAr: 'منع نشر أي Pod يحتوي على privileged: true لحماية عزل النواة.',
      descriptionEn: 'Rejects admission of Pods specifying securityContext.privileged = true.',
      enforceAction: 'DENY',
    },
    {
      id: 'k8s-require-non-root',
      name: 'Require Non-Root User Execution',
      engine: 'KYVERNO',
      descriptionAr: 'إلزام جميع الحاويات بالعمل تحت معرف مستخدم غير مميز runAsNonRoot: true.',
      descriptionEn: 'Enforces runAsNonRoot: true and rejects containers attempting to run as UID 0.',
      enforceAction: 'DENY',
    },
    {
      id: 'k8s-require-readonly-rootfs',
      name: 'Require Read-Only Root Filesystem',
      engine: 'OPA_GATEKEEPER',
      descriptionAr: 'منع الكتابة المباشرة على نظام ملفات الحاوية لمنع حفظ برمجيات الفدية والمخترقين.',
      descriptionEn: 'Enforces securityContext.readOnlyRootFilesystem = true.',
      enforceAction: 'DENY',
    },
    {
      id: 'k8s-block-host-namespaces',
      name: 'Disallow Host Namespaces (hostPID, hostIPC, hostNetwork)',
      engine: 'KYVERNO',
      descriptionAr: 'منع مشاركة مساحات أسماء المضيف مع الحاويات.',
      descriptionEn: 'Blocks hostPID: true, hostIPC: true, and hostNetwork: true in pod specs.',
      enforceAction: 'DENY',
    },
    {
      id: 'k8s-require-cosign-signature',
      name: 'Verify Image Cosign Cryptographic Signature',
      engine: 'KYVERNO',
      descriptionAr: 'التحقق من توقيع الصورة الرقمي عبر Sigstore Cosign قبل السماح بتشغيلها.',
      descriptionEn: 'Verifies Sigstore/Cosign public key signature before allowing image pull.',
      enforceAction: 'DENY',
    },
  ];
}

export function validatePodAdmission(
  pod: KubernetesPod,
  policies: AdmissionPolicyRule[]
): {
  admitted: boolean;
  blockedPolicyRules: AdmissionPolicyRule[];
  reasonAr: string;
  reasonEn: string;
} {
  const blockedRules: AdmissionPolicyRule[] = [];

  for (const pol of policies) {
    if (pol.enforceAction !== 'DENY') continue;

    if (pol.id === 'k8s-disallow-privileged' && pod.securityContext.privileged) {
      blockedRules.push(pol);
    }
    if (pol.id === 'k8s-require-non-root' && (!pod.securityContext.runAsNonRoot || pod.securityContext.runAsUser === 0)) {
      blockedRules.push(pol);
    }
    if (pol.id === 'k8s-require-readonly-rootfs' && !pod.securityContext.readOnlyRootFilesystem) {
      blockedRules.push(pol);
    }
    if (pol.id === 'k8s-require-cosign-signature' && !pod.image.isSignedCosign) {
      blockedRules.push(pol);
    }
  }

  if (blockedRules.length > 0) {
    return {
      admitted: false,
      blockedPolicyRules: blockedRules,
      reasonAr: `رفض الـ Admission Webhook نشر الـ Pod (${pod.name}) لانتهاكه السياسات الأمنية: ${blockedRules.map((r) => r.name).join(', ')}.`,
      reasonEn: `Admission Webhook rejected Pod (${pod.name}) due to policy violations: ${blockedRules.map((r) => r.name).join(', ')}.`,
    };
  }

  return {
    admitted: true,
    blockedPolicyRules: [],
    reasonAr: `تمت الموافقة على نشر الـ Pod (${pod.name}) بنجاح لتوافقه مع كافة معايير السياسات الأمنية.`,
    reasonEn: `Pod (${pod.name}) successfully passed ValidatingWebhook admission gate.`,
  };
}
