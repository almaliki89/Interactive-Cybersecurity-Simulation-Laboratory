/**
 * OMEGA V14 — Container & Kubernetes Attack & Defense Scenarios
 * Deterministic multi-stage incident scenarios for hands-on simulation.
 */

export interface ClusterAttackStage {
  stageId: number;
  nameAr: string;
  nameEn: string;
  technique: string;
  attackerCommand: string;
  targetResource: string;
  observedImpactAr: string;
  observedImpactEn: string;
  mitigationRequiredAr: string;
  mitigationRequiredEn: string;
}

export const CLUSTER_ATTACK_SCENARIO: ClusterAttackStage[] = [
  {
    stageId: 1,
    nameAr: 'المرحلة الأولى: استغلال ثغرة الويب وحقن الأوامر (Web Pod RCE)',
    nameEn: 'Stage 1: Web Pod Exploitation & Remote Command Execution',
    technique: 'T1190 - Exploit Public-Facing Application',
    attackerCommand: 'curl -X POST https://app.nexora.internal/api/render -d "cmd=id; cat /var/run/secrets/kubernetes.io/serviceaccount/token"',
    targetResource: 'pod/frontend-service-67b8-x1',
    observedImpactAr: 'المهاجم ينفذ أوامر داخل الحاوية ويستخرج رمز مصادقة الخدمة ServiceAccount Token.',
    observedImpactEn: 'Attacker executes shell commands inside web container and harvests mounted ServiceAccount token.',
    mitigationRequiredAr: 'تطبيق Pod Security Standards (Restricted) مع readOnlyRootFilesystem: true و runAsNonRoot: true.',
    mitigationRequiredEn: 'Enforce Pod Security Standards (Restricted) with readOnlyRootFilesystem and non-root execution.',
  },
  {
    stageId: 2,
    nameAr: 'المرحلة الثانية: استعلام خادم Kubernetes API Server عبر الصلاحيات المسروقة',
    nameEn: 'Stage 2: K8s API Enumeration via Compromised ServiceAccount Token',
    technique: 'T1613 - Container and Resource Discovery',
    attackerCommand: 'kubectl --token=$TOKEN --server=https://10.96.0.1:443 get secrets -n production',
    targetResource: 'kube-apiserver:443',
    observedImpactAr: 'بسبب وجود أدوار RBAC بصلاحيات شاملة (*)، استطاع المهاجم قراءة كافة كلمات مرور قواعد البيانات!',
    observedImpactEn: 'Overprivileged RBAC wildcard (*) role allowed attacker to list and decode all production database secrets!',
    mitigationRequiredAr: 'إزالة الأدوار الفضفاضة (Wildcard *) وحصر صلاحيات ServiceAccount على مبدأ أقل الامتيازات.',
    mitigationRequiredEn: 'Eliminate wildcard (*) grants and enforce least-privilege RoleBindings.',
  },
  {
    stageId: 3,
    nameAr: 'المرحلة الثالثة: التحرك الشبكي الجانبي نحو حاوية الدفع المعزولة',
    nameEn: 'Stage 3: Pod-to-Pod Lateral Movement to Payment Vault',
    technique: 'T1210 - Exploitation of Remote Services (Lateral Pod Hop)',
    attackerCommand: 'nmap -sT 10.244.4.19 -p 8200 && curl http://10.244.4.19:8200/v1/pci/card-keys',
    targetResource: 'pod/payment-vault-service-0',
    observedImpactAr: 'غياب سياسات الشبكة NetworkPolicies سمح لحاوية الويب المخترقة بالاتصال المباشر بحاوية الدفع.',
    observedImpactEn: 'Flat open Kubernetes network allowed compromised frontend container to directly access sensitive payment pod.',
    mitigationRequiredAr: 'تطبيق سياسات NetworkPolicies مع فرض Default Deny Ingress/Egress.',
    mitigationRequiredEn: 'Apply Default Deny Ingress/Egress NetworkPolicies with strict namespace labels.',
  },
  {
    stageId: 4,
    nameAr: 'المرحلة الرابعة: كسر عزل الحاوية والسيطرة على خادم المضيف (Host Breakout)',
    nameEn: 'Stage 4: Container Escape via Mounted Host Socket',
    technique: 'T1611 - Escape to Host',
    attackerCommand: 'docker -H unix:///var/run/docker.sock run -v /:/host -it alpine chroot /host /bin/bash',
    targetResource: 'worker-node-1 (/var/run/docker.sock)',
    observedImpactAr: 'المهاجم استخدم مقبس دكر الممرر داخل الحاوية لإنشاء حاوية مميزة والسيطرة الكاملة على نظام المضيف!',
    observedImpactEn: 'Attacker leveraged mounted Docker socket to spawn host-chroot container, gaining unrestricted host root access!',
    mitigationRequiredAr: 'حظر تركيب مجلدات المضيف ومقابس دكر تماماً.',
    mitigationRequiredEn: 'Strictly prohibit mounting /var/run/docker.sock or host root volumes.',
  },
];

export interface K8sAttackTimelineStep {
  virtualTime: number;
  eventType: string;
  podName: string;
  namespace: string;
  serviceAccount: string;
  sourceIp: string;
  resource: string;
  severity: 'info' | 'warn' | 'threat' | 'critical';
  descriptionEn: string;
  descriptionAr: string;
  payload: Record<string, unknown>;
}

