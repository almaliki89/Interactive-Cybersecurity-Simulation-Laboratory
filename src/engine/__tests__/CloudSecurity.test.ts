/**
 * OMEGA V13 — Cloud Security World Unit Tests
 * CloudSecurity.test.ts
 *
 * Exhaustive deterministic test suite validating all Cloud Security logic modules:
 * Accounts, IAM, Authorization (Deny > Allow > Implicit Deny), Roles, Network,
 * Security Groups vs NACLs, Storage BPA, Secrets & Leaks, IMDSv1 vs IMDSv2,
 * Compute, Logging digests, Misconfigurations, Detections, and Hardening.
 */

import { describe, it, expect } from 'vitest';
import {
  createDefaultNexoraOrganization,
  evaluateAccountIsolation,
} from '../../simulations/cloud/logic/accounts';
import {
  createDefaultCloudIdentities,
  getPrincipalEffectivePolicies,
} from '../../simulations/cloud/logic/identity';
import {
  ALL_PRESET_POLICIES,
  ADMIN_ACCESS_POLICY,
  LEAST_PRIVILEGE_FINANCE_READER_POLICY,
  STORAGE_FULL_ACCESS_POLICY,
  validatePolicySyntax,
} from '../../simulations/cloud/logic/policies';
import {
  evaluateCloudAuthorization,
  matchWildcard,
  CloudAuthRequest,
} from '../../simulations/cloud/logic/authorization';
import {
  createDefaultRoles,
  evaluateRoleAssumption,
} from '../../simulations/cloud/logic/roles';
import {
  createDefaultProductionVpc,
  evaluateSubnetEgressRoute,
  evaluateCloudReachability,
} from '../../simulations/cloud/logic/network';
import {
  validateCloudArchitecture,
} from '../../simulations/cloud/logic/architecture';
import {
  createDefaultSecurityGroups,
  createDefaultNacl,
  evaluateSecurityGroup,
  evaluateNetworkAcl,
} from '../../simulations/cloud/logic/securityGroups';
import {
  createDefaultStorageBuckets,
  evaluateBucketPublicExposure,
} from '../../simulations/cloud/logic/storage';
import {
  createDefaultSecrets,
  scanForCleartextSecrets,
} from '../../simulations/cloud/logic/secrets';
import {
  ImdsEngine,
  ImdsConfig,
} from '../../simulations/cloud/logic/workloadIdentity';
import {
  createDefaultComputeInstances,
  isolateComputeInstance,
  enforceImdsv2OnInstance,
} from '../../simulations/cloud/logic/compute';
import {
  validateLogFileDigests,
  createDefaultTrailConfig,
  CloudAuditLogEntry,
} from '../../simulations/cloud/logic/logging';
import {
  scanCloudMisconfigurations,
  CloudInfrastructureState,
} from '../../simulations/cloud/logic/misconfigurations';
import {
  evaluateCloudDetections,
} from '../../simulations/cloud/logic/detection';
import {
  createDefaultCloudIncident,
  evaluateIncidentProgress,
} from '../../simulations/cloud/logic/incidents';
import {
  calculateCspmBenchmark,
  validateCloudMasterChallenge,
  CloudMasterChallengeState,
  createDefaultCloudMasterChallengeState,
} from '../../simulations/cloud/logic/hardening';

describe('1. Cloud Organization & Multi-Account Blast Radius', () => {
  const org = createDefaultNexoraOrganization();

  it('creates complete organization with root, security, audit, prod, and dev accounts', () => {
    expect(org.accounts.length).toBe(6);
    expect(org.accounts.some((a) => a.environment === 'PROD')).toBe(true);
    expect(org.accounts.some((a) => a.environment === 'DEV')).toBe(true);
    expect(org.accounts.some((a) => a.environment === 'SECURITY')).toBe(true);
  });

  it('enforces strong isolation boundary between DEV and PROD', () => {
    const devAcc = org.accounts.find((a) => a.environment === 'DEV')!;
    const prodAcc = org.accounts.find((a) => a.environment === 'PROD')!;
    const isolation = evaluateAccountIsolation(devAcc.id, prodAcc.id, org);

    expect(isolation.isIsolated).toBe(true);
    expect(isolation.isolationBoundary).toBe('STRONG');
  });

  it('identifies unconstrained blast radius within the same account', () => {
    const prodAcc = org.accounts.find((a) => a.environment === 'PROD')!;
    const isolation = evaluateAccountIsolation(prodAcc.id, prodAcc.id, org);

    expect(isolation.isIsolated).toBe(false);
    expect(isolation.isolationBoundary).toBe('SAME_ACCOUNT');
  });
});

