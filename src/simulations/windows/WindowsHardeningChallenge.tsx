import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Server,
  Key,
  FolderTree,
  Cpu,
  Flame,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Wrench,
  Lock,
  Unlock,
} from 'lucide-react';
import {
  validateWindowsHardeningState,
  WindowsHardeningState,
  WindowsHardeningValidationResult,
} from './logic/hardening';
import {
  WindowsUser,
  WindowsGroup,
  INITIAL_WINDOWS_USERS,
  INITIAL_WINDOWS_GROUPS,
  WELL_KNOWN_SIDS,
} from './logic/identity';
import {
  NtfsResource,
  INITIAL_NTFS_RESOURCES,
} from './logic/ntfs';
import {
  WindowsService,
  INITIAL_WINDOWS_SERVICES,
  fixUnquotedServicePath,
  changeStartupType,
  stopWindowsService,
} from './logic/services';
import {
  WindowsFirewallState,
  INITIAL_FIREWALL_STATE,
  setFirewallProfileState,
  toggleFirewallRule,
} from './logic/firewall';

interface WindowsHardeningChallengeProps {
  onBackToMap?: () => void;
  onNavigateToLab?: (labId: string) => void;
}

export const WindowsHardeningChallenge: React.FC<WindowsHardeningChallengeProps> = ({
  onBackToMap,
  onNavigateToLab,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // Initial vulnerable state
  const [users, setUsers] = useState<WindowsUser[]>([
    ...INITIAL_WINDOWS_USERS.map((u) => {
      if (u.username === 'Guest') return { ...u, enabled: true }; // VULNERABLE: Guest enabled
      if (u.username === 'bob') return { ...u, groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.ADMINISTRATORS] }; // VULNERABLE: Bob is Admin
      return u;
    }),
  ]);

  const [groups, setGroups] = useState<WindowsGroup[]>([
    ...INITIAL_WINDOWS_GROUPS.map((g) => {
      if (g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS) {
        return { ...g, memberSids: ['S-1-5-21-1001', 'S-1-5-21-1002'] };
      }
      return g;
    }),
  ]);

  const [resources, setResources] = useState<NtfsResource[]>([
    ...INITIAL_NTFS_RESOURCES, // includes C:\Confidential with Everyone FullControl
  ]);

  const [services, setServices] = useState<WindowsService[]>([
    ...INITIAL_WINDOWS_SERVICES, // includes TlntSvr running and EnterpriseBackupAgent unquoted
  ]);

  const [firewall, setFirewall] = useState<WindowsFirewallState>({
    ...INITIAL_FIREWALL_STATE, // includes SMB Port 445 open to Public and Telnet 23 active
  });

  const [auditPolicies, setAuditPolicies] = useState({
    auditLogonEvents: true,
    auditProcessCreation: false, // VULNERABLE: Process Creation Auditing disabled
    auditPrivilegeUse: true,
  });

  const [auditResult, setAuditResult] = useState<WindowsHardeningValidationResult | null>(null);

  // Evaluate hardening score on mount and when state changes
  useEffect(() => {
    const currentState: WindowsHardeningState = {
      users,
      groups,
      ntfsResources: resources,
      services,
      firewallState: firewall,
      auditPolicies,
    };
    const result = validateWindowsHardeningState(currentState);
    setAuditResult(result);
  }, [users, groups, resources, services, firewall, auditPolicies]);

  // Run Manual Audit & record challenge completion
  const handleRunAudit = () => {
    const currentState: WindowsHardeningState = {
      users,
      groups,
      ntfsResources: resources,
      services,
      firewallState: firewall,
      auditPolicies,
    };
    const result = validateWindowsHardeningState(currentState);
    setAuditResult(result);

    if (result.success) {
      completeChallenge('windows_hardening');
      addLog({
        level: 'INFO',
        source: 'AUDIT',
        category: 'SECURITY',
        message: 'Master Windows Security Hardening Challenge completed successfully! Score: 100/100',
        timestamp: virtualTime,
      });
      addEvent({
        id: `evt-comp-win-hard-${virtualTime}`,
        type: 'status_change',
        description: isAr ? 'اكتمل تحدي تحصين محطة عمل ويندوز بنجاح!' : 'Windows Security Hardening Challenge completed!',
        timestamp: virtualTime,
        details: { score: 100 },
      });
    } else {
      addLog({
        level: 'WARN',
        source: 'AUDIT',
        category: 'SECURITY',
        message: `Security Audit Score: ${result.score}/100. Failed checks: ${result.failedChecks.join(', ')}`,
        timestamp: virtualTime,
      });
    }
  };

  // Remediation actions:
  // 1. Disable Guest
  const remediateGuest = () => {
    setUsers((prev) => prev.map((u) => (u.username === 'Guest' ? { ...u, enabled: false } : u)));
    addLog({
      level: 'INFO',
      source: 'SAM',
      category: 'AUTH',
      message: 'Remediation applied: Built-in Guest account disabled.',
      timestamp: virtualTime,
    });
  };

  // 2. Remove Bob from Administrators
  const remediateBob = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username === 'bob'
          ? { ...u, groupSids: u.groupSids.filter((s) => s !== WELL_KNOWN_SIDS.ADMINISTRATORS) }
          : u
      )
    );
    setGroups((prev) =>
      prev.map((g) =>
        g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS
          ? { ...g, memberSids: g.memberSids.filter((sid) => sid !== 'S-1-5-21-1002') }
          : g
      )
    );
    addLog({
      level: 'INFO',
      source: 'SAM',
      category: 'AUTH',
      message: 'Remediation applied: Bob removed from Administrators group (Least Privilege enforced).',
      timestamp: virtualTime,
    });
  };

  // 3. Stop and Disable Telnet Service
  const remediateTelnet = () => {
    setServices((prev) =>
      prev.map((s) =>
        s.serviceName === 'TlntSvr'
          ? { ...s, status: 'Stopped', startupType: 'Disabled' }
          : s
      )
    );
    addLog({
      level: 'INFO',
      source: 'SCM',
      category: 'SYSTEM',
      message: 'Remediation applied: Telnet Server service stopped and startup set to Disabled.',
      timestamp: virtualTime,
    });
  };

  // 4. Quote Unquoted Service Path
  const remediateUnquoted = () => {
    setServices((prev) =>
      prev.map((s) => (s.serviceName === 'EnterpriseBackupAgent' ? fixUnquotedServicePath(s) : s))
    );
    addLog({
      level: 'INFO',
      source: 'SCM',
      category: 'SECURITY',
      message: 'Remediation applied: Binary path for EnterpriseBackupAgent wrapped in quotes.',
      timestamp: virtualTime,
    });
  };

  // 5. Harden C:\Confidential DACL
  const remediateConfidentialDacl = () => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.path === 'C:\\Confidential') {
          return {
            ...r,
            dacl: r.dacl.filter((ace) => ace.trusteeSid !== WELL_KNOWN_SIDS.EVERYONE),
          };
        }
        return r;
      })
    );
    addLog({
      level: 'INFO',
      source: 'NTFS',
      category: 'SECURITY',
      message: 'Remediation applied: Everyone FullControl ACE removed from C:\\Confidential DACL.',
      timestamp: virtualTime,
    });
  };

  // 6. Harden Firewall Rules & Enable Profiles
  const remediateFirewall = () => {
    setFirewall((prev) => ({
      profilesEnabled: { Domain: true, Private: true, Public: true },
      currentActiveProfile: prev.currentActiveProfile,
      rules: prev.rules.map((r) => {
        if (r.id === 'fw-smb-in') {
          return { ...r, profiles: ['Domain', 'Private'] }; // Remove Public exposure
        }
        if (r.id === 'fw-telnet-in') {
          return { ...r, enabled: false }; // Disable Telnet rule
        }
        return r;
      }),
    }));
    addLog({
      level: 'INFO',
      source: 'FIREWALL',
      category: 'FIREWALL',
      message: 'Remediation applied: SMB 445 restricted from Public, Telnet rule disabled, all profiles ON.',
      timestamp: virtualTime,
    });
  };

  // 7. Enable Process Creation Auditing
  const remediateAuditPolicy = () => {
    setAuditPolicies((prev) => ({
      ...prev,
      auditProcessCreation: true,
      auditLogonEvents: true,
    }));
    addLog({
      level: 'INFO',
      source: 'AUDIT',
      category: 'SECURITY',
      message: 'Remediation applied: Process Creation Auditing (Event 4688) enabled.',
      timestamp: virtualTime,
    });
  };

  // Reset to initial vulnerable state
  const handleReset = () => {
    setUsers([
      ...INITIAL_WINDOWS_USERS.map((u) => {
        if (u.username === 'Guest') return { ...u, enabled: true };
        if (u.username === 'bob') return { ...u, groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.ADMINISTRATORS] };
        return u;
      }),
    ]);
    setGroups([
      ...INITIAL_WINDOWS_GROUPS.map((g) => {
        if (g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS) {
          return { ...g, memberSids: ['S-1-5-21-1001', 'S-1-5-21-1002'] };
        }
        return g;
      }),
    ]);
    setResources([...INITIAL_NTFS_RESOURCES]);
    setServices([...INITIAL_WINDOWS_SERVICES]);
    setFirewall({ ...INITIAL_FIREWALL_STATE });
    setAuditPolicies({
      auditLogonEvents: true,
      auditProcessCreation: false,
      auditPrivilegeUse: true,
    });
    addLog({
      level: 'WARN',
      source: 'CHALLENGE',
      category: 'SECURITY',
      message: 'Windows Hardening Challenge environment reset to vulnerable baseline.',
      timestamp: virtualTime,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to Map'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'تحدي تحصين محطة عمل ويندوز (Windows Hardening Master Challenge)' : 'Windows Hardening Master Challenge'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فحص أمني شامل: معالجة 7 ثغرات حرجة للوصول لدرجة 100/100 في معايير CIS Benchmark'
                : 'Comprehensive security audit: remediate 7 vulnerabilities across Accounts, NTFS, Services, Firewall, and Auditing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة التعيين' : 'Reset'}</span>
          </button>

          <button
            onClick={handleRunAudit}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs shadow-lg shadow-emerald-950/40 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isAr ? 'تشغيل فحص الامتثال الأمني' : 'Run Security Audit'}</span>
          </button>
        </div>
      </div>

      {/* Score Banner */}
      {auditResult && (
        <div
          className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 ${
            auditResult.success
              ? 'bg-gradient-to-r from-emerald-950/60 to-teal-950/40 border-emerald-500/60 shadow-xl shadow-emerald-950/20'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-extrabold text-xl shadow-md ${
                auditResult.success
                  ? 'bg-emerald-500 text-slate-950'
                  : auditResult.score >= 60
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {auditResult.score}
            </div>

            <div>
              <div className="text-xs font-mono uppercase text-slate-400">
                {isAr ? 'درجة التحصين والامتثال الإجمالية' : 'Overall Security Posture Score'}
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {auditResult.success
                  ? isAr
                    ? 'محطة العمل محصنة بالكامل بنسبة 100%! اكتمل التحدي بنجاح.'
                    : 'System Fully Hardened (100%)! Challenge Completed.'
                  : isAr
                  ? `تم اجتياز ${auditResult.passedChecks.length} من أصل 7 متطلبات أمنية.`
                  : `${auditResult.passedChecks.length} of 7 hardening controls passing.`}
              </h3>
            </div>
          </div>

          {auditResult.success && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold animate-pulse">
              <Award className="w-4 h-4" />
              <span>{isAr ? 'شهادة إتقان أمن أنظمة ويندوز' : 'Windows Security Mastery Earned'}</span>
            </div>
          )}
        </div>
      )}

      {/* Audit Checklist & Remediation Controls */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <span className="text-xs font-mono font-bold text-slate-300 uppercase block">
          {isAr ? 'جدول معايير الفحص الأمني السبعة (CIS Hardening Checklist)' : 'Hardening Controls & Remediation Checklist'}
        </span>

        <div className="space-y-3">
          {auditResult?.checkDetails.map((check) => {
            return (
              <div
                key={check.id}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition-all ${
                  check.passed
                    ? 'bg-emerald-950/20 border-emerald-900/60 text-slate-200'
                    : 'bg-rose-950/20 border-rose-900/60 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {isAr ? check.nameAr : check.nameEn}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          check.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {check.score} / {check.maxScore} pts
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1 leading-relaxed">
                      {isAr ? check.messageAr : check.messageEn}
                    </p>
                  </div>
                </div>

                {/* 1-Click Remediation Button if failed */}
                {!check.passed && (
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {check.id === 'guest_account_disabled' && (
                      <button
                        onClick={remediateGuest}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تعطيل الحساب' : 'Disable Guest'}</span>
                      </button>
                    )}
                    {check.id === 'bob_least_privilege' && (
                      <button
                        onClick={remediateBob}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إزالة من المسؤولين' : 'Revoke Admin'}</span>
                      </button>
                    )}
                    {check.id === 'telnet_service_disabled' && (
                      <button
                        onClick={remediateTelnet}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إيقاف وتعطيل' : 'Disable Telnet'}</span>
                      </button>
                    )}
                    {check.id === 'unquoted_service_path_fixed' && (
                      <button
                        onClick={remediateUnquoted}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إضافة الاقتباسات' : 'Quote Path'}</span>
                      </button>
                    )}
                    {check.id === 'ntfs_confidential_hardened' && (
                      <button
                        onClick={remediateConfidentialDacl}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>{isAr ? 'حذف إذن Everyone' : 'Fix NTFS DACL'}</span>
                      </button>
                    )}
                    {check.id === 'firewall_perimeter_hardened' && (
                      <button
                        onClick={remediateFirewall}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحصين الجدار الناري' : 'Harden Firewall'}</span>
                      </button>
                    )}
                    {check.id === 'process_auditing_enabled' && (
                      <button
                        onClick={remediateAuditPolicy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold shadow-md whitespace-nowrap"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تفعيل التدقيق' : 'Enable Event 4688'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
