import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_GROUPS,
  INITIAL_USERS,
  AdGroup,
} from './logic/directory';
import {
  resolveNestedMembership,
  wouldCreateGroupCycle,
} from './logic/groups';
import {
  Workflow,
  Shield,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface GroupMembershipGraphProps {
  onBackToMap?: () => void;
  onNavigateToAuth?: () => void;
}

export const GroupMembershipGraph: React.FC<GroupMembershipGraphProps> = ({
  onBackToMap,
  onNavigateToAuth,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [groups, setGroups] = useState<AdGroup[]>(INITIAL_GROUPS);
  const [selectedGroupSid, setSelectedGroupSid] = useState<string>('S-1-5-21-392841-1102'); // Finance-Reporting
  const [parentCandidateSid, setParentCandidateSid] = useState<string>('S-1-5-21-392841-1101');
  const [cycleAlert, setCycleAlert] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.sid === selectedGroupSid) || groups[0];

  // Resolve all nested members of selected group
  const resolvedMemberSids = resolveNestedMembership(groups, selectedGroup.sid);

  const handleNestGroup = (parentSid: string, memberSid: string) => {
    setCycleAlert(null);

    // Check for cycle first
    if (wouldCreateGroupCycle(groups, parentSid, memberSid)) {
      setCycleAlert(
        isAr
          ? 'تحذير: لا يمكن إضافة هذه المجموعة لأنها ستتسبب في حلقة تكرارية مغلقة (Cyclic Loop)!'
          : 'Cycle Detection Error: Nesting this group would create an invalid circular dependency loop!'
      );
      return;
    }

    const updated = groups.map((g) => {
      if (g.sid === parentSid) {
        if (!g.members.includes(memberSid)) {
          return {
            ...g,
            members: [...g.members, memberSid],
          };
        }
      }
      return g;
    });

    setGroups(updated);
  };

  const handleRemoveMember = (parentSid: string, memberSid: string) => {
    setCycleAlert(null);
    const updated = groups.map((g) => {
      if (g.sid === parentSid) {
        return {
          ...g,
          members: g.members.filter((m) => m !== memberSid),
        };
      }
      return g;
    });
    setGroups(updated);
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
              <Workflow className="w-6 h-6 text-purple-400" />
              <span>{isAr ? 'مخطط تداخل المجموعات (Nested Groups Graph)' : 'Nested Group Membership Graph'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استكشاف سلاسل التداخل (A -> B -> C)، كشف وحظر الحلقات التكرارية (Cycle Prevention)، وحساب الصلاحيات التراكمية'
                : 'Explore AGDLP group nesting, prevent cyclic dependency deadlocks, and calculate cumulative role expansion'}
            </p>
          </div>
        </div>

        {onNavigateToAuth && (
          <button
            onClick={onNavigateToAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
          >
            <span>{isAr ? 'مختبر التفويض والموارد' : 'Resource Authorization'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cycle Alert Banner */}
      {cycleAlert && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs font-mono flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{cycleAlert}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Group Selector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            {isAr ? 'مجموعات النطاق الأمني:' : 'Security Groups:'}
          </span>
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {groups.map((group) => {
              const isSelected = group.sid === selectedGroupSid;
              return (
                <div
                  key={group.id}
                  onClick={() => {
                    setSelectedGroupSid(group.sid);
                    setCycleAlert(null);
                  }}
                  className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{group.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                      {group.scope}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>{group.members.length} direct members</span>
                    {group.privileged && (
                      <span className="text-amber-400 font-bold">Privileged</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Nesting Diagram & Actions (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                GROUP INSPECTOR
              </span>
              <h2 className="text-xl font-bold text-white">{selectedGroup.name}</h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">{selectedGroup.sid}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Scope: <strong className="text-cyan-400">{selectedGroup.scope}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                Type: <strong className="text-purple-400">{selectedGroup.groupType}</strong>
              </span>
            </div>
          </div>

          {/* AGDLP Architectural Flow Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs font-mono">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[11px]">
              {isAr ? 'نموذج تصميم المجموعات AGDLP في Active Directory:' : 'AGDLP Role-Based Access Control Model:'}
            </span>
            <div className="flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">Accounts</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">Global Groups</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Domain Local Groups</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Permissions (DACL)</span>
            </div>
          </div>

          {/* Direct Members */}
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
              {isAr ? 'الأعضاء المباشرون في هذه المجموعة (Direct Members):' : 'Direct Members in this Group:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {selectedGroup.members.map((memberSid) => {
                const memberGroup = groups.find((g) => g.sid === memberSid);
                const memberUser = INITIAL_USERS.find((u) => u.sid === memberSid);
                const name = memberGroup ? `[Group] ${memberGroup.name}` : memberUser ? `[User] ${memberUser.displayName}` : memberSid;

                return (
                  <div
                    key={memberSid}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300"
                  >
                    <span className="truncate">{name}</span>
                    <button
                      onClick={() => handleRemoveMember(selectedGroup.sid, memberSid)}
                      className="text-slate-500 hover:text-red-400 ml-2"
                      title={isAr ? 'حذف العضو' : 'Remove member'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nest Another Group Action */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'تضمين مجموعة أخرى داخل هذه المجموعة (Nesting):' : 'Nest Another Group into this Group:'}</span>
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={parentCandidateSid}
                onChange={(e) => setParentCandidateSid(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              >
                {groups
                  .filter((g) => g.sid !== selectedGroup.sid && !selectedGroup.members.includes(g.sid))
                  .map((g) => (
                    <option key={g.id} value={g.sid}>
                      {g.name} ({g.scope})
                    </option>
                  ))}
              </select>

              <button
                onClick={() => handleNestGroup(selectedGroup.sid, parentCandidateSid)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition-colors"
              >
                {isAr ? 'إضافة وتدقيق الحلقات' : 'Nest with Cycle Check'}
              </button>
            </div>
          </div>

          {/* Fully Resolved Nested Member SIDs */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              {isAr ? 'كافة المعرفات المستفيدة عبر التداخل (Resolved SIDs):' : 'Full Recursive Transitive Membership Resolution:'}
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {resolvedMemberSids.map((sid, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300"
                >
                  {sid}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