describe('2. Cloud Policy Evaluation: Explicit Deny > Allow > Implicit Deny', () => {
  it('wildcard matching handles full wildcard, prefix, and exact matches', () => {
    expect(matchWildcard('*', 'anything')).toBe(true);
    expect(matchWildcard('storage:*', 'storage:GetObject')).toBe(true);
    expect(matchWildcard('storage:*', 'compute:StartInstances')).toBe(false);
    expect(matchWildcard('finance-reports/*', 'finance-reports/Q3.pdf')).toBe(true);
    expect(matchWildcard('finance-reports/*', 'marketing/logo.png')).toBe(false);
  });

  it('evaluates ALLOW when matching statement allows action and resource with valid TLS', () => {
    const request: CloudAuthRequest = {
      principalArn: 'ncrn:nexora:iam::acc-prod-003:user/sara',
      action: 'storage:GetObject',
      resource: 'finance-reports/Q3.pdf',
      context: { secureTransport: true, mfaActive: true },
    };

    const decision = evaluateCloudAuthorization(request, [LEAST_PRIVILEGE_FINANCE_READER_POLICY]);
    expect(decision.decision).toBe('ALLOW');
    expect(decision.isAllowed).toBe(true);
  });

  it('EXPLICIT DENY overrides ALLOW when insecure HTTP transport is used', () => {
    const request: CloudAuthRequest = {
      principalArn: 'ncrn:nexora:iam::acc-prod-003:user/sara',
      action: 'storage:GetObject',
      resource: 'finance-reports/Q3.pdf',
      context: { secureTransport: false, mfaActive: true }, // Insecure!
    };

    const decision = evaluateCloudAuthorization(request, [LEAST_PRIVILEGE_FINANCE_READER_POLICY]);
    expect(decision.decision).toBe('EXPLICIT_DENY');
    expect(decision.isAllowed).toBe(false);
    expect(decision.matchedDenyStatementId).toBe('Stmt-Deny-Insecure-Http');
  });

  it('defaults to IMPLICIT DENY when no statement grants permission', () => {
    const request: CloudAuthRequest = {
      principalArn: 'ncrn:nexora:iam::acc-prod-003:user/sara',
      action: 'compute:TerminateInstances',
      resource: 'instance/inst-prod-01',
      context: { secureTransport: true },
    };

    const decision = evaluateCloudAuthorization(request, [LEAST_PRIVILEGE_FINANCE_READER_POLICY]);
    expect(decision.decision).toBe('IMPLICIT_DENY');
    expect(decision.isAllowed).toBe(false);
  });

  it('detects wildcard admin anti-pattern in policy syntax validator', () => {
    const syntax = validatePolicySyntax(ADMIN_ACCESS_POLICY);
    expect(syntax.hasWildcardAction).toBe(true);
    expect(syntax.hasWildcardResource).toBe(true);
    expect(syntax.hasOverlyPermissiveAdmin).toBe(true);
  });
});

describe('3. Role Assumption & Trust Policy Engine', () => {
  const roles = createDefaultRoles();
  const identities = createDefaultCloudIdentities();

  const financeReaderRole = roles.find((r) => r.id === 'rol-finance-reader')!;
  const saraUser = identities.principals.find((p) => p.name === 'sara')!;
  const alexUser = identities.principals.find((p) => p.name === 'alex')!;

  it('allows authorized user with MFA to assume role and receive temporary STS credentials', () => {
    const res = evaluateRoleAssumption(saraUser, financeReaderRole, 100, { isMfaActive: true });
    expect(res.isSuccess).toBe(true);
    expect(res.credentials).toBeDefined();
    expect(res.credentials?.accessKeyId.startsWith('NXASIA')).toBe(true);
    expect(res.credentials?.sessionToken).toContain('tok_');
    expect(res.credentials?.expirationVirtualTime).toBeGreaterThan(100);
  });

  it('denies role assumption when required MFA condition is missing', () => {
    const res = evaluateRoleAssumption(saraUser, financeReaderRole, 100, { isMfaActive: false });
    expect(res.isSuccess).toBe(false);
    expect(res.denialReasonEn).toContain('MFA');
  });

  it('denies role assumption when principal is not trusted in AssumeRolePolicy', () => {
    const res = evaluateRoleAssumption(alexUser, financeReaderRole, 100, { isMfaActive: true });
    expect(res.isSuccess).toBe(false);
    expect(res.denialReasonEn).toContain('Implicit DENY');
  });
});

