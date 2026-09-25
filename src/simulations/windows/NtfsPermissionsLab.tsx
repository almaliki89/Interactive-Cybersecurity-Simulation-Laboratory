import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  NtfsResource,
  NtfsAce,
  NtfsPermission,
  INITIAL_NTFS_RESOURCES,
  evaluateNtfsAccess,
  getEffectiveNtfsPermissions,
  toggleInheritance,
  addAceToResource,
  removeAceFromResource,
} from './logic/ntfs';
import {
  INITIAL_WINDOWS_USERS,
  INITIAL_WINDOWS_GROUPS,
  WELL_KNOWN_SIDS,
  WindowsUser,
} from './logic/identity';
import { buildAccessToken } from './logic/token';
import {
  FolderTree,
  FileText,
  Folder,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Key,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface NtfsPermissionsLabProps {
  onBackToMap?: () => void;
}

export const NtfsPermissionsLab: React.FC<NtfsPermissionsLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [resources, setResources] = useState<NtfsResource[]>(INITIAL_NTFS_RESOURCES);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('res-confidential');

  // Effective permission tester user selection
  const [testUsername, setTestUsername] = useState<string>('bob');
  const [testPermission, setTestPermission] = useState<NtfsPermission>('Write');

  // New ACE form states
  const [newTrusteeSid, setNewTrusteeSid] = useState<string>(WELL_KNOWN_SIDS.USERS);
  const [newAceType, setNewAceType] = useState<'Allow' | 'Deny'>('Allow');
  const [newPerms, setNewPerms] = useState<NtfsPermission[]>(['Read']);

  const selectedResource = resources.find((r) => r.id === selectedResourceId) || resources[0];

  // Build token for the test user
  const testUser = INITIAL_WINDOWS_USERS.find((u) => u.username === testUsername) || INITIAL_WINDOWS_USERS[0];
  const testToken = buildAccessToken(testUser, INITIAL_WINDOWS_GROUPS, undefined, undefined, virtualTime);

  // Evaluate access
  const accessDecision = selectedResource
    ? evaluateNtfsAccess(selectedResource, testToken, testPermission)
    : { allowed: false, reasonEn: 'No resource selected', reasonAr: 'لم يتم تحديد مورد' };

  // Calculate effective permissions matrix for all rights
  const effectiveMatrix = selectedResource ? getEffectiveNtfsPermissions(selectedResource, testToken) : null;

  const handleToggleInheritance = () => {
    if (!selectedResource) return;
    const parent = resources.find((r) => r.path === selectedResource.parentPath);
    const updated = toggleInheritance(selectedResource, parent?.dacl);

    setResources((prev) => prev.map((r) => (r.id === selectedResource.id ? updated : r)));
    addLog({
      level: 'INFO',
      source: 'NTFS',
      category: 'SECURITY',
      message: `Inheritance ${updated.inheritanceEnabled ? 'ENABLED' : 'DISABLED'} on "${selectedResource.path}"`,
      timestamp: virtualTime,
    });
  };

  const handleRemoveAce = (aceId: string) => {
    if (!selectedResource) return;
    const updated = removeAceFromResource(selectedResource, aceId);
    setResources((prev) => prev.map((r) => (r.id === selectedResource.id ? updated : r)));
    addLog({
      level: 'WARN',
      source: 'NTFS',
      category: 'SECURITY',
      message: `ACE entry removed from DACL of "${selectedResource.path}"`,
      timestamp: virtualTime,
    });
  };

  const handleAddAce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;

    let trusteeName = 'Unknown';
    if (newTrusteeSid === WELL_KNOWN_SIDS.EVERYONE) trusteeName = 'Everyone';
    else if (newTrusteeSid === WELL_KNOWN_SIDS.ADMINISTRATORS) trusteeName = 'Administrators';
    else if (newTrusteeSid === WELL_KNOWN_SIDS.USERS) trusteeName = 'Users';
    else if (newTrusteeSid === WELL_KNOWN_SIDS.FINANCE) trusteeName = 'Finance';
    else if (newTrusteeSid === WELL_KNOWN_SIDS.GUESTS) trusteeName = 'Guests';
    else {
      const u = INITIAL_WINDOWS_USERS.find((x) => x.sid === newTrusteeSid);
      if (u) trusteeName = u.username;
    }

    const updated = addAceToResource(selectedResource, {
      trusteeSid: newTrusteeSid,
      trusteeName,
      type: newAceType,
      permissions: newPerms,
      isInherited: false,
    });

    setResources((prev) => prev.map((r) => (r.id === selectedResource.id ? updated : r)));
    addLog({
      level: 'INFO',
      source: 'NTFS',
      category: 'SECURITY',
      message: `Added ${newAceType} ACE for "${trusteeName}" to "${selectedResource.path}"`,
      timestamp: virtualTime,
    });
  };

  const toggleFormPerm = (perm: NtfsPermission) => {
    setNewPerms((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
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
              <FolderTree className="w-5 h-5 text-emerald-400" />
              <span>{isAr ? 'مختبر أذونات وقوائم NTFS (Discretionary Access Control - DACL)' : 'NTFS Permissions Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فهم أسبقية القواعد: المنع الصريح يسبق السماح، والقواعد الصريحة تسبق الموروثة، وحساب الصلاحية الفعلية'
                : 'Master Windows Access Control: Explicit Deny > Explicit Allow > Inherited Deny > Inherited Allow.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Resource Filesystem Tree (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase block mb-3">
              {isAr ? 'الملفات والمجلدات (NTFS Resources)' : 'NTFS Resources & Volumes'}
            </span>

            <div className="space-y-2">
              {resources.map((res) => {
                const isSelected = selectedResource && selectedResource.id === res.id;
                const isFolder = res.type === 'folder';

                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedResourceId(res.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-slate-300">
                        {isFolder ? <Folder className="w-4 h-4 text-amber-400" /> : <FileText className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white font-mono truncate">{res.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{res.path}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        {res.dacl.length} ACEs
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Context Card */}
          {selectedResource && (
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 text-xs space-y-2">
              <div className="font-mono text-slate-400 uppercase text-[10px]">
                {isAr ? 'الأهمية الأمنية للمورد:' : 'Security Relevance:'}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isAr ? selectedResource.securityRelevanceAr : selectedResource.securityRelevanceEn}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Owner: {selectedResource.ownerName}</span>
                <span>Inheritance: {selectedResource.inheritanceEnabled ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: DACL Inspector & Effective Access Tester (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedResource ? (
            <>
              {/* DACL Table Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">
                      {isAr ? 'قائمة التحكم التقديرية بالوصول' : 'Discretionary Access Control List (DACL)'}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono mt-0.5">{selectedResource.path}</h3>
                  </div>

                  <button
                    onClick={handleToggleInheritance}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                      selectedResource.inheritanceEnabled
                        ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 hover:bg-cyan-900'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAr
                      ? selectedResource.inheritanceEnabled
                        ? 'الوراثة مفعلة (Inheritance ON)'
                        : 'الوراثة معطلة (Inheritance OFF)'
                      : selectedResource.inheritanceEnabled
                      ? 'Disable Inheritance'
                      : 'Enable Inheritance'}
                  </button>
                </div>

                {/* ACE List */}
                <div className="space-y-2">
                  {selectedResource.dacl.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                      {isAr ? 'لا توجد قواعد في قائمة DACL (سيتم تطبيق الرفض الضمني على كافة المحاولات)' : 'Empty DACL: Implicit Deny applies to all requests'}
                    </div>
                  ) : (
                    selectedResource.dacl.map((ace) => {
                      const isDeny = ace.type === 'Deny';
                      return (
                        <div
                          key={ace.id}
                          className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                            isDeny
                              ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                              : 'bg-slate-950/70 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isDeny ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                              }`}
                            >
                              {ace.type}
                            </span>
                            <div>
                              <div className="font-mono font-bold text-white text-xs">{ace.trusteeName}</div>
                              <div className="text-[10px] font-mono text-slate-500 truncate">{ace.trusteeSid}</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {ace.permissions.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                              >
                                {p}
                              </span>
                            ))}
                            {ace.isInherited && (
                              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-[9px] font-mono text-purple-300">
                                INHERITED
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveAce(ace.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-colors"
                            title={isAr ? 'حذف القاعدة' : 'Remove ACE'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add ACE Compact Form */}
                <form onSubmit={handleAddAce} className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
                  <select
                    value={newTrusteeSid}
                    onChange={(e) => setNewTrusteeSid(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value={WELL_KNOWN_SIDS.EVERYONE}>Everyone</option>
                    <option value={WELL_KNOWN_SIDS.USERS}>Users</option>
                    <option value={WELL_KNOWN_SIDS.ADMINISTRATORS}>Administrators</option>
                    <option value={WELL_KNOWN_SIDS.FINANCE}>Finance</option>
                    <option value={WELL_KNOWN_SIDS.GUESTS}>Guests</option>
                    <option value="S-1-5-21-1002">bob (Intern)</option>
                  </select>

                  <select
                    value={newAceType}
                    onChange={(e) => setNewAceType(e.target.value as 'Allow' | 'Deny')}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Allow">Allow</option>
                    <option value="Deny">Deny</option>
                  </select>

                  <div className="flex items-center gap-1.5">
                    {(['Read', 'Write', 'Modify', 'FullControl'] as NtfsPermission[]).map((p) => {
                      const active = newPerms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleFormPerm(p)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono transition-colors border ${
                            active
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إضافة الإذن' : 'Add ACE'}</span>
                  </button>
                </form>
              </div>

              {/* Effective Access Tester Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'فاحص الوصول الفعلي (Effective Access Decision Engine)' : 'Effective Access Decision Engine'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      {isAr ? 'المستخدم المختبر (Caller):' : 'Select User Token:'}
                    </label>
                    <select
                      value={testUsername}
                      onChange={(e) => setTestUsername(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {INITIAL_WINDOWS_USERS.map((u) => (
                        <option key={u.id} value={u.username}>
                          {u.username} ({u.fullName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-slate-400 block mb-1">
                      {isAr ? 'الإذن المطلوب فحصه:' : 'Requested Access Right:'}
                    </label>
                    <select
                      value={testPermission}
                      onChange={(e) => setTestPermission(e.target.value as NtfsPermission)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Read">Read (قراءة)</option>
                      <option value="Write">Write (كتابة)</option>
                      <option value="Modify">Modify (تعديل)</option>
                      <option value="FullControl">FullControl (تحكم كامل)</option>
                    </select>
                  </div>

                  {/* Decision Banner */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col justify-center ${
                      accessDecision.allowed
                        ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-600/80 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase mb-0.5">
                      {accessDecision.allowed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                      <span>{accessDecision.allowed ? (isAr ? 'مسموح (ACCESS GRANTED)' : 'ACCESS GRANTED') : (isAr ? 'مرفوض (ACCESS DENIED)' : 'ACCESS DENIED')}</span>
                    </div>
                    <div className="text-[11px] leading-tight opacity-90 truncate">
                      {isAr ? accessDecision.reasonAr : accessDecision.reasonEn}
                    </div>
                  </div>
                </div>

                {/* Matrix of all 4 rights */}
                {effectiveMatrix && (
                  <div className="pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-2">
                      {isAr ? `مصفوفة الصلاحيات الشاملة للمستخدم "${testUsername}" على هذا المورد:` : `Complete Effective Rights Matrix for "${testUsername}":`}
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      {(['Read', 'Write', 'Modify', 'FullControl'] as NtfsPermission[]).map((p) => {
                        const hasRight = effectiveMatrix[p];
                        return (
                          <div
                            key={p}
                            className={`p-2 rounded-xl border ${
                              hasRight
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                : 'bg-slate-950 border-slate-900 text-slate-500'
                            }`}
                          >
                            <div className="text-[10px] text-slate-400 mb-0.5">{p}</div>
                            <div className="font-bold">{hasRight ? '✓ YES' : '✗ NO'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
