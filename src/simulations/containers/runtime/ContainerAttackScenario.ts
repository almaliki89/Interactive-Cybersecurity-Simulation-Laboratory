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