describe('4. VPC Routing & Subnet Segmentation', () => {
  const net = createDefaultProductionVpc();

  it('routes traffic within internal VPC CIDR block locally', () => {
    const pubSubnet = net.vpc.subnets.find((s) => s.type === 'PUBLIC')!;
    const res = evaluateSubnetEgressRoute(pubSubnet, '10.100.10.25', net.vpc.routeTables);
    expect(res.canRoute).toBe(true);
    expect(res.routeTarget).toBe('LOCAL');
  });

  it('routes public subnet external traffic to Internet Gateway (IGW)', () => {
    const pubSubnet = net.vpc.subnets.find((s) => s.type === 'PUBLIC')!;
    const res = evaluateSubnetEgressRoute(pubSubnet, '8.8.8.8', net.vpc.routeTables);
    expect(res.canRoute).toBe(true);
    expect(res.routeTarget).toBe('INTERNET_GATEWAY');
  });

  it('routes private subnet external traffic to NAT Gateway', () => {
    const privSubnet = net.vpc.subnets.find((s) => s.type === 'PRIVATE')!;
    const res = evaluateSubnetEgressRoute(privSubnet, '8.8.8.8', net.vpc.routeTables);
    expect(res.canRoute).toBe(true);
    expect(res.routeTarget).toBe('NAT_GATEWAY');
  });

  it('blocks external egress from isolated database subnet completely', () => {
    const isolatedSubnet = net.vpc.subnets.find((s) => s.type === 'ISOLATED')!;
    const res = evaluateSubnetEgressRoute(isolatedSubnet, '8.8.8.8', net.vpc.routeTables);
    expect(res.canRoute).toBe(false);
    expect(res.routeTarget).toBe('BLACKHOLE');
  });
});

describe('5. Stateful Security Groups vs Stateless NACLs', () => {
  const sgs = createDefaultSecurityGroups();
  const nacl = createDefaultNacl();

  it('permits inbound HTTPS in web ALB security group', () => {
    const res = evaluateSecurityGroup(sgs.webAlbSg, {
      direction: 'INGRESS',
      protocol: 'TCP',
      sourceIp: '203.0.113.10',
      sourcePort: 54100,
      destinationIp: '10.100.1.10',
      destinationPort: 443,
    });
    expect(res.isAllowed).toBe(true);
    expect(res.filterType).toBe('SECURITY_GROUP');
  });

  it('automatically permits return traffic in stateful Security Group regardless of outbound rules', () => {
    const res = evaluateSecurityGroup(sgs.webAlbSg, {
      direction: 'EGRESS',
      protocol: 'TCP',
      sourceIp: '10.100.1.10',
      sourcePort: 443,
      destinationIp: '203.0.113.10',
      destinationPort: 54100,
      isExistingConnection: true, // Stateful return packet!
    });
    expect(res.isAllowed).toBe(true);
    expect(res.statefulBypass).toBe(true);
  });

  it('stateless NACL evaluates sequential rules and allows inbound ephemeral return traffic', () => {
    const res = evaluateNetworkAcl(nacl, {
      direction: 'INGRESS',
      protocol: 'TCP',
      sourceIp: '198.51.100.1',
      sourcePort: 443,
      destinationIp: '10.100.1.10',
      destinationPort: 55000, // Ephemeral return port
    });
    expect(res.isAllowed).toBe(true);
    expect(res.matchedRuleNumber).toBe(120);
  });
});

describe('6. Cloud Storage Security & Block Public Access', () => {
  const buckets = createDefaultStorageBuckets();
  const financeVault = buckets.find((b) => b.name === 'nexora-finance-vault-prod')!;
  const rawBucket = buckets.find((b) => b.name === 'nexora-analytics-raw-bucket')!;

  it('verifies hardened storage vault has zero public exposure', () => {
    const exp = evaluateBucketPublicExposure(financeVault);
    expect(exp.isPublic).toBe(false);
    expect(exp.riskSeverity).toBe('SAFE');
  });

  it('identifies critical public exposure when Block Public Access is disabled', () => {
    const exp = evaluateBucketPublicExposure(rawBucket);
    expect(exp.isPublic).toBe(true);
    expect(exp.riskSeverity).toBe('CRITICAL');
  });
});

