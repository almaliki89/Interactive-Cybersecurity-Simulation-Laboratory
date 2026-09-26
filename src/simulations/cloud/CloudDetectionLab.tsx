/**
 * OMEGA V13 — Cloud Security World
 * CloudDetectionLab.tsx
 *
 * Interactive Cloud Threat Detection & MITRE ATT&CK Cloud Matrix Lab.
 * Evaluates real-time detection rules against streaming audit logs.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  CLOUD_DETECTION_RULES,
  evaluateCloudDetections,
  CloudDetectionAlert,
} from './logic/detection';
import { CloudAuditLogEntry } from './logic/logging';
import { Radio, Shield, AlertTriangle, Play, CheckCircle2, Terminal, ArrowRight } from 'lucide-react';

export const CloudDetectionLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const initialStream: CloudAuditLogEntry[] = [
    {
      id: 'evt-01',
      eventTimeVirtual: 150,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AWSService',
        principalId: 'IMDS-V1',
        arn: 'ncrn:nexora:iam::acc-prod-003:role/NexoraAppWorkloadInstanceProfileRole',
        accountId: 'acc-prod-003',
      },
      eventSource: 'iam.nexora.com',
      eventName: 'GetSecurityCredentials',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'curl/7.88.1 (imds-v1-query)',
      requestParameters: { roleName: 'NexoraAppWorkloadInstanceProfileRole' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Management',
    },
    {
      id: 'evt-02',
      eventTimeVirtual: 500,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AssumedRole',
        principalId: 'AROA-ATTACKER',
        arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/ElevatedDevOpsRole/session',
        accountId: 'acc-prod-003',
      },
      eventSource: 'iam.nexora.com',
      eventName: 'AssumeRole',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'aws-cli/2.15.0',
      requestParameters: { roleArn: 'ncrn:nexora:iam::acc-prod-003:role/ElevatedDevOpsRole' },
      readOnly: false,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Management',
    },
    {
      id: 'evt-03',
      eventTimeVirtual: 800,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AssumedRole',
        principalId: 'AROA-ATTACKER',
        arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole/session',
        accountId: 'acc-prod-003',
      },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'python-requests/2.31.0',
      requestParameters: { bucketName: 'nexora-finance-vault-prod', key: 'part1.csv' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Data',
    },
    {
      id: 'evt-04',
      eventTimeVirtual: 850,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AssumedRole',
        principalId: 'AROA-ATTACKER',
        arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole/session',
        accountId: 'acc-prod-003',
      },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'python-requests/2.31.0',
      requestParameters: { bucketName: 'nexora-finance-vault-prod', key: 'part2.csv' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Data',
    },
    {
      id: 'evt-05',
      eventTimeVirtual: 900,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AssumedRole',
        principalId: 'AROA-ATTACKER',
        arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole/session',
        accountId: 'acc-prod-003',
      },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'python-requests/2.31.0',
      requestParameters: { bucketName: 'nexora-finance-vault-prod', key: 'part3.csv' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Data',
    },
    {
      id: 'evt-06',
      eventTimeVirtual: 1200,
      eventVersion: '1.08',
      userIdentity: {
        type: 'IAMUser',
        principalId: 'AID-ADMIN',
        arn: 'ncrn:nexora:iam::acc-prod-003:user/attacker-root',
        accountId: 'acc-prod-003',
      },
      eventSource: 'audit.nexora.com',
      eventName: 'StopLogging',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'aws-cli/2.15.0',
      requestParameters: { name: 'Nexora-Global-Enterprise-Trail' },
      readOnly: false,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Management',
    },
  ];

  const [events] = useState<CloudAuditLogEntry[]>(initialStream);
  const alerts = evaluateCloudDetections(events);

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-mono mb-1">
            <Radio className="w-4 h-4" />
            <span>CLOUD SIEM & DETECTION ENGINEERING</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر هندسة الكشف ومصفوفة MITRE للسحابة' : 'Cloud Threat Detection & MITRE ATT&CK Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'بناء قواعد رصد تربط أحداث سجلات التدقيق بتكتيكات هجمات السحابة: استخراج بيانات الاعتماد (T1552)، وسحب البيانات (T1530)، وتعطيل الدفاعات (T1562).'
              : 'Analyze real-time detection alerts mapped to MITRE ATT&CK Cloud Matrix tactics: Credential Access, Exfiltration, and Defense Evasion.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 block text-[10px]">TRIGGERED ALERTS</span>
            <span className="text-fuchsia-400 font-bold">{alerts.length} Security Alerts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Active Detection Rules Directory */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'قواعد الرصد المفعلة' : 'Deployed Detection Rules'}
          </span>

          <div className="flex flex-col gap-2">
            {CLOUD_DETECTION_RULES.map((rule) => (
              <div key={rule.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{rule.name}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-800">
                    {rule.mitreTechniqueId}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mb-1">{rule.mitreTechniqueName}</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr ? rule.descriptionAr : rule.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Live Security Alerts Stream */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-300">
            {isAr ? 'تنبيهات الأمان المرصودة فورًا' : 'Triggered Security Alerts Stream'}
          </span>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="text-xs font-bold text-white">{isAr ? alt.titleAr : alt.titleEn}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    Virtual T+{alt.virtualTime} • {alt.ruleId}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr ? alt.summaryAr : alt.summaryEn}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-600 block">MITRE TECHNIQUE</span>
                    <span className="text-cyan-400">{alt.mitreTechniqueId}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">SOURCE IP</span>
                    <span className="text-rose-400">{alt.sourceIp}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-slate-600 block">TARGET RESOURCE</span>
                    <span className="text-purple-300 truncate block">{alt.affectedResource}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>{isAr ? 'الإجراء المقترح:' : 'Recommended Action:'} </strong>
                    {isAr ? alt.recommendedActionAr : alt.recommendedActionEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
