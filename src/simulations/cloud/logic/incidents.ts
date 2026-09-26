/**
 * OMEGA V13 — Cloud Security World
 * logic/incidents.ts
 *
 * Deterministic Cloud Incident Response Engine & Playbook Automation.
 * Guides the learner through Triage, Containment, Eradication, and Recovery
 * for a multi-stage cloud breach.
 * Zero non-deterministic functions.
 */

export type IncidentStage = 'TRIAGE' | 'CONTAINMENT' | 'ERADICATION' | 'RECOVERY' | 'RESOLVED';

export interface CloudIncidentPhase {
  phaseId: number;
  nameEn: string;
  nameAr: string;
  virtualTime: number;
  attackerActionEn: string;
  attackerActionAr: string;
  mitreTactic: string;
  telemetryEvidence: string;
  isContained: boolean;
}

export interface IncidentPlaybookAction {
  id: string;
  titleEn: string;
  titleAr: string;
  category: 'IAM' | 'NETWORK' | 'COMPUTE' | 'STORAGE' | 'LOGGING';
  descriptionEn: string;
  descriptionAr: string;
  isExecuted: boolean;
  requiredForStage: IncidentStage;
}

export interface CloudIncidentCase {
  caseId: string;
  titleEn: string;
  titleAr: string;
  currentStage: IncidentStage;
  severity: 'CRITICAL';
  compromisedWorkloadId: string;
  compromisedRoleArn: string;
  targetedBucketName: string;
  timeline: CloudIncidentPhase[];
  playbookActions: IncidentPlaybookAction[];
  isFullyRemediated: boolean;
}

export function createDefaultCloudIncident(): CloudIncidentCase {
  const timeline: CloudIncidentPhase[] = [
    {
      phaseId: 1,
      nameEn: 'Initial Access via Web SSRF Vulnerability',
      nameAr: 'الوصول الأولي عبر ثغرة SSRF في خادم الويب',
      virtualTime: 200,
      attackerActionEn: 'Attacker queries /api/v1/preview?url=http://169.254.169.254/latest/meta-data/',
      attackerActionAr: 'المهاجم يرسل استعلامًا لمعاينة الرابط يستهدف عنوان بيانات التعريف 169.254.169.254',
      mitreTactic: 'Initial Access (T1190)',
      telemetryEvidence: 'HTTP GET /api/v1/preview returned 200 OK with IMDS directory structure.',
      isContained: false,
    },
    {
      phaseId: 2,
      nameEn: 'IMDSv1 Role Credential Harvesting',
      nameAr: 'استخراج بيانات اعتماد الدور السحابي عبر IMDSv1',
      virtualTime: 450,
      attackerActionEn: 'Attacker retrieves AccessKeyId, SecretAccessKey, and Token for NexoraAppWorkloadInstanceProfileRole.',
      attackerActionAr: 'المهاجم يستخرج المفاتيح المؤقتة ورمز الجلسة لدور خادم التطبيقات.',
      mitreTactic: 'Credential Access (T1552.005)',
      telemetryEvidence: 'Audit log: GetSecurityCredentials issued for NexoraAppWorkloadInstanceProfileRole.',
      isContained: false,
    },
    {
      phaseId: 3,
      nameEn: 'Cloud Reconnaissance & Storage Enumeration',
      nameAr: 'استطلاع السحابة وسرد حاويات التخزين',
      virtualTime: 750,
      attackerActionEn: 'Attacker invokes storage:ListBuckets and discovers nexora-analytics-raw-bucket & finance-vault.',
      attackerActionAr: 'المهاجم ينفذ أمر سرد الحاويات ويكتشف حاوية التحليلات وخزينة المالية.',
      mitreTactic: 'Discovery (T1580)',
      telemetryEvidence: 'CloudTrail: ListAllMyBuckets from anomalous external IP.',
      isContained: false,
    },
    {
      phaseId: 4,
      nameEn: 'Mass Exfiltration of Customer Records',
      nameAr: 'سحب وتسريب جماعي لسجلات العملاء',
      virtualTime: 1100,
      attackerActionEn: 'Attacker downloads export_pii_dump_2026.csv via public access and attempted GET on finance vault.',
      attackerActionAr: 'المهاجم يحمل ملف بيانات العملاء عبر الوصول العام ويحاول سحب مستندات المالية.',
      mitreTactic: 'Exfiltration (T1530)',
      telemetryEvidence: 'Storage GetObject logs indicate 25.8 MB egress to external destination.',
      isContained: false,
    },
    {
      phaseId: 5,
      nameEn: 'Defense Evasion & Audit Trail Tamper Attempt',
      nameAr: 'محاولة تعطيل سجلات التدقيق لتغطية الآثار',
      virtualTime: 1400,
      attackerActionEn: 'Attacker attempts StopLogging on CloudTrail to blind security analysts.',
      attackerActionAr: 'المهاجم يحاول إيقاف تسجيل العمليات في CloudTrail لإعماء فريق التحقيق الأمني.',
      mitreTactic: 'Defense Evasion (T1562.001)',
      telemetryEvidence: 'Alert: CloudTrail StopLogging call detected and intercepted.',
      isContained: false,
    },
  ];

  const playbookActions: IncidentPlaybookAction[] = [
    {
      id: 'ACT-ENFORCE-IMDSV2',
      titleEn: 'Enforce IMDSv2 on Compromised Compute Workload',
      titleAr: 'فرض استخدام IMDSv2 على الخادم المخترق',
      category: 'COMPUTE',
      descriptionEn: 'Update compute instance metadata options to require session tokens (HttpTokens=required) and set hop limit to 1.',
      descriptionAr: 'تحديث خيارات بيانات التعريف لإلزام استخدام رموز الجلسات وضبط القفزات على 1.',
      isExecuted: false,
      requiredForStage: 'CONTAINMENT',
    },
    {
      id: 'ACT-REVOKE-IAM-SESSIONS',
      titleEn: 'Revoke Compromised IAM Role Active Sessions',
      titleAr: 'إلغاء الجلسات النشطة للدور السحابي المخترق',
      category: 'IAM',
      descriptionEn: 'Attach an explicit Deny policy for requests with session creation timestamps prior to incident virtual time.',
      descriptionAr: 'إرفاق سياسة حظر صريحة لجميع الجلسات التي تم إنشاؤها قبل توقيت رصد الحادث.',
      isExecuted: false,
      requiredForStage: 'CONTAINMENT',
    },
    {
      id: 'ACT-BLOCK-PUBLIC-S3',
      titleEn: 'Apply Organization-Wide S3 Block Public Access (BPA)',
      titleAr: 'تفعيل حظر الوصول العام للحاويات على مستوى المنظمة',
      category: 'STORAGE',
      descriptionEn: 'Enable all 4 Block Public Access controls on nexora-analytics-raw-bucket and account root.',
      descriptionAr: 'تفعيل ضوابط حظر الوصول العام الأربعة على حاوية التحليلات وحساب المؤسسة.',
      isExecuted: false,
      requiredForStage: 'ERADICATION',
    },
    {
      id: 'ACT-RESTRICT-SECURITY-GROUPS',
      titleEn: 'Remove Open Inbound SSH/RDP Security Group Rules',
      titleAr: 'إزالة قواعد السماح المفتوحة لـ SSH و RDP في مجموعات الأمان',
      category: 'NETWORK',
      descriptionEn: 'Delete 0.0.0.0/0 ingress rules on port 22 and 3389 in vulnerable development security group.',
      descriptionAr: 'حذف قواعد الدخول لـ 0.0.0.0/0 على المنافذ 22 و 3389 في مجموعة الأمان غير الآمنة.',
      isExecuted: false,
      requiredForStage: 'ERADICATION',
    },
    {
      id: 'ACT-LOCK-CLOUDTRAIL-SCP',
      titleEn: 'Enforce Service Control Policy (SCP) to Protect CloudTrail',
      titleAr: 'فرض سياسة تحكم (SCP) لحماية واستمرارية سجلات التدقيق',
      category: 'LOGGING',
      descriptionEn: 'Deploy organization SCP explicitly denying StopLogging and DeleteTrail across all child accounts.',
      descriptionAr: 'نشر سياسة SCP تمنع إيقاف أو حذف سجلات التدقيق عبر جميع حسابات المؤسسة التابعة.',
      isExecuted: false,
      requiredForStage: 'RECOVERY',
    },
  ];

  return {
    caseId: 'INC-NEXORA-CLOUD-2026-01',
    titleEn: 'Operation Cloud Storm: Web SSRF to Instance Role Exfiltration',
    titleAr: 'عملية العاصفة السحابية: من ثغرة SSRF إلى سحب بيانات الاعتماد وتسريب البيانات',
    currentStage: 'TRIAGE',
    severity: 'CRITICAL',
    compromisedWorkloadId: 'inst-web-prod-01',
    compromisedRoleArn: 'ncrn:nexora:iam::acc-prod-003:role/NexoraAppWorkloadInstanceProfileRole',
    targetedBucketName: 'nexora-analytics-raw-bucket',
    timeline,
    playbookActions,
    isFullyRemediated: false,
  };
}