describe('7. Workload Identity & IMDSv1 vs IMDSv2', () => {
  const engine = new ImdsEngine();

  it('IMDSv1 dispenses temporary role credentials via direct token-less GET (SSRF Vulnerable)', () => {
    const v1Config: ImdsConfig = {
      version: 'v1',
      httpTokens: 'optional',
      httpPutResponseHopLimit: 2,
      httpEndpoint: 'enabled',
    };

    const res = engine.evaluateRequest(v1Config, {
      method: 'GET',
      path: '/latest/meta-data/iam/security-credentials/NexoraAppWorkloadInstanceProfileRole',
      headers: {},
      hopCount: 2, // Traversing SSRF proxy
      virtualTime: 100,
    });

    expect(res.statusCode).toBe(200);
    expect(res.isSsrfExploitable).toBe(true);
    expect((res.body as any).AccessKeyId).toBeDefined();
  });

  it('IMDSv2 blocks token-less GET with 401 Unauthorized', () => {
    const v2Config: ImdsConfig = {
      version: 'v2',
      httpTokens: 'required',
      httpPutResponseHopLimit: 1,
      httpEndpoint: 'enabled',
    };

    const res = engine.evaluateRequest(v2Config, {
      method: 'GET',
      path: '/latest/meta-data/iam/security-credentials/NexoraAppWorkloadInstanceProfileRole',
      headers: {}, // No session token!
      hopCount: 1,
      virtualTime: 100,
    });

    expect(res.statusCode).toBe(401);
    expect(res.isSsrfExploitable).toBe(false);
  });

  it('IMDSv2 issues session token via PUT and accepts it on subsequent GET', () => {
    const v2Config: ImdsConfig = {
      version: 'v2',
      httpTokens: 'required',
      httpPutResponseHopLimit: 1,
      httpEndpoint: 'enabled',
    };

    // 1. Issue Token
    const putRes = engine.evaluateRequest(v2Config, {
      method: 'PUT',
      path: '/latest/api/token',
      headers: { 'x-nexora-ec2-metadata-token-ttl-seconds': '21600' },
      hopCount: 1,
      virtualTime: 100,
    });
    expect(putRes.statusCode).toBe(200);
    const token = String(putRes.body);

    // 2. Query with token
    const getRes = engine.evaluateRequest(v2Config, {
      method: 'GET',
      path: '/latest/meta-data/iam/security-credentials/NexoraAppWorkloadInstanceProfileRole',
      headers: { 'x-nexora-ec2-metadata-token': token },
      hopCount: 1,
      virtualTime: 100,
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.isSsrfExploitable).toBe(false);
  });

  it('drops packet when hopCount exceeds httpPutResponseHopLimit', () => {
    const v2Config: ImdsConfig = {
      version: 'v2',
      httpTokens: 'required',
      httpPutResponseHopLimit: 1, // Strictly direct host only
      httpEndpoint: 'enabled',
    };

    const res = engine.evaluateRequest(v2Config, {
      method: 'GET',
      path: '/latest/meta-data/',
      headers: {},
      hopCount: 2, // Proxy hop!
      virtualTime: 100,
    });
    expect(res.statusCode).toBe(408);
  });
});

describe('8. Cleartext Secret Scanning & KMS Keys', () => {
  it('detects embedded static IAM access key and cleartext passwords in container configs', () => {
    const payload = [
      {
        location: 'docker-compose.yml',
        sourceType: 'CONTAINER_SPEC' as const,
        textContent: 'DB=postgres://user:password123@10.0.0.1:5432 and KEY=NXAKIAIOSFODNN7ALEX9',
      },
    ];

    const findings = scanForCleartextSecrets(payload);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.detectedPattern === 'NXAKIAIOSFODNN7ALEX9')).toBe(true);
  });
});

describe('9. Cryptographic Log Integrity & Digest Verification', () => {
  const sampleLogs: CloudAuditLogEntry[] = [
    {
      id: 'log-1',
      eventTimeVirtual: 100,
      eventVersion: '1.08',
      userIdentity: { type: 'IAMUser', principalId: 'P1', arn: 'arn:user/sara', accountId: '1' },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '10.100.1.1',
      userAgent: 'console',
      readOnly: true,
      recipientAccountId: '1',
      eventCategory: 'Data',
    },
  ];

  it('validates authentic log digest chain successfully', () => {
    const check = validateLogFileDigests(sampleLogs);
    expect(check.isValid).toBe(true);
    expect(check.tamperedEntryIds.length).toBe(0);
  });

  it('detects tampering or digest mismatch', () => {
    const check = validateLogFileDigests(sampleLogs, 'sha256_forged_hash');
    expect(check.isValid).toBe(false);
    expect(check.tamperedEntryIds).toContain('log-1');
  });
});

