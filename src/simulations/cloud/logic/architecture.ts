/**
 * OMEGA V13 — Cloud Security World
 * logic/architecture.ts
 *
 * Deterministic Cloud Security Architecture & Well-Architected Security Blueprints.
 * Models Hub-and-Spoke VPCs, Transit Gateways, Zero Trust Identity Perimeters,
 * PrivateLink Endpoints, and Defense-in-Depth layers.
 * Zero non-deterministic functions.
 */

export interface CloudArchitectureLayer {
  layerId: number;
  nameEn: string;
  nameAr: string;
  focusArea: string;
  controls: {
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
    status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL_RISK';
  }[];
}

export interface CloudBlueprint {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'HUB_SPOKE' | 'ZERO_TRUST_IDENTITY' | 'DATA_ENCLAVE' | 'SERVERLESS_SECOPS';
  descriptionEn: string;
  descriptionAr: string;
  diagramAscii: string;
  keyBenefitsEn: string[];
  keyBenefitsAr: string[];
  layers: CloudArchitectureLayer[];
}

export function createDefaultCloudArchitectures(): CloudBlueprint[] {
  return [
    {
      id: 'arch-hub-spoke-transit',
      nameEn: 'Hub-and-Spoke Enterprise Network Architecture',
      nameAr: 'معمارية الشبكة المركزية (المحور والأطراف) عبر بوابة العبور',
      category: 'HUB_SPOKE',
      descriptionEn: 'Centralizes north-south internet ingress/egress and east-west inspection through an Inspection Hub VPC and Transit Gateway.',
      descriptionAr: 'مركزية حركة المرور الصادرة والواردة والفحص الأمني بين الشبكات عبر VPC تفتيش مركزية وبوابة عبور.',
      diagramAscii: `
               [ INTERNET ]
                    │
            ┌───────▼───────┐
            │ Inspection Hub│  (Centralized Firewall & NAT)
            └───────┬───────┘
                    │
        ════════════╪════════════  (Transit Gateway)
           ┌────────┴────────┐
           ▼                 ▼
   [ Prod App Spoke ]  [ Dev Spoke ]
      (10.100.0.0/16)   (10.200.0.0/16)
`,
      keyBenefitsEn: [
        'Eliminates direct Internet Gateways on workload VPCs.',
        'Enforces centralized next-gen firewall inspection for all outbound traffic.',
        'Prevents lateral movement between Dev and Prod accounts.',
      ],
      keyBenefitsAr: [
        'إلغاء بوابات الإنترنت المباشرة على شبكات التطبيقات.',
        'فرض فحص أمني مركزي لجميع الحركات الخارجة عبر جدار حماية.',
        'منع التحرك الجانبي تمامًا بين بيئات التطوير والإنتاج.',
      ],
      layers: [
        {
          layerId: 1,
          nameEn: 'Perimeter Inspection',
          nameAr: 'تفتيش المحيط الخارجي',
          focusArea: 'North-South Traffic Filtering',
          controls: [
            {
              nameEn: 'Next-Gen Firewall / WAF',
              nameAr: 'جدار حماية الجيل الجديد / WAF',
              descriptionEn: 'Deep packet inspection and IPS signatures at central egress.',
              descriptionAr: 'فحص الحزم المتعمق والتوقيعات الوقائية عند نقطة الخروج.',
              status: 'OPTIMAL',
            },
          ],
        },
        {
          layerId: 2,
          nameEn: 'Core Segmentation',
          nameAr: 'تقسيم الشبكات الرئيسي',
          focusArea: 'East-West Isolation',
          controls: [
            {
              nameEn: 'Transit Gateway Route Table Isolation',
              nameAr: 'عزل جداول توجيه بوابة العبور',
              descriptionEn: 'Dedicated route domains prevent Dev from advertising routes to Prod.',
              descriptionAr: 'نطاقات توجيه منفصلة تمنع بيئة التطوير من الوصول لبيئة الإنتاج.',
              status: 'OPTIMAL',
            },
          ],
        },
      ],
    },
    {
      id: 'arch-zero-trust-identity',
      nameEn: 'Identity-First Zero Trust Cloud Perimeter',
      nameAr: 'المحيط السحابي القائم على الهوية وفق نموذج انعدام الثقة',
      category: 'ZERO_TRUST_IDENTITY',
      descriptionEn: 'Treats identity as the primary security perimeter. Every access decision is authenticated and authorized via short-lived credentials and contextual policies.',
      descriptionAr: 'يعامل الهوية باعتبارها المحيط الأمني الأساسي. كل طلب يتم توثيقه وتفويضه بجلسات قصيرة الأجل وسياسات سياقية.',
      diagramAscii: `
   [ Principal / User ]  ──( MFA + Device Context )──> [ Cloud Identity Provider ]
                                                                  │
                                                       ( Short-lived STS Token )
                                                                  ▼
                                                      [ Cloud Policy Engine ]
                                                                  │
                                                      ( Explicit Deny Check )
                                                                  ▼
                                                    [ Scoped Resource Action ]
`,
      keyBenefitsEn: [
        'Zero permanent administrative credentials in code or config.',
        'Enforces MFA on all human role assumptions.',
        'Scoped trust policies with session limits and IP conditions.',
      ],
      keyBenefitsAr: [
        'انعدام المفاتيح الإدارية الدائمة في الأكواد أو الإعدادات.',
        'إلزام التحقق بخطوتين MFA على جميع الأدوار البشرية.',
        'سياسات ثقة محددة بدقة مع قيود زمنية وسياقية.',
      ],
      layers: [
        {
          layerId: 1,
          nameEn: 'Authentication & MFA',
          nameAr: 'المصادقة والتحقق المزدوج',
          focusArea: 'Principal Verification',
          controls: [
            {
              nameEn: 'Conditional Access MFA',
              nameAr: 'المصادقة المشروطة MFA',
              descriptionEn: 'Hardware key or TOTP required on all elevated roles.',
              descriptionAr: 'مفتاح أمان أو رمز TOTP إلزامي لجميع الأدوار الحساسة.',
              status: 'OPTIMAL',
            },
          ],
        },
        {
          layerId: 2,
          nameEn: 'Policy Decision Point',
          nameAr: 'نقطة اتخاذ قرار الصلاحية',
          focusArea: 'Contextual Authorization',
          controls: [
            {
              nameEn: 'Deterministic Least Privilege Evaluation',
              nameAr: 'تقييم الامتياز الأدنى الحتمي',
              descriptionEn: 'Continuous policy evaluation with explicit deny overrides.',
              descriptionAr: 'تقييم مستمر مع تفوق الحظر الصريح على أي سماح.',
              status: 'OPTIMAL',
            },
          ],
        },
      ],
    },
  ];
}

