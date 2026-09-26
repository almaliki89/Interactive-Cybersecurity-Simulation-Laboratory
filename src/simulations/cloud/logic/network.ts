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