describe('10. Cloud Misconfiguration Scanner (CSPM) & Master Challenge', () => {
  const defaultSgs = createDefaultSecurityGroups();
  const rawInfra: CloudInfrastructureState = {
    buckets: createDefaultStorageBuckets(),
    securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg, defaultSgs.vulnerableOpenSshSg],
    principals: createDefaultCloudIdentities().principals,
    policies: ALL_PRESET_POLICIES,
    computeInstances: createDefaultComputeInstances(),
    trailConfig: { ...createDefaultTrailConfig(), isLogging: false },
    rootHasActiveAccessKey: true,
  };

  it('scans and identifies all critical misconfigurations', () => {
    const findings = scanCloudMisconfigurations(rawInfra);
    expect(findings.some((f) => f.id.includes('MISCFG-S3-PUBLIC'))).toBe(true);
    expect(findings.some((f) => f.id.includes('MISCFG-SG-OPEN-MGMT'))).toBe(true);
    expect(findings.some((f) => f.id.includes('MISCFG-IMDSV1'))).toBe(true);
    expect(findings.some((f) => f.id.includes('MISCFG-LOGGING-DISABLED'))).toBe(true);
    expect(findings.some((f) => f.id.includes('MISCFG-ROOT-ACCESS-KEY'))).toBe(true);
  });

  it('master challenge fails initially with unhardened infrastructure', () => {
    const challengeState: CloudMasterChallengeState = {
      infraState: rawInfra,
      incidentCase: createDefaultCloudIncident(),
      appliedRemediations: new Set(),
      testedAuthorizationsPassed: false,
    };

    const val = validateCloudMasterChallenge(challengeState);
    expect(val.isPassed).toBe(false);
    expect(val.failedChecks.length).toBeGreaterThan(0);
  });

  it('master challenge passes with Grade A when all remediations and playbook actions are complete', () => {
    const hardenedInfra: CloudInfrastructureState = {
      buckets: createDefaultStorageBuckets().map((b) => ({
        ...b,
        isPubliclyExposed: false,
        publicAccessBlock: {
          blockPublicAcls: true,
          ignorePublicAcls: true,
          blockPublicPolicy: true,
          restrictPublicBuckets: true,
        },
        encryption: { ...b.encryption, enabled: true },
      })),
      securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg], // Removed open SSH SG
      principals: createDefaultCloudIdentities().principals,
      policies: ALL_PRESET_POLICIES.filter((p) => !p.isWildcardAdmin),
      computeInstances: createDefaultComputeInstances().map((i) =>
        enforceImdsv2OnInstance({
          ...i,
          vulnerabilities: i.vulnerabilities.map((v) => ({ ...v, isPatched: true })),
        })
      ),
      trailConfig: {
        ...createDefaultTrailConfig(),
        isLogging: true,
        enableLogFileValidation: true,
        isMultiRegionTrail: true,
      },
      rootHasActiveAccessKey: false,
    };

    const completedIncident = createDefaultCloudIncident();
    completedIncident.playbookActions.forEach((a) => (a.isExecuted = true));

    const challengeState: CloudMasterChallengeState = {
      infraState: hardenedInfra,
      incidentCase: completedIncident,
      appliedRemediations: new Set(['S3_BPA', 'CLOSE_SSH', 'ENFORCE_IMDSV2', 'ENABLE_TRAIL', 'DELETE_ROOT_KEY']),
      testedAuthorizationsPassed: true,
    };

    const val = validateCloudMasterChallenge(challengeState);
    expect(val.isPassed).toBe(true);
    expect(val.cspmBenchmark.grade).toBe('A');
    expect(val.failedChecks.length).toBe(0);
  });
});

describe('11. Unified Cloud Reachability Engine (8 Scenarios)', () => {
  it('Scenario 1: Internet -> Public Load Balancer: ALLOW on 443/80', () => {
    const res = evaluateCloudReachability({
      source: { ip: '198.51.100.5', isInternet: true },
      destination: { ip: '10.100.1.10', workloadType: 'PUBLIC_ALB' },
      protocol: 'TCP',
      port: 443,
    });
    expect(res.reachable).toBe(true);
    expect(res.matchedRoute).toContain('IGW');
  });

  it('Scenario 2: Internet -> Application VM: DENY (App tier private)', () => {
    const res = evaluateCloudReachability({
      source: { ip: '198.51.100.5', isInternet: true },
      destination: { ip: '10.100.10.45', workloadType: 'APP_VM' },
      protocol: 'TCP',
      port: 80,
    });
    expect(res.reachable).toBe(false);
    expect(res.reasonEn).toContain('private subnet');
  });

  it('Scenario 3: Internet -> Database: DENY (Zero internet route)', () => {
    const res = evaluateCloudReachability({
      source: { ip: '198.51.100.5', isInternet: true },
      destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
      protocol: 'TCP',
      port: 5432,
    });
    expect(res.reachable).toBe(false);
    expect(res.reasonEn).toContain('Isolated database tier');
  });

  it('Scenario 4: Application Tier -> Database: ALLOW on 5432', () => {
    const res = evaluateCloudReachability({
      source: { ip: '10.100.10.45', subnetId: 'sub-private-app-1a', securityGroupIds: ['sg-prod-app-workload'] },
      destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
      protocol: 'TCP',
      port: 5432,
    });
    expect(res.reachable).toBe(true);
    expect(res.matchedRoute).toContain('LOCAL');
  });

  it('Scenario 5: Unrelated Subnet -> Database: DENY', () => {
    const res = evaluateCloudReachability({
      source: { ip: '10.100.50.12', subnetId: 'sub-unrelated-dev', securityGroupIds: ['sg-dev-random'] },
      destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
      protocol: 'TCP',
      port: 5432,
    });
    expect(res.reachable).toBe(false);
    expect(res.reasonEn).toContain('unauthorized subnets');
  });

  it('Scenario 6: Database -> Internet: DENY (No 0.0.0.0/0 route)', () => {
    const res = evaluateCloudReachability({
      source: { ip: '10.100.20.15', subnetId: 'sub-isolated-db-1a' },
      destination: { ip: '198.51.100.5', isInternet: true },
      protocol: 'TCP',
      port: 443,
    });
    expect(res.reachable).toBe(false);
    expect(res.reasonEn).toContain('no default 0.0.0.0/0');
  });

  it('Scenario 7: Admin/VPN Network -> Management Interface: ALLOW', () => {
    const res = evaluateCloudReachability({
      source: { ip: '10.100.250.5', isAdminVpn: true },
      destination: { ip: '10.100.1.50', workloadType: 'MANAGEMENT_INTERFACE' },
      protocol: 'TCP',
      port: 22,
    });
    expect(res.reachable).toBe(true);
    expect(res.matchedSecurityGroupRule).toContain('sgr-mgmt-from-vpn');
  });

  it('Scenario 8: 0.0.0.0/0 -> SSH: FAIL SECURITY VALIDATION', () => {
    const res = evaluateCloudReachability({
      source: { ip: '0.0.0.0/0', isInternet: true },
      destination: { ip: '10.100.10.45', workloadType: 'APP_VM' },
      protocol: 'TCP',
      port: 22,
    });
    expect(res.reachable).toBe(false);
    expect(res.reasonEn).toContain('Open SSH from 0.0.0.0/0 violates cloud security baseline');
  });
});