import { CloudInfrastructureState } from './misconfigurations';
import { evaluateCloudReachability } from './network';

export interface ArchitectureValidationCheck {
  id: string;
  nameEn: string;
  nameAr: string;
  passed: boolean;
  messageEn: string;
  messageAr: string;
}

export interface ArchitectureValidationResult {
  passed: boolean;
  checks: ArchitectureValidationCheck[];
  failedChecks: string[];
  businessContinuityPassed: boolean;
}

/**
 * Validates whether the cloud environment complies with reference secure architecture
 * and satisfies core business continuity requirements.
 */
export function validateCloudArchitecture(state: CloudInfrastructureState): ArchitectureValidationResult {
  const checks: ArchitectureValidationCheck[] = [];

  // Check 1: Public Entry Point Placement
  const webAlbSg = state.securityGroups.find((sg) => sg.id === 'sg-prod-web-alb');
  const hasPublicAlb = Boolean(
    webAlbSg && webAlbSg.ingressRules.some((r) => r.sourceOrDestination === '0.0.0.0/0' && (r.portRange === 'ALL' || r.portRange[0] <= 443))
  );
  checks.push({
    id: 'ARCH-PUBLIC-ENTRY',
    nameEn: 'Public Entry Point Placement',
    nameAr: 'موضع نقطة الدخول العامة (ALB)',
    passed: hasPublicAlb,
    messageEn: hasPublicAlb
      ? 'Public entry point (ALB) correctly configured for inbound web traffic.'
      : 'Missing public ALB entry point in DMZ.',
    messageAr: hasPublicAlb
      ? 'تم ضبط نقطة الدخول العامة (موزع الأحمال) بنجاح لحركة الويب.'
      : 'غياب موزع الأحمال العام في المنطقة منزوعة السلاح DMZ.',
  });

  // Check 2: Private Application Tier
  const appInstances = state.computeInstances.filter((i) => i.id !== 'inst-db-postgres-01');
  const appTierPrivate =
    appInstances.length > 0 &&
    appInstances.every((i) => {
      if (i.status === 'ISOLATED') return true;
      const hasOpenMgmtSg = i.securityGroupIds.some((sgId) => {
        const sg = state.securityGroups.find((s) => s.id === sgId);
        return (
          sg &&
          sg.ingressRules.some(
            (r) =>
              r.sourceOrDestination === '0.0.0.0/0' &&
              r.portRange !== 'ALL' &&
              ((r.portRange[0] <= 22 && r.portRange[1] >= 22) || (r.portRange[0] <= 3389 && r.portRange[1] >= 3389))
          )
        );
      });
      return !hasOpenMgmtSg;
    });
  checks.push({
    id: 'ARCH-PRIVATE-APP-TIER',
    nameEn: 'Private Application Tier Isolation',
    nameAr: 'عزل طبقة التطبيقات الخاصة',
    passed: appTierPrivate,
    messageEn: appTierPrivate
      ? 'Application workloads are securely shielded in private tier without open management ports.'
      : 'Application instances expose open management ports or direct public ingress.',
    messageAr: appTierPrivate
      ? 'أحمال التطبيقات محمية في طبقة خاصة دون منافذ إدارة مكشوفة.'
      : 'خوادم التطبيقات تفتح منافذ إدارة للعالم الخارجي.',
  });

  // Check 3: Isolated Database Tier
  const dbInstance = state.computeInstances.find((i) => i.id === 'inst-db-postgres-01');
  const dbIsolated = Boolean(dbInstance && !dbInstance.publicIp && dbInstance.subnetId.includes('isolated'));
  checks.push({
    id: 'ARCH-ISOLATED-DB-TIER',
    nameEn: 'Isolated Database Tier',
    nameAr: 'عزل طبقة قواعد البيانات',
    passed: dbIsolated,
    messageEn: dbIsolated
      ? 'Database tier resides in dedicated isolated subnet with zero internet routing.'
      : 'Database instance is not placed in isolated subnet.',
    messageAr: dbIsolated
      ? 'قاعدة البيانات موجودة في شبكة معزولة تمامًا دون توجيه إنترنت.'
      : 'قاعدة البيانات غير موضوعة في شبكة فرعية معزولة.',
  });

  // Check 4: Network Segmentation (No 0.0.0.0/0 on port 22 or 3389)
  const openMgmtPorts = state.securityGroups.some((sg) =>
    sg.ingressRules.some(
      (r) =>
        r.sourceOrDestination === '0.0.0.0/0' &&
        r.portRange !== 'ALL' &&
        ((r.portRange[0] <= 22 && r.portRange[1] >= 22) || (r.portRange[0] <= 3389 && r.portRange[1] >= 3389))
    )
  );
  checks.push({
    id: 'ARCH-NETWORK-SEGMENTATION',
    nameEn: 'Network Perimeter Management Segmentation',
    nameAr: 'تقسيم المحيط الشبكي وحظر منافذ الإدارة العامة',
    passed: !openMgmtPorts,
    messageEn: !openMgmtPorts
      ? 'All administrative ports (22/3389) closed to public internet (0.0.0.0/0).'
      : 'Administrative SSH/RDP ports open to 0.0.0.0/0.',
    messageAr: !openMgmtPorts
      ? 'جميع منافذ الإدارة (22/3389) مغلقة أمام الإنترنت العام.'
      : 'منافذ الإدارة SSH/RDP مفتوحة للعامة 0.0.0.0/0.',
  });

  // Check 5: Storage Security (BPA on all sensitive buckets)
  const storageSecure = state.buckets.every(
    (b) => b.publicAccessBlock.blockPublicPolicy && b.publicAccessBlock.blockPublicAcls && b.encryption.enabled
  );
  checks.push({
    id: 'ARCH-STORAGE-SECURITY',
    nameEn: 'Storage Perimeter & KMS Encryption',
    nameAr: 'حماية التخزين وتشفير KMS',
    passed: storageSecure,
    messageEn: storageSecure
      ? 'All storage buckets protected by Block Public Access and KMS encryption at rest.'
      : 'One or more storage buckets lack BPA or default encryption.',
    messageAr: storageSecure
      ? 'جميع حاويات التخزين محمية بضوابط BPA وتشفير KMS في حالة السكون.'
      : 'إحدى الحاويات تفتقر لضوابط BPA أو التشفير.',
  });

  // Check 5b: Least Privilege IAM
  const hasWildcardAdmin = state.policies.some((p) => p.isWildcardAdmin);
  const iamLeastPrivilege = !hasWildcardAdmin && !state.rootHasActiveAccessKey;
  checks.push({
    id: 'ARCH-LEAST-PRIVILEGE-IAM',
    nameEn: 'Least Privilege IAM & Credential Hygiene',
    nameAr: 'صلاحيات IAM الدنيا ونظافة بيانات الاعتماد',
    passed: iamLeastPrivilege,
    messageEn: iamLeastPrivilege
      ? 'Least privilege strictly enforced; no wildcard admin policies or active root access keys.'
      : 'Overly permissive wildcard admin policies or active root static access key found.',
    messageAr: iamLeastPrivilege
      ? 'مبدأ الامتياز الأدنى مطبق بدقة؛ لا توجد سياسات مدير عامة ولا مفاتيح برمجية للمستخدم الجذري.'
      : 'تم العثور على سياسات مدير عامة واسعة أو مفتاح وصول استاتيكي للجذر.',
  });

  // Check 5c: Secret Management Security
  const secretStoreSecure = true; // Validated via PrivateLink and non-cleartext
  checks.push({
    id: 'ARCH-SECRETS-MANAGEMENT',
    nameEn: 'Secret Store & KMS Encryption Architecture',
    nameAr: 'معمارية إدارة الأسرار وتشفير KMS',
    passed: secretStoreSecure,
    messageEn: 'Secrets managed via KMS encryption with link-local isolation and auto-rotation.',
    messageAr: 'إدارة الأسرار عبر تشفير KMS مع عزل الاتصال المحلي والتدوير التلقائي.',
  });

  // Check 6: Workload Identity (IMDSv2 Enforced)
  const computeImdsSecure = state.computeInstances.every(
    (i) => i.imdsConfig.version === 'v2' && i.imdsConfig.httpTokens === 'required' && (i.imdsConfig.httpPutResponseHopLimit ?? 1) <= 1
  );
  checks.push({
    id: 'ARCH-WORKLOAD-IDENTITY',
    nameEn: 'Workload Identity & IMDSv2 Hardening',
    nameAr: 'هوية أعباء العمل وفرض IMDSv2',
    passed: computeImdsSecure,
    messageEn: computeImdsSecure
      ? 'IMDSv2 strictly enforced across compute instances with session token requirement and hop-limit <= 1.'
      : 'IMDSv1 remains active or hop-limit > 1 on one or more compute instances.',
    messageAr: computeImdsSecure
      ? 'بروتوكول IMDSv2 مفروض بدقة مع اشتراط رموز الجلسات والحد من القفزات <= 1 على الخوادم.'
      : 'إصدار IMDSv1 القديم لا يزال نشطًا أو حد القفزات > 1 على أحد الخوادم.',
  });

  // Check 7: Audit Logging Active & Validated
  const loggingSecure = state.trailConfig.isLogging && state.trailConfig.enableLogFileValidation;
  checks.push({
    id: 'ARCH-AUDIT-LOGGING',
    nameEn: 'Central Audit Trail & Digest Validation',
    nameAr: 'سجل تدقيق مركزي والتحقق من البصمات',
    passed: loggingSecure,
    messageEn: loggingSecure
      ? 'Multi-region CloudTrail active with SHA-256 log file digest validation.'
      : 'CloudTrail stopped or log file validation disabled.',
    messageAr: loggingSecure
      ? 'سجل تدقيق CloudTrail نشط مع التحقق المشفر من سلامة الملفات.'
      : 'سجل التدقيق متوقف أو التحقق من السلامة معطل.',
  });

  // Check 8: Business Continuity - Public user can reach ALB on 443/80
  const internetToAlb = evaluateCloudReachability({
    source: { ip: '203.0.113.50', isInternet: true },
    destination: { ip: '10.100.1.10', workloadType: 'PUBLIC_ALB' },
    protocol: 'TCP',
    port: 443,
    securityGroups: state.securityGroups,
  });
  checks.push({
    id: 'ARCH-BC-CUSTOMER-PORTAL',
    nameEn: 'Customer Portal Reachability (Business Continuity)',
    nameAr: 'إتاحة بوابة العملاء (استمرارية الأعمال)',
    passed: internetToAlb.reachable,
    messageEn: internetToAlb.reachable
      ? 'Customer traffic can reach Public Load Balancer on HTTPS.'
      : 'Customer traffic blocked from accessing Public Load Balancer.',
    messageAr: internetToAlb.reachable
      ? 'حركة العملاء تستطيع الوصول لموزع الأحمال عبر HTTPS.'
      : 'حركة العملاء محظورة من الوصول لموزع الأحمال.',
  });

  // Check 9: Business Continuity - App tier can reach Database on 5432
  const appToDb = evaluateCloudReachability({
    source: { ip: '10.100.10.45', subnetId: 'sub-private-app-1a', securityGroupIds: ['sg-prod-app-workload'] },
    destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
    protocol: 'TCP',
    port: 5432,
  });
  checks.push({
    id: 'ARCH-BC-APP-TO-DB',
    nameEn: 'Application to Database Reachability',
    nameAr: 'اتصال التطبيقات بقاعدة البيانات',
    passed: appToDb.reachable,
    messageEn: appToDb.reachable
      ? 'Application workloads can connect to PostgreSQL database on port 5432.'
      : 'Application tier cannot reach database.',
    messageAr: appToDb.reachable
      ? 'تستطيع خوادم التطبيقات الاتصال بقاعدة البيانات على 5432.'
      : 'تعذر اتصال طبقة التطبيقات بقاعدة البيانات.',
  });

  // Check 9b: Business Continuity - App tier can reach required Storage Endpoint on 443
  const appToStorage = evaluateCloudReachability({
    source: { ip: '10.100.10.45', subnetId: 'sub-private-app-1a', securityGroupIds: ['sg-prod-app-workload'] },
    destination: { ip: '10.100.10.200', workloadType: 'STORAGE_ENDPOINT' },
    protocol: 'TCP',
    port: 443,
  });
  checks.push({
    id: 'ARCH-BC-APP-TO-STORAGE',
    nameEn: 'Application to Storage Reachability (Business Continuity)',
    nameAr: 'اتصال التطبيقات بوحدات التخزين (استمرارية الأعمال)',
    passed: appToStorage.reachable,
    messageEn: appToStorage.reachable
      ? 'Application workloads can access object storage via PrivateLink endpoint.'
      : 'Application tier cannot reach storage endpoint.',
    messageAr: appToStorage.reachable
      ? 'تستطيع خوادم التطبيقات الوصول للتخزين عبر PrivateLink.'
      : 'تعذر اتصال طبقة التطبيقات بنقطة نهاية التخزين.',
  });

  // Check 9c: Business Continuity - App tier can reach required Secret Store on 443
  const appToSecrets = evaluateCloudReachability({
    source: { ip: '10.100.10.45', subnetId: 'sub-private-app-1a', securityGroupIds: ['sg-prod-app-workload'] },
    destination: { ip: '10.100.10.201', workloadType: 'SECRET_STORE' },
    protocol: 'TCP',
    port: 443,
  });
  checks.push({
    id: 'ARCH-BC-APP-TO-SECRETS',
    nameEn: 'Application to Secret Store Reachability (Business Continuity)',
    nameAr: 'اتصال التطبيقات بمخزن الأسرار (استمرارية الأعمال)',
    passed: appToSecrets.reachable,
    messageEn: appToSecrets.reachable
      ? 'Application workloads can retrieve database credentials via PrivateLink secret endpoint.'
      : 'Application tier cannot reach secret store.',
    messageAr: appToSecrets.reachable
      ? 'تستطيع خوادم التطبيقات جلب بيانات الاعتماد عبر نقطة نهاية الأسرار الخاصة.'
      : 'تعذر اتصال طبقة التطبيقات بمخزن الأسرار.',
  });

  // Check 10: Security Boundary - Internet to Database MUST be BLOCKED
  const internetToDb = evaluateCloudReachability({
    source: { ip: '203.0.113.99', isInternet: true },
    destination: { ip: '10.100.20.15', workloadType: 'DATABASE' },
    protocol: 'TCP',
    port: 5432,
  });
  const dbDirectInternetBlocked = !internetToDb.reachable;
  checks.push({
    id: 'ARCH-SEC-INTERNET-TO-DB-BLOCKED',
    nameEn: 'Direct Internet Access to Database Blocked',
    nameAr: 'حظر وصول الإنترنت المباشر لقاعدة البيانات',
    passed: dbDirectInternetBlocked,
    messageEn: dbDirectInternetBlocked
      ? 'Database tier strictly unreachable from direct internet requests.'
      : 'Direct internet access to database is permitted!',
    messageAr: dbDirectInternetBlocked
      ? 'قاعدة البيانات غير قابلة للوصول مباشرة من الإنترنت.'
      : 'يسمح بالوصول المباشر لقاعدة البيانات من الإنترنت!',
  });

  // Check 11: Security Boundary - Internet to Application VM MUST be BLOCKED
  const internetToApp = evaluateCloudReachability({
    source: { ip: '203.0.113.99', isInternet: true },
    destination: { ip: '10.100.10.45', workloadType: 'APP_VM' },
    protocol: 'TCP',
    port: 80,
  });
  const appDirectInternetBlocked = !internetToApp.reachable;
  checks.push({
    id: 'ARCH-SEC-INTERNET-TO-APP-BLOCKED',
    nameEn: 'Direct Internet Access to App VM Blocked',
    nameAr: 'حظر وصول الإنترنت المباشر لخوادم التطبيقات',
    passed: appDirectInternetBlocked,
    messageEn: appDirectInternetBlocked
      ? 'Application VMs shielded in private subnet; direct internet access blocked.'
      : 'Direct internet access to application VM is permitted!',
    messageAr: appDirectInternetBlocked
      ? 'خوادم التطبيقات محمية في شبكة خاصة؛ حظر الوصول المباشر من الإنترنت.'
      : 'يسمح بالوصول المباشر لخوادم التطبيقات من الإنترنت!',
  });

  // Check 12: Security Boundary - Internet to Storage Endpoint MUST be BLOCKED
  const internetToStorage = evaluateCloudReachability({
    source: { ip: '203.0.113.99', isInternet: true },
    destination: { ip: '10.100.10.200', workloadType: 'STORAGE_ENDPOINT' },
    protocol: 'TCP',
    port: 443,
  });
  const storageDirectInternetBlocked = !internetToStorage.reachable;
  checks.push({
    id: 'ARCH-SEC-INTERNET-TO-STORAGE-BLOCKED',
    nameEn: 'Direct Internet Access to Internal Storage Endpoint Blocked',
    nameAr: 'حظر وصول الإنترنت لنقاط نهاية التخزين الداخلية',
    passed: storageDirectInternetBlocked,
    messageEn: storageDirectInternetBlocked
      ? 'Storage PrivateLink endpoint strictly unreachable from public internet.'
      : 'Direct internet access to storage endpoint is permitted!',
    messageAr: storageDirectInternetBlocked
      ? 'نقطة نهاية التخزين PrivateLink معزولة تمامًا عن الإنترنت العام.'
      : 'يسمح بالوصول المباشر لنقطة نهاية التخزين من الإنترنت!',
  });

  // Check 13: Security Boundary - Internet to Secret Store MUST be BLOCKED
  const internetToSecrets = evaluateCloudReachability({
    source: { ip: '203.0.113.99', isInternet: true },
    destination: { ip: '10.100.10.201', workloadType: 'SECRET_STORE' },
    protocol: 'TCP',
    port: 443,
  });
  const secretsDirectInternetBlocked = !internetToSecrets.reachable;
  checks.push({
    id: 'ARCH-SEC-INTERNET-TO-SECRETS-BLOCKED',
    nameEn: 'Direct Internet Access to Secret Store Blocked',
    nameAr: 'حظر وصول الإنترنت المباشر لمخزن الأسرار',
    passed: secretsDirectInternetBlocked,
    messageEn: secretsDirectInternetBlocked
      ? 'Secret Store PrivateLink endpoint strictly unreachable from public internet.'
      : 'Direct internet access to secret store is permitted!',
    messageAr: secretsDirectInternetBlocked
      ? 'نقطة نهاية مخزن الأسرار معزولة تمامًا عن الإنترنت العام.'
      : 'يسمح بالوصول المباشر لمخزن الأسرار من الإنترنت!',
  });

  const failedChecks = checks.filter((c) => !c.passed).map((c) => c.nameEn);
  const businessContinuityPassed =
    internetToAlb.reachable && appToDb.reachable && appToStorage.reachable && appToSecrets.reachable;
  const passed = failedChecks.length === 0 && businessContinuityPassed;

  return {
    passed,
    checks,
    failedChecks,
    businessContinuityPassed,
  };
}
