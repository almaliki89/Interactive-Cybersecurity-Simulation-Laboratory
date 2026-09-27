/**
 * OMEGA V16 — Simulation Threat Intelligence Knowledge Layer
 * Deterministic IOC/IOA indicators, Threat Actor Profiles, and ATT&CK TTP Mappings.
 * Fully deterministic - no live external internet dependencies.
 */

import { SecurityTelemetryEvent } from '../../soc/logic/telemetry';
import { ThreatIntelIndicator, ThreatActorProfile } from './types';

export const SIMULATION_THREAT_ACTORS: ThreatActorProfile[] = [
  {
    id: 'ACTOR-NEXORA-APT',
    name: 'SILVER_JACKAL (APT-NEX-01)',
    aliases: ['ShadowWeaver', 'UNC-2026-FIN'],
    origin: 'Simulated Advanced Persistent Threat',
    motivationEn: 'Financial Espionage & Cloud Supply Chain Infiltration',
    motivationAr: 'التجسس المالي واختراق سلاسل توريد الخدمات السحابية',
    targetedSectors: ['Financial Services', 'Enterprise Software', 'DevOps Infrastructure'],
    ttps: ['T1110 (Brute Force)', 'T1059 (Command & Scripting)', 'T1078 (Valid Accounts)', 'T1195 (Supply Chain)'],
    activeCampaign: 'OPERATION_NEXUS_BREACH',
    confidence: 'HIGH',
  },
  {
    id: 'ACTOR-CLOUD-LURKER',
    name: 'CLOUD_DRIFTER',
    aliases: ['K8s-Specter', 'VaporRaven'],
    origin: 'Simulated Cloud Infrastructure Threat Group',
    motivationEn: 'Resource Hijacking & Secret Harvesting in Kubernetes/AWS',
    motivationAr: 'الاستيلاء على الموارد وسرقة المفاتيح في بيئات Kubernetes والسحابة',
    targetedSectors: ['Cloud Providers', 'SaaS Platforms', 'Fintech'],
    ttps: ['T1098 (Account Manipulation)', 'T1611 (Escape to Host)', 'T1552 (Unsecured Credentials)'],
    activeCampaign: 'CAMPAIGN_KUBE_ESC',
    confidence: 'HIGH',
  },
];

