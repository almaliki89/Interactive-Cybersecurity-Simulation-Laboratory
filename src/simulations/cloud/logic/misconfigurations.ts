/**
 * OMEGA V13 — Cloud Security World
 * logic/misconfigurations.ts
 *
 * Deterministic Cloud Misconfiguration Scanner & Remediation Engine (CSPM).
 * Identifies high-risk security flaws across IAM, Network, Storage, Compute, Secrets, and Logging.
 * Zero non-deterministic functions.
 */

import { CloudStorageBucket } from './storage';
import { CloudSecurityGroup } from './securityGroups';
import { CloudPrincipal } from './identity';
import { CloudPolicy } from './policies';
import { CloudComputeInstance } from './compute';
import { CloudTrailConfig } from './logging';

export type MisconfigCategory = 'IAM' | 'NETWORK' | 'STORAGE' | 'SECRETS' | 'LOGGING' | 'COMPUTE';
export type MisconfigSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface CloudMisconfiguration {
  id: string;
  category: MisconfigCategory;
  severity: MisconfigSeverity;
  resourceId: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  riskImpactEn: string;
  riskImpactAr: string;
  remediationStepsEn: string;
  remediationStepsAr: string;
  isRemediated: boolean;
}

export interface CloudInfrastructureState {
  buckets: CloudStorageBucket[];
  securityGroups: CloudSecurityGroup[];
  principals: CloudPrincipal[];
  policies: CloudPolicy[];
  computeInstances: CloudComputeInstance[];
  trailConfig: CloudTrailConfig;
  rootHasActiveAccessKey: boolean;
}

/**
 * Scans the full cloud environment state for misconfigurations deterministically.
 */