export const DETERMINISTIC_K8S_ATTACK_TIMELINE: K8sAttackTimelineStep[] = [
  {
    virtualTime: 100,
    eventType: 'K8S_UNSIGNED_IMAGE_DEPLOYED',
    podName: 'frontend-service-67b8-x1',
    namespace: 'frontend',
    serviceAccount: 'deployer-sa',
    sourceIp: '10.244.1.5',
    resource: 'registry.nexora.internal/frontend:v1.4',
    severity: 'warn',
    descriptionEn: 'Unsigned image deployed without Cosign verification',
    descriptionAr: 'تم نشر صورة حاوية غير موثقة بدون التحقق من توقيع Cosign',
    payload: { image: 'registry.nexora.internal/frontend:v1.4', cosignSigned: false },
  },
  {
    virtualTime: 250,
    eventType: 'K8S_PRIVILEGED_POD_CREATED',
    podName: 'debug-pod-alpha',
    namespace: 'frontend',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'pod/debug-pod-alpha',
    severity: 'threat',
    descriptionEn: 'Privileged pod created with CAP_SYS_ADMIN and hostPID',
    descriptionAr: 'تم إنشاء Pod ذو صلاحيات ممتازة مع CAP_SYS_ADMIN و hostPID',
    payload: { privileged: true, capabilities: ['CAP_SYS_ADMIN'] },
  },
  {
    virtualTime: 400,
    eventType: 'K8S_SERVICEACCOUNT_TOKEN_USED',
    podName: 'frontend-service-67b8-x1',
    namespace: 'frontend',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'serviceaccount/frontend-sa',
    severity: 'warn',
    descriptionEn: 'Automounted ServiceAccount token accessed from inside container',
    descriptionAr: 'تم استخدام توكن ServiceAccount المثبت تلقائياً من داخل الحاوية',
    payload: { tokenPath: '/var/run/secrets/kubernetes.io/serviceaccount/token' },
  },
  {
    virtualTime: 600,
    eventType: 'K8S_API_ENUMERATION',
    podName: 'frontend-service-67b8-x1',
    namespace: 'frontend',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'kube-apiserver',
    severity: 'threat',
    descriptionEn: 'API enumeration: listing all secrets across cluster',
    descriptionAr: 'استعلام API: استعراض جميع الأسرار عبر الكلاستر',
    payload: { verb: 'list', resource: 'secrets', namespace: 'finance' },
  },
  {
    virtualTime: 800,
    eventType: 'K8S_SECRET_READ',
    podName: 'frontend-service-67b8-x1',
    namespace: 'finance',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'secret/finance-db-credentials',
    severity: 'critical',
    descriptionEn: 'Unauthorized read of sensitive finance database secret',
    descriptionAr: 'قراءة غير مصرح بها لسر قاعدة بيانات المالية الحساس',
    payload: { secretName: 'finance-db-credentials', namespace: 'finance', keysRead: ['db-password', 'api-key'] },
  },
  {
    virtualTime: 1000,
    eventType: 'K8S_CLUSTERROLEBINDING_CREATED',
    podName: 'frontend-service-67b8-x1',
    namespace: 'kube-system',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'clusterrolebinding/backdoor-admin',
    severity: 'critical',
    descriptionEn: 'Unauthorized ClusterRoleBinding created assigning cluster-admin role',
    descriptionAr: 'إنشاء غير مصرح به لـ ClusterRoleBinding يمنح دور cluster-admin',
    payload: { roleRef: 'cluster-admin', subject: 'frontend-sa' },
  },
  {
    virtualTime: 1200,
    eventType: 'K8S_NETWORK_POLICY_CHANGED',
    podName: 'frontend-service-67b8-x1',
    namespace: 'finance',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'networkpolicy/finance-allow-all',
    severity: 'threat',
    descriptionEn: 'NetworkPolicy modified to remove default deny isolation in finance namespace',
    descriptionAr: 'تعديل NetworkPolicy لإلغاء العزل في namespace المالية',
    payload: { action: 'delete', policyName: 'finance-default-deny' },
  },
  {
    virtualTime: 1400,
    eventType: 'K8S_SENSITIVE_SERVICE_ACCESS',
    podName: 'frontend-service-67b8-x1',
    namespace: 'finance',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'service/finance-api-internal',
    severity: 'critical',
    descriptionEn: 'Direct cross-namespace connection from frontend to finance-api endpoint',
    descriptionAr: 'اتصال مباشر عبر النطاقات من frontend إلى واجهة finance-api الداخلية',
    payload: { destinationPort: 8080, destinationIp: '10.244.3.44' },
  },
  {
    virtualTime: 1600,
    eventType: 'K8S_AUDIT_POLICY_CHANGED',
    podName: 'frontend-service-67b8-x1',
    namespace: 'kube-system',
    serviceAccount: 'frontend-sa',
    sourceIp: '10.244.1.12',
    resource: 'configmap/kube-audit-policy',
    severity: 'threat',
    descriptionEn: 'Kube audit policy tampered to suppress security logging',
    descriptionAr: 'تعديل سياسة تدقيق الكلاستر لتعطيل تسجيل الأحداث الأمنية',
    payload: { auditLevel: 'None' },
  },
];

import { containerEventBridge } from './ContainerEventBridge';

export function runKubernetesAttackScenario(): void {
  DETERMINISTIC_K8S_ATTACK_TIMELINE.forEach((step) => {
    containerEventBridge.emitEvent({
      id: `evt-k8s-timeline-${step.virtualTime}-${step.eventType}`,
      eventType: step.eventType,
      virtualTime: step.virtualTime,
      podName: step.podName,
      namespace: step.namespace,
      serviceAccount: step.serviceAccount,
      sourceIp: step.sourceIp,
      resource: step.resource,
      severity: step.severity,
      outcome: step.severity === 'critical' || step.severity === 'threat' ? 'ANOMALY' : 'INFO',
      attributes: {
        ...step.payload,
        descriptionEn: step.descriptionEn,
        descriptionAr: step.descriptionAr,
      },
    });
  });
}
