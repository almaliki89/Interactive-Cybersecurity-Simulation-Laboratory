import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  AdObject,
  AdUser,
  AdComputer,
  AdGroup,
  AdOrganizationalUnit,
  INITIAL_DIRECTORY_OBJECTS,
  moveObjectToOu,
  enableDirectoryObject,
  disableDirectoryObject,
  DOMAIN_DN,
  DOMAIN_NAME,
} from './logic/directory';
import {
  FolderTree,
  Folder,
  FolderOpen,
  User,
  Laptop,
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  MoveRight,
  Key,
  Info,
  Power,
} from 'lucide-react';

interface DirectoryExplorerProps {
  onBackToMap?: () => void;
  onNavigateToKerberos?: () => void;
  onAddEvent?: (event: any) => void;
}

export const DirectoryExplorer: React.FC<DirectoryExplorerProps> = ({
  onBackToMap,
  onNavigateToKerberos,
  onAddEvent,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [objects, setObjects] = useState<AdObject[]>(INITIAL_DIRECTORY_OBJECTS);
  const [selectedObjectId, setSelectedObjectId] = useState<string>('usr-sara');
  const [expandedOus, setExpandedOus] = useState<Set<string>>(
    new Set(['ou-finance', 'ou-hr', 'ou-it', 'ou-contractors', 'ou-servers', 'ou-groups'])
  );
  const [targetMoveOu, setTargetMoveOu] = useState<string>('OU=Finance,DC=corp,DC=nexora,DC=local');

  const selectedObject = objects.find((o) => o.id === selectedObjectId) || objects[0];
  const ous = objects.filter((o): o is AdOrganizationalUnit => o.type === 'ou');

  const toggleOuExpand = (ouId: string) => {
    setExpandedOus((prev) => {
      const next = new Set(prev);
      if (next.has(ouId)) {
        next.delete(ouId);
      } else {
        next.add(ouId);
      }
      return next;
    });
  };

  const handleMoveObject = (objectId: string, targetOuDn: string) => {
    const updated = moveObjectToOu(objects, objectId, targetOuDn);
    setObjects(updated);

    const obj = objects.find((o) => o.id === objectId);
    if (onAddEvent && obj) {
      onAddEvent({
        id: `ad-evt-move-${virtualTime}-${objectId}`,
        eventId: 5136,
        channel: 'Directory Service',
        provider: 'Microsoft-Windows-ActiveDirectory_DomainService',
        virtualTime,
        severity: 'Information',
        subjectUser: 'Administrator',
        targetUserOrObject: (obj as any).samAccountName || (obj as any).name,
        computer: 'DC01-NEXORA',
        actionEn: `Object moved to new OU`,
        actionAr: `تم نقل الكائن إلى وحدة تنظيمية جديدة`,
        detailsEn: `Object '${(obj as any).displayName || (obj as any).name}' moved to '${targetOuDn}'.`,
        detailsAr: `تم نقل الكائن '${(obj as any).displayName || (obj as any).name}' إلى '${targetOuDn}'.`,
        category: 'Directory Service Access',
      });
    }
  };

  const handleToggleEnable = (objectId: string, currentEnabled: boolean) => {
    const updated = currentEnabled
      ? disableDirectoryObject(objects, objectId)
      : enableDirectoryObject(objects, objectId);
    setObjects(updated);

    const obj = objects.find((o) => o.id === objectId);
    if (onAddEvent && obj) {
      onAddEvent({
        id: `ad-evt-status-${virtualTime}-${objectId}`,
        eventId: currentEnabled ? 4725 : 4722,
        channel: 'Security',
        provider: 'Microsoft-Windows-Security-Auditing',
        virtualTime,
        severity: 'Information',
        subjectUser: 'Administrator',
        targetUserOrObject: (obj as any).samAccountName,
        computer: 'DC01-NEXORA',
        actionEn: currentEnabled ? 'A user account was disabled' : 'A user account was enabled',
        actionAr: currentEnabled ? 'تم تعطيل حساب مستخدم' : 'تم تفعيل حساب مستخدم',
        detailsEn: `Account '${(obj as any).samAccountName}' status toggled to ${!currentEnabled}.`,
        detailsAr: `تم تغيير حالة الحساب '${(obj as any).samAccountName}' إلى ${!currentEnabled}.`,
        category: 'Account Management',
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to World Map'}
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مستكشف دليل Active Directory' : 'Active Directory Explorer'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استعراض شجرة النطاق corp.nexora.local، إدارة كائنات الوحدات التنظيمية، وفحص الخصائص الأمنية'
                : 'Browse corp.nexora.local directory tree, manage OU memberships, and inspect security attributes'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
            Root: {DOMAIN_NAME}
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Objects: {objects.length}
          </span>
        </div>
      </div>

      {/* Main Grid: Directory Tree + Object Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Directory Tree (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col h-[640px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 text-cyan-400" />
              <span>{DOMAIN_DN}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {ous.length} OUs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {ous
              .filter((ou) => !ou.parentOu)
              .map((ou) => {
                const isExpanded = expandedOus.has(ou.id);
                const children = objects.filter((o) => {
                  if (o.type === 'user' || o.type === 'computer' || o.type === 'group') {
                    return (o as any).ou === ou.distinguishedName;
                  }
                  if (o.type === 'ou') {
                    return (o as AdOrganizationalUnit).parentOu === ou.distinguishedName;
                  }
                  return false;
                });

                return (
                  <div key={ou.id} className="space-y-1">
                    {/* OU Header Node */}
                    <div
                      onClick={() => toggleOuExpand(ou.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono cursor-pointer transition-colors ${
                        selectedObjectId === ou.id
                          ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        {isExpanded ? (
                          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="font-bold truncate">{ou.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                        {children.length}
                      </span>
                    </div>

                    {/* Children List */}
                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l border-slate-800 space-y-1 mt-1">
                        {children.map((child) => {
                          const isSelected = selectedObjectId === child.id;
                          let Icon = User;
                          let iconColor = 'text-blue-400';
                          let title = '';

                          if (child.type === 'user') {
                            const u = child as AdUser;
                            title = `${u.displayName} (${u.samAccountName})`;
                            iconColor = u.privileged
                              ? 'text-red-400'
                              : u.isServiceAccount
                              ? 'text-amber-400'
                              : 'text-blue-400';
                          } else if (child.type === 'computer') {
                            const c = child as AdComputer;
                            title = c.hostname;
                            Icon = Laptop;
                            iconColor = 'text-emerald-400';
                          } else if (child.type === 'group') {
                            const g = child as AdGroup;
                            title = g.name;
                            Icon = Users;
                            iconColor = g.privileged ? 'text-rose-400' : 'text-purple-400';
                          } else if (child.type === 'ou') {
                            const subOu = child as AdOrganizationalUnit;
                            title = subOu.name;
                            Icon = Folder;
                            iconColor = 'text-amber-400';
                          }

                          return (
                            <div
                              key={child.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedObjectId(child.id);
                              }}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-900/30'
                                  : 'hover:bg-slate-800/60 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : iconColor} shrink-0`} />
                                <span className="truncate">{title}</span>
                              </div>

                              {child.type === 'user' && !(child as AdUser).enabled && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                                  {isAr ? 'معطل' : 'Disabled'}
                                </span>
                              )}
                              {child.type === 'user' && (child as AdUser).privileged && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                  Admin
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Object Inspector & Actions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Object Header Badge */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {selectedObject.type.toUpperCase()} OBJECT
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {(selectedObject as any).displayName ||
                    (selectedObject as any).hostname ||
                    (selectedObject as any).name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1 break-all">
                  {'sid' in selectedObject ? (selectedObject as any).sid : (selectedObject as any).distinguishedName}
                </p>
              </div>

              {/* Status / Toggle Enable for Users */}
              {selectedObject.type === 'user' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleEnable(selectedObject.id, (selectedObject as AdUser).enabled)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      (selectedObject as AdUser).enabled
                        ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300 hover:bg-red-950 hover:border-red-600 hover:text-red-300'
                        : 'bg-red-950/80 border border-red-600 text-red-300 hover:bg-emerald-950 hover:border-emerald-600 hover:text-emerald-300'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {(selectedObject as AdUser).enabled
                        ? isAr
                          ? 'الحساب مفعل (انقر للتعطيل)'
                          : 'Enabled (Click to Disable)'
                        : isAr
                        ? 'الحساب معطل (انقر للتفعيل)'
                        : 'Disabled (Click to Enable)'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Organizational Unit (OU)</span>
                <span className="text-cyan-300 font-semibold break-all">
                  {(selectedObject as any).ou || (selectedObject as any).distinguishedName}
                </span>
              </div>

              {'samAccountName' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">sAMAccountName</span>
                  <span className="text-white font-semibold">{(selectedObject as AdUser).samAccountName}</span>
                </div>
              )}

              {'userPrincipalName' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">User Principal Name (UPN)</span>
                  <span className="text-white font-semibold">{(selectedObject as AdUser).userPrincipalName}</span>
                </div>
              )}

              {'department' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">Department</span>
                  <span className="text-white font-semibold">{(selectedObject as AdUser).department}</span>
                </div>
              )}

              {'operatingSystem' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">Operating System</span>
                  <span className="text-white font-semibold">{(selectedObject as AdComputer).operatingSystem}</span>
                </div>
              )}

              {'ipAddress' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">IPv4 Address</span>
                  <span className="text-emerald-400 font-semibold">{(selectedObject as AdComputer).ipAddress}</span>
                </div>
              )}

              {'privileged' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">Privilege Tier</span>
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      (selectedObject as any).privileged ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    {(selectedObject as any).privileged ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Privileged Role / AdminCount=1</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Standard Non-Privileged User</span>
                      </>
                    )}
                  </span>
                </div>
              )}

              {'isServiceAccount' in selectedObject && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block">Account Classification</span>
                  <span className="text-white font-semibold">
                    {(selectedObject as AdUser).isServiceAccount ? 'Service Account (sAMAccountType=805306368)' : 'Interactive User Account'}
                  </span>
                </div>
              )}
            </div>

            {/* Group Memberships for Users */}
            {selectedObject.type === 'user' && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  {isAr ? 'عضويات المجموعات المباشرة (memberOf):' : 'Direct Group Memberships (memberOf):'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedObject as AdUser).groups.map((grpName, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-xl text-xs font-mono border ${
                        grpName.includes('Admin')
                          ? 'bg-rose-950/70 border-rose-700 text-rose-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-cyan-300'
                      }`}
                    >
                      {grpName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Move Object OU Action Box */}
            {(selectedObject.type === 'user' || selectedObject.type === 'computer') && (
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                  <MoveRight className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'نقل الكائن إلى وحدة تنظيمية أخرى:' : 'Move Object to Target OU:'}</span>
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={targetMoveOu}
                    onChange={(e) => setTargetMoveOu(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ous.map((ou) => (
                      <option key={ou.id} value={ou.distinguishedName}>
                        {ou.name} ({ou.distinguishedName})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleMoveObject(selectedObject.id, targetMoveOu)}
                    disabled={(selectedObject as any).ou === targetMoveOu}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono font-bold text-xs transition-colors"
                  >
                    {isAr ? 'تنفيذ النقل' : 'Apply Move'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Footer Navigation */}
          {onNavigateToKerberos && selectedObject.type === 'user' && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? 'اختبار مصادقة هذا المستخدم عبر Kerberos:' : 'Test Kerberos ticket acquisition for this user:'}
              </span>
              <button
                onClick={onNavigateToKerberos}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isAr ? 'مختبر Kerberos' : 'Open Kerberos'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
