import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  APP_USERS,
  APP_RESOURCES,
  evaluateRouteAccess,
  evaluateResourceOwnership,
  AppRole,
} from './logic/accessControl';
import {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sliders,
} from 'lucide-react';

interface AccessControlLabProps {
  onBackToMap?: () => void;
  onNavigateToValidation?: () => void;
}

export const AccessControlLab: React.FC<AccessControlLabProps> = ({
  onBackToMap,
  onNavigateToValidation,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [selectedUserId, setSelectedUserId] = useState<string>('usr-bob');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('ord-1001');
  const [enforceOwnership, setEnforceOwnership] = useState<boolean>(true);

  const currentUser = APP_USERS[selectedUserId];
  const currentResource = APP_RESOURCES[selectedResourceId];

  const decision = evaluateResourceOwnership(currentUser, selectedResourceId, enforceOwnership);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono">
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
              <Lock className="w-6 h-6 text-emerald-400" />
              <span>{isAr ? 'مختبر التحكم بالوصول وحماية IDOR / BOLA' : 'Access Control & IDOR / BOLA Defense Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'الفرق الحاسم: التحقق من الهوية (AuthN) لا يكفي بدون فحص الصلاحيات وملكية المورد (Object-Level AuthZ)'
                : 'Master the critical boundary: Authentication != Authorization. Enforce RBAC & Object-Level Ownership.'}
            </p>
          </div>
        </div>

        {onNavigateToValidation && (
          <button
            onClick={onNavigateToValidation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isAr ? 'التحقق من المدخلات' : 'Input Validation Lab'}</span>
          </button>
        )}
      </div>

      {/* Interactive Selection Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
        {/* User Identity */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">1. Authenticated User Identity:</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            {Object.values(APP_USERS).map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} (Role: {u.role})
              </option>
            ))}
          </select>
          <div className="text-slate-400 text-[11px]">
            User ID: <span className="text-cyan-400">{currentUser.id}</span> | Department: <span className="text-emerald-400">{currentUser.department}</span>
          </div>
        </div>

        {/* Target Resource */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">2. Requested Resource:</label>
          <select
            value={selectedResourceId}
            onChange={(e) => setSelectedResourceId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          >
            {Object.values(APP_RESOURCES).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.type})
              </option>
            ))}
          </select>
          <div className="text-slate-400 text-[11px]">
            Owner: <span className="text-indigo-400">{currentResource.ownerUserId}</span> {currentResource.requiredRole && `| Required: ${currentResource.requiredRole}`}
          </div>
        </div>

        {/* Ownership Policy Toggle */}
        <div className="space-y-2">
          <label className="text-slate-300 font-bold block">3. Defensive Policy Configuration:</label>
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={enforceOwnership}
              onChange={(e) => setEnforceOwnership(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500"
            />
            <span className="font-bold">Enforce Object-Level Ownership (BOLA Shield)</span>
          </label>
          <span className="text-[11px] text-slate-400 block">
            {enforceOwnership
              ? 'Active: Server checks if resource.ownerUserId === session.userId'
              : 'DISABLED: Vulnerable to horizontal privilege escalation / IDOR!'}
          </span>
        </div>
      </div>

      {/* Decision Engine Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verdict Card */}
        <div
          className={`p-6 rounded-2xl border space-y-4 ${
            decision.allowed
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
              : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Authorization Decision Result
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                decision.allowed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              HTTP {decision.statusCode} {decision.allowed ? 'OK' : 'DENIED'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span>Authentication (Identity Proof):</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS (User {currentUser.username} is logged in)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>Authorization (Permission Check):</span>
              {decision.authorized ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GRANTED
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> REJECTED ({decision.reasonCode})
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200">
            <span className="text-slate-400 block mb-1 font-bold">Why:</span>
            {isAr ? decision.reasonAr : decision.reasonEn}
          </div>
        </div>

        {/* Resource Payload Viewer */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase">Resource Data Inspector</span>
            <span className="text-xs text-slate-400">{currentResource.id}</span>
          </div>

          {decision.allowed ? (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 text-xs overflow-x-auto">
              {JSON.stringify(currentResource, null, 2)}
            </pre>
          ) : (
            <div className="p-8 rounded-xl bg-slate-950/80 border border-red-900/50 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              <div className="text-xs font-bold text-red-300">Payload Hidden — Access Denied (HTTP 403)</div>
              <div className="text-[11px] text-slate-500">
                User '{currentUser.username}' is not authorized to read data belonging to '{currentResource.ownerUserId}'.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
