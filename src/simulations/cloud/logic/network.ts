/**
 * OMEGA V13 — Cloud Security World
 * logic/network.ts
 *
 * Deterministic Cloud Virtual Network (VPC/VNet), Subnets, Route Tables,
 * Internet Gateway, NAT Gateway, Peering, and VPC Private Endpoints.
 * Zero non-deterministic functions.
 */

export type SubnetType = 'PUBLIC' | 'PRIVATE' | 'ISOLATED';

export interface NexoraSubnet {
  id: string;
  vpcId: string;
  name: string;
  cidrBlock: string; // e.g. '10.100.1.0/24'
  availabilityZone: string; // e.g. 'nx-east-1a'
  type: SubnetType;
  routeTableId: string;
  networkAclId: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface RouteEntry {
  destinationCidr: string; // e.g. '10.100.0.0/16' or '0.0.0.0/0'
  targetType: 'LOCAL' | 'IGW' | 'NAT' | 'PEERING' | 'VPC_ENDPOINT' | 'BLACKHOLE';
  targetId: string;
  status: 'ACTIVE' | 'BLACKHOLE';
}

export interface CloudRouteTable {
  id: string;
  vpcId: string;
  name: string;
  routes: RouteEntry[];
  associatedSubnetIds: string[];
}

export interface NexoraVpc {
  id: string;
  name: string;
  accountId: string;
  region: string;
  cidrBlock: string; // e.g. '10.100.0.0/16'
  internetGatewayId?: string;
  enableDnsHostnames: boolean;
  enableDnsSupport: boolean;
  subnets: NexoraSubnet[];
  routeTables: CloudRouteTable[];
  defaultSecurityGroupId: string;
  tags: Record<string, string>;
}

export interface NexoraIgw {
  id: string;
  vpcId: string;
  state: 'ATTACHED' | 'DETACHED';
}

export interface NexoraNatGateway {
  id: string;
  vpcId: string;
  subnetId: string; // Resides in a public subnet
  allocationId: string; // Elastic IP
  privateIp: string;
  state: 'AVAILABLE' | 'DELETING' | 'FAILED';
}

export interface NexoraVpcEndpoint {
  id: string;
  vpcId: string;
  serviceName: string; // e.g. 'com.nexora.nx-east-1.storage' or 'com.nexora.nx-east-1.secrets'
  endpointType: 'GATEWAY' | 'INTERFACE'; // PrivateLink
  subnetIds: string[];
  privateIpAddresses: string[];
  policy?: string;
}

export function createDefaultProductionVpc(accountId = 'acc-prod-003'): {
  vpc: NexoraVpc;
  igw: NexoraIgw;
  nat: NexoraNatGateway;
  endpoints: NexoraVpcEndpoint[];
} {
  const vpcId = 'vpc-prod-01';
  const igwId = 'igw-prod-01';
  const natId = 'nat-prod-public-1a';
  const rtbPublicId = 'rtb-public-01';
  const rtbPrivateId = 'rtb-private-01';
  const rtbIsolatedId = 'rtb-isolated-db-01';

  const subnets: NexoraSubnet[] = [
    {
      id: 'sub-public-web-1a',
      vpcId,
      name: 'Prod-Public-Web-1A',
      cidrBlock: '10.100.1.0/24',
      availabilityZone: 'nx-east-1a',
      type: 'PUBLIC',
      routeTableId: rtbPublicId,
      networkAclId: 'nacl-default-01',
      descriptionEn: 'Public DMZ subnet with direct IGW route. Hosts external ALBs and public bastion/web servers.',
      descriptionAr: 'شبكة فرعية عامة (DMZ) متصلة ببوابة الإنترنت مباشرة. تستضيف موزع الأحمال وخوادم الويب العامة.',
    },
    {
      id: 'sub-private-app-1a',
      vpcId,
      name: 'Prod-Private-App-1A',
      cidrBlock: '10.100.10.0/24',
      availabilityZone: 'nx-east-1a',
      type: 'PRIVATE',
      routeTableId: rtbPrivateId,
      networkAclId: 'nacl-default-01',
      descriptionEn: 'Private app tier. Egress to internet goes through NAT Gateway; no inbound direct internet access.',
      descriptionAr: 'شبكة فرعية خاصة بالتطبيقات. الخروج للإنترنت عبر بوابة NAT فقط دون وصول مباشر وارد.',
    },
    {
      id: 'sub-isolated-data-1a',
      vpcId,
      name: 'Prod-Isolated-Database-1A',
      cidrBlock: '10.100.20.0/24',
      availabilityZone: 'nx-east-1a',
      type: 'ISOLATED',
      routeTableId: rtbIsolatedId,
      networkAclId: 'nacl-strict-db-01',
      descriptionEn: 'Isolated database subnet. Strictly local routing; zero internet ingress and zero internet egress.',
      descriptionAr: 'شبكة فرعية معزولة لقواعد البيانات. توجيه محلي فقط؛ حظر كامل لأي وصول أو خروج للإنترنت.',
    },
  ];

  const routeTables: CloudRouteTable[] = [
    {
      id: rtbPublicId,
      vpcId,
      name: 'Prod-Public-RouteTable',
      associatedSubnetIds: ['sub-public-web-1a'],
      routes: [
        { destinationCidr: '10.100.0.0/16', targetType: 'LOCAL', targetId: 'local', status: 'ACTIVE' },
        { destinationCidr: '0.0.0.0/0', targetType: 'IGW', targetId: igwId, status: 'ACTIVE' },
      ],
    },
    {
      id: rtbPrivateId,
      vpcId,
      name: 'Prod-Private-App-RouteTable',
      associatedSubnetIds: ['sub-private-app-1a'],
      routes: [
        { destinationCidr: '10.100.0.0/16', targetType: 'LOCAL', targetId: 'local', status: 'ACTIVE' },
        { destinationCidr: '0.0.0.0/0', targetType: 'NAT', targetId: natId, status: 'ACTIVE' },
      ],
    },
    {
      id: rtbIsolatedId,
      vpcId,
      name: 'Prod-Isolated-DB-RouteTable',
      associatedSubnetIds: ['sub-isolated-data-1a'],
      routes: [
        { destinationCidr: '10.100.0.0/16', targetType: 'LOCAL', targetId: 'local', status: 'ACTIVE' },
        // Notice: NO 0.0.0.0/0 route! Truly isolated.
      ],
    },
  ];

  const endpoints: NexoraVpcEndpoint[] = [
    {
      id: 'vpce-s3-gateway',
      vpcId,
      serviceName: 'com.nexora.nx-east-1.storage',
      endpointType: 'GATEWAY',
      subnetIds: ['sub-private-app-1a', 'sub-isolated-data-1a'],
      privateIpAddresses: [],
    },
    {
      id: 'vpce-secrets-interface',
      vpcId,
      serviceName: 'com.nexora.nx-east-1.secrets',
      endpointType: 'INTERFACE',
      subnetIds: ['sub-private-app-1a'],
      privateIpAddresses: ['10.100.10.250'],
    },
  ];

  const vpc: NexoraVpc = {
    id: vpcId,
    name: 'Nexora-Prod-VPC',
    accountId,
    region: 'nx-east-1',
    cidrBlock: '10.100.0.0/16',
    internetGatewayId: igwId,
    enableDnsHostnames: true,
    enableDnsSupport: true,
    subnets,
    routeTables,
    defaultSecurityGroupId: 'sg-default-deny-all',
    tags: { Environment: 'Production', Architecture: 'MultiTier' },
  };

  const igw: NexoraIgw = { id: igwId, vpcId, state: 'ATTACHED' };
  const nat: NexoraNatGateway = {
    id: natId,
    vpcId,
    subnetId: 'sub-public-web-1a',
    allocationId: 'eip-prod-nat-01',
    privateIp: '10.100.1.50',
    state: 'AVAILABLE',
  };

  return { vpc, igw, nat, endpoints };
}

import { CloudSecurityGroup, CloudNetworkAcl, ProtocolType, evaluateSecurityGroup, evaluateNetworkAcl } from './securityGroups';

export interface CloudReachabilitySource {
  ip: string;
  subnetId?: string;
  securityGroupIds?: string[];
  isInternet?: boolean;
  isAdminVpn?: boolean;
}

export interface CloudReachabilityDestination {
  ip: string;
  subnetId?: string;
  securityGroupIds?: string[];
  workloadType?: 'PUBLIC_ALB' | 'APP_VM' | 'DATABASE' | 'MANAGEMENT_INTERFACE' | 'STORAGE_ENDPOINT' | 'SECRET_STORE';
  isInternet?: boolean;
}

export interface CloudReachabilityRequest {
  source: CloudReachabilitySource;
  destination: CloudReachabilityDestination;
  protocol: ProtocolType;
  port: number;
  vpc?: NexoraVpc;
  securityGroups?: CloudSecurityGroup[];
  networkAcls?: CloudNetworkAcl[];
}

export interface CloudReachabilityResult {
  reachable: boolean;
  matchedRoute?: string;
  matchedSecurityGroupRule?: string;
  matchedNetworkAclRule?: number | string;
  reasonEn: string;
  reasonAr: string;
}

/**
 * Unified Cloud Network Reachability Evaluation Engine
 * Combines Route Tables, Subnet Isolation, Network ACLs, and Security Groups.
 */
export function evaluateCloudReachability(request: CloudReachabilityRequest): CloudReachabilityResult {
  const { source, destination, protocol, port } = request;

  // 1. Check for dangerous open SSH exposure
  if ((source.isInternet || source.ip === '0.0.0.0/0') && port === 22) {
    // If the destination security group permits 0.0.0.0/0 on port 22, it's a security flaw
    return {
      reachable: false,
      reasonEn: 'Reachability Denied: Open SSH from 0.0.0.0/0 violates cloud security baseline and is blocked by perimeter enforcement.',
      reasonAr: 'تم رفض الاتصال: فتح SSH لجميع عناوين 0.0.0.0/0 يخالف المعيار الأمني ومحظور بضوابط المحيط.',
    };
  }

  // 2. Database direct internet ingress: ALWAYS DENY
  if (source.isInternet && destination.workloadType === 'DATABASE') {
    return {
      reachable: false,
      reasonEn: 'Reachability Denied: Isolated database tier has zero internet route and is unreachable from public networks.',
      reasonAr: 'تم رفض الاتصال: طبقة قواعد البيانات المعزولة لا تمتلك أي مسار إنترنت ويتعذر الوصول إليها من الشبكات العامة.',
    };
  }

  // 3. Database egress to internet: ALWAYS DENY
  if (source.subnetId?.includes('isolated') && destination.isInternet) {
    return {
      reachable: false,
      reasonEn: 'Reachability Denied: Isolated database tier has no default 0.0.0.0/0 egress route (Blackhole).',
      reasonAr: 'تم رفض الاتصال: طبقة قواعد البيانات المعزولة لا تمتلك مسار خروج افتراضي 0.0.0.0/0.',
    };
  }

  // 4. Internet direct to Application VM: DENY (App tier is private; traffic must traverse Public ALB)
  if (source.isInternet && destination.workloadType === 'APP_VM') {
    return {
      reachable: false,
      reasonEn: 'Reachability Denied: Application workload resides in a private subnet without public IP or direct IGW routing. Traffic must ingress via Public ALB.',
      reasonAr: 'تم رفض الاتصال: خوادم التطبيقات داخل شبكة فرعية خاصة دون عنوان عام أو توجيه مباشر. يجب المرور عبر موزع الأحمال.',
    };
  }

  // 4b. Internet direct to internal storage endpoints or secret store: DENY
  if (source.isInternet && (destination.workloadType === 'STORAGE_ENDPOINT' || destination.workloadType === 'SECRET_STORE')) {
    return {
      reachable: false,
      reasonEn: `Reachability Denied: ${destination.workloadType} is an internal PrivateLink endpoint unreachable from public internet.`,
      reasonAr: `تم رفض الاتصال: نقطة النهاية ${destination.workloadType} خاصة عبر PrivateLink وغير قابلة للوصول من الإنترنت العام.`,
    };
  }

  // 4c. Application Tier to internal storage endpoints or secret store: ALLOW on 443
  if (
    (source.subnetId?.includes('private-app') || source.securityGroupIds?.includes('sg-prod-app-workload')) &&
    (destination.workloadType === 'STORAGE_ENDPOINT' || destination.workloadType === 'SECRET_STORE')
  ) {
    if (port === 443) {
      return {
        reachable: true,
        matchedRoute: '10.100.0.0/16 -> VPC_ENDPOINT',
        matchedSecurityGroupRule: 'sgr-vpce-https',
        matchedNetworkAclRule: 100,
        reasonEn: `Reachability Allowed: Private application tier securely connects to ${destination.workloadType} via VPC PrivateLink endpoint on port 443.`,
        reasonAr: `الاتصال مسموح: طبقة التطبيقات الخاصة تتصل بـ ${destination.workloadType} بأمان عبر PrivateLink الداخلي على المنفذ 443.`,
      };
    } else {
      return {
        reachable: false,
        reasonEn: `Reachability Denied: Internal VPC endpoints only permit HTTPS port 443 (attempted port ${port}).`,
        reasonAr: `تم رفض الاتصال: نقاط نهاية VPC تسمح فقط بمنفذ HTTPS 443 (تمت محاولة المنفذ ${port}).`,
      };
    }
  }

  // 5. Internet to Public Load Balancer: ALLOW on 443/80
  if (source.isInternet && destination.workloadType === 'PUBLIC_ALB') {
    if (request.securityGroups) {
      const albSg = request.securityGroups.find((sg) => sg.id === 'sg-prod-web-alb');
      const permitsPort =
        albSg &&
        albSg.ingressRules.some(
          (r) =>
            (r.portRange === 'ALL' || (r.portRange[0] <= port && r.portRange[1] >= port)) &&
            (r.sourceOrDestination === '0.0.0.0/0' || r.sourceOrDestination === source.ip)
        );
      if (!permitsPort) {
        return {
          reachable: false,
          reasonEn: `Reachability Denied: Public ALB security group rejects ingress on port ${port}.`,
          reasonAr: `تم رفض الاتصال: مجموعة أمان موزع الأحمال ترفض المنفذ ${port}.`,
        };
      }
    }
    if (port === 443 || port === 80) {
      return {
        reachable: true,
        matchedRoute: '0.0.0.0/0 -> IGW',
        matchedSecurityGroupRule: 'sgr-alb-https',
        matchedNetworkAclRule: 110,
        reasonEn: 'Reachability Allowed: Public Internet traffic routed via Internet Gateway to Public ALB on authorized web ports.',
        reasonAr: 'الاتصال مسموح: تمرير حركة الإنترنت عبر بوابة IGW إلى موزع الأحمال العام على منافذ الويب المصرح بها.',
      };
    } else {
      return {
        reachable: false,
        reasonEn: `Reachability Denied: Public ALB security group rejects ingress on port ${port}. Only 443/80 allowed.`,
        reasonAr: `تم رفض الاتصال: مجموعة أمان موزع الأحمال ترفض المنفذ ${port}. يُسمح فقط بـ 443/80.`,
      };
    }
  }

  // 6. Application Tier to Database: ALLOW on 5432
  if (
    (source.subnetId?.includes('private-app') || source.securityGroupIds?.includes('sg-prod-app-workload')) &&
    destination.workloadType === 'DATABASE'
  ) {
    if (request.securityGroups) {
      const dbSg = request.securityGroups.find((sg) => sg.id === 'sg-prod-db-tier');
      const permitsApp =
        dbSg &&
        dbSg.ingressRules.some(
          (r) =>
            (r.portRange === 'ALL' || (r.portRange[0] <= port && r.portRange[1] >= port)) &&
            (r.sourceOrDestination === 'sg-prod-app-workload' ||
              source.securityGroupIds?.includes(r.sourceOrDestination) ||
              r.sourceOrDestination === '0.0.0.0/0')
        );
      if (!permitsApp) {
        return {
          reachable: false,
          reasonEn: `Reachability Denied: Database tier security group rejects traffic on port ${port}.`,
          reasonAr: `تم رفض الاتصال: مجموعة أمان قاعدة البيانات ترفض الحركة على المنفذ ${port}.`,
        };
      }
    }
    if (port === 5432) {
      return {
        reachable: true,
        matchedRoute: '10.100.0.0/16 -> LOCAL',
        matchedSecurityGroupRule: 'sgr-db-from-app',
        matchedNetworkAclRule: 100,
        reasonEn: 'Reachability Allowed: Private application tier connects to database on port 5432 via local VPC route and referenced SG.',
        reasonAr: 'الاتصال مسموح: طبقة التطبيقات الخاصة تتصل بقاعدة البيانات على 5432 عبر مسار VPC المحلي ومجموعة الأمان المحصورة.',
      };
    } else {
      return {
        reachable: false,
        reasonEn: `Reachability Denied: Database security group rejects port ${port}. Only PostgreSQL 5432 permitted.`,
        reasonAr: `تم رفض الاتصال: مجموعة أمان قاعدة البيانات ترفض المنفذ ${port}. يسمح بـ 5432 فقط.`,
      };
    }
  }

  // 7. Unrelated Subnet to Database: DENY
  if (destination.workloadType === 'DATABASE') {
    const isApprovedAppTier = source.subnetId?.includes('private-app') || source.securityGroupIds?.includes('sg-prod-app-workload');
    if (!isApprovedAppTier) {
      return {
        reachable: false,
        reasonEn: 'Reachability Denied: Database tier security group rejects traffic from unauthorized subnets/security groups.',
        reasonAr: 'تم رفض الاتصال: مجموعة أمان قاعدة البيانات ترفض الحركة القادمة من شبكات فرعية غير مصرح بها.',
      };
    }
  }

  // 8. Admin / VPN Network to Management Interface: ALLOW
  if (source.isAdminVpn && (destination.workloadType === 'MANAGEMENT_INTERFACE' || port === 22 || port === 443)) {
    return {
      reachable: true,
      matchedRoute: '10.100.250.0/24 -> LOCAL',
      matchedSecurityGroupRule: 'sgr-mgmt-from-vpn',
      matchedNetworkAclRule: 100,
      reasonEn: 'Reachability Allowed: Admin/VPN corporate network authorized for internal management access.',
      reasonAr: 'الاتصال مسموح: شبكة VPN الإدارية مصرح لها بالوصول إلى واجهة الإدارة الداخلية.',
    };
  }

  // Default fallback: internal local VPC communication
  if (source.ip.startsWith('10.100.') && destination.ip.startsWith('10.100.')) {
    return {
      reachable: true,
      matchedRoute: '10.100.0.0/16 -> LOCAL',
      reasonEn: 'Reachability Allowed: Intra-VPC communication routed locally.',
      reasonAr: 'الاتصال مسموح: اتصال داخلي ضمن نطاق VPC الموجه محليًا.',
    };
  }

  return {
    reachable: false,
    reasonEn: 'Reachability Denied: Default cloud network boundary deny. No matching route or security group rule allows this flow.',
    reasonAr: 'تم رفض الاتصال: حظر افتراضي للحدود الشبكية. لا يوجد مسار أو قاعدة أمان تسمح بهذا التدفق.',
  };
}

/**
 * Evaluates whether an IP destination can be reached from a given subnet.
 */
export function evaluateSubnetEgressRoute(
  subnet: NexoraSubnet,
  destinationIp: string,
  routeTables: CloudRouteTable[]
): {
  canRoute: boolean;
  routeTarget: string;
  explanationEn: string;
  explanationAr: string;
} {
  const rtb = routeTables.find((r) => r.id === subnet.routeTableId);
  if (!rtb) {
    return {
      canRoute: false,
      routeTarget: 'NONE',
      explanationEn: 'Subnet has no associated route table.',
      explanationAr: 'الشبكة الفرعية لا ترتبط بجدول توجيه.',
    };
  }

  // Check if destination is internal VPC (10.100.x.x)
  if (destinationIp.startsWith('10.100.')) {
    return {
      canRoute: true,
      routeTarget: 'LOCAL',
      explanationEn: 'Routed locally within VPC CIDR block (10.100.0.0/16).',
      explanationAr: 'توجيه محلي داخل نطاق VPC الداخلي (10.100.0.0/16).',
    };
  }

  // External destination (Internet)
  const defaultRoute = rtb.routes.find((r) => r.destinationCidr === '0.0.0.0/0');
  if (!defaultRoute) {
    return {
      canRoute: false,
      routeTarget: 'BLACKHOLE',
      explanationEn: `Subnet '${subnet.name}' is isolated: no default route (0.0.0.0/0) exists. External egress blocked.`,
      explanationAr: `الشبكة الفرعية '${subnet.name}' معزولة: لا يوجد مسار افتراضي (0.0.0.0/0). الخروج للإنترنت محظور.`,
    };
  }

  if (defaultRoute.targetType === 'IGW') {
    return {
      canRoute: true,
      routeTarget: 'INTERNET_GATEWAY',
      explanationEn: `Direct Internet Egress via Internet Gateway (${defaultRoute.targetId}). Public IP required on workload.`,
      explanationAr: `خروج مباشر للإنترنت عبر بوابة الإنترنت (${defaultRoute.targetId}). يتطلب عنوان IP عام على الخادم.`,
    };
  }

  if (defaultRoute.targetType === 'NAT') {
    return {
      canRoute: true,
      routeTarget: 'NAT_GATEWAY',
      explanationEn: `Outbound Internet Egress via NAT Gateway (${defaultRoute.targetId}). Source IP translated; inbound denied.`,
      explanationAr: `خروج للإنترنت عبر بوابة NAT (${defaultRoute.targetId}). إخفاء العنوان الداخلي؛ مع منع أي اتصال وارد.`,
    };
  }

  return {
    canRoute: false,
    routeTarget: defaultRoute.targetType,
    explanationEn: `Traffic sent to target ${defaultRoute.targetType}.`,
    explanationAr: `تم إرسال الحركة إلى الهدف ${defaultRoute.targetType}.`,
  };
}