describe('12. Real Cloud Architecture Validator', () => {
  const defaultSgs = createDefaultSecurityGroups();

  it('passes when architecture adheres to reference secure production design', () => {
    const secureState: CloudInfrastructureState = {
      buckets: createDefaultStorageBuckets().map((b) => ({
        ...b,
        isPubliclyExposed: false,
        publicAccessBlock: {
          blockPublicAcls: true,
          ignorePublicAcls: true,
          blockPublicPolicy: true,
          restrictPublicBuckets: true,
        },
        encryption: { ...b.encryption, enabled: true },
      })),
      securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg],
      principals: createDefaultCloudIdentities().principals,
      policies: ALL_PRESET_POLICIES.filter((p) => !p.isWildcardAdmin),
      computeInstances: createDefaultComputeInstances().map((i) =>
        enforceImdsv2OnInstance({
          ...i,
          vulnerabilities: i.vulnerabilities.map((v) => ({ ...v, isPatched: true })),
        })
      ),
      trailConfig: {
        ...createDefaultTrailConfig(),
        isLogging: true,
        enableLogFileValidation: true,
        isMultiRegionTrail: true,
      },
      rootHasActiveAccessKey: false,
    };

    const arch = validateCloudArchitecture(secureState);
    expect(arch.passed).toBe(true);
    expect(arch.businessContinuityPassed).toBe(true);
    expect(arch.failedChecks.length).toBe(0);
  });

  it('fails architecture validation when open SSH security group is present', () => {
    const flawedState: CloudInfrastructureState = {
      buckets: createDefaultStorageBuckets(),
      securityGroups: [defaultSgs.webAlbSg, defaultSgs.vulnerableOpenSshSg],
      principals: createDefaultCloudIdentities().principals,
      policies: ALL_PRESET_POLICIES,
      computeInstances: createDefaultComputeInstances(),
      trailConfig: createDefaultTrailConfig(),
      rootHasActiveAccessKey: false,
    };

    const arch = validateCloudArchitecture(flawedState);
    expect(arch.passed).toBe(false);
    expect(arch.failedChecks.some((f) => f.includes('Network Perimeter Management Segmentation'))).toBe(true);
  });

  it('fails architecture validation when database is not isolated', () => {
    const flawedState: CloudInfrastructureState = {
      buckets: createDefaultStorageBuckets(),
      securityGroups: [defaultSgs.webAlbSg],
      principals: createDefaultCloudIdentities().principals,
      policies: ALL_PRESET_POLICIES,
      computeInstances: [
        {
          ...createDefaultComputeInstances()[0],
          id: 'inst-db-postgres-01',
          subnetId: 'sub-public-web-1a', // Placed in public subnet!
          publicIp: '203.0.113.88',
        },
      ],
      trailConfig: createDefaultTrailConfig(),
      rootHasActiveAccessKey: false,
    };

    const arch = validateCloudArchitecture(flawedState);
    expect(arch.passed).toBe(false);
    expect(arch.failedChecks.some((f) => f.includes('Isolated Database Tier'))).toBe(true);
  });
});