export const SIMULATION_THREAT_INDICATORS: ThreatIntelIndicator[] = [
  // IP IOCs
  {
    id: 'INTEL-IOC-001',
    type: 'IP',
    value: '203.0.113.55',
    titleEn: 'Known C2 Beacon IP (Silver Jackal)',
    titleAr: 'عنوان خادم تحكم وسيطرة معروف (Silver Jackal)',
    descriptionEn: 'Observed as initial staging proxy for credential spray and PowerShell reverse shells.',
    descriptionAr: 'تم رصده كنقطة انطلاق لهجمات تخمين كلمات المرور والاتصال العكسي عبر PowerShell.',
    confidence: 'HIGH',
    severity: 'critical',
    actorName: 'SILVER_JACKAL (APT-NEX-01)',
    campaign: 'OPERATION_NEXUS_BREACH',
    mitreTechniques: ['T1071 - Application Layer Protocol', 'T1110 - Brute Force'],
    firstSeenVirtualTime: 0,
    tags: ['C2', 'PROXY', 'MALICIOUS_IP'],
  },
  {
    id: 'INTEL-IOC-002',
    type: 'IP',
    value: '198.51.100.99',
    titleEn: 'Exfiltration Drop Endpoint',
    titleAr: 'نقطة تفريغ وتسريب البيانات',
    descriptionEn: 'External IP address receiving unauthorized compressed financial archive uploads.',
    descriptionAr: 'عنوان خارجي يستقبل عمليات رفع أرشيفات البيانات المالية غير المصرح بها.',
    confidence: 'HIGH',
    severity: 'threat',
    actorName: 'SILVER_JACKAL (APT-NEX-01)',
    campaign: 'OPERATION_NEXUS_BREACH',
    mitreTechniques: ['T1041 - Exfiltration Over C2 Channel'],
    firstSeenVirtualTime: 500,
    tags: ['EXFILTRATION', 'SUSPICIOUS_IP'],
  },

  // Process / File Hash IOCs
  {
    id: 'INTEL-IOC-003',
    type: 'PROCESS_NAME',
    value: 'powershell.exe',
    titleEn: 'Encoded PowerShell Invocations',
    titleAr: 'تشغيل PowerShell بمعاملات مشفرة',
    descriptionEn: 'Use of powershell.exe with -encodedcommand or -nop to bypass script block logging.',
    descriptionAr: 'استخدام PowerShell مع تشفير الأوامر لتجاوز تسجيل السجلات الأمنية.',
    confidence: 'MEDIUM',
    severity: 'warn',
    actorName: 'SILVER_JACKAL (APT-NEX-01)',
    campaign: 'OPERATION_NEXUS_BREACH',
    mitreTechniques: ['T1059.001 - PowerShell'],
    firstSeenVirtualTime: 200,
    tags: ['LOLBAS', 'PROCESS_INJECTION'],
  },
  {
    id: 'INTEL-IOC-004',
    type: 'HASH_SHA256',
    value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    titleEn: 'Trojanized Build Script Checksum',
    titleAr: 'بصمة تجزئة لسكربت بناء مصاب ببرمجية خبيثة',
    descriptionEn: 'Tainted npm preinstall script injecting reverse telemetry into CI runner.',
    descriptionAr: 'سكربت تثبيت ملوث يقوم بحقن اتصالات عكسية في بيئة تشغيل CI.',
    confidence: 'HIGH',
    severity: 'critical',
    actorName: 'SILVER_JACKAL (APT-NEX-01)',
    campaign: 'OPERATION_NEXUS_BREACH',
    mitreTechniques: ['T1195.002 - Compromise Software Dependencies'],
    firstSeenVirtualTime: 1200,
    tags: ['SUPPLY_CHAIN', 'SHA256', 'MALWARE_HASH'],
  },

  // Behavioral IOAs
  {
    id: 'INTEL-IOA-005',
    type: 'BEHAVIORAL_PATTERN',
    value: 'AUTH_BURST_THEN_SUCCESS',
    titleEn: 'Credential Spray with Immediate Success',
    titleAr: 'هجوم تخمين يتبعه مباشرة نجاح تسجيل دخول',
    descriptionEn: 'Multiple authentication failures within 120s followed by a valid logon and privilege query.',
    descriptionAr: 'إخفاقات تسجيل دخول متعددة خلال 120 ثانية يتبعها تسجيل دخول ناجح واستعلام صلاحيات.',
    confidence: 'HIGH',
    severity: 'threat',
    actorName: 'SILVER_JACKAL (APT-NEX-01)',
    campaign: 'OPERATION_NEXUS_BREACH',
    mitreTechniques: ['T1110.003 - Password Spraying', 'T1078 - Valid Accounts'],
    firstSeenVirtualTime: 100,
    tags: ['IOA', 'BEHAVIORAL', 'CREDENTIAL_ACCESS'],
  },
  {
    id: 'INTEL-IOA-006',
    type: 'BEHAVIORAL_PATTERN',
    value: 'CONTAINER_HOSTPATH_PRIVILEGED',
    titleEn: 'Kubernetes Pod HostPath Mount & Breakout',
    titleAr: 'تثبيت مجلد النظام المضيف في حاوية Kubernetes والهروب منها',
    descriptionEn: 'Creation of pod with securityContext.privileged=true mounting /etc or /var/run/docker.sock.',
    descriptionAr: 'إنشاء حاوية بصلاحيات مميزة مع ربط مسارات النظام الحساسة للوصول إلى العقدة المضيفة.',
    confidence: 'HIGH',
    severity: 'critical',
    actorName: 'CLOUD_DRIFTER',
    campaign: 'CAMPAIGN_KUBE_ESC',
    mitreTechniques: ['T1611 - Escape to Host', 'T1068 - Exploitation for Privilege Escalation'],
    firstSeenVirtualTime: 800,
    tags: ['IOA', 'K8S', 'CONTAINER_ESCAPE'],
  },
];

export class ThreatIntelMatcher {
  /**
   * Evaluates all known indicators against normalized events
   */
  public static matchTelemetry(
    indicators: ThreatIntelIndicator[],
    events: SecurityTelemetryEvent[]
  ): ThreatIntelIndicator[] {
    return indicators.map((indicator) => {
      const matchedEvents: string[] = [];

      events.forEach((event) => {
        let isMatch = false;

        switch (indicator.type) {
          case 'IP':
            if (
              event.sourceIp === indicator.value ||
              event.destinationIp === indicator.value ||
              event.attributes?.sourceIp === indicator.value
            ) {
              isMatch = true;
            }
            break;

          case 'PROCESS_NAME':
            if (
              event.process?.toLowerCase().includes(indicator.value.toLowerCase()) ||
              event.parentProcess?.toLowerCase().includes(indicator.value.toLowerCase())
            ) {
              isMatch = true;
            }
            break;

          case 'HASH_SHA256':
            if (
              event.attributes?.hash === indicator.value ||
              event.attributes?.sha256 === indicator.value ||
              event.attributes?.fileHash === indicator.value
            ) {
              isMatch = true;
            }
            break;

          case 'BEHAVIORAL_PATTERN':
            if (indicator.value === 'AUTH_BURST_THEN_SUCCESS') {
              if (
                event.category === 'AUTHENTICATION' &&
                (event.outcome === 'FAILURE' || event.eventType.includes('FAILED') || event.eventType.includes('SUCCESS'))
              ) {
                isMatch = true;
              }
            } else if (indicator.value === 'CONTAINER_HOSTPATH_PRIVILEGED') {
              if (
                event.sourceWorld === 'KUBERNETES' &&
                (event.attributes?.privileged || event.eventType.includes('HOSTPATH') || event.eventType.includes('PRIVILEGED'))
              ) {
                isMatch = true;
              }
            }
            break;

          default:
            break;
        }

        if (isMatch) {
          matchedEvents.push(event.id);
        }
      });

      return {
        ...indicator,
        matchedEventIds: matchedEvents,
      };
    });
  }
}