/**
 * Evaluates playbook execution progress and advances the incident stage.
 */
export function evaluateIncidentProgress(incident: CloudIncidentCase): {
  newStage: IncidentStage;
  isComplete: boolean;
  unexecutedRequiredActions: string[];
} {
  const executedIds = new Set(incident.playbookActions.filter((a) => a.isExecuted).map((a) => a.id));

  const containmentActions = incident.playbookActions.filter((a) => a.requiredForStage === 'CONTAINMENT');
  const eradicationActions = incident.playbookActions.filter((a) => a.requiredForStage === 'ERADICATION');
  const recoveryActions = incident.playbookActions.filter((a) => a.requiredForStage === 'RECOVERY');

  const hasContainment = containmentActions.every((a) => executedIds.has(a.id));
  const hasEradication = eradicationActions.every((a) => executedIds.has(a.id));
  const hasRecovery = recoveryActions.every((a) => executedIds.has(a.id));

  let newStage: IncidentStage = 'TRIAGE';
  if (hasContainment && !hasEradication) {
    newStage = 'ERADICATION';
  } else if (hasContainment && hasEradication && !hasRecovery) {
    newStage = 'RECOVERY';
  } else if (hasContainment && hasEradication && hasRecovery) {
    newStage = 'RESOLVED';
  } else if (hasContainment) {
    newStage = 'CONTAINMENT';
  }

  const unexecuted = incident.playbookActions.filter((a) => !a.isExecuted).map((a) => a.titleEn);

  return {
    newStage,
    isComplete: newStage === 'RESOLVED',
    unexecutedRequiredActions: unexecuted,
  };
}
