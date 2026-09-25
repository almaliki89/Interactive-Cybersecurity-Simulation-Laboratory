import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  AdUser,
  AdComputer,
  INITIAL_USERS,
  INITIAL_COMPUTERS,
  INITIAL_GROUPS,
  AdGroup,
} from './logic/directory';
import { getEffectiveGroups } from './logic/groups';
import {
  Users,
  Laptop,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Key,
  Terminal,
  Activity,
  UserCheck,
} from 'lucide-react';

interface UsersComputersLabProps {
  onBackToMap?: () => void;
  onNavigateToAuth?: () => void;
  onAddEvent?: (event: any) => void;
}

export const UsersComputersLab: React.FC<UsersComputersLabProps> = ({
  onBackToMap,
  onNavigateToAuth,
  onAddEvent,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [activeTab, setActiveTab] = useState<'users' | 'computers'>('users');
  const [users, setUsers] = useState<AdUser[]>(INITIAL_USERS);
  const [computers, setComputers] = useState<AdComputer[]>(INITIAL_COMPUTERS);
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-sara');
  const [selectedCompId, setSelectedCompId] = useState<string>('cmp-fin-ws01');
  const [groupToAdd, setGroupToAdd] = useState<string>('Finance-Users');

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];
  const selectedComputer = computers.find((c) => c.id === selectedCompId) || computers[0];

  // Calculate effective groups
  const effectiveGroups = getEffectiveGroups(
    [...users, ...INITIAL_GROUPS, ...computers],
    selectedUser.sid
  );

  const handleAddGroupToUser = (groupName: string) => {
    if (selectedUser.groups.includes(groupName)) return;

    const updated = users.map((u) => {
      if (u.id === selectedUser.id) {
        const nextGroups = [...u.groups, groupName];
        return {
          ...u,
          groups: nextGroups,
          privileged: nextGroups.some((g) => g.includes('Admin')),
        };
      }
      return u;
    });

    setUsers(updated);

    if (onAddEvent) {
      onAddEvent({
        id: `ad-evt-grp-add-${virtualTime}-${selectedUser.id}`,
        eventId: 4728,
        channel: 'Security',
        provider: 'Microsoft-Windows-Security-Auditing',
        virtualTime,
        severity: 'Information',
        subjectUser: 'Administrator',
        targetUserOrObject: groupName,
        computer: 'DC01-NEXORA',
        actionEn: 'Member added to security group',
        actionAr: 'تمت إضافة عضو إلى مجموعة الأمان',
        detailsEn: `User '${selectedUser.samAccountName}' added to group '${groupName}'.`,
        detailsAr: `تمت إضافة المستخدم '${selectedUser.samAccountName}' إلى المجموعة '${groupName}'.`,
        category: 'Account Management',
      });
    }
  };

  const handleRemoveGroupFromUser = (groupName: string) => {
    const updated = users.map((u) => {
      if (u.id === selectedUser.id) {
        const nextGroups = u.groups.filter((g) => g !== groupName);
        return {
          ...u,
          groups: nextGroups,
          privileged: nextGroups.some((g) => g.includes('Admin')),
        };
      }
      return u;
    });

    setUsers(updated);

    if (onAddEvent) {
      onAddEvent({
        id: `ad-evt-grp-rem-${virtualTime}-${selectedUser.id}`,
        eventId: 4729,
        channel: 'Security',
        provider: 'Microsoft-Windows-Security-Auditing',
        virtualTime,
        severity: 'Information',
        subjectUser: 'Administrator',
        targetUserOrObject: groupName,
        computer: 'DC01-NEXORA',
        actionEn: 'Member removed from security group',
        actionAr: 'تمت إزالة عضو من مجموعة الأمان',
        detailsEn: `User '${selectedUser.samAccountName}' removed from group '${groupName}'.`,
        detailsAr: `تمت إزالة المستخدم '${selectedUser.samAccountName}' من المجموعة '${groupName}'.`,
        category: 'Account Management',
      });
    }
  };

  const handleToggleInteractiveLogon = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          allowInteractiveLogon: !u.allowInteractiveLogon,
        };
      }
      return u;
    });
    setUsers(updated);
  };

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
              <Users className="w-6 h-6 text-emerald-400" />
              <span>{isAr ? 'مختبر كائنات المستخدمين والحواسيب' : 'Users & Computers Management Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص حسابات المستخدمين، تحصين حسابات الخدمات، وضبط صلاحيات تسجيل الدخول التفاعلي'
                : 'Audit user security tokens, harden service accounts, and configure interactive logon privileges'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'حسابات المستخدمين' : 'Users'} ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('computers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'computers'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isAr ? 'أجهزة الحاسوب' : 'Computers'} ({computers.length})
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        /* Users View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User List Column */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'قائمة حسابات النطاق:' : 'Domain User Accounts:'}
            </span>
            <div className="space-y-2">
              {users.map((user) => {
                const isSelected = user.id === selectedUserId;
                return (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{user.displayName}</span>
                      {user.privileged && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Admin
                        </span>
                      )}
                      {user.isServiceAccount && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          Service
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>{user.samAccountName}</span>
                      <span>{user.department}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Inspector Column */}
          <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  SECURITY PRINCIPAL
                </span>
                <h2 className="text-xl font-bold text-white">{selectedUser.displayName}</h2>
                <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedUser.sid}</p>
              </div>

              {/* Service Account Hardening Controls */}
              {selectedUser.isServiceAccount && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-4 text-xs font-mono">
                    <span className="text-slate-300">Allow Interactive Logon:</span>
                    <button
                      onClick={() => handleToggleInteractiveLogon(selectedUser.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                        selectedUser.allowInteractiveLogon
                          ? 'bg-red-950 border border-red-700 text-red-300 hover:bg-emerald-950'
                          : 'bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-red-950'
                      }`}
                    >
                      {selectedUser.allowInteractiveLogon
                        ? isAr
                          ? 'مسموح (ثغرة أمنية)'
                          : 'ALLOWED (Vulnerable)'
                        : isAr
                        ? 'محظور (محصن)'
                        : 'BLOCKED (Hardened)'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Memberships */}
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                {isAr ? 'المجموعات المباشرة (Direct Groups):' : 'Direct Group Memberships:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedUser.groups.map((grp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                  >
                    <span>{grp}</span>
                    {grp !== 'Domain Users' && (
                      <button
                        onClick={() => handleRemoveGroupFromUser(grp)}
                        className="text-slate-500 hover:text-red-400 transition-colors ml-1"
                        title={isAr ? 'حذف من المجموعة' : 'Remove from group'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Group Widget */}
              <div className="flex items-center gap-2 pt-2">
                <select
                  value={groupToAdd}
                  onChange={(e) => setGroupToAdd(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  {INITIAL_GROUPS.map((g) => (
                    <option key={g.id} value={g.name}>
                      {g.name} ({g.scope})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAddGroupToUser(groupToAdd)}
                  disabled={selectedUser.groups.includes(groupToAdd)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-mono font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إسناد للمستخدم' : 'Add Group'}</span>
                </button>
              </div>
            </div>

            {/* Effective Group Expansion */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                {isAr ? 'المجموعات الفعالة الكاملة (تتضمن التداخل Nested Groups):' : 'Effective Groups (Direct + Nested Resolution):'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {effectiveGroups.map((eg) => (
                  <div
                    key={eg.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      eg.privileged
                        ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{eg.name}</span>
                      <span className="text-[10px] text-slate-500">{eg.scope} • {eg.groupType}</span>
                    </div>
                    {eg.privileged && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                        Privileged
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Computers View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {computers.map((comp) => (
            <div
              key={comp.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <Laptop className="w-5 h-5 text-emerald-400" />
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-[10px]">
                  Domain Joined
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{comp.hostname}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{comp.operatingSystem}</p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>IPv4:</span>
                  <span className="text-white">{comp.ipAddress || 'DHCP'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>OU:</span>
                  <span className="text-cyan-300 truncate max-w-[150px]">{comp.ou}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
