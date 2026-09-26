/**
 * OMEGA V13 — Cloud Security World
 * logic/detection.ts
 *
 * Deterministic Cloud Threat Detection Rules & Security Operations Alerts.
 * Maps CloudTrail & Telemetry events to MITRE ATT&CK Cloud Matrix tactics and techniques.
 * Zero non-deterministic functions.
 */

import { CloudAuditLogEntry } from './logging';

export interface CloudDetectionAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  virtualTime: number;
  principalArn: string;
  sourceIp: string;
  affectedResource: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  recommendedActionEn: string;
  recommendedActionAr: string;
}

export interface CloudDetectionRule {
  id: string;
  name: string;
  mitreTechniqueId: string;
  mitreTechniqueName: string;
  severity: CloudDetectionAlert['severity'];
  descriptionEn: string;
  descriptionAr: string;
  evaluate: (event: CloudAuditLogEntry, recentEvents: CloudAuditLogEntry[]) => CloudDetectionAlert | null;
}

export const CLOUD_DETECTION_RULES: CloudDetectionRule[] = [
  {
    id: 'CLOUD-DET-01',
    name: 'IMDS SSRF Credential Theft Attempt',
    mitreTechniqueId: 'T1552.005',
    mitreTechniqueName: 'Cloud Instance Metadata API',
    severity: 'HIGH',
    descriptionEn: 'Detects unauthorized retrieval of IAM role security credentials via instance metadata API without IMDSv2 token.',
    descriptionAr: 'رصد محاولة استخراج بيانات اعتماد دور IAM عبر واجهة بيانات التعريف دون رمز IMDSv2.',
    evaluate: (event) => {
      if (
        event.eventName === 'GetSecurityCredentials' ||
        (event.eventName === 'AssumeRole' && event.userAgent.toLowerCase().includes('imds-v1-query'))
      ) {
        return {
          id: `ALT-IMDS-${event.id}`,
          ruleId: 'CLOUD-DET-01',
          ruleName: 'IMDS SSRF Credential Theft Attempt',
          mitreTechniqueId: 'T1552.005',
          mitreTechniqueName: 'Cloud Instance Metadata API',
          severity: 'HIGH',
          virtualTime: event.eventTimeVirtual,
          principalArn: event.userIdentity.arn,
          sourceIp: event.sourceIPAddress,
          affectedResource: event.requestParameters?.roleName || 'ComputeInstanceProfile',
          titleEn: 'IMDSv1 Credential Harvest Detected',
          titleAr: 'تم رصد استخراج بيانات اعتماد عبر IMDSv1',
          summaryEn: `Workload identity credentials retrieved from 169.254.169.254 by ${event.sourceIPAddress} without session token.`,
          summaryAr: `تم الحصول على بيانات الاعتماد من 169.254.169.254 بواسطة ${event.sourceIPAddress} دون استخدام رمز جلسة.`,
          recommendedActionEn: 'Enforce IMDSv2 (HttpTokens=required), set hop limit to 1, and patch web SSRF vulnerability.',
          recommendedActionAr: 'افرض استخدام IMDSv2 واضبط القفزات على 1 ورقع ثغرة SSRF في التطبيق.',
        };
      }
      return null;
    },
  },
  {
    id: 'CLOUD-DET-02',
    name: 'Anomalous Cross-Account Administrative Role Assumption',
    mitreTechniqueId: 'T1078.004',
    mitreTechniqueName: 'Cloud Accounts: Role Assumption',
    severity: 'CRITICAL',
    descriptionEn: 'Detects role assumption granting administrative privileges from an unexpected or untrusted IP.',
    descriptionAr: 'رصد تقمص دور يمنح صلاحيات إدارية من عنوان IP غير موثوق به.',
    evaluate: (event) => {
      if (
        event.eventName === 'AssumeRole' &&
        (event.requestParameters?.roleArn?.includes('Admin') || event.requestParameters?.roleArn?.includes('Elevated'))
      ) {
        // Untrusted source IP (not in 10.100.x.x or approved VPN)
        if (!event.sourceIPAddress.startsWith('10.100.') && event.sourceIPAddress !== '198.51.100.10') {
          return {
            id: `ALT-ROLE-${event.id}`,
            ruleId: 'CLOUD-DET-02',
            ruleName: 'Anomalous Administrative Role Assumption',
            mitreTechniqueId: 'T1078.004',
            mitreTechniqueName: 'Cloud Accounts: Role Assumption',
            severity: 'CRITICAL',
            virtualTime: event.eventTimeVirtual,
            principalArn: event.userIdentity.arn,
            sourceIp: event.sourceIPAddress,
            affectedResource: event.requestParameters?.roleArn || 'AdministrativeRole',
            titleEn: 'Privileged Role Assumed from External IP',
            titleAr: 'تقمص دور ذي صلاحيات عالية من عنوان IP خارجي',
            summaryEn: `Role ${event.requestParameters?.roleArn} assumed by ${event.userIdentity.arn} from untrusted IP ${event.sourceIPAddress}.`,
            summaryAr: `تم تقمص الدور ${event.requestParameters?.roleArn} من عنوان غير معتمد ${event.sourceIPAddress}.`,
            recommendedActionEn: 'Revoke temporary session credentials, attach explicit deny policy to role, and investigate principal compromise.',
            recommendedActionAr: 'ألغِ جلسة الدور المؤقتة فورًا وافرض حظرًا صريحًا وحقق في اختراق المستخدم.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'CLOUD-DET-03',
    name: 'Mass Data Exfiltration from Cloud Storage Bucket',
    mitreTechniqueId: 'T1530',
    mitreTechniqueName: 'Data from Cloud Storage Object',
    severity: 'CRITICAL',
    descriptionEn: 'Detects high-volume GetObject requests across confidential or restricted storage buckets in short window.',
    descriptionAr: 'رصد سحب جماعي للملفات من حاويات التخزين الحساسة أو السرية في نافذة زمنية قصيرة.',
    evaluate: (event, recentEvents) => {
      if (event.eventName === 'GetObject') {
        const bucket = event.requestParameters?.bucketName || '';
        if (bucket.includes('finance') || bucket.includes('vault') || bucket.includes('analytics')) {
          // Check count in recent events
          const getCount = recentEvents.filter(
            (e) =>
              e.eventName === 'GetObject' &&
              e.sourceIPAddress === event.sourceIPAddress &&
              e.eventTimeVirtual >= event.eventTimeVirtual - 300
          ).length;

          if (getCount >= 3) {
            return {
              id: `ALT-EXFIL-${event.id}`,
              ruleId: 'CLOUD-DET-03',
              ruleName: 'Mass Data Exfiltration from Cloud Storage Bucket',
              mitreTechniqueId: 'T1530',
              mitreTechniqueName: 'Data from Cloud Storage Object',
              severity: 'CRITICAL',
              virtualTime: event.eventTimeVirtual,
              principalArn: event.userIdentity.arn,
              sourceIp: event.sourceIPAddress,
              affectedResource: bucket,
              titleEn: 'High-Volume Object Retrieval / Exfiltration',
              titleAr: 'عملية تحميل واستنزاف جماعي للملفات الحساسة',
              summaryEn: `Rapid consecutive GetObject calls on ${bucket} from ${event.sourceIPAddress} (${getCount} objects accessed).`,
              summaryAr: `عمليات تحميل متتالية سريعة لملفات الحاوية ${bucket} من ${event.sourceIPAddress} (تم الوصول لـ ${getCount} ملفات).`,
              recommendedActionEn: 'Apply restrictive bucket policy immediately, block source IP in VPC NACL, and review DLP audit logs.',
              recommendedActionAr: 'طبق سياسة حظر فوري على الحاوية واحظر IP المهاجم في NACL وراجع سجلات التسريب.',
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'CLOUD-DET-04',
    name: 'Cloud Audit Logging Disabled (Defense Evasion)',
    mitreTechniqueId: 'T1562.001',
    mitreTechniqueName: 'Impair Defenses: Disable Cloud Logs',
    severity: 'CRITICAL',
    descriptionEn: 'Detects attempts to stop CloudTrail logging or delete logging buckets to conceal adversary presence.',
    descriptionAr: 'رصد محاولات إيقاف تسجيل سجلات التدقيق أو حذف حاويات السجلات لإخفاء النشاط العدائي.',
    evaluate: (event) => {
      if (
        event.eventName === 'StopLogging' ||
        event.eventName === 'DeleteTrail' ||
        event.eventName === 'UpdateTrail' ||
        event.eventName === 'PutBucketPolicy' && event.requestParameters?.bucketName?.includes('audit')
      ) {
        return {
          id: `ALT-EVASION-${event.id}`,
          ruleId: 'CLOUD-DET-04',
          ruleName: 'Cloud Audit Logging Disabled (Defense Evasion)',
          mitreTechniqueId: 'T1562.001',
          mitreTechniqueName: 'Impair Defenses: Disable Cloud Logs',
          severity: 'CRITICAL',
          virtualTime: event.eventTimeVirtual,
          principalArn: event.userIdentity.arn,
          sourceIp: event.sourceIPAddress,
          affectedResource: event.requestParameters?.name || 'CentralAuditTrail',
          titleEn: 'Security Audit Trail Tamper Attempt',
          titleAr: 'محاولة تعطيل أو التلاعب بسجلات التدقيق الأمني',
          summaryEn: `Call ${event.eventName} executed against audit logging infrastructure by ${event.userIdentity.arn}.`,
          summaryAr: `تم تنفيذ العملية ${event.eventName} ضد بنية سجلات التدقيق بواسطة ${event.userIdentity.arn}.`,
          recommendedActionEn: 'Re-enable CloudTrail immediately and enforce Service Control Policy (SCP) to prevent trail deletion.',
          recommendedActionAr: 'أعد تفعيل السجلات فورًا وافرض سياسة تحكم بالمؤسسة (SCP) تمنع حذف أو إيقاف السجلات.',
        };
      }
      return null;
    },
  },
];

/**
 * Runs all detection rules against a stream of audit log events deterministically.
 */
export function evaluateCloudDetections(events: CloudAuditLogEntry[]): CloudDetectionAlert[] {
  const alerts: CloudDetectionAlert[] = [];
  const alertIds = new Set<string>();

  events.forEach((event, idx) => {
    const priorWindow = events.slice(Math.max(0, idx - 10), idx + 1);
    for (const rule of CLOUD_DETECTION_RULES) {
      const alert = rule.evaluate(event, priorWindow);
      if (alert && !alertIds.has(alert.id)) {
        alertIds.add(alert.id);
        alerts.push(alert);
      }
    }
  });

  return alerts;
}
