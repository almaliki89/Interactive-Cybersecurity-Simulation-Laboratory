import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_USERS,
  INITIAL_GROUPS,
  AdUser,
} from './logic/directory';
import { getEffectiveGroups } from './logic/groups';
import {
  DirectoryResource,
  INITIAL_DIRECTORY_RESOURCES,
  evaluateDirectoryResourceAccess,
  ResourcePermission,
  AccessEvaluationResult,
} from './logic/authorization';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  FolderLock,
  FolderOpen,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface AuthVsAuthorizationLabProps {
  onBackToMap?: () => void;
  onNavigateToKerberos?: () => void;
}

export const AuthVsAuthorizationLab: React.FC<AuthVsAuthorizationLabProps> = ({
  onBackToMap,
  onNavigateToKerberos,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [selectedUsername, setSelectedUsername] = useState<string>('sara');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('res-finance-share');
  const [requestedPermission, setRequestedPermission] = useState<ResourcePermission>('Read');
  const [accountEnabledOverride, setAccountEnabledOverride] = useState<boolean>(true);

  const baseUser = INITIAL_USERS.find((u) => u.samAccountName === selectedUsername) || INITIAL_USERS[0];
  const currentUser: AdUser = {
    ...baseUser,
    enabled: accountEnabledOverride,
  };

  const currentResource =
    INITIAL_DIRECTORY_RESOURCES.find((r) => r.id === selectedResourceId) ||
    INITIAL_DIRECTORY_RESOURCES[0];

  const effectiveGroups = getEffectiveGroups(
    [...INITIAL_USERS, ...INITIAL_GROUPS],
    currentUser.sid
  );

  // Evaluate access with production logic
  const evaluation: AccessEvaluationResult = evaluateDirectoryResourceAccess(
    currentUser,
    effectiveGroups,
    currentResource,
    requestedPermission
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مختبر المصادقة مقابل التفويض' : 'Authentication vs Authorization Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم الفارق الحاسم: إثبات الهوية (Authentication) لا يمنح تلقائياً أذونات الوصول للموارد (Authorization)'
                : 'Master the fundamental boundary: identity proofing (Authentication) != resource permission granting (Authorization)'}
            </p>
          </div>
        </div>

        {onNavigateToKerberos && (
          <button
            onClick={onNavigateToKerberos}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'محاكي Kerberos' : 'Kerberos Simulator'}</span>
          </button>
        )}
      </div>

      {/* Control Deck: User, Resource, Permission Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* User Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300 block">
            {isAr ? '1. اختر هوية المستخدم (User Principal):' : '1. Select User Identity:'}
          </label>
          <select
            value={selectedUsername}
            onChange={(e) => setSelectedUsername(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
          >
            {INITIAL_USERS.map((u) => (
              <option key={u.id} value={u.samAccountName}>
                {u.displayName} ({u.samAccountName})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={accountEnabledOverride}
                onChange={(e) => setAccountEnabledOverride(e.target.checked)}
                className="rounded border-slate-700 text-amber-500"
              />
              <span>{isAr ? 'حساب المستخدم مفعل (Enabled)' : 'Account Enabled in AD'}</span>
            </label>
          </div>
        </div>

        {/* Resource Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300 block">
            {isAr ? '2. المورد المطلوب (Target Resource):' : '2. Target Shared Resource:'}
          </label>
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
          >
            {INITIAL_DIRECTORY_RESOURCES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.department})
              </option>
            ))}
          </select>
          <span className="text-[11px] font-mono text-cyan-400 block truncate">
            {currentResource.path}
          </span>
        </div>

        {/* Requested Permission */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300 block">
            {isAr ? '3. الصلاحية المطلوبة (Requested Right):' : '3. Requested Access Right:'}
          </label>
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {(['Read', 'Write', 'Modify', 'FullControl'] as ResourcePermission[]).map((perm) => (
              <button
                key={perm}
                onClick={() => setRequestedPermission(perm)}
                className={`py-2 px-1 rounded-xl text-[11px] font-mono font-bold transition-all ${
                  requestedPermission === perm
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {perm}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Pillars: Authentication Status vs Authorization Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Authentication */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            evaluation.authenticated
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
              : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'المرحلة 1: المصادقة (Authentication)' : 'Tier 1: Authentication'}
            </span>
            {evaluation.authenticated ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>SUCCESS (200 OK)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>FAILED (401)</span>
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Question Answered:</span>
              <strong className="text-white">"Who are you?"</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">User Principal:</span>
              <span className="text-cyan-300 font-bold">{currentUser.userPrincipalName}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Account State:</span>
              <span className={currentUser.enabled ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                {currentUser.enabled ? 'Enabled in Domain' : 'Disabled Account'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Kerberos Ticket Issued:</span>
              <span className={evaluation.authenticated ? 'text-emerald-400' : 'text-slate-500'}>
                {evaluation.authenticated ? 'TGT Acquired' : 'Pre-auth Denied'}
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 2: Authorization */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            evaluation.allowed
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
              : 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {isAr ? 'المرحلة 2: التفويض (Authorization)' : 'Tier 2: Authorization'}
            </span>
            {evaluation.allowed ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>ACCESS GRANTED</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                <span>ACCESS DENIED</span>
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Question Answered:</span>
              <strong className="text-white">"What are you allowed to do?"</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Resource Path:</span>
              <span className="text-cyan-300 font-bold truncate max-w-[200px]">{currentResource.name}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">Effective Groups Evaluated:</span>
              <span className="text-purple-300 font-bold">{evaluation.effectiveGroups.length} Groups</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500">DACL Decision:</span>
              <span className={evaluation.allowed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {evaluation.allowed ? 'Explicit Allow Matched' : 'No Granting ACE / Deny'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Decision Trace & Why */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'سلسلة خطوات اتخاذ القرار التفصيلي (Decision Trace):' : 'Step-by-Step Access Decision Trace:'}</span>
        </h3>

        <div className="space-y-2">
          {(isAr ? evaluation.stepExplanationAr : evaluation.stepExplanationEn).map((step, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span className="text-slate-300 mt-0.5 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Final Conclusion Box */}
        <div
          className={`p-4 rounded-xl border font-mono text-xs ${
            evaluation.allowed
              ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <span className="font-bold block text-white mb-1">
            {isAr ? 'الخلاصة الأمنية:' : 'Security Conclusion:'}
          </span>
          <p>{isAr ? evaluation.reasonAr : evaluation.reasonEn}</p>
        </div>
      </div>
    </div>
  );
};
