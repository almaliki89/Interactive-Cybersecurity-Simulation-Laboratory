/**
 * OMEGA V13 — Cloud Security World
 * CloudLoggingLab.tsx
 *
 * Interactive Cloud Audit Logging, CloudTrail, VPC Flow Logs,
 * and Cryptographic Log Integrity / Digest Validation Lab.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultTrailConfig,
  validateLogFileDigests,
  CloudAuditLogEntry,
} from './logic/logging';
import { Activity, Shield, CheckCircle2, AlertTriangle, FileCode, Check, RefreshCw, Layers } from 'lucide-react';

export const CloudLoggingLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [trailConfig, setTrailConfig] = useState(createDefaultTrailConfig());

  const sampleAuditLogs: CloudAuditLogEntry[] = [
    {
      id: 'log-001',
      eventTimeVirtual: 100,
      eventVersion: '1.08',
      userIdentity: {
        type: 'IAMUser',
        principalId: 'AIDA-SARA-01',
        arn: 'ncrn:nexora:iam::acc-prod-003:user/sara',
        accountId: 'acc-prod-003',
        userName: 'sara',
      },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '10.100.1.50',
      userAgent: 'console.nexora.internal',
      requestParameters: { bucketName: 'nexora-finance-vault-prod', key: 'reports/Q3_Earnings_Ledger.xlsx' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Data',
    },
    {
      id: 'log-002',
      eventTimeVirtual: 450,
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
      userAgent: 'curl/7.88.1',
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Management',
    },
    {
      id: 'log-003',
      eventTimeVirtual: 1100,
      eventVersion: '1.08',
      userIdentity: {
        type: 'AssumedRole',
        principalId: 'AROA-ATTACKER',
        arn: 'ncrn:nexora:iam::acc-prod-003:assumed-role/NexoraAppWorkloadInstanceProfileRole/instance-session',
        accountId: 'acc-prod-003',
      },
      eventSource: 'storage.nexora.com',
      eventName: 'GetObject',
      awsRegion: 'nx-east-1',
      sourceIPAddress: '203.0.113.88',
      userAgent: 'python-requests/2.31.0',
      requestParameters: { bucketName: 'nexora-analytics-raw-bucket', key: 'customers/export_pii_dump_2026.csv' },
      readOnly: true,
      recipientAccountId: 'acc-prod-003',
      eventCategory: 'Data',
    },
  ];

  const [simulateTamper, setSimulateTamper] = useState<boolean>(false);
  const digestCheck = validateLogFileDigests(
    sampleAuditLogs,
    simulateTamper ? 'sha256_00000000_fake_tampered_digest' : undefined
  );

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-mono mb-1">
            <Activity className="w-4 h-4" />
            <span>CLOUD AUDIT LOGS & INTEGRITY DIGESTS</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر سجلات التدقيق والمراقبة والتثبت المشفر' : 'Cloud Audit Logging & Integrity Digest Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'سجلات CloudTrail هي الصندوق الأسود للسحابة. تحقق من تفعيل التسجيل لجميع المناطق والتأكد من سلامة البصمات المشفرة.'
              : 'Audit logs provide complete visibility into cloud API transactions. Verify multi-region coverage and cryptographic digest integrity.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Trail Config */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-300">
                {isAr ? 'إعدادات سجل التدقيق المركزي' : 'Trail Configuration'}
              </span>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  trailConfig.isLogging
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {trailConfig.isLogging ? 'LOGGING ACTIVE' : 'STOPPED'}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">TRAIL NAME</span>
                <span className="font-bold text-white">{trailConfig.name}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] mb-1">STORAGE S3 DESTINATION</span>
                <span className="font-bold text-violet-300 truncate block">{trailConfig.s3BucketName}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">LOG FILE VALIDATION</span>
                  <span className={trailConfig.enableLogFileValidation ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    {trailConfig.enableLogFileValidation ? 'SHA-256 Digest Active' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setTrailConfig((prev) => ({
                      ...prev,
                      enableLogFileValidation: !prev.enableLogFileValidation,
                    }))
                  }
                  className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  Toggle
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">LOGGING STATUS</span>
                  <span className={trailConfig.isLogging ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {trailConfig.isLogging ? 'Recording API Calls' : 'Logging Disabled'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setTrailConfig((prev) => ({
                      ...prev,
                      isLogging: !prev.isLogging,
                    }))
                  }
                  className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    trailConfig.isLogging ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  {trailConfig.isLogging ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right: Audit Log Viewer & Cryptographic Digest Validation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Digest Integrity Result Card */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              digestCheck.isValid
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/40 border-rose-700 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {digestCheck.isValid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-bold">
                  {digestCheck.isValid
                    ? isAr
                      ? 'البصمة المشفرة صالحة: لم يحدث أي تلاعب أو حذف للسجلات'
                      : 'Cryptographic Digest Verified: No Log Tampering Detected'
                    : isAr
                    ? 'تحذير أمني: عدم تطابق البصمة المشفرة! تم رصد تلاعب بالسجلات'
                    : 'SECURITY ALERT: Digest Mismatch! Unauthorized Log Tampering Detected'}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isAr ? digestCheck.explanationAr : digestCheck.explanationEn}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSimulateTamper(!simulateTamper)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 shrink-0"
            >
              {simulateTamper ? 'Restore Authentic Digest' : 'Simulate Attacker Log Tamper'}
            </button>
          </div>

          {/* Audit Log Stream Table */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-violet-400" />
              <span>{isAr ? 'سجل أحداث العمليات (CloudTrail Event Stream)' : 'Recent CloudTrail Events'}</span>
            </h3>

            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[350px]">
              {sampleAuditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-cyan-300">{log.eventName}</span>
                    <span className="text-[10px] text-slate-500">Virtual T+{log.eventTimeVirtual}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-600 block text-[9px]">SOURCE SERVICE</span>
                      <span>{log.eventSource}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[9px]">SOURCE IP</span>
                      <span className={log.sourceIPAddress.startsWith('203.') ? 'text-rose-400' : 'text-slate-300'}>
                        {log.sourceIPAddress}
                      </span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-600 block text-[9px]">PRINCIPAL ARN</span>
                      <span className="truncate block">{log.userIdentity.arn}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
