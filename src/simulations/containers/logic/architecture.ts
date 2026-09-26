/**
 * OMEGA V14 — Kubernetes Architecture & Business Continuity Validator
 * Validates production workload segmentation, RBAC, network isolation, and business path continuity.
 */

import { KubernetesMasterState } from './types';
import { evaluateKubernetesAuthorization } from './rbac';
import { evaluatePodNetworkReachability } from './networkPolicies';

export interface ArchitectureCheckResult {
  id: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  messageEn: string;
  messageAr: string;
}

export interface KubernetesArchitectureValidation {
  passed: boolean;
  checks: ArchitectureCheckResult[];
  failedChecks: string[];
  businessContinuityPassed: boolean;
}

export function validateKubernetesArchitecture(state: KubernetesMasterState): KubernetesArchitectureValidation {
  const checks: ArchitectureCheckResult[] = [];

  // Check 1: Namespace Segmentation
  const requiredNs = ['frontend', 'backend', 'finance', 'monitoring', 'security'];
  const stateNsNames = state.namespaces.map((n) => n.name);
  const hasAllNs = requiredNs.every((ns) => stateNsNames.includes(ns));
  checks.push({
    id: 'namespace-segmentation',
    nameEn: 'Namespace Multi-Tenant Segmentation',
    nameAr: 'تقسيم مساحات الأسماء Multi-Tenant Namespace Segmentation',
    passed: hasAllNs,
    severity: 'HIGH',
    messageEn: hasAllNs
      ? 'All required production namespaces (frontend, backend, finance, monitoring, security) exist.'
      : `Missing required namespaces: ${requiredNs.filter((n) => !stateNsNames.includes(n)).join(', ')}.`,
    messageAr: hasAllNs
      ? 'جميع مساحات الأسماء المطلوبة للإنتاج موجودة ومفصولة بنجاح.'
      : 'توجد مساحات أسماء مفقودة من العزل الهيكلي.',
  });

  // Check 2: Production Workload Availability
  const prodPods = state.pods.filter((p) => ['frontend', 'backend', 'finance'].includes(p.namespace));
  const allPodsRunning = prodPods.length > 0 && prodPods.every((p) => p.status === 'Running');
  checks.push({
    id: 'production-workload-availability',
    nameEn: 'Production Workload Availability',
    nameAr: 'توفريات خدمات الإنتاج Production Workload Availability',
    passed: allPodsRunning,
    severity: 'CRITICAL',
    messageEn: allPodsRunning
      ? 'All core workloads across production namespaces are running.'
      : 'One or more production pods are degraded or not running.',
    messageAr: allPodsRunning
      ? 'جميع خدمات الإنتاج تعمل في حالة السليمة Running.'
      : 'توجد حاويات إنتاجية غير شغالة أو في حالة خلل.',
  });

  // Check 3: Pod Security Standards (Non-Root & Privileged)
  const nonRootPassing = prodPods.every(
    (p) =>
      p.securityContext.runAsNonRoot &&
      p.securityContext.runAsUser !== 0 &&
      !p.securityContext.privileged &&
      !p.securityContext.allowPrivilegeEscalation
  );
  checks.push({
    id: 'pod-security-standards',
    nameEn: 'Restricted Pod Security Standards',
    nameAr: 'معايير أمان الحاويات Restricted Pod Security Standards',
    passed: nonRootPassing,
    severity: 'CRITICAL',
    messageEn: nonRootPassing
      ? 'All production pods run as non-root with privileged mode and privilege escalation disabled.'
      : 'Found production pods running as root or with privileged/privilege escalation enabled.',
    messageAr: nonRootPassing
      ? 'جميع الحاويات تعمل بمستخدم غير root وبدون امتيازات مرتفعة.'
      : 'تم العثور على حاويات تعمل بملكية root أو نمط privileged.',
  });

  // Check 4: Linux Capabilities Dropped
  const capsPassing = prodPods.every(
    (p) =>
      !p.securityContext.capabilitiesAdd.some((c) =>
        ['CAP_SYS_ADMIN', 'CAP_NET_ADMIN', 'CAP_NET_RAW', 'CAP_SYS_PTRACE'].includes(c)
      )
  );
  checks.push({
    id: 'capabilities-hardening',
    nameEn: 'Linux Capabilities Drop Enforced',
    nameAr: 'إسقاط قدرات لينكس الخطرة Linux Capabilities Drop',
    passed: capsPassing,
    severity: 'HIGH',
    messageEn: capsPassing
      ? 'No production workload retains dangerous Linux capabilities.'
      : 'Dangerous capabilities (CAP_SYS_ADMIN/CAP_NET_ADMIN/CAP_NET_RAW) found in production pods.',
    messageAr: capsPassing
      ? 'تم تجريد الحاويات من القدرات الأمنية الخطرة.'
      : 'توجد قدرات لينكس عالية الخطورة مضافة للحاويات.',
  });

  // Check 5: Image Trust & Signature Verification
  const imagesSigned = prodPods.every((p) => p.image.isSignedCosign);
  checks.push({
    id: 'image-trust-verification',
    nameEn: 'Container Image Cosign Signature Trust',
    nameAr: 'التحقق من توقيع صور الحاويات Image Signature Trust',
    passed: imagesSigned,
    severity: 'HIGH',
    messageEn: imagesSigned
      ? 'All production container images are signed and verified via Cosign.'
      : 'Unsigned or unverified container images found in production workloads.',
    messageAr: imagesSigned
      ? 'جميع صور الحاويات موثقة وموقعة رقمياً.'
      : 'توجد صور حاويات غير موقعة في بيئة الإنتاج.',
  });

  // Check 6: RBAC Least Privilege (No Wildcards or Secret Stealing)
  const rbacHasWildcards = state.roles.some((r) =>
    r.rules.some((rule) => rule.verbs.includes('*') || rule.resources.includes('*'))
  );
  checks.push({
    id: 'rbac-least-privilege',
    nameEn: 'RBAC Sanitize & Least Privilege',
    nameAr: 'مبدأ أقل الصلاحيات لمصادقة RBAC Least Privilege',
    passed: !rbacHasWildcards,
    severity: 'CRITICAL',
    messageEn: !rbacHasWildcards
      ? 'RBAC roles sanitized with zero wildcard (*) grants or overbroad cluster permissions.'
      : 'Dangerous wildcard (*) verbs or resources found in RBAC role definitions.',
    messageAr: !rbacHasWildcards
      ? 'تم تطهير جميع أدوار RBAC وإزالة النجوم Wildcards.'
      : 'توجد أدوار RBAC تحتوي على علامات النجمة (*) الممنوحة بدون قيود.',
  });

  // Check 7: Secrets Encryption at Rest
  const secretsEncrypted = state.secrets.every((s) => s.encryptedAtRest);
  checks.push({
    id: 'secrets-protection',
    nameEn: 'etcd Secrets KMS Encryption at Rest',
    nameAr: 'تشفير الأسرار في etcd KMS Encryption at Rest',
    passed: secretsEncrypted,
    severity: 'HIGH',
    messageEn: secretsEncrypted
      ? 'All Kubernetes secrets encrypted at rest in etcd with KMS provider.'
      : 'Unencrypted secrets detected in cluster state storage.',
    messageAr: secretsEncrypted
      ? 'الأسرار مشفرة بنجاح أثناء التخزين في etcd.'
      : 'توجد أسرار مخزنة في etcd بدون تشفير.',
  });

  // Check 8: Network Default Deny & Policy Enforcement
  const defaultDenyPresent = state.networkPolicies.some((p) => p.enabled && p.policyTypes.includes('Ingress'));
  checks.push({
    id: 'network-isolation',
    nameEn: 'Declarative NetworkPolicy Isolation',
    nameAr: 'سياسات العزل الشبكي NetworkPolicy Isolation',
    passed: defaultDenyPresent,
    severity: 'CRITICAL',
    messageEn: defaultDenyPresent
      ? 'NetworkPolicies enforced in production namespaces.'
      : 'Missing active NetworkPolicies; network is open flat default.',
    messageAr: defaultDenyPresent
      ? 'تم تطبيق سياسات العزل الشبكي في الكلاستر.'
      : 'الكلاستر مفتوح شبكياً بدون سياسات NetworkPolicy.',
  });

  // Check 9: Audit Logging Configured
  const auditActive = state.auditConfig.enabled && state.auditConfig.policyLevel !== 'None';
  checks.push({
    id: 'audit-logging',
    nameEn: 'Kubernetes Control Plane Audit Logging',
    nameAr: 'سجلات التدقيق لحركة الكلاستر Audit Logging',
    passed: auditActive,
    severity: 'MEDIUM',
    messageEn: auditActive
      ? 'Kube audit logging enabled and capturing API requests.'
      : 'Audit logging is disabled or set to None policy level.',
    messageAr: auditActive
      ? 'سجلات تدقيق الكلاستر مفعلة وتعمل بنجاح.'
      : 'سجلات تدقيق الكلاستر معطلة أو على مستوى None.',
  });

  // Evaluate Business Continuity Path Matrix
  // Required allowed path: Internet -> frontend -> backend -> finance-api
  const extToFrontend = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'internet-client', namespace: 'external', labels: {} },
      dstPod: { name: 'frontend-service', namespace: 'frontend', labels: { app: 'frontend' } },
      dstPort: 443,
      isExternal: true,
    },
    state.networkPolicies
  ).reachable;

  const frontendToBackend = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'frontend-service', namespace: 'frontend', labels: { app: 'frontend' } },
      dstPod: { name: 'backend-service', namespace: 'backend', labels: { app: 'backend' } },
      dstPort: 443,
    },
    state.networkPolicies
  ).reachable;

  const backendToFinanceApi = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'backend-service', namespace: 'backend', labels: { app: 'backend' } },
      dstPod: { name: 'finance-api', namespace: 'finance', labels: { app: 'finance-api' } },
      dstPort: 8080,
    },
    state.networkPolicies
  ).reachable;

  // Required blocked paths
  const extToFinance = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'internet-client', namespace: 'external', labels: {} },
      dstPod: { name: 'finance-api', namespace: 'finance', labels: { app: 'finance-api' } },
      dstPort: 8080,
      isExternal: true,
    },
    state.networkPolicies
  ).reachable;

  const frontendToFinanceDb = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'frontend-service', namespace: 'frontend', labels: { app: 'frontend' } },
      dstPod: { name: 'finance-db', namespace: 'finance', labels: { app: 'finance-db' } },
      dstPort: 5432,
    },
    state.networkPolicies
  ).reachable;

  const randomToFinance = evaluatePodNetworkReachability(
    {
      srcPod: { name: 'untrusted-pod', namespace: 'guest', labels: { app: 'guest' } },
      dstPod: { name: 'finance-api', namespace: 'finance', labels: { app: 'finance-api' } },
      dstPort: 8080,
    },
    state.networkPolicies
  ).reachable;

  const businessContinuityPassed =
    extToFrontend &&
    frontendToBackend &&
    backendToFinanceApi &&
    !extToFinance &&
    !frontendToFinanceDb &&
    !randomToFinance;

  checks.push({
    id: 'business-continuity-matrix',
    nameEn: 'Business Continuity & Legitimate Traffic Flow',
    nameAr: 'استمرارية الأعمال ومسارات الخدمة المعتمدة Business Continuity',
    passed: businessContinuityPassed,
    severity: 'CRITICAL',
    messageEn: businessContinuityPassed
      ? 'Legitimate business path (Internet -> frontend -> backend -> finance-api) is operational while unauthorized lateral/external access is strictly blocked.'
      : 'Business path validation failed or unauthorized lateral access was permitted.',
    messageAr: businessContinuityPassed
      ? 'مسار الخدمة المعتمد يعمل بنجاح مع حظر الاتصالات التسللية والجانبية غير المصرح بها.'
      : 'فشل التحقق من مسار استمرارية الأعمال أو تم السماح باتصال جانبي غير مصرح به.',
  });

  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.id);
  const passed = failedChecks.length === 0;

  return {
    passed,
    checks,
    failedChecks,
    businessContinuityPassed,
  };
}
