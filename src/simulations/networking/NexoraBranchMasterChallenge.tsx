import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Award, ShieldCheck, ShieldAlert, Play, CheckCircle2, Network, Layers, Lock, Cpu, Server } from 'lucide-react';
import { validateNexoraBranchConfiguration } from './logic/nexoraValidator';

interface VerificationRule {
  id: string;
  nameAr: string;
  nameEn: string;
  status: 'pending' | 'passed' | 'failed';
  detailsAr: string;
  detailsEn: string;
}

export const NexoraBranchMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const [financeSubnet, setFinanceSubnet] = useState<string>('10.50.10.0/24');
  const [hrSubnet, setHrSubnet] = useState<string>('10.50.20.0/24');
  const [guestSubnet, setGuestSubnet] = useState<string>('10.50.30.0/24');
  const [guestIsolation, setGuestIsolation] = useState<boolean>(true);
  const [sshMgmtOnly, setSshMgmtOnly] = useState<boolean>(true);
  const [httpsServerPermitted, setHttpsServerPermitted] = useState<boolean>(true);

  const [overallScore, setOverallScore] = useState<number | null>(null);

  const [rules, setRules] = useState<VerificationRule[]>([
    {
      id: 'r1',
      nameAr: 'تأمين وعزل شبكة الضيوف (Guest Network Isolation)',
      nameEn: 'Guest Network Isolation Enforcement',
      status: 'pending',
      detailsAr: 'شبكة الضيوف تملك وصولاً للإنترنت فقط وممنوعة تماماً من شبكات المالية والرواتب والسيرفرات.',
      detailsEn: 'Guest VLAN 30 has WAN egress but is strictly isolated from internal Finance/HR/Server subnets.',
    },
    {
      id: 'r2',
      nameAr: 'تقييد إدارة SSH على شبكة الإدارة فقط (Admin SSH Hardening)',
      nameEn: 'Management SSH Port 22 Restriction',
      status: 'pending',
      detailsAr: 'منفذ SSH 22 مسموح به فقط من شبكة الإدارة (10.50.50.0/24) ومحظور عن بقية الموظفين والضيوف.',
      detailsEn: 'SSH Port 22 is permitted exclusively from Management Subnet (VLAN 50). Blocked elsewhere.',
    },
    {
      id: 'r3',
      nameAr: 'السماح بخدمات الويب HTTPS و DNS للخوادم المركزية',
      nameEn: 'Web Server HTTPS & DNS Availability',
      status: 'pending',
      detailsAr: 'خادم الويب (10.50.40.10) يستقبل طلبات HTTPS 443 من كافة موظفي المؤسسة بنجاح.',
      detailsEn: 'Web Server (10.50.40.10) is reachable on HTTPS 443 from all corporate subnets.',
    },
    {
      id: 'r4',
      nameAr: 'تقسيم وصحة العناوين الفرعية (Valid CIDR Subnetting)',
      nameEn: 'Subnet Boundary Integrity',
      status: 'pending',
      detailsAr: 'تخصيص شبكات فرعية غير متداخلة لكل من الموظفين والإدارة والسيرفرات.',
      detailsEn: 'Non-overlapping CIDR boundaries assigned to Finance, HR, Guest, and Server VLANs.',
    },
  ]);

  const handleRunVerification = () => {
    globalSimulationRuntime.reset();

    const valResult = validateNexoraBranchConfiguration({
      financeSubnet,
      hrSubnet,
      guestSubnet,
      guestIsolation,
      sshMgmtOnly,
      httpsServerPermitted,
    });

    const updatedRules = rules.map((r) => {
      const match = valResult.checkDetails.find((c) => c.id === r.id);
      return {
        ...r,
        status: match?.passed ? ('passed' as const) : ('failed' as const),
      };
    });

    setRules(updatedRules);
    setOverallScore(valResult.score);

    if (valResult.success) {
      completeChallenge('nexora_master');
      globalSimulationRuntime.dispatch({
        type: 'ALERT_CREATED',
        source: 'NEXORA_SECURITY_AUDITOR',
        description: 'PASSED NEXORA MASTER CHALLENGE! 100% Policy Compliance Achieved.',
      });
    } else {
      globalSimulationRuntime.dispatch({
        type: 'PACKET_BLOCKED',
        source: 'NEXORA_SECURITY_AUDITOR',
        description: `AUDIT FAILED: Failed checks: ${valResult.failedChecks.join(', ')}`,
      });
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Challenge Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
            <Award className="w-5 h-5" />
            <span>{isAr ? 'التحدي الرئيسي الأول (Master Challenge)' : 'First Networking Master Challenge'}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isAr ? 'تحدي تأمين شبكة فرع شركة NEXORA DIGITAL' : 'NEXORA Branch Office Network Security Architecture'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {isAr
              ? 'قم بتقسيم وتأمين بنية فرع المؤسسة: 12 جهازاً، قسمين، شبكة ضيوف، خوادم، موجه، وجدار حماية وفق السياسات الأمنية.'
              : 'Segment and harden a complete branch office: Finance, HR, Guest VLANs, Server Farm, Router, and Edge ACL Rules.'}
          </p>
        </div>

        {overallScore === 100 && (
          <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500 text-amber-300 px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-amber-950/50">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'تم إنجاز التحدي الرئيسي بنجاح! 🏆' : 'MASTER CHALLENGE COMPLETED! 🏆'}</span>
          </div>
        )}
      </div>

      {/* Network Configuration Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'شبكة المالية (VLAN 10)' : 'Finance Subnet (VLAN 10)'}</label>
          <input
            type="text"
            value={financeSubnet}
            onChange={(e) => setFinanceSubnet(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'شبكة الموارد البشرية (VLAN 20)' : 'HR Subnet (VLAN 20)'}</label>
          <input
            type="text"
            value={hrSubnet}
            onChange={(e) => setHrSubnet(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-mono text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'شبكة الضيوف (VLAN 30)' : 'Guest Subnet (VLAN 30)'}</label>
          <input
            type="text"
            value={guestSubnet}
            onChange={(e) => setGuestSubnet(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Firewall Policy Checkboxes */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'سياسات جدار الحماية (ACL Policy Rules)' : 'Edge Firewall Policy Configuration'}</h3>

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={guestIsolation}
              onChange={(e) => setGuestIsolation(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
            <span className="text-xs text-slate-200 font-medium">
              {isAr
                ? 'تفعيل حظر وعزل شبكة الضيوف (VLAN 30) عن كافة الشبكات الداخلية للمؤسسة'
                : 'Enforce strict L3 isolation: Block Guest VLAN 30 from all internal subnets'}
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={sshMgmtOnly}
              onChange={(e) => setSshMgmtOnly(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
            <span className="text-xs text-slate-200 font-medium">
              {isAr
                ? 'حصر منفذ إدارة SSH 22 على شبكة الإدارة فقط (10.50.50.0/24) وحظره عن باقي المستخدمين'
                : 'Restrict SSH Port 22 exclusively to Management Subnet (VLAN 50)'}
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
            <input
              type="checkbox"
              checked={httpsServerPermitted}
              onChange={(e) => setHttpsServerPermitted(e.target.checked)}
              className="accent-cyan-500 w-4 h-4"
            />
            <span className="text-xs text-slate-200 font-medium">
              {isAr
                ? 'السماح بمرور حركة HTTPS 443 و DNS 53 إلى خوادم المؤسسة المركزية'
                : 'Permit HTTPS 443 & DNS 53 traffic to Server Subnet (VLAN 40)'}
            </span>
          </label>
        </div>
      </div>

      {/* Verification Action Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunVerification}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-base rounded-xl shadow-xl shadow-amber-900/30 transition transform hover:scale-105"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isAr ? 'تشغيل فحص الامتثال المباشر' : 'Run Automated Policy Verification'}</span>
        </button>
      </div>

      {/* Verification Scorecard */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>{isAr ? 'تقرير فحص الامتثال للسياسات الأمنية' : 'Automated Verification Scorecard'}</span>
          </h3>
          {overallScore !== null && (
            <span className={`text-xl font-bold font-mono ${overallScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              Score: {overallScore}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((r) => (
            <div
              key={r.id}
              className={`p-4 rounded-xl border transition-all ${
                r.status === 'passed'
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
                  : r.status === 'failed'
                  ? 'bg-rose-950/60 border-rose-700/80 text-rose-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-xs">{isAr ? r.nameAr : r.nameEn}</span>
                {r.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                {r.status === 'failed' && <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{isAr ? r.detailsAr : r.detailsEn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
