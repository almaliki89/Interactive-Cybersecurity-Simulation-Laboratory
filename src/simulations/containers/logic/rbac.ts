/**
 * OMEGA V14 — Kubernetes RBAC (Role-Based Access Control) Security Engine
 * Evaluates cluster permissions, detects dangerous wildcards (*), pods/exec abuse, and privilege escalation paths.
 */

import { KubernetesRole, KubernetesRoleBinding } from './types';

export interface DangerousRbacFinding {
  roleName: string;
  isClusterRole: boolean;
  resource: string;
  verb: string;
  riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  explanationAr: string;
  explanationEn: string;
  escalationVectorAr: string;
  escalationVectorEn: string;
}

export function getInitialClusterRoles(): { roles: KubernetesRole[]; bindings: KubernetesRoleBinding[] } {
  const roles: KubernetesRole[] = [
    {
      id: 'role-overprivileged-frontend-sa',
      name: 'frontend-service-role',
      namespace: 'production',
      isClusterRole: false,
      rules: [
        {
          apiGroups: [''],
          resources: ['pods', 'secrets', 'configmaps'],
          verbs: ['*'], // DANGEROUS WILDCARD!
        },
        {
          apiGroups: [''],
          resources: ['pods/exec'], // DANGEROUS EXEC!
          verbs: ['create'],
        },
      ],
    },
    {
      id: 'role-cluster-admin-shadow',
      name: 'ci-runner-cluster-role',
      namespace: '',
      isClusterRole: true,
      rules: [
        {
          apiGroups: ['*'],
          resources: ['*'],
          verbs: ['*'], // SHADOW CLUSTER ADMIN!
        },
      ],
    },
    {
      id: 'role-backend-restricted',
      name: 'backend-pod-reader',
      namespace: 'production',
      isClusterRole: false,
      rules: [
        {
          apiGroups: [''],
          resources: ['configmaps'],
          verbs: ['get', 'list', 'watch'],
        },
      ],
    },
  ];

  const bindings: KubernetesRoleBinding[] = [
    {
      id: 'binding-frontend-sa',
      name: 'frontend-sa-binding',
      namespace: 'production',
      isClusterRoleBinding: false,
      roleRefName: 'frontend-service-role',
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'frontend-sa',
          namespace: 'production',
        },
      ],
    },
    {
      id: 'binding-ci-runner',
      name: 'ci-runner-cluster-binding',
      namespace: '',
      isClusterRoleBinding: true,
      roleRefName: 'ci-runner-cluster-role',
      subjects: [
        {
          kind: 'ServiceAccount',
          name: 'gitlab-runner-sa',
          namespace: 'ci-cd',
        },
      ],
    },
  ];

  return { roles, bindings };
}

export function auditKubernetesRbac(roles: KubernetesRole[]): {
  findings: DangerousRbacFinding[];
  wildcardRolesCount: number;
  podExecRolesCount: number;
  secretsAccessCount: number;
  securityScore: number;
  isCompliant: boolean;
} {
  const findings: DangerousRbacFinding[] = [];
  let wildcardRolesCount = 0;
  let podExecRolesCount = 0;
  let secretsAccessCount = 0;

  for (const role of roles) {
    for (const rule of role.rules) {
      const hasWildcardResource = rule.resources.includes('*');
      const hasWildcardVerb = rule.verbs.includes('*');
      const hasSecretsResource = rule.resources.includes('secrets') || hasWildcardResource;
      const hasPodExec = rule.resources.includes('pods/exec');

      if (hasWildcardResource || hasWildcardVerb) {
        wildcardRolesCount++;
        findings.push({
          roleName: role.name,
          isClusterRole: role.isClusterRole,
          resource: rule.resources.join(', '),
          verb: rule.verbs.join(', '),
          riskSeverity: 'CRITICAL',
          explanationAr: `استخدام علامة النجمة (*) يمنح صلاحيات مطلقة وغير مقيدة على موارد الكلاستر.`,
          explanationEn: `Wildcard (*) grant provides unconstrained authority across cluster resources.`,
          escalationVectorAr: `تمكين المهاجم من سرقة جميع الأسرار، وتعديل أدوار RBAC، والسيطرة الكاملة على الكلاستر.`,
          escalationVectorEn: `Enables credential harvesting, RBAC escalation, and total cluster takeover.`,
        });
      }

      if (hasPodExec) {
        podExecRolesCount++;
        findings.push({
          roleName: role.name,
          isClusterRole: role.isClusterRole,
          resource: 'pods/exec',
          verb: rule.verbs.join(', '),
          riskSeverity: 'CRITICAL',
          explanationAr: `صلاحية pods/exec تسمح بتنفيذ أوامر تفاعلية (Shell) داخل أي حاوية أخرى في الـ Namespace.`,
          explanationEn: `pods/exec permission allows interactive remote code execution inside any co-located pod.`,
          escalationVectorAr: `القفز الجانبي إلى حاويات قواعد البيانات أو حزم الدفع عبر فتح جلسة bash مباشرة.`,
          escalationVectorEn: `Direct lateral hopping into database or payment pods by opening a remote interactive bash terminal.`,
        });
      }

      if (hasSecretsResource && !hasWildcardVerb) {
        secretsAccessCount++;
        if (rule.verbs.includes('get') || rule.verbs.includes('list')) {
          findings.push({
            roleName: role.name,
            isClusterRole: role.isClusterRole,
            resource: 'secrets',
            verb: rule.verbs.join(', '),
            riskSeverity: 'HIGH',
            explanationAr: `منح صلاحية قراءة الأسرار (secrets get/list) لخدمة ويب عادية يعرض مفاتيح التشفير وقواعد البيانات للتسريب.`,
            explanationEn: `Granting raw Secret access to public-facing workloads exposes database credentials and API tokens.`,
            escalationVectorAr: `استخراج مفاتيح API الخاصة بالبنية التحتية واستخدامها خارج الكلاستر.`,
            escalationVectorEn: `Extraction of database passwords and external API tokens for persistent cloud pivoting.`,
          });
        }
      }
    }
  }

  let securityScore = 100;
  securityScore -= wildcardRolesCount * 35;
  securityScore -= podExecRolesCount * 25;
  securityScore -= secretsAccessCount * 10;
  securityScore = Math.max(0, Math.min(100, securityScore));

  return {
    findings,
    wildcardRolesCount,
    podExecRolesCount,
    secretsAccessCount,
    securityScore,
    isCompliant: findings.length === 0,
  };
}
