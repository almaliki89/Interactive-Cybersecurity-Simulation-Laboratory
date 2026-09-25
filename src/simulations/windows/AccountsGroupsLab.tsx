import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  WindowsUser,
  WindowsGroup,
  INITIAL_WINDOWS_USERS,
  INITIAL_WINDOWS_GROUPS,
  getEffectiveWindowsGroups,
  isLocalAdministrator,
  canLogOnInteractively,
  createWindowsUser,
  WELL_KNOWN_SIDS,
} from './logic/identity';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface AccountsGroupsLabProps {
  onBackToMap?: () => void;
}

export const AccountsGroupsLab: React.FC<AccountsGroupsLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [users, setUsers] = useState<WindowsUser[]>(INITIAL_WINDOWS_USERS);
  const [groups, setGroups] = useState<WindowsGroup[]>(INITIAL_WINDOWS_GROUPS);
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-alice');

  // Form for new user creation
  const [newUsername, setNewUsername] = useState<string>('');
  const [newFullName, setNewFullName] = useState<string>('');
  const [newPrimaryGroup, setNewPrimaryGroup] = useState<string>(WELL_KNOWN_SIDS.USERS);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const effectiveGroups = selectedUser ? getEffectiveWindowsGroups(selectedUser, groups) : [];
  const isAdmin = selectedUser ? isLocalAdministrator(selectedUser, groups) : false;
  const canLogon = selectedUser ? canLogOnInteractively(selectedUser, groups) : false;

  const handleToggleUserEnabled = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextState = !u.enabled;
          addLog({
            level: 'INFO',
            source: 'SAM',
            category: 'AUTH',
            message: `User account "${u.username}" state changed to ${nextState ? 'ENABLED' : 'DISABLED'}`,
            timestamp: virtualTime,
          });
          return { ...u, enabled: nextState };
        }
        return u;
      })
    );
  };

  const handleToggleGroupMembership = (groupSid: string) => {
    if (!selectedUser) return;
    const hasGroup = selectedUser.groupSids.includes(groupSid);

    let updatedGroupSids: string[];
    if (hasGroup) {
      updatedGroupSids = selectedUser.groupSids.filter((s) => s !== groupSid);
    } else {
      updatedGroupSids = [...selectedUser.groupSids, groupSid];
    }

    const groupObj = groups.find((g) => g.sid === groupSid);
    addLog({
      level: hasGroup ? 'WARN' : 'INFO',
      source: 'SECURITY',
      category: 'SECURITY',
      message: `${hasGroup ? 'Removed' : 'Added'} user "${selectedUser.username}" ${hasGroup ? 'from' : 'to'} group "${groupObj?.name || groupSid}"`,
      timestamp: virtualTime,
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, groupSids: updatedGroupSids } : u))
    );

    // Also update group member list
    setGroups((prev) =>
      prev.map((g) => {
        if (g.sid === groupSid) {
          const exists = g.memberSids.includes(selectedUser.sid);
          return {
            ...g,
            memberSids: exists ? g.memberSids.filter((s) => s !== selectedUser.sid) : [...g.memberSids, selectedUser.sid],
          };
        }
        return g;
      })
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const updated = createWindowsUser(users, newUsername, {
      fullName: newFullName || newUsername,
      primaryGroupSid: newPrimaryGroup,
      groupSids: [newPrimaryGroup],
    });

    if (updated.length > users.length) {
      setUsers(updated);
      addLog({
        level: 'INFO',
        source: 'SECURITY',
        category: 'SECURITY',
        message: `Event 4720: A user account was created: "${newUsername}"`,
        timestamp: virtualTime,
      });
      setSelectedUserId(`usr-${newUsername.toLowerCase().trim()}`);
      setNewUsername('');
      setNewFullName('');
    }
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
              <Users className="w-5 h-5 text-blue-400" />
              <span>{isAr ? 'مختبر الحسابات والمجموعات المحلية (Accounts & Local Groups)' : 'Accounts & Local Groups Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فحص معرفات الأمان (SIDs)، حساب المجموعات الفعلية، والتحكم بصلاحيات الإدارة وتسجيل الدخول'
                : 'Inspect Security Identifiers (SIDs), compute effective groups, and verify administrative privilege.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Users List & Creator (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'حسابات المستخدمين المحلية (SAM)' : 'Local User Accounts (SAM)'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                {users.length} {isAr ? 'مستخدمين' : 'users'}
              </span>
            </div>

            <div className="space-y-2">
              {users.map((u) => {
                const isSelected = selectedUser && selectedUser.id === u.id;
                const isUserAdmin = isLocalAdministrator(u, groups);

                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-950/40'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{u.username}</span>
                        {isUserAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800/50">
                            ADMIN
                          </span>
                        )}
                        {!u.enabled && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            DISABLED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{u.fullName}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{u.sid}</div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUserEnabled(u.id);
                      }}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        u.enabled
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900'
                      }`}
                      title={u.enabled ? (isAr ? 'تعطيل الحساب' : 'Disable Account') : (isAr ? 'تفعيل الحساب' : 'Enable Account')}
                    >
                      {u.enabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create User Form */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-3">
              <UserPlus className="w-4 h-4" />
              <span>{isAr ? 'إنشاء حساب مستخدم جديد (New User)' : 'Create Local Windows User'}</span>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'اسم المستخدم (Username):' : 'Username:'}
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'الاسم الكامل / الوصف:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. John Doe (Contractor)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  {isAr ? 'المجموعة الأساسية (Primary Group):' : 'Primary Group:'}
                </label>
                <select
                  value={newPrimaryGroup}
                  onChange={(e) => setNewPrimaryGroup(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                >
                  <option value={WELL_KNOWN_SIDS.USERS}>Users (Standard)</option>
                  <option value={WELL_KNOWN_SIDS.ADMINISTRATORS}>Administrators</option>
                  <option value={WELL_KNOWN_SIDS.REMOTE_DESKTOP_USERS}>Remote Desktop Users</option>
                  <option value={WELL_KNOWN_SIDS.GUESTS}>Guests</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-colors shadow-md"
              >
                {isAr ? 'إضافة الحساب للنظام' : 'Create User in SAM'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Selected User Inspector & Group Memberships (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedUser ? (
            <>
              {/* User Overview Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      {isAr ? 'تفاصيل الحساب المحدد' : 'Selected Account Identity'}
                    </span>
                    <h3 className="text-xl font-bold text-white font-mono mt-0.5">{selectedUser.username}</h3>
                    <p className="text-xs text-slate-400">{selectedUser.fullName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold font-mono shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'مسؤول محلي (Local Admin)' : 'Local Administrator'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span>{isAr ? 'مستخدم قياسي (Standard User)' : 'Standard User'}</span>
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                        canLogon
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                          : 'bg-amber-950/60 border-amber-800 text-amber-300'
                      }`}
                    >
                      {canLogon ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{canLogon ? (isAr ? 'تسجيل دخول مسموح' : 'Logon Allowed') : (isAr ? 'تسجيل دخول محظور' : 'Logon Denied')}</span>
                    </div>
                  </div>
                </div>

                {/* Identity Metadata Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Security Identifier (SID):</span>
                    <span className="font-mono text-cyan-300 text-[11px] select-all break-all">{selectedUser.sid}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">Interactive Logon Right:</span>
                    <span className="font-mono text-slate-200">
                      {selectedUser.canInteractiveLogon ? 'SeInteractiveLogonRight (Granted)' : 'Denied (Service/Non-interactive)'}
                    </span>
                  </div>
                </div>

                {/* Warning note for Bob or Guest if vulnerable */}
                {selectedUser.username === 'bob' && isAdmin && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">
                        {isAr ? 'تنبيه أمني (Hardening Finding):' : 'Hardening Finding (Excessive Privilege):'}
                      </strong>
                      <span>
                        {isAr
                          ? 'الحساب bob يمتلك صلاحيات مسؤول بالخطأ. قم بإزالته من مجموعة Administrators لفرض مبدأ الحد الأدنى من الصلاحيات.'
                          : 'Account "bob" possesses local Administrator membership. Revoke this membership to enforce Least Privilege.'}
                      </span>
                    </div>
                  </div>
                )}

                {selectedUser.username === 'Guest' && selectedUser.enabled && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">
                        {isAr ? 'تنبيه أمني (Critical Finding):' : 'Critical Security Finding:'}
                      </strong>
                      <span>
                        {isAr
                          ? 'حساب الضيف (Guest) مفعل حالياً! يجب تعطيل الحساب فوراً لتفادي الوصول غير المصرح به.'
                          : 'The built-in Guest account is currently ENABLED. Disable it to prevent anonymous console access.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Group Memberships Manager */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    {isAr ? 'إدارة عضوية المجموعات (Group Memberships)' : 'Group Memberships Configuration'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isAr ? 'انقر على المجموعة لإضافتها أو إزالتها' : 'Click to toggle membership'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groups.map((group) => {
                    const isMember = selectedUser.groupSids.includes(group.sid);
                    const isPrimary = selectedUser.primaryGroupSid === group.sid;

                    return (
                      <div
                        key={group.id}
                        onClick={() => handleToggleGroupMembership(group.sid)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isMember
                            ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                            : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{group.name}</span>
                            {isPrimary && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                              isMember ? 'bg-blue-600 text-white' : 'border border-slate-700 text-transparent'
                            }`}
                          >
                            ✓
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-snug">
                          {isAr ? group.descriptionAr : group.descriptionEn}
                        </p>

                        <div className="text-[10px] font-mono text-slate-500 truncate">{group.sid}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Effective Groups Preview */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 mb-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'المجموعات الفعلية في رمز الأمان (Token Group SIDs):' : 'Effective Groups in Access Token:'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {effectiveGroups.map((g) => (
                    <span
                      key={g.sid}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{g.name}</span>
                      <span className="text-[9px] text-slate-500">({g.sid.slice(-4)})</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