describe('13. Cloud Anti-Cheat System & Exploit Guard', () => {
  const defaultSgs = createDefaultSecurityGroups();

  const getBaseHardenedState = (): CloudMasterChallengeState => {
    const completedIncident = createDefaultCloudIncident();
    completedIncident.playbookActions.forEach((a) => (a.isExecuted = true));
    completedIncident.currentStage = 'RESOLVED';

    return {
      infraState: {
        buckets: createDefaultStorageBuckets().map((b) => ({
          ...b,
          isPubliclyExposed: false,
          publicAccessBlock: {
            blockPublicAcls: true,
            ignorePublicAcls: true,
            blockPublicPolicy: true,
            restrictPublicBuckets: true,
          },
          encryption: { ...b.encryption, enabled: true },
          accessLogging: { enabled: true, targetBucket: 'nexora-central-audit-logs-immutable' },
        })),
        securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg],
        principals: createDefaultCloudIdentities().principals,
        policies: ALL_PRESET_POLICIES.filter((p) => !p.isWildcardAdmin),
        computeInstances: createDefaultComputeInstances().map((i) =>
          enforceImdsv2OnInstance({
            ...i,
            vulnerabilities: i.vulnerabilities.map((v) => ({ ...v, isPatched: true })),
          })
        ),
        trailConfig: {
          ...createDefaultTrailConfig(),
          isLogging: true,
          enableLogFileValidation: true,
          isMultiRegionTrail: true,
        },
        rootHasActiveAccessKey: false,
      },
      incidentCase: completedIncident,
      appliedRemediations: new Set(['S3_BPA', 'CLOSE_SSH', 'ENFORCE_IMDSV2', 'ENABLE_TRAIL', 'DELETE_ROOT_KEY']),
      testedAuthorizationsPassed: true,
    };
  };

  it('detects and fails on trivial status mutation (marking bucket non-public without BPA)', () => {
    const state = getBaseHardenedState();
    // Tamper: bucket is marked non-public, but BPA flags are set to false!
    state.infraState.buckets = state.infraState.buckets.map((b) =>
      b.name === 'nexora-analytics-raw-bucket'
        ? {
            ...b,
            isPubliclyExposed: false,
            publicAccessBlock: {
              blockPublicAcls: false,
              ignorePublicAcls: false,
              blockPublicPolicy: false,
              restrictPublicBuckets: false,
            },
          }
        : b
    );

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations.length).toBeGreaterThan(0);
    expect(val.antiCheatViolations.some((v) => v.includes('without activating Block Public Access'))).toBe(true);
  });

  it('detects and fails on marking incident resolved without executed containment/eradication', () => {
    const state = getBaseHardenedState();
    // Cheating attempt: currentStage set to RESOLVED, but containment actions are unexecuted
    state.incidentCase.currentStage = 'RESOLVED';
    state.incidentCase.playbookActions.forEach((a) => {
      if (a.requiredForStage === 'CONTAINMENT') a.isExecuted = false;
    });

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations.some((v) => v.includes('without actually executing containment'))).toBe(true);
  });

  it('detects and fails on disabling audit logging to hide alerts', () => {
    const state = getBaseHardenedState();
    // Tamper: logging disabled
    state.infraState.trailConfig.isLogging = false;

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations.some((v) => v.includes('Central audit logging is disabled'))).toBe(true);
  });

  it('detects and fails when anti-cheat flags are tripped', () => {
    const state = getBaseHardenedState();
    state.antiCheatFlags = {
      reachabilityBypassed: true,
      postureScoreFalsified: true,
    };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations.some((v) => v.includes('reachability boundary'))).toBe(true);
    expect(val.antiCheatViolations.some((v) => v.includes('Falsified CSPM posture'))).toBe(true);
  });
});

describe('14. Business Continuity Validation', () => {
  const defaultSgs = createDefaultSecurityGroups();

  const getValidState = (): CloudMasterChallengeState => {
    const completedIncident = createDefaultCloudIncident();
    completedIncident.playbookActions.forEach((a) => (a.isExecuted = true));
    completedIncident.currentStage = 'RESOLVED';

    return {
      infraState: {
        buckets: createDefaultStorageBuckets().map((b) => ({
          ...b,
          isPubliclyExposed: false,
          publicAccessBlock: {
            blockPublicAcls: true,
            ignorePublicAcls: true,
            blockPublicPolicy: true,
            restrictPublicBuckets: true,
          },
          encryption: { ...b.encryption, enabled: true },
          accessLogging: { enabled: true, targetBucket: 'nexora-central-audit-logs-immutable' },
        })),
        securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg],
        principals: createDefaultCloudIdentities().principals,
        policies: ALL_PRESET_POLICIES.filter((p) => !p.isWildcardAdmin),
        computeInstances: createDefaultComputeInstances().map((i) =>
          enforceImdsv2OnInstance({
            ...i,
            vulnerabilities: i.vulnerabilities.map((v) => ({ ...v, isPatched: true })),
          })
        ),
        trailConfig: {
          ...createDefaultTrailConfig(),
          isLogging: true,
          enableLogFileValidation: true,
          isMultiRegionTrail: true,
        },
        rootHasActiveAccessKey: false,
      },
      incidentCase: completedIncident,
      appliedRemediations: new Set(['S3_BPA', 'CLOSE_SSH', 'ENFORCE_IMDSV2', 'ENABLE_TRAIL', 'DELETE_ROOT_KEY']),
      testedAuthorizationsPassed: true,
    };
  };

  it('fails master challenge if customer portal reachability is broken', () => {
    const state = getValidState();
    // Over-hardening: remove all ingress rules from web ALB
    state.infraState.securityGroups = state.infraState.securityGroups.map((sg) =>
      sg.id === 'sg-prod-web-alb' ? { ...sg, ingressRules: [] } : sg
    );

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.failedChecks.some((f) => f.includes('Customer Portal'))).toBe(true);
  });

  it('fails master challenge if authorized role assumptions fail', () => {
    const state = getValidState();
    state.testedAuthorizationsPassed = false; // Broken role assumption!

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.businessContinuityPassed).toBe(false);
    expect(val.failedChecks.some((f) => f.includes('Authorized legitimate role assumption'))).toBe(true);
  });
});