export function scanCloudMisconfigurations(state: CloudInfrastructureState): CloudMisconfiguration[] {
  const findings: CloudMisconfiguration[] = [];

  // 1. Storage: Public Buckets
  state.buckets.forEach((bucket) => {
    const bpa = bucket.publicAccessBlock;
    const isPublic = !bpa.blockPublicPolicy || !bpa.blockPublicAcls || bucket.isPubliclyExposed;
    if (isPublic) {
      findings.push({
        id: `MISCFG-S3-PUBLIC-${bucket.id}`,
        category: 'STORAGE',
        severity: 'CRITICAL',
        resourceId: bucket.name,
        titleEn: `Publicly Accessible Storage Bucket: ${bucket.name}`,
        titleAr: `حاوية تخزين سحابية متاحة للعامة: ${bucket.name}`,
        descriptionEn: `Bucket has Block Public Access disabled and allows unauthenticated internet downloads.`,
        descriptionAr: `الحاوية معطل فيها حظر الوصول العام وتسمح بتحميل الملفات دون توثيق عبر الإنترنت.`,
        riskImpactEn: 'Data breach and mass exfiltration of sensitive corporate or customer records.',
        riskImpactAr: 'تسريب جماعي للبيانات وسحب ملفات حساسة خاصة بالشركة والعملاء.',
        remediationStepsEn: 'Enable all 4 Block Public Access (BPA) controls and remove public wildcard statements from bucket policy.',
        remediationStepsAr: 'قم بتفعيل ضوابط حظر الوصول العام الأربعة كاملة وإزالة بنود السياسة العامة.',
        isRemediated: false,
      });
    }

    if (!bucket.encryption.enabled) {
      findings.push({
        id: `MISCFG-S3-UNENCRYPTED-${bucket.id}`,
        category: 'STORAGE',
        severity: 'MEDIUM',
        resourceId: bucket.name,
        titleEn: `Unencrypted Storage at Rest: ${bucket.name}`,
        titleAr: `تخزين غير مشفر في حالة السكون: ${bucket.name}`,
        descriptionEn: `Bucket is not configured with default KMS server-side encryption.`,
        descriptionAr: `الحاوية غير مفعل بها التشفير الافتراضي باستخدام مفاتيح KMS.`,
        riskImpactEn: 'Non-compliance with financial and privacy regulations (GDPR/HIPAA/SOX).',
        riskImpactAr: 'عدم الامتثال للوائح المالية وحماية الخصوصية التنظيمية.',
        remediationStepsEn: 'Enable AES256 or Customer Managed KMS encryption and enforce TLS.',
        remediationStepsAr: 'فعل التشفير عبر KMS وافرض استخدام بروتوكول TLS المشفر.',
        isRemediated: false,
      });
    }
  });

  // 2. Network: Security Groups with open management ports (22, 3389)
  state.securityGroups.forEach((sg) => {
    sg.ingressRules.forEach((rule) => {
      if (rule.sourceOrDestination === '0.0.0.0/0' && rule.portRange !== 'ALL') {
        const [start, end] = rule.portRange;
        if ((start <= 22 && end >= 22) || (start <= 3389 && end >= 3389)) {
          findings.push({
            id: `MISCFG-SG-OPEN-MGMT-${sg.id}-${rule.id}`,
            category: 'NETWORK',
            severity: 'CRITICAL',
            resourceId: sg.name,
            titleEn: `Management Port Exposed to Internet: ${sg.name}`,
            titleAr: `منفذ إدارة مفتوح لجميع عناوين الإنترنت: ${sg.name}`,
            descriptionEn: `Rule '${rule.id}' exposes administrative port (${start === 22 ? 'SSH 22' : 'RDP 3389'}) to 0.0.0.0/0.`,
            descriptionAr: `القاعدة '${rule.id}' تفتح منفذ الإدارة (${start === 22 ? 'SSH 22' : 'RDP 3389'}) للعامة 0.0.0.0/0.`,
            riskImpactEn: 'Direct brute-force, zero-day exploitation, and remote host takeover.',
            riskImpactAr: 'هجمات التخمين والاستغلال المباشر والسيطرة عن بعد على الخوادم.',
            remediationStepsEn: 'Restrict management ingress to private corporate VPN CIDR or use Systems Manager Session Manager.',
            remediationStepsAr: 'احصر الوصول على نطاق VPN الداخلي للشركة أو استخدم مدير الجلسات السحابي.',
            isRemediated: false,
          });
        }
      }
    });
  });

  // 3. Compute: IMDSv1 enabled
  state.computeInstances.forEach((inst) => {
    if (inst.imdsConfig.version === 'v1' || inst.imdsConfig.httpTokens === 'optional') {
      findings.push({
        id: `MISCFG-IMDSV1-${inst.id}`,
        category: 'COMPUTE',
        severity: 'HIGH',
        resourceId: inst.name,
        titleEn: `IMDSv1 In Use on Compute: ${inst.name}`,
        titleAr: `إصدار بيانات التعريف القديم IMDSv1 متاح: ${inst.name}`,
        descriptionEn: `Instance allows token-less HTTP GET to metadata IP 169.254.169.254, vulnerable to SSRF.`,
        descriptionAr: `الخادم يسمح باستعلام بيانات التعريف دون رمز جلسة، مما يجعله عرضة لهجمات SSRF.`,
        riskImpactEn: 'Attacker exploiting web SSRF can steal IAM instance profile credentials directly.',
        riskImpactAr: 'المهاجم المستغل لثغرات SSRF يمكنه سرقة بيانات اعتماد دور الخادم مباشرة.',
        remediationStepsEn: 'Enforce IMDSv2 (HttpTokens=required) and set hop limit to 1.',
        remediationStepsAr: 'افرض استخدام IMDSv2 واضبط الحد الأقصى للقفزات على 1.',
        isRemediated: false,
      });
    }
  });

  // 4. IAM: Wildcard Admin Policies
  state.policies.forEach((pol) => {
    if (pol.isWildcardAdmin) {
      findings.push({
        id: `MISCFG-IAM-WILDCARD-${pol.id}`,
        category: 'IAM',
        severity: 'HIGH',
        resourceId: pol.name,
        titleEn: `Overly Permissive IAM Policy: ${pol.name}`,
        titleAr: `سياسة صلاحيات مفرطة واسعة النطاق: ${pol.name}`,
        descriptionEn: `Policy grants wildcard Action: '*' on Resource: '*', violating principle of least privilege.`,
        descriptionAr: `السياسة تمنح صلاحيات شاملة (*:*) مخالفة لمبدأ الامتياز الأدنى.`,
        riskImpactEn: 'Any principal assigned this policy obtains unrestricted administrative power.',
        riskImpactAr: 'أي مستخدم يحصل على هذه السياسة يمتلك صلاحية سيطرة مطلقة على السحابة.',
        remediationStepsEn: 'Replace with fine-grained scoped actions and specific resource ARNs.',
        remediationStepsAr: 'استبدل السياسة بأفعال محددة بدقة وحصر الموارد بمعرفات ARN الخاصة بها.',
        isRemediated: false,
      });
    }
  });

  // 5. Logging: Audit trail disabled or missing log file validation
  if (!state.trailConfig.isLogging) {
    findings.push({
      id: 'MISCFG-LOGGING-DISABLED',
      category: 'LOGGING',
      severity: 'CRITICAL',
      resourceId: state.trailConfig.name,
      titleEn: 'Central Cloud Audit Trail is Disabled',
      titleAr: 'سجل تدقيق السحابة المركزي معطل',
      descriptionEn: 'CloudTrail recording is turned off, leaving the organization blind to security events.',
      descriptionAr: 'تسجيل عمليات السحابة متوقف، مما يترك المؤسسة عمياء أمام الأحداث الأمنية.',
      riskImpactEn: 'Zero visibility into adversary activity, identity compromises, or unauthorized changes.',
      riskImpactAr: 'غياب كامل للرؤية حول نشاط المهاجمين واختراق الهويات والتعديلات غير المصرح بها.',
      remediationStepsEn: 'Enable multi-region CloudTrail logging across all accounts immediately.',
      remediationStepsAr: 'قم بتفعيل تسجيل سجلات التدقيق في جميع المناطق والحسابات فورًا.',
      isRemediated: false,
    });
  } else if (!state.trailConfig.enableLogFileValidation) {
    findings.push({
      id: 'MISCFG-LOG-VALIDATION-OFF',
      category: 'LOGGING',
      severity: 'MEDIUM',
      resourceId: state.trailConfig.name,
      titleEn: 'Log File Integrity Validation Disabled',
      titleAr: 'التحقق من سلامة ملفات السجلات معطل',
      descriptionEn: 'Digest files are not being generated; log modifications cannot be detected.',
      descriptionAr: 'لا يتم إنشاء بصمات التجزئة، وبالتالي يتعذر رصد تعديل أو حذف السجلات.',
      riskImpactEn: 'Adversary can tamper with or delete audit records without detection.',
      riskImpactAr: 'يمكن للمهاجم العبث بالسجلات أو حذفها دون أن يتم اكتشافه.',
      remediationStepsEn: 'Turn on enableLogFileValidation in CloudTrail configuration.',
      remediationStepsAr: 'فعل خيار التحقق من سلامة السجلات في إعدادات CloudTrail.',
      isRemediated: false,
    });
  }

  // 6. Identity: Root account active access keys
  if (state.rootHasActiveAccessKey) {
    findings.push({
      id: 'MISCFG-ROOT-ACCESS-KEY',
      category: 'SECRETS',
      severity: 'CRITICAL',
      resourceId: 'Root Account',
      titleEn: 'Active Long-Lived Access Key on Root Account',
      titleAr: 'وجود مفتاح وصول طويل الأمد نشط لحساب الجذر (Root)',
      descriptionEn: 'Root account has programmatic API keys generated. Root should only be used for break-glass console logins.',
      descriptionAr: 'تم إنشاء مفتاح وصول برمجي لحساب الجذر. يجب استخدام الجذر للطوارئ فقط عبر لوحة التحكم.',
      riskImpactEn: 'Key compromise results in irreversible, total organization takeover.',
      riskImpactAr: 'تسريب المفتاح يؤدي إلى فقدان السيطرة التامة وغير القابلة للاسترداد على المؤسسة.',
      remediationStepsEn: 'Delete all root access keys immediately and enforce MFA on root console.',
      remediationStepsAr: 'احذف جميع مفاتيح الوصول لحساب الجذر فورًا وافرض المصادقة الثنائية.',
      isRemediated: false,
    });
  }

  return findings;
}
