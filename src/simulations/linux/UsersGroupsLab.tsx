import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  FolderLock,
  Layers,
  CheckCircle2,
  Trash2,
  Plus,
  Terminal,
} from 'lucide-react';
import {
  LinuxUser,
  LinuxResource,
  getEffectiveGroups,
  canUserAccessResource,
  createUser,
  changePrimaryGroup,
  addSupplementaryGroup,
  removeSupplementaryGroup,
} from './logic/identity';
import { parseOctalMode } from './logic/permissions';

interface UsersGroupsLabProps {
  onBackToMap?: () => void;
}

export const UsersGroupsLab: React.FC<UsersGroupsLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [users, setUsers] = useState<LinuxUser[]>([
    { username: 'root', primaryGroup: 'root', supplementaryGroups: ['wheel'] },
    { username: 'alice', primaryGroup: 'developers', supplementaryGroups: ['devops'] },
    { username: 'bob', primaryGroup: 'developers', supplementaryGroups: [] },
    { username: 'www-data', primaryGroup: 'www-data', supplementaryGroups: [] },
  ]);

  const [availableGroups] = useState<string[]>([
    'root',
    'wheel',
    'developers',
    'devops',
    'shadow',
    'www-data',
    'accounting',
  ]);

  const [selectedUsername, setSelectedUsername] = useState<string>('alice');
  const [newUsername, setNewUsername] = useState('');
  const [newPrimaryGroup, setNewPrimaryGroup] = useState('developers');
  const [selectedSuppGroupToAdd, setSelectedSuppGroupToAdd] = useState('devops');

  // Test Resources
  const sampleResources: LinuxResource[] = [
    {
      path: '/etc/shadow',
      owner: 'root',
      group: 'shadow',
      permissions: parseOctalMode('640'),
    },
    {
      path: '/var/www/html/index.html',
      owner: 'www-data',
      group: 'developers',
      permissions: parseOctalMode('664'),
    },
    {
      path: '/usr/local/bin/deploy.sh',
      owner: 'alice',
      group: 'devops',
      permissions: parseOctalMode('750'),
    },
    {
      path: '/home/alice/id_rsa',
      owner: 'alice',
      group: 'developers',
      permissions: parseOctalMode('600'),
    },
  ];

  const [selectedResourcePath, setSelectedResourcePath] = useState<string>('/etc/shadow');
  const [testAction, setTestAction] = useState<'r' | 'w' | 'x'>('r');

  const selectedUser = users.find((u) => u.username === selectedUsername) || users[0];
  const effectiveGroups = getEffectiveGroups(selectedUser);
  const selectedResource = sampleResources.find((r) => r.path === selectedResourcePath) || sampleResources[0];

  // Evaluate access immediately
  const accessEvaluation = canUserAccessResource(selectedUser, selectedResource, testAction);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const cleanName = newUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updated = createUser(users, cleanName, newPrimaryGroup);
    setUsers(updated);
    setSelectedUsername(cleanName);
    setNewUsername('');

    addLog({
      level: 'INFO',
      source: 'USERADD',
      message: `Created account '${cleanName}' with primary GID '${newPrimaryGroup}' at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'USER_CREATED',
      description: `User '${cleanName}' created with group '${newPrimaryGroup}'`,
    });
  };

  const handleChangePrimary = (group: string) => {
    const updated = changePrimaryGroup(users, selectedUser.username, group);
    setUsers(updated);
    addLog({
      level: 'INFO',
      source: 'USERMOD',
      message: `Updated primary group for '${selectedUser.username}' to '${group}' at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'USER_GROUP_CHANGED',
      description: `Primary group of '${selectedUser.username}' changed to '${group}'`,
    });
  };

  const handleAddSupplementary = (group: string) => {
    const updated = addSupplementaryGroup(users, selectedUser.username, group);
    setUsers(updated);
    addLog({
      level: 'INFO',
      source: 'USERMOD',
      message: `Added supplementary group '${group}' to '${selectedUser.username}' at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'USER_GROUP_CHANGED',
      description: `Supplementary group '${group}' added to '${selectedUser.username}'`,
    });
  };

  const handleRemoveSupplementary = (group: string) => {
    const updated = removeSupplementaryGroup(users, selectedUser.username, group);
    setUsers(updated);
    addLog({
      level: 'INFO',
      source: 'USERMOD',
      message: `Removed supplementary group '${group}' from '${selectedUser.username}' at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'USER_GROUP_CHANGED',
      description: `Supplementary group '${group}' removed from '${selectedUser.username}'`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono uppercase">
            <Users className="w-4 h-4" />
            <span>{isAr ? 'مختبر إدارة الهوية والمجموعات (Identity & Access Graph)' : 'Identity, Groups & DAC Access Lab'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'هيكلية الحسابات والمجموعات وحساب الصلاحيات الفعلية' : 'User Account Boundaries, Group Memberships & Access Decisions'}
          </h2>
        </div>

        {onBackToMap && (
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <BackArrow className="w-3.5 h-3.5" />
            <span>{isAr ? 'العودة للخارطة' : 'Back to World Map'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Users List & Provisioning */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between border-b border-slate-800 pb-2">
            <span>{isAr ? 'حسابات النظام المسجلة' : 'System Accounts'}</span>
            <span className="text-[10px] text-slate-500">{users.length} Users</span>
          </h3>

          <div className="space-y-2">
            {users.map((u) => {
              const isSelected = selectedUsername === u.username;
              return (
                <button
                  key={u.username}
                  onClick={() => setSelectedUsername(u.username)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between font-mono text-xs transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/80 text-cyan-200'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <span className="font-bold block truncate">{u.username}</span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Primary: <span className="text-slate-300">{u.primaryGroup}</span>
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    +{u.supplementaryGroups.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Provision New User */}
          <form onSubmit={handleCreateUser} className="border-t border-slate-800 pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'إضافة مستخدم جديد (useradd)' : 'Provision User (useradd)'}</span>
            </span>

            <div className="space-y-2">
              <input
                type="text"
                placeholder={isAr ? 'اسم المستخدم الجديد...' : 'username...'}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
              />
              <select
                value={newPrimaryGroup}
                onChange={(e) => setNewPrimaryGroup(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                {availableGroups.map((g) => (
                  <option key={g} value={g}>
                    Primary GID: {g}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إنشاء الحساب' : 'Create User'}</span>
            </button>
          </form>
        </div>

        {/* Center Column: Group Memberships & Identity Graph */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'إدارة المجموعات والصلاحيات الفعلية' : 'Group Memberships & Hierarchy'}</span>
          </h3>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
            <span className="text-[10px] text-slate-500 block uppercase">{isAr ? 'المستخدم المحدد' : 'Selected User'}</span>
            <div className="text-cyan-300 font-bold text-sm">{selectedUser.username}</div>
          </div>

          {/* Primary Group Modification */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              {isAr ? 'المجموعة الأساسية (Primary Group - GID):' : 'Primary Group (GID):'}
            </label>
            <select
              value={selectedUser.primaryGroup}
              onChange={(e) => handleChangePrimary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono focus:outline-none"
            >
              {availableGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Supplementary Groups */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
              {isAr ? 'المجموعات التكميلية (Supplementary Groups):' : 'Supplementary Groups:'}
            </label>

            <div className="flex flex-wrap gap-1.5 min-h-[48px] p-2 bg-slate-950 border border-slate-800 rounded-xl">
              {selectedUser.supplementaryGroups.map((grp) => (
                <span
                  key={grp}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono"
                >
                  <span>{grp}</span>
                  <button
                    onClick={() => handleRemoveSupplementary(grp)}
                    className="text-slate-500 hover:text-rose-400"
                    title="Remove group"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedUser.supplementaryGroups.length === 0 && (
                <span className="text-[11px] text-slate-600 font-mono self-center">
                  {isAr ? 'لا توجد مجموعات تكميلية' : 'No supplementary groups'}
                </span>
              )}
            </div>

            {/* Add Supplementary Group form */}
            <div className="flex gap-2">
              <select
                value={selectedSuppGroupToAdd}
                onChange={(e) => setSelectedSuppGroupToAdd(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none"
              >
                {availableGroups
                  .filter((g) => g !== selectedUser.primaryGroup && !selectedUser.supplementaryGroups.includes(g))
                  .map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => handleAddSupplementary(selectedSuppGroupToAdd)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {isAr ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>

          {/* Effective Groups Inspector */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
              {isAr ? 'المجموعات الفعلية المحسوبة (Effective Groups):' : 'Effective Groups Calculated:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {effectiveGroups.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-mono text-[11px] font-bold"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Access Consequence Evaluator */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'تقييم أثر الصلاحيات الفعلي' : 'Access Consequence Evaluator'}</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                {isAr ? 'الملف المستهدف بالفحص:' : 'TARGET RESOURCE:'}
              </label>
              <select
                value={selectedResourcePath}
                onChange={(e) => setSelectedResourcePath(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                {sampleResources.map((res) => (
                  <option key={res.path} value={res.path}>
                    {res.path} ({res.owner}:{res.group})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                {isAr ? 'الإجراء المراد تنفيذه:' : 'ATTEMPTED ACTION:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'r', labelEn: 'Read (r)', labelAr: 'قراءة (r)' },
                  { id: 'w', labelEn: 'Write (w)', labelAr: 'كتابة (w)' },
                  { id: 'x', labelEn: 'Execute (x)', labelAr: 'تشغيل (x)' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setTestAction(act.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      testAction === act.id
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isAr ? act.labelAr : act.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Access Outcome Card */}
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 mt-4 transition-all ${
              accessEvaluation.allowed
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {accessEvaluation.allowed ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold uppercase tracking-wider">
                {accessEvaluation.allowed
                  ? (isAr ? 'مسموح بالوصول' : 'ACCESS GRANTED')
                  : (isAr ? 'تم رفض الوصول (EACCES)' : 'ACCESS DENIED (EACCES)')}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {isAr ? accessEvaluation.reasonAr : accessEvaluation.reasonEn}
            </p>
          </div>

          {/* Matched Class Badge */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'فئة المطابقة:' : 'MATCHED CLASS:'}</span>
            <span className="text-cyan-400 font-bold uppercase">{accessEvaluation.matchedClass}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
