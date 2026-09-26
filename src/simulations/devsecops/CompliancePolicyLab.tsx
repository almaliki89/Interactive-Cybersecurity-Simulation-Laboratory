/**
 * OMEGA V15.1 — Automated Compliance as Code (SOC2 / PCI-DSS) Lab
 * High-fidelity interactive compliance auditor linking actual code/infra findings with regulatory controls.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { Shield, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Award } from 'lucide-react';

export const CompliancePolicyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const compliance = masterState.complianceState;

  const [auditing, setAuditing] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Compute live compliance dynamically based on actual masterState findings
  const activeSast = masterState.sastFindings.filter(f => !f.remediated);
  const activeSca = masterState.dependencies.filter(d => !d.remediated);
  const activeSecrets = masterState.secretMatches.filter(s => !s.remediated);
  const activeTf = masterState.terraformResources.filter(r => !r.remediated);

  const failedControls: string[] = [];
  if (activeSast.length > 0) failedControls.push('PCI-DSS-v4.0: CC6.4.3 (Unpatched injection flaws)');
  if (activeSecrets.length > 0) failedControls.push('SOC2 CC7.1: Cryptographic key management (Hardcoded secrets)');
  if (activeTf.length > 0) failedControls.push('ISO-27001: A.12.6.1 (Exposed SSH ports & unencrypted S3)');

  const isCompliant = failedControls.length === 0;

  const appendLog = (msg: string) => setLogs((prev) => [...prev, `[compliance] ${msg}`]);

  const runComplianceAudit = () => {
    setAuditing(true);
    setLogs([]);
    appendLog('Initiating regulatory policy-as-code validation scans...');
    
    setTimeout(() => {
      appendLog('Validating OWASP Top 10 SAST findings...');
      if (activeSast.length > 0) {
        appendLog('❌ Fail: active high/critical vulnerabilities found in application files.');
      } else {
        appendLog('✓ Pass: Application layer has zero known OWASP injection flaws.');
      }

      appendLog('Auditing Git history for hardcoded access tokens...');
      if (activeSecrets.length > 0) {
        appendLog('❌ Fail: exposed high-entropy Stripe/AWS production credentials in repository.');
      } else {
        appendLog('✓ Pass: Repository secret scan matched strict baseline.');
      }

      appendLog('Parsing HCL infrastructure blueprints for unencrypted resources...');
      if (activeTf.length > 0) {
        appendLog('❌ Fail: unencrypted buckets and world-open security groups (0.0.0.0/0 SSH).');
      } else {
        appendLog('✓ Pass: IaC compliance policies verified.');
      }

      // Commit audit results back to state
      setMasterState((state) => {
        state.complianceState.failedControls = failedControls;
        state.complianceState.pciDssCompliant = activeSast.length === 0 && activeSecrets.length === 0;
        state.complianceState.soc2Compliant = activeSecrets.length === 0 && activeTf.length === 0;
        state.complianceState.iso27001Compliant = isCompliant;
      });

      appendLog(`Compliance scan completed. Status: ${isCompliant ? '100% COMPLIANT' : 'NON-COMPLIANT'}`);
      setAuditing(false);
    }, 900);
  };

  const resetCompliance = () => {
    setMasterState((state) => {
      state.complianceState = {
        pciDssCompliant: false,
        soc2Compliant: false,
        iso27001Compliant: false,
        failedControls: ['PCI-DSS-v4.0: CC6.4.3', 'SOC2 CC7.1', 'ISO-27001: A.12.6.1']
      };
    });
    setLogs([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
              <Shield className="w-4 h-4" />
              <span>{isAr ? 'مختبر الامتثال التلقائي ككود (Compliance as Code)' : 'Compliance as Code (SOC2 / PCI-DSS) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'فحص ضوابط SOC2 و ISO27001 و PCI-DSS تلقائياً في خط CI/CD' : 'Automated CI/CD Regulatory Compliance Audits'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'تأكد من مطابقة خط الإنتاج وبوابات الحماية لمتطلبات ضوابط العمل المشترك للبيانات والامتثال الدولي.'
                : 'Enforce regulatory compliance controls across PCI-DSS v4.0, SOC2 CC7.1, and ISO 27001 in CI pipelines.'}
            </p>
          </div>

          <button
            onClick={resetCompliance}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Compliance Status Banner */}
        <div
          className={`p-4.5 rounded-xl border flex items-center justify-between ${
            isCompliant
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {isCompliant ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {isCompliant
                  ? isAr
                    ? 'البيئة متوافقة بالكامل مع المعايير الأمنية لـ PCI-DSS و SOC2'
                    : 'Infrastructure & Codebase is 100% Compliant'
                  : isAr
                  ? 'تم رصد مخالفات تنظيمية لضوابط الامتثال الدولي'
                  : 'Regulatory Compliance Audit Blocked: Broken Policy Controls'}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isCompliant
                  ? (isAr ? 'اجتازت البيئة كافة الفحوصات التنظيمية بنجاح.' : 'SaaS codebase and IaC configuration matches regulatory baseline controls.')
                  : (isAr ? `الضوابط المخترقة النشطة: ${failedControls.join(' | ')}` : `Broken Active Controls: ${failedControls.join(' | ')}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Audit Split View */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left panel: Audit trigger and results */}
          <div className="md:col-span-5 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'أدوات الامتثال الرقمي:' : 'Compliance Regulatory Audits:'}</span>
            </h3>

            <div className="space-y-3 font-mono text-[11px] bg-slate-950 p-4 rounded-xl border border-slate-900">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">PCI-DSS v4.0 Secure:</span>
                <span className={`font-bold ${activeSast.length === 0 && activeSecrets.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeSast.length === 0 && activeSecrets.length === 0 ? 'COMPLIANT' : 'FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-slate-400">SOC2 CC7.1 Secure:</span>
                <span className={`font-bold ${activeSecrets.length === 0 && activeTf.length === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeSecrets.length === 0 && activeTf.length === 0 ? 'COMPLIANT' : 'FAIL'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ISO-27001 Secure:</span>
                <span className={`font-bold ${isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCompliant ? 'COMPLIANT' : 'FAIL'}
                </span>
              </div>
            </div>

            <button
              onClick={runComplianceAudit}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Shield className="w-4 h-4" />
              <span>{auditing ? (isAr ? 'جاري الفحص...' : 'Auditing...') : (isAr ? 'تشغيل فحص الامتثال التلقائي' : 'Audit Regulatory Compliance')}</span>
            </button>
          </div>

          {/* Right panel: Audit logs output */}
          <div className="md:col-span-7 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Auditor Logs:</div>
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-950 text-[10px] text-amber-300 h-44 overflow-y-auto space-y-1">
              {logs.length === 0 && <span className="text-slate-500">// Run "Audit Regulatory Compliance" to view diagnostic logs</span>}
              {logs.map((lg, idx) => (
                <div key={idx}>{lg}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
