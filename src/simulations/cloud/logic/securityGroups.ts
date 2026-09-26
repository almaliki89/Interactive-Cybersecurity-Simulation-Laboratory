/**
 * OMEGA V13 — Cloud Security World
 * logic/securityGroups.ts
 *
 * Deterministic Cloud Network Security Layer:
 * Stateful Security Groups (ENI-level) vs Stateless Network ACLs (Subnet-level).
 * Zero non-deterministic functions.
 */

export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'ALL';
export type TrafficDirection = 'INGRESS' | 'EGRESS';

export interface SecurityGroupRule {
  id: string;
  direction: TrafficDirection;
  protocol: ProtocolType;
  portRange: [number, number] | 'ALL'; // e.g. [443, 443] or [80, 80] or [22, 22]
  sourceOrDestination: string; // CIDR (e.g. '0.0.0.0/0', '10.100.1.0/24') or SG ID ('sg-web-alb')
  descriptionEn: string;
  descriptionAr: string;
}

export interface CloudSecurityGroup {
  id: string;
  name: string;
  vpcId: string;
  descriptionEn: string;
  descriptionAr: string;
  ingressRules: SecurityGroupRule[];
  egressRules: SecurityGroupRule[];
  isStateful: true; // Always true for Cloud SGs
}

export interface NetworkAclRule {
  ruleNumber: number; // 1 to 32766, or 32767 for default '*'
  direction: TrafficDirection;
  protocol: ProtocolType;
  action: 'ALLOW' | 'DENY';
  portRange: [number, number] | 'ALL';
  cidrBlock: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface CloudNetworkAcl {
  id: string;
  name: string;
  vpcId: string;
  associatedSubnetIds: string[];
  isStateful: false; // Always false for NACLs
  ingressRules: NetworkAclRule[];
  egressRules: NetworkAclRule[];
}

export interface TrafficPacket {
  direction: TrafficDirection;
  protocol: ProtocolType;
  sourceIp: string;
  sourcePort: number;
  destinationIp: string;
  destinationPort: number;
  isExistingConnection?: boolean; // For stateful tracking
}

export interface EvaluationResult {
  isAllowed: boolean;
  filterType: 'SECURITY_GROUP' | 'NETWORK_ACL';
  matchedRuleId?: string;
  matchedRuleNumber?: number;
  statefulBypass: boolean;
  explanationEn: string;
  explanationAr: string;
}

export function createDefaultSecurityGroups(vpcId = 'vpc-prod-01'): {
  webAlbSg: CloudSecurityGroup;
  appWorkloadSg: CloudSecurityGroup;
  dbTierSg: CloudSecurityGroup;
  vulnerableOpenSshSg: CloudSecurityGroup;
} {
  const webAlbSg: CloudSecurityGroup = {
    id: 'sg-prod-web-alb',
    name: 'Prod-Web-ALB-SG',
    vpcId,
    descriptionEn: 'Public Internet ALB security group. Ingress: 443/80 from 0.0.0.0/0.',
    descriptionAr: 'مجموعة أمان موزع الأحمال العام. الدخول: 443/80 من أي عنوان عام 0.0.0.0/0.',
    isStateful: true,
    ingressRules: [
      {
        id: 'sgr-alb-https',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [443, 443],
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'Allow inbound HTTPS from everywhere',
        descriptionAr: 'السماح بحركة HTTPS الواردة من كل مكان',
      },
      {
        id: 'sgr-alb-http',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [80, 80],
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'Allow inbound HTTP for redirect to HTTPS',
        descriptionAr: 'السماح بحركة HTTP لإعادة التوجيه لـ HTTPS',
      },
    ],
    egressRules: [
      {
        id: 'sgr-alb-egress-app',
        direction: 'EGRESS',
        protocol: 'TCP',
        portRange: [8080, 8080],
        sourceOrDestination: 'sg-prod-app-workload',
        descriptionEn: 'Forward traffic to App workloads on port 8080',
        descriptionAr: 'تمرير الحركة لخوادم التطبيقات على المنفذ 8080',
      },
    ],
  };

  const appWorkloadSg: CloudSecurityGroup = {
    id: 'sg-prod-app-workload',
    name: 'Prod-App-Workload-SG',
    vpcId,
    descriptionEn: 'Private App tier. Ingress strictly limited to source sg-prod-web-alb on port 8080.',
    descriptionAr: 'مجموعة أمان طبقة التطبيقات. الدخول محصور من مجموعة موزع الأحمال فقط على المنفذ 8080.',
    isStateful: true,
    ingressRules: [
      {
        id: 'sgr-app-from-alb',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [8080, 8080],
        sourceOrDestination: 'sg-prod-web-alb',
        descriptionEn: 'Allow inbound HTTP only from ALB security group',
        descriptionAr: 'السماح بالدخول فقط من مجموعة أمان موزع الأحمال',
      },
    ],
    egressRules: [
      {
        id: 'sgr-app-to-db',
        direction: 'EGRESS',
        protocol: 'TCP',
        portRange: [5432, 5432],
        sourceOrDestination: 'sg-prod-db-tier',
        descriptionEn: 'Egress to Postgres database on 5432',
        descriptionAr: 'الخروج لقاعدة بيانات بوستجريس على 5432',
      },
      {
        id: 'sgr-app-https-out',
        direction: 'EGRESS',
        protocol: 'TCP',
        portRange: [443, 443],
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'Allow HTTPS outbound for cloud API calls and updates',
        descriptionAr: 'السماح بالخروج عبر HTTPS لنداءات واجهات السحابة والتحديثات',
      },
    ],
  };

  const dbTierSg: CloudSecurityGroup = {
    id: 'sg-prod-db-tier',
    name: 'Prod-Database-SG',
    vpcId,
    descriptionEn: 'Database security group. Ingress restricted to sg-prod-app-workload on port 5432. Zero outbound.',
    descriptionAr: 'مجموعة أمان قاعدة البيانات. الدخول محصور من خوادم التطبيقات على 5432. لا يوجد خروج.',
    isStateful: true,
    ingressRules: [
      {
        id: 'sgr-db-from-app',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [5432, 5432],
        sourceOrDestination: 'sg-prod-app-workload',
        descriptionEn: 'Allow PostgreSQL connections from App SG only',
        descriptionAr: 'السماح باتصال بوستجريس من مجموعة التطبيقات فقط',
      },
    ],
    egressRules: [], // No outbound needed
  };

  const vulnerableOpenSshSg: CloudSecurityGroup = {
    id: 'sg-vulnerable-dev-open',
    name: 'Vulnerable-Open-Management-SG',
    vpcId,
    descriptionEn: 'CRITICAL MISCONFIGURATION: Exposes administrative SSH (22) and RDP (3389) directly to 0.0.0.0/0.',
    descriptionAr: 'خطأ إعداد جسيم: فتح منافذ الإدارة SSH (22) و RDP (3389) مباشرة لجميع عناوين الإنترنت 0.0.0.0/0.',
    isStateful: true,
    ingressRules: [
      {
        id: 'sgr-open-ssh-all',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [22, 22],
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'CRITICAL: Open SSH to world',
        descriptionAr: 'حرج: فتح SSH للعالم الخارجي',
      },
      {
        id: 'sgr-open-rdp-all',
        direction: 'INGRESS',
        protocol: 'TCP',
        portRange: [3389, 3389],
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'CRITICAL: Open RDP to world',
        descriptionAr: 'حرج: فتح RDP للعالم الخارجي',
      },
    ],
    egressRules: [
      {
        id: 'sgr-open-all-out',
        direction: 'EGRESS',
        protocol: 'ALL',
        portRange: 'ALL',
        sourceOrDestination: '0.0.0.0/0',
        descriptionEn: 'Allow all outbound',
        descriptionAr: 'السماح بجميع الحركات الخارجة',
      },
    ],
  };

  return { webAlbSg, appWorkloadSg, dbTierSg, vulnerableOpenSshSg };
}

export function createDefaultNacl(vpcId = 'vpc-prod-01'): CloudNetworkAcl {
  return {
    id: 'nacl-default-01',
    name: 'Default-Subnet-NACL',
    vpcId,
    associatedSubnetIds: ['sub-public-web-1a', 'sub-private-app-1a'],
    isStateful: false,
    ingressRules: [
      {
        ruleNumber: 100,
        direction: 'INGRESS',
        protocol: 'TCP',
        action: 'ALLOW',
        portRange: [80, 80],
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Allow inbound HTTP',
        descriptionAr: 'سماح بدخول HTTP',
      },
      {
        ruleNumber: 110,
        direction: 'INGRESS',
        protocol: 'TCP',
        action: 'ALLOW',
        portRange: [443, 443],
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Allow inbound HTTPS',
        descriptionAr: 'سماح بدخول HTTPS',
      },
      {
        ruleNumber: 120,
        direction: 'INGRESS',
        protocol: 'TCP',
        action: 'ALLOW',
        portRange: [1024, 65535],
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Allow inbound ephemeral return ports (required for stateless NACL)',
        descriptionAr: 'سماح بمنافذ الاستجابة العابرة (إلزامي للـ NACL غير الحالة)',
      },
      {
        ruleNumber: 32767,
        direction: 'INGRESS',
        protocol: 'ALL',
        action: 'DENY',
        portRange: 'ALL',
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Default Inbound Deny',
        descriptionAr: 'الحظر الافتراضي للدخول',
      },
    ],
    egressRules: [
      {
        ruleNumber: 100,
        direction: 'EGRESS',
        protocol: 'TCP',
        action: 'ALLOW',
        portRange: [1024, 65535],
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Allow outbound ephemeral return traffic to clients',
        descriptionAr: 'سماح بحركة الرد عبر المنافذ العابرة للعملاء',
      },
      {
        ruleNumber: 110,
        direction: 'EGRESS',
        protocol: 'TCP',
        action: 'ALLOW',
        portRange: [443, 443],
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Allow outbound HTTPS for API and updates',
        descriptionAr: 'سماح بالخروج عبر HTTPS للواجهات والتحديثات',
      },
      {
        ruleNumber: 32767,
        direction: 'EGRESS',
        protocol: 'ALL',
        action: 'DENY',
        portRange: 'ALL',
        cidrBlock: '0.0.0.0/0',
        descriptionEn: 'Default Outbound Deny',
        descriptionAr: 'الحظر الافتراضي للخروج',
      },
    ],
  };
}

/**
 * Evaluates stateful Security Group for an incoming or outgoing packet.
 */
export function evaluateSecurityGroup(
  sg: CloudSecurityGroup,
  packet: TrafficPacket,
  attachedSgIdsOfRemote: string[] = []
): EvaluationResult {
  // Stateful connection tracking: if this packet is response to an already allowed connection, allow immediately!
  if (packet.isExistingConnection) {
    return {
      isAllowed: true,
      filterType: 'SECURITY_GROUP',
      statefulBypass: true,
      explanationEn: `Stateful Security Group: Return traffic automatically permitted because the outbound/inbound session was already established.`,
      explanationAr: `مجموعة أمان حالة (Stateful): حركة الاستجابة مسموحة تلقائيًا لأن جلسة الاتصال تأسست مسبقًا.`,
    };
  }

  const rules = packet.direction === 'INGRESS' ? sg.ingressRules : sg.egressRules;
  const targetPort = packet.direction === 'INGRESS' ? packet.destinationPort : packet.destinationPort;

  for (const rule of rules) {
    if (rule.protocol !== 'ALL' && rule.protocol !== packet.protocol) {
      continue;
    }

    // Port check
    if (rule.portRange !== 'ALL') {
      const [start, end] = rule.portRange;
      if (targetPort < start || targetPort > end) {
        continue;
      }
    }

    // Source / Dest check
    if (rule.sourceOrDestination === '0.0.0.0/0') {
      return {
        isAllowed: true,
        filterType: 'SECURITY_GROUP',
        matchedRuleId: rule.id,
        statefulBypass: false,
        explanationEn: `Security Group '${sg.name}': Traffic allowed by rule '${rule.id}' for 0.0.0.0/0 on port ${targetPort}.`,
        explanationAr: `مجموعة الأمان '${sg.name}': مسموح بالقاعدة '${rule.id}' لـ 0.0.0.0/0 على المنفذ ${targetPort}.`,
      };
    }

    if (rule.sourceOrDestination.startsWith('sg-')) {
      if (attachedSgIdsOfRemote.includes(rule.sourceOrDestination)) {
        return {
          isAllowed: true,
          filterType: 'SECURITY_GROUP',
          matchedRuleId: rule.id,
          statefulBypass: false,
          explanationEn: `Security Group '${sg.name}': Allowed via referenced security group '${rule.sourceOrDestination}'.`,
          explanationAr: `مجموعة الأمان '${sg.name}': مسموح عبر إحالة مجموعة الأمان '${rule.sourceOrDestination}'.`,
        };
      }
    }

    // CIDR match (e.g. 10.100.1.0/24)
    const remoteIp = packet.direction === 'INGRESS' ? packet.sourceIp : packet.destinationIp;
    if (remoteIp.startsWith(rule.sourceOrDestination.replace('/24', '').replace('/16', ''))) {
      return {
        isAllowed: true,
        filterType: 'SECURITY_GROUP',
        matchedRuleId: rule.id,
        statefulBypass: false,
        explanationEn: `Security Group '${sg.name}': Allowed from CIDR ${rule.sourceOrDestination}.`,
        explanationAr: `مجموعة الأمان '${sg.name}': مسموح من نطاق CIDR ${rule.sourceOrDestination}.`,
      };
    }
  }

  return {
    isAllowed: false,
    filterType: 'SECURITY_GROUP',
    statefulBypass: false,
    explanationEn: `Security Group '${sg.name}': Denied by default (Security Groups implicitly deny all unlisted traffic).`,
    explanationAr: `مجموعة الأمان '${sg.name}': محظور افتراضيًا (مجموعات الأمان تحظر ضمنيًا أي حركة غير مدرجة).`,
  };
}

/**
 * Evaluates stateless Network ACL (evaluated sequentially by rule number).
 */
export function evaluateNetworkAcl(nacl: CloudNetworkAcl, packet: TrafficPacket): EvaluationResult {
  const rules = (packet.direction === 'INGRESS' ? nacl.ingressRules : nacl.egressRules).slice().sort((a, b) => a.ruleNumber - b.ruleNumber);
  const targetPort = packet.destinationPort;

  for (const rule of rules) {
    if (rule.protocol !== 'ALL' && rule.protocol !== packet.protocol) {
      continue;
    }

    if (rule.portRange !== 'ALL') {
      const [start, end] = rule.portRange;
      if (targetPort < start || targetPort > end) {
        continue;
      }
    }

    // Matched first rule in order!
    const isAllowed = rule.action === 'ALLOW';
    return {
      isAllowed,
      filterType: 'NETWORK_ACL',
      matchedRuleNumber: rule.ruleNumber,
      statefulBypass: false,
      explanationEn: `Network ACL '${nacl.name}' rule #${rule.ruleNumber}: ${rule.action} traffic on port ${targetPort}. Stateless: does not track connection state.`,
      explanationAr: `قائمة تحكم الشبكة '${nacl.name}' قاعدة #${rule.ruleNumber}: ${rule.action === 'ALLOW' ? 'سماح' : 'حظر'} على المنفذ ${targetPort}. غير حالة (Stateless).`,
    };
  }

  return {
    isAllowed: false,
    filterType: 'NETWORK_ACL',
    matchedRuleNumber: 32767,
    statefulBypass: false,
    explanationEn: `Network ACL default rule (*): Denied.`,
    explanationAr: `قاعدة قائمة تحكم الشبكة الافتراضية (*): محظور.`,
  };
}