describe('15. Cloud Master Challenge Initial State & Anti-Cheat Suite', () => {
  const defaultSgs = createDefaultSecurityGroups();

  const getValidHardenedState = (): CloudMasterChallengeState => {
    const completedIncident = createDefaultCloudIncident();
    completedIncident.playbookActions.forEach((a) => (a.isExecuted = true));
    completedIncident.currentStage = 'RESOLVED';

    return {
      infraState: {
        buckets: createDefaultStorageBuckets().map((b) => ({
          ...b,
          isPubliclyExposed: false,
          publicAccessBlock: {
            blockPublicAcls: true,
            ignorePublicAcls: true,
            blockPublicPolicy: true,
            restrictPublicBuckets: true,
          },
          encryption: { ...b.encryption, enabled: true },
          accessLogging: { enabled: true, targetBucket: 'nexora-central-audit-logs-immutable' },
        })),
        securityGroups: [defaultSgs.webAlbSg, defaultSgs.appWorkloadSg, defaultSgs.dbTierSg],
        principals: createDefaultCloudIdentities().principals,
        policies: ALL_PRESET_POLICIES.filter((p) => !p.isWildcardAdmin),
        computeInstances: createDefaultComputeInstances().map((i) =>
          enforceImdsv2OnInstance({
            ...i,
            vulnerabilities: i.vulnerabilities.map((v) => ({ ...v, isPatched: true })),
          })
        ),
        trailConfig: {
          ...createDefaultTrailConfig(),
          isLogging: true,
          enableLogFileValidation: true,
          isMultiRegionTrail: true,
        },
        rootHasActiveAccessKey: false,
      },
      incidentCase: completedIncident,
      appliedRemediations: new Set(['S3_BPA', 'CLOSE_SSH', 'ENFORCE_IMDSV2', 'ENABLE_TRAIL', 'DELETE_ROOT_KEY']),
      testedAuthorizationsPassed: true,
    };
  };

  it('initializes Cloud Master Challenge in an unsolved state with testedAuthorizationsPassed as false', () => {
    const initial = createDefaultCloudMasterChallengeState();
    expect(initial.testedAuthorizationsPassed).toBe(false);
    const validation = validateCloudMasterChallenge(initial);
    expect(validation.isPassed).toBe(false);
    expect(validation.failedChecks.length).toBeGreaterThan(0);
  });

  it('valid hardened state passes all CIS benchmark, anti-cheat, and continuity checks', () => {
    const state = getValidHardenedState();
    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(true);
    expect(val.failedChecks.length).toBe(0);
    expect(val.antiCheatViolations.length).toBe(0);
    expect(val.businessContinuityPassed).toBe(true);
  });

  // Anti-Cheat Condition 1: blockAllInboundTraffic
  it('detects and independently fails on blockAllInboundTraffic defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { blockAllInboundTraffic: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Customer portal must remain reachable through the intended public entry point.'
    );
  });

  // Anti-Cheat Condition 2: deleteProductionResources
  it('detects and independently fails on deleteProductionResources defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { deleteProductionResources: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Security remediation cannot delete required production infrastructure.'
    );
  });

  // Anti-Cheat Condition 3: disableApplication
  it('detects and independently fails on disableApplication defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { disableApplication: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Hardening cannot disable customer-facing application functionality.'
    );
  });

  // Anti-Cheat Condition 4: grantEveryoneAdmin
  it('detects and independently fails on grantEveryoneAdmin defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { grantEveryoneAdmin: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Granting universal administrative access violates least privilege.'
    );
  });

  // Anti-Cheat Condition 5: disableAllIdentities
  it('detects and independently fails on disableAllIdentities defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { disableAllIdentities: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Security controls must preserve legitimate identity access.'
    );
  });

  // Anti-Cheat Condition 6: makeAllStorageInaccessible
  it('detects and independently fails on makeAllStorageInaccessible defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { makeAllStorageInaccessible: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Required business data must remain accessible to approved workloads.'
    );
  });

  // Anti-Cheat Condition 7: removeAllNetworkConnectivity
  it('detects and independently fails on removeAllNetworkConnectivity defect', () => {
    const state = getValidHardenedState();
    state.antiCheatFlags = { removeAllNetworkConnectivity: true };

    const val = validateCloudMasterChallenge(state);
    expect(val.isPassed).toBe(false);
    expect(val.antiCheatViolations).toContain(
      'Anti-Cheat: Business-critical application paths must remain functional.'
    );
  });
});
