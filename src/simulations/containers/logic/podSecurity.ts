/**
 * OMEGA V14 — Pod Security Standards (PSS) & SecurityContext Engine
 * Evaluates Pod manifests against Privileged, Baseline, and Restricted PSS profiles.
 */

import { ContainerSecurityContext, KubernetesPod } from './types';

export type PodSecurityStandardLevel = 'Privileged' | 'Baseline' | 'Restricted';

export interface PssEvaluationResult {
  level: PodSecurityStandardLevel;
  meetsRestricted: boolean;
  meetsBaseline: boolean;
  violationsAr: string[];
  violationsEn: string[];
  recommendationsAr: string[];
  recommendationsEn: string[];
}

export function evaluatePodSecurityStandard(pod: KubernetesPod): PssEvaluationResult {
  const sc = pod.securityContext;
  const violationsAr: string[] = [];
  const violationsEn: string[] = [];
  const recommendationsAr: string[] = [];
  const recommendationsEn: string[] = [];

  let meetsBaseline = true;
  let meetsRestricted = true;

  // 1. Privileged Container check (Baseline violation)
  if (sc.privileged) {
    meetsBaseline = false;
    meetsRestricted = false;
    violationsAr.push('الحاوية تعمل في الوضع المميز (privileged: true)، مما يلغي جميع حدود العزل.');
    violationsEn.push('Container runs with privileged: true, completely bypassing isolation boundaries.');
    recommendationsAr.push('اضبط privileged: false في securityContext.');
    recommendationsEn.push('Set privileged: false in container securityContext.');
  }

  // 2. Host Path Volume Mounts check (Baseline violation)
  for (const vol of pod.volumeMounts) {
    if (vol.isSensitiveHostMount) {
      meetsBaseline = false;
      meetsRestricted = false;
      violationsAr.push(`تم تركيب مجلد حساس من خادم المضيف: ${vol.hostPath || vol.name}`);
      violationsEn.push(`Sensitive host filesystem mount detected: ${vol.hostPath || vol.name}`);
      recommendationsAr.push('أزل تركيب مجلدات المضيف واستخدم emptyDir أو PersistentVolumeClaims.');
      recommendationsEn.push('Eliminate hostPath mounts; use emptyDir or managed PersistentVolumes.');
    }
  }

  // 3. Capabilities Checks (Baseline / Restricted)
  const hasDangerousCaps = sc.capabilitiesAdd.some((c) =>
    ['CAP_SYS_ADMIN', 'CAP_SYS_PTRACE', 'CAP_SYS_MODULE', 'CAP_NET_ADMIN', 'CAP_NET_RAW'].includes(c)
  );

  if (hasDangerousCaps) {
    meetsBaseline = false;
    meetsRestricted = false;
    violationsAr.push(`تمت إضافة صلاحيات لينكس خطرة: ${sc.capabilitiesAdd.join(', ')}`);
    violationsEn.push(`Dangerous Linux capabilities added: ${sc.capabilitiesAdd.join(', ')}`);
    recommendationsAr.push('قم بإسقاط كافة الصلاحيات عبر capabilities: { drop: ["ALL"] }.');
    recommendationsEn.push('Drop all capabilities: capabilities: { drop: ["ALL"] }.');
  }

  const hasDroppedAll = sc.capabilitiesDrop.includes('CAP_SYS_ADMIN') || (sc.capabilitiesDrop.length > 0 && sc.capabilitiesDrop[0] === ('ALL' as any));
  if (!hasDroppedAll && sc.capabilitiesDrop.length === 0) {
    meetsRestricted = false;
    violationsAr.push('لم يتم إسقاط جميع الصلاحيات الافتراضية (drop: ["ALL"]).');
    violationsEn.push('Container does not explicitly drop all default capabilities (drop: ["ALL"]).');
    recommendationsAr.push('أضف drop: ["ALL"] ثم اسمح فقط بـ NET_BIND_SERVICE إن لزم الأمر.');
    recommendationsEn.push('Add drop: ["ALL"] and allow only required capabilities (e.g. NET_BIND_SERVICE).');
  }

  // 4. Non-Root Execution check (Restricted violation)
  if (!sc.runAsNonRoot || sc.runAsUser === 0) {
    meetsRestricted = false;
    violationsAr.push('الحاوية مسموح لها بالتشغيل كـ Root (UID 0 / runAsNonRoot: false).');
    violationsEn.push('Container is permitted to run as root user (UID 0 / runAsNonRoot: false).');
    recommendationsAr.push('اضبط runAsNonRoot: true و runAsUser: 10001 لمنع تشغيل العمليات كـ Root.');
    recommendationsEn.push('Enforce runAsNonRoot: true and specify runAsUser: 10001.');
  }

  // 5. Read-Only Root Filesystem check (Restricted violation)
  if (!sc.readOnlyRootFilesystem) {
    meetsRestricted = false;
    violationsAr.push('نظام الملفات قابل للكتابة (readOnlyRootFilesystem: false)، مما يسهل تنزيل ملفات الاختراق.');
    violationsEn.push('Root filesystem is writable (readOnlyRootFilesystem: false), facilitating malware drop.');
    recommendationsAr.push('فعل readOnlyRootFilesystem: true واستخدم tmpfs للمجلدات المؤقتة /tmp.');
    recommendationsEn.push('Enforce readOnlyRootFilesystem: true and use memory tmpfs for /tmp scratch space.');
  }

  // 6. Privilege Escalation check (Restricted violation)
  if (sc.allowPrivilegeEscalation) {
    meetsRestricted = false;
    violationsAr.push('السماح بترقية الصلاحيات (allowPrivilegeEscalation: true) يمكن أن يفعل برامج SUID.');
    violationsEn.push('allowPrivilegeEscalation: true permits child processes to gain additional privileges via SUID binaries.');
    recommendationsAr.push('اضبط allowPrivilegeEscalation: false لمنع تجاوز الصلاحيات عبر SUID.');
    recommendationsEn.push('Set allowPrivilegeEscalation: false in container security context.');
  }

  // 7. Seccomp Profile check (Restricted violation)
  if (sc.seccompProfile === 'Unconfined') {
    meetsRestricted = false;
    violationsAr.push('مرشح Seccomp معطل (Unconfined)، مما يسمح باستدعاء دوال نواة غير آمنة.');
    violationsEn.push('Seccomp profile is Unconfined, permitting unrestricted raw Linux kernel syscalls.');
    recommendationsAr.push('اضبط seccompProfile: { type: "RuntimeDefault" }.');
    recommendationsEn.push('Enforce seccompProfile: { type: "RuntimeDefault" }.');
  }

  let level: PodSecurityStandardLevel = 'Privileged';
  if (meetsRestricted) {
    level = 'Restricted';
  } else if (meetsBaseline) {
    level = 'Baseline';
  }

  return {
    level,
    meetsRestricted,
    meetsBaseline,
    violationsAr,
    violationsEn,
    recommendationsAr,
    recommendationsEn,
  };
}
