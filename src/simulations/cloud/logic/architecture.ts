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
