import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Terminal,
  FileCode,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';

interface LinuxFile {
  id: string;
  name: string;
  owner: string;
  group: string;
  isExecutable: boolean;
}

export const LinuxSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const addLog = useSimulationStore((s) => s.addLog);

  // Files available
  const files: LinuxFile[] = [
    { id: 'f1', name: '/var/www/html/index.html', owner: 'alice', group: 'developers', isExecutable: false },
    { id: 'f2', name: '/etc/shadow', owner: 'root', group: 'shadow', isExecutable: false },
    { id: 'f3', name: '/usr/local/bin/deploy.sh', owner: 'alice', group: 'devops', isExecutable: true },
  ];

  const [selectedFileId, setSelectedFileId] = useState('f1');
  const selectedFile = files.find((f) => f.id === selectedFileId)!;

  // Active permissions matrix: [r, w, x]
  const [ownerPerms, setOwnerPerms] = useState({ r: true, w: true, x: false });
  const [groupPerms, setGroupPerms] = useState({ r: true, w: false, x: false });
  const [otherPerms, setOtherPerms] = useState({ r: true, w: false, x: false });

  // User tester
  const users = [
    { name: 'alice', role: language === 'ar' ? 'المالك (Owner)' : 'Owner', groups: ['developers', 'devops'] },
    { name: 'bob', role: language === 'ar' ? 'عضو المجموعة (Group Member)' : 'Group Member', groups: ['developers'] },
    { name: 'www-data', role: language === 'ar' ? 'الآخرون (Web Daemon)' : 'Other (Web Daemon)', groups: ['www-data'] },
    { name: 'root', role: language === 'ar' ? 'المستخدم الجذر (Superuser)' : 'Superuser', groups: ['root', 'wheel'] },
  ];
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [testResult, setTestResult] = useState<{
    action: string;
    allowed: boolean;
    reason: string;
  } | null>(null);

  // Calculate octal representation
  const calcOctal = (p: { r: boolean; w: boolean; x: boolean }) =>
    (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);

  const octalNotation = `${calcOctal(ownerPerms)}${calcOctal(groupPerms)}${calcOctal(otherPerms)}`;

  // Symbolic representation
  const formatSymbolic = () => {
    const o = `${ownerPerms.r ? 'r' : '-'}${ownerPerms.w ? 'w' : '-'}${ownerPerms.x ? 'x' : '-'}`;
    const g = `${groupPerms.r ? 'r' : '-'}${groupPerms.w ? 'w' : '-'}${groupPerms.x ? 'x' : '-'}`;
    const oth = `${otherPerms.r ? 'r' : '-'}${otherPerms.w ? 'w' : '-'}${otherPerms.x ? 'x' : '-'}`;
    return `-${o}${g}${oth}`;
  };

  const linuxChallenge: Challenge = {
    id: 'linux-permissions-challenge',
    simulationId: 'linux',
    title: t.linux.missionTitle,
    difficulty: 'Beginner',
    category: t.linux.missionCategory,
    mission: t.linux.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'يستخدم نظام لينكس التحكم بالوصول التقديري (DAC) بـ 9 بتات مقسمة بين المالك والمجموعة والآخرين لمنع الاستغلال والتصعيد غير المصرح به.'
        : 'Linux uses Discretionary Access Control (DAC) with 9 permission bits grouped into Owner, Group, and Other. Overly permissive write or execute permissions lead to privilege escalation.',
    objectives: [
      {
        id: 'obj-restrict-others',
        title: t.linux.objRestrictOthers,
        description: t.linux.objRestrictOthersDesc,
        isCompleted: !otherPerms.r && !otherPerms.w && !otherPerms.x,
        validationKey: 'others_zero',
      },
      {
        id: 'obj-owner-rw',
        title: t.linux.objOwnerAccess,
        description: t.linux.objOwnerAccessDesc,
        isCompleted: ownerPerms.r && ownerPerms.w,
        validationKey: 'owner_rw',
      },
    ],
    hints: [t.linux.hint1],
  };

  // Test action logic
  const handleTestAction = (action: 'read' | 'write' | 'execute') => {
    if (selectedUser.name === 'root') {
      const res = {
        action,
        allowed: true,
        reason:
          language === 'ar'
            ? 'المستخدم الجذر root (UID 0) يتجاوز بتات صلاحيات DAC القياسية عبر قدرة CAP_DAC_OVERRIDE.'
            : 'Superuser (root / UID 0) bypasses standard DAC permission bits.',
      };
      setTestResult(res);
      addLog({ level: 'INFO', source: 'AUDITD', message: `root executed ${action} on ${selectedFile.name} (CAP_DAC_OVERRIDE)`, category: 'SYSTEM' });
      return;
    }

    const isOwner = selectedUser.name === selectedFile.owner;
    const isGroup = selectedUser.groups.includes(selectedFile.group);

    let allowed = false;
    let categoryApplied = '';

    if (isOwner) {
      categoryApplied = language === 'ar' ? 'فئة المالك (Owner)' : 'Owner Class';
      if (action === 'read' && ownerPerms.r) allowed = true;
      if (action === 'write' && ownerPerms.w) allowed = true;
      if (action === 'execute' && ownerPerms.x) allowed = true;
    } else if (isGroup) {
      categoryApplied = language === 'ar' ? 'فئة المجموعة (Group)' : 'Group Class';
      if (action === 'read' && groupPerms.r) allowed = true;
      if (action === 'write' && groupPerms.w) allowed = true;
      if (action === 'execute' && groupPerms.x) allowed = true;
    } else {
      categoryApplied = language === 'ar' ? 'فئة الآخرين (Others/World)' : 'Other/World Class';
      if (action === 'read' && otherPerms.r) allowed = true;
      if (action === 'write' && otherPerms.w) allowed = true;
      if (action === 'execute' && otherPerms.x) allowed = true;
    }

    const res = {
      action,
      allowed,
      reason: allowed
        ? (language === 'ar'
            ? `المستخدم '${selectedUser.name}' يطابق ${categoryApplied} وتملك بت الصلاحية المطلوب (+${action[0]}).`
            : `User '${selectedUser.name}' matches ${categoryApplied} and bit (+${action[0]}) is active.`)
        : (language === 'ar'
            ? `رفض النواة (EACCES): المستخدم '${selectedUser.name}' في ${categoryApplied} يفتقر لصلاحية (${action}).`
            : `Kernel denied (EACCES): User '${selectedUser.name}' under ${categoryApplied} lacks (${action}) bit.`),
    };

    setTestResult(res);

    addLog({
      level: allowed ? 'INFO' : 'WARN',
      source: 'KERNEL_VFS',
      message: `${selectedUser.name} attempt '${action}' on ${selectedFile.name} -> ${
        allowed ? 'PERMISSION_GRANTED' : 'EACCES_PERMISSION_DENIED'
      }`,
      category: 'SYSTEM',
    });
  };

  const validateChallenge = () => {
    if (!otherPerms.r && !otherPerms.w && !otherPerms.x && ownerPerms.r && ownerPerms.w) {
      return {
        success: true,
        message: t.linux.valSuccess,
      };
    }
    return {
      success: false,
      message: t.linux.valFailed,
    };
  };

  return (
    <Workspace
      title={t.linux.title}
      subtitle={t.linux.subtitle}
      challenge={linuxChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={() => {
        setOwnerPerms({ r: true, w: true, x: false });
        setGroupPerms({ r: true, w: false, x: false });
        setOtherPerms({ r: false, w: false, x: false });
        setTestResult(null);
      }}
    >
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center select-none space-y-6">
        {/* Top File Selector Banner */}
        <div className="max-w-3xl w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-slate-400">{t.linux.selectFile}</span>
            <select
              value={selectedFileId}
              onChange={(e) => {
                setSelectedFileId(e.target.value);
                setTestResult(null);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white font-mono focus:outline-hidden"
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.owner}:{f.group})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Badges */}
          <div className="flex items-center gap-3 font-mono">
            <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase">{t.linux.mode}</span>
              <span className="text-base font-bold text-amber-400 tracking-wider">
                {octalNotation}
              </span>
            </div>
            <div className="px-3 py-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase">{t.linux.symbolic}</span>
              <span className="text-sm font-bold text-cyan-400 tracking-wider">
                {formatSymbolic()}
              </span>
            </div>
          </div>
        </div>

        {/* 3-Column Permission Matrix */}
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Owner Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase font-mono">
                1. {t.linux.owner} ({selectedFile.owner})
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {calcOctal(ownerPerms)}
              </span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.read}</span>
                <input
                  type="checkbox"
                  checked={ownerPerms.r}
                  onChange={(e) => setOwnerPerms((p) => ({ ...p, r: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.write}</span>
                <input
                  type="checkbox"
                  checked={ownerPerms.w}
                  onChange={(e) => setOwnerPerms((p) => ({ ...p, w: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.execute}</span>
                <input
                  type="checkbox"
                  checked={ownerPerms.x}
                  onChange={(e) => setOwnerPerms((p) => ({ ...p, x: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
              </label>
            </div>
          </div>

          {/* Group Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase font-mono">
                2. {t.linux.group} ({selectedFile.group})
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {calcOctal(groupPerms)}
              </span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.read}</span>
                <input
                  type="checkbox"
                  checked={groupPerms.r}
                  onChange={(e) => setGroupPerms((p) => ({ ...p, r: e.target.checked }))}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.write}</span>
                <input
                  type="checkbox"
                  checked={groupPerms.w}
                  onChange={(e) => setGroupPerms((p) => ({ ...p, w: e.target.checked }))}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.execute}</span>
                <input
                  type="checkbox"
                  checked={groupPerms.x}
                  onChange={(e) => setGroupPerms((p) => ({ ...p, x: e.target.checked }))}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
              </label>
            </div>
          </div>

          {/* Other Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase font-mono">
                3. {t.linux.others}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {calcOctal(otherPerms)}
              </span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.read}</span>
                <input
                  type="checkbox"
                  checked={otherPerms.r}
                  onChange={(e) => setOtherPerms((p) => ({ ...p, r: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.write}</span>
                <input
                  type="checkbox"
                  checked={otherPerms.w}
                  onChange={(e) => setOtherPerms((p) => ({ ...p, w: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded hover:bg-slate-800/40">
                <span>{t.linux.execute}</span>
                <input
                  type="checkbox"
                  checked={otherPerms.x}
                  onChange={(e) => setOtherPerms((p) => ({ ...p, x: e.target.checked }))}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Live Permission Tester Deck */}
        <div className="max-w-3xl w-full bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {t.linux.testerTitle}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{t.linux.testerDesc}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            {/* User Choice */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{t.linux.runAs}</span>
              <select
                value={selectedUser.name}
                onChange={(e) =>
                  setSelectedUser(users.find((u) => u.name === e.target.value) || users[0])
                }
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-hidden"
              >
                {users.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTestAction('read')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {t.linux.attemptRead}
              </button>
              <button
                onClick={() => handleTestAction('write')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {t.linux.attemptWrite}
              </button>
              <button
                onClick={() => handleTestAction('execute')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                {t.linux.attemptExec}
              </button>
            </div>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-3 ${
                testResult.allowed
                  ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {testResult.allowed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {testResult.allowed ? t.linux.permitted : t.linux.denied}
                </span>
                <p className="mt-1 leading-relaxed text-xs">{testResult.reason}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Workspace>
  );
};
