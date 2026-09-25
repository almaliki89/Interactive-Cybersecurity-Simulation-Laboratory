import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  ActiveDirectoryChallengeState,
  getInitialChallengeState,
  validateActiveDirectoryState,
  HardeningValidationResult,
} from './logic/hardening';
import { AdUser, AdGroup, moveObjectToOu, disableDirectoryObject } from './logic/directory';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Info,
  UserCheck,
  Lock,
  Unlock,
  FolderTree,
  AlertTriangle,
  MoveRight,
  Plus,
  Trash2,
  Power,
  Sliders,
} from 'lucide-react';

interface ActiveDirectoryMasterChallengeProps {
  onBackToMap?: () => void;
  onNavigateToLab?: (labId: string) => void;
}

export const ActiveDirectoryMasterChallenge: React.FC<ActiveDirectoryMasterChallengeProps> = ({
  onBackToMap,
  onNavigateToLab,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [state, setState] = useState<ActiveDirectoryChallengeState>(getInitialChallengeState());
  const [validation, setValidation] = useState<HardeningValidationResult>(
    validateActiveDirectoryState(getInitialChallengeState())
  );
  const [hasValidated, setHasValidated] = useState<boolean>(false);

  const users = state.objects.filter((o): o is AdUser => o.type === 'user');
  const groups = state.objects.filter((o): o is AdGroup => o.type === 'group');
  const sara = users.find((u) => u.samAccountName === 'sara')!;
  const tempAuditor = users.find((u) => u.samAccountName === 'temp-auditor')!;
  const svcBackup = users.find((u) => u.samAccountName === 'svc-sql-backup')!;
  const finShare = state.resources.find((r) => r.id === 'res-finance-share')!;

  const handleValidate = () => {
    const res = validateActiveDirectoryState(state);
    setValidation(res);
    setHasValidated(true);

    if (res.success) {
      completeChallenge('ad_nexora_migration_master');
      addEvent({
        id: `evt-comp-ad-hard-${virtualTime}`,
        type: 'status_change',
        description: 'Master Challenge: Active Directory Domain Hardening Completed Successfully!',
        payload: { score: res.score },
      });
    }
  };

  const handleReset = () => {
    const fresh = getInitialChallengeState();
    setState(fresh);
    setValidation(validateActiveDirectoryState(fresh));
    setHasValidated(false);
  };

  // 1. Move Sara OU
  const handleMoveSaraToFinance = () => {
    const updated = moveObjectToOu(
      state.objects,
      sara.id,
      'OU=Finance,DC=corp,DC=nexora,DC=local'
    );
    setState((prev) => ({ ...prev, objects: updated }));
  };

  // 2. Add Sara to Finance-Users
  const handleAddSaraToFinance = () => {
    const updatedObjects = state.objects.map((obj) => {
      if (obj.id === sara.id && obj.type === 'user') {
        const u = obj as AdUser;
        if (!u.groups.includes('Finance-Users')) {
          return { ...u, groups: [...u.groups, 'Finance-Users'] };
        }
      }
      return obj;
    });
    setState((prev) => ({ ...prev, objects: updatedObjects }));
  };

  // 3. Remove Sara from HR-Admins
  const handleRemoveSaraFromHrAdmins = () => {
    const updatedObjects = state.objects.map((obj) => {
      if (obj.id === sara.id && obj.type === 'user') {
        const u = obj as AdUser;
        return {
          ...u,
          groups: u.groups.filter((g) => g !== 'HR-Admins' && g !== 'HR-Managers'),
          privileged: u.groups.some((g) => g.includes('Admin') && g !== 'HR-Admins'),
        };
      }
      if (obj.type === 'group' && (obj as AdGroup).name === 'HR-Admins') {
        const g = obj as AdGroup;
        return {
          ...g,
          members: g.members.filter((m) => m !== sara.sid),
        };
      }
      return obj;
    });
    setState((prev) => ({ ...prev, objects: updatedObjects }));
  };

  // 4. Contractors removal from Finance-Share
  const handleRemoveContractorsFromFinanceShare = () => {
    const updatedResources = state.resources.map((r) => {
      if (r.id === finShare.id) {
        return {
          ...r,
          dacl: r.dacl.filter((ace) => ace.principalName !== 'Contractors-Ext'),
        };
      }
      return r;
    });
    setState((prev) => ({ ...prev, resources: updatedResources }));
  };

  // 5. Disable stale temp-auditor account
  const handleDisableTempAuditor = () => {
    const updatedObjects = disableDirectoryObject(state.objects, tempAuditor.id);
    setState((prev) => ({ ...prev, objects: updatedObjects }));
  };

  // 6. Restrict service account (remove RDP & interactive logon)
  const handleHardenServiceAccount = () => {
    const updatedObjects = state.objects.map((obj) => {
      if (obj.id === svcBackup.id && obj.type === 'user') {
        const u = obj as AdUser;
        return {
          ...u,
          allowInteractiveLogon: false,
          groups: u.groups.filter((g) => g !== 'Remote Desktop Users'),
        };
      }
      if (obj.type === 'group' && (obj as AdGroup).name === 'Remote Desktop Users') {
        const g = obj as AdGroup;
        return {
          ...g,
          members: g.members.filter((m) => m !== svcBackup.sid),
        };
      }
      return obj;
    });
    setState((prev) => ({ ...prev, objects: updatedObjects }));
  };

  // 7. Enforce Finance Workstation GPO Policy
  const handleEnforceWorkstationGpo = () => {
    const updatedGpos = state.gpos.map((g) => {
      if (g.id === 'gpo-workstation-baseline') {
        return {
          ...g,
          enabled: true,
          enforced: true,
          settings: {
            ...g.settings,
            screenLockTimeoutMinutes: 5,
            firewallEnabled: true,
            usbRemovableStorageBlocked: true,
          },
        };
      }
      return g;
    });
    setState((prev) => ({ ...prev, gpos: updatedGpos }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Challenge Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950 border border-slate-800 p-8 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAr ? 'التحدي الأمني الأكبر: هجرة الصلاحيات المؤسسية' : 'Enterprise Identity Hardening Challenge'}</span>
          </div>

          <h1 className="text-3xl font-black text-white">
            {isAr ? 'سيناريو نطاق نيكسورا: انتقال سارة إلى إدارة المالية' : 'Nexora Domain: Staff Role Migration & Enterprise Hardening'}
          </h1>

          <p className="text-slate-300 text-xs leading-relaxed">
            {isAr
              ? 'انتقلت الموظفة "سارة" مؤخراً من قسم الموارد البشرية إلى إدارة المالية. البيئة الحالية تحتوي على ثغرات أمنية خطيرة: سارة لا تزال تحتفظ بصلاحيات HR-Admins الحساسة وتفتقر لصلاحيات المالية، والمتعاقدون الخارجيون لديهم إذن وصول لملفات المالية السرية، وحساب الخدمة يمتلك صلاحية الدخول التفاعلي عبر RDP! قم بتصحيح الوضع الأمني بالكامل وفق مبدأ الحد الأدنى من الصلاحيات (Least Privilege).'
              : 'Staff member Sara transferred from HR to Finance. The directory is currently vulnerable: Sara retains HR-Admins privilege, lacks Finance access, external contractors have read/write permissions on the confidential Finance share, stale accounts remain enabled, and a backup service account has interactive RDP access! Remediate all misconfigurations while respecting Least Privilege.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleValidate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'فحص وتقييم الوضع الأمني (Validate)' : 'Validate Directory Security State'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-mono text-xs flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isAr ? 'إعادة ضبط التحدي' : 'Reset Scenario'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scorecard / Result Banner */}
      <div
        className={`p-6 rounded-2xl border font-mono text-xs transition-all ${
          validation.success
            ? 'bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-950/30'
            : 'bg-slate-900/80 border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                validation.success
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {validation.score}%
            </div>
            <div>
              <span className="font-bold text-white text-sm block">
                {validation.success
                  ? isAr
                    ? '🎉 اكتمل التحدي بنجاح! تم تحصين النطاق بالكامل'
                    : '🎉 Challenge Mastered! Enterprise Domain Fully Hardened'
                  : isAr
                  ? 'حالة التحدي قيد المعالجة'
                  : 'Remediation In Progress'}
              </span>
              <span className="text-slate-400 text-[11px]">
                {validation.passedChecks.length} / {validation.checkDetails.length} Security Controls Satisfied
              </span>
            </div>
          </div>

          {validation.success && (
            <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>PASSED & VERIFIED</span>
            </span>
          )}
        </div>

        {/* Real-time Remediation Action Cards */}
        <div className="pt-4 space-y-4">
          <span className="text-slate-400 uppercase tracking-wider block font-bold text-[11px]">
            {isAr ? 'الإجراءات التصحيحية المتاحة للتطبيق المباشر:' : 'Direct Remediation Actions:'}
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Action 1: Move Sara */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">1. Move Sara to Finance OU</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Current OU: <strong className="text-cyan-300">{sara.ou}</strong>
                </p>
              </div>
              <button
                onClick={handleMoveSaraToFinance}
                disabled={sara.ou === 'OU=Finance,DC=corp,DC=nexora,DC=local'}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {sara.ou === 'OU=Finance,DC=corp,DC=nexora,DC=local' ? '✓ Moved to Finance' : 'Move to Finance OU'}
              </button>
            </div>

            {/* Action 2: Sara Finance-Users */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">2. Add Sara to Finance-Users</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Grants required role access to financial ledgers.
                </p>
              </div>
              <button
                onClick={handleAddSaraToFinance}
                disabled={sara.groups.includes('Finance-Users')}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {sara.groups.includes('Finance-Users') ? '✓ Member of Finance-Users' : 'Add to Finance-Users'}
              </button>
            </div>

            {/* Action 3: Revoke HR-Admins */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">3. Revoke HR-Admins Privileges</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Strip historical administrative access.
                </p>
              </div>
              <button
                onClick={handleRemoveSaraFromHrAdmins}
                disabled={!sara.groups.includes('HR-Admins')}
                className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {!sara.groups.includes('HR-Admins') ? '✓ HR Privileges Revoked' : 'Revoke HR-Admins'}
              </button>
            </div>

            {/* Action 4: Revoke Contractors from Finance Share */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">4. Secure Finance Share DACL</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Remove external contractors from confidential share ACL.
                </p>
              </div>
              <button
                onClick={handleRemoveContractorsFromFinanceShare}
                disabled={!finShare.dacl.some((a) => a.principalName === 'Contractors-Ext')}
                className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {!finShare.dacl.some((a) => a.principalName === 'Contractors-Ext')
                  ? '✓ Contractors Removed'
                  : 'Remove Contractors'}
              </button>
            </div>

            {/* Action 5: Disable Stale Account */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">5. Disable Stale Auditor</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Status: <strong className={tempAuditor.enabled ? 'text-red-400' : 'text-emerald-400'}>
                    {tempAuditor.enabled ? 'Enabled (Risk)' : 'Disabled (Safe)'}
                  </strong>
                </p>
              </div>
              <button
                onClick={handleDisableTempAuditor}
                disabled={!tempAuditor.enabled}
                className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {!tempAuditor.enabled ? '✓ Account Disabled' : 'Disable temp-auditor'}
              </button>
            </div>

            {/* Action 6: Harden Service Account */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">6. Harden Backup Service</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Revoke interactive logon rights & remove from RDP.
                </p>
              </div>
              <button
                onClick={handleHardenServiceAccount}
                disabled={!svcBackup.allowInteractiveLogon && !svcBackup.groups.includes('Remote Desktop Users')}
                className="w-full py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs"
              >
                {!svcBackup.allowInteractiveLogon && !svcBackup.groups.includes('Remote Desktop Users')
                  ? '✓ Service Hardened'
                  : 'Harden svc-sql-backup'}
              </button>
            </div>

            {/* Action 7: Enforce Workstation GPO */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block">7. Enforce Workstation GPO</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lock screen &lt;= 5m, enable firewall, block USB.
                </p>
              </div>
              <button
                onClick={handleEnforceWorkstationGpo}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Apply & Enforce GPO
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Check Evaluation Grid */}
      <div className="space-y-3 font-mono text-xs">
        <h3 className="font-bold text-white uppercase tracking-wider block">
          {isAr ? 'نتائج تدقيق الضوابط الأمنية العشرة:' : 'Detailed 10-Point Security Evaluation Audit:'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {validation.checkDetails.map((chk) => (
            <div
              key={chk.id}
              className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
                chk.passed
                  ? 'bg-emerald-950/20 border-emerald-600/70 text-emerald-200'
                  : 'bg-rose-950/20 border-rose-600/70 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">
                  {isAr ? chk.titleAr : chk.titleEn}
                </span>
                {chk.passed ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isAr ? chk.messageAr : chk.messageEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
