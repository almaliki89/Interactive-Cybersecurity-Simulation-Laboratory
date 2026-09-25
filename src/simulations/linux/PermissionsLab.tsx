import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Shield,
  FileCode,
  Terminal,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import {
  PosixPermissions,
  parseOctalMode,
  formatSymbolicMode,
  getOctalString,
  calcOctalDigit,
  evaluatePosixPermission,
  applyChmodSymbolic,
} from './logic/permissions';

interface TestFile {
  name: string;
  path: string;
  owner: string;
  group: string;
  permissions: PosixPermissions;
}

interface PermissionsLabProps {
  onBackToMap?: () => void;
}

export const PermissionsLab: React.FC<PermissionsLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [files, setFiles] = useState<TestFile[]>([
    {
      name: 'shadow',
      path: '/etc/shadow',
      owner: 'root',
      group: 'shadow',
      permissions: parseOctalMode('600'),
    },
    {
      name: 'index.html',
      path: '/var/www/html/index.html',
      owner: 'alice',
      group: 'developers',
      permissions: parseOctalMode('644'),
    },
    {
      name: 'deploy.sh',
      path: '/usr/local/bin/deploy.sh',
      owner: 'alice',
      group: 'devops',
      permissions: parseOctalMode('750'),
    },
  ]);

  const [selectedFilePath, setSelectedFilePath] = useState('/etc/shadow');
  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  // Users for testing
  const testUsers = [
    { username: 'root', primaryGroup: 'root', supplementaryGroups: ['wheel'] },
    { username: 'alice', primaryGroup: 'developers', supplementaryGroups: ['devops'] },
    { username: 'bob', primaryGroup: 'developers', supplementaryGroups: [] },
    { username: 'www-data', primaryGroup: 'www-data', supplementaryGroups: [] },
  ];
  const [selectedUser, setSelectedUser] = useState(testUsers[1]); // alice

  // Chmod Direct Input
  const [octalInput, setOctalInput] = useState(getOctalString(selectedFile.permissions));

  const updateFilePerms = (newPerms: PosixPermissions) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFilePath ? { ...f, permissions: newPerms } : f))
    );
    const newOctal = getOctalString(newPerms);
    setOctalInput(newOctal);

    addLog({
      level: 'INFO',
      source: 'CHMOD',
      message: `chmod ${newOctal} ${selectedFilePath} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'FILE_PERMISSION_CHANGED',
      description: `chmod ${newOctal} on ${selectedFilePath}`,
    });
  };

  const handleToggleBit = (cls: 'owner' | 'group' | 'other', bit: 'r' | 'w' | 'x') => {
    const updated: PosixPermissions = JSON.parse(JSON.stringify(selectedFile.permissions));
    updated[cls][bit] = !updated[cls][bit];
    updateFilePerms(updated);
  };

  const handleOctalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-7]{3}$/.test(octalInput)) return;
    const parsed = parseOctalMode(octalInput);
    updateFilePerms(parsed);
  };

  const handleChown = (newOwner: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFilePath ? { ...f, owner: newOwner } : f))
    );
    addLog({
      level: 'INFO',
      source: 'CHOWN',
      message: `chown ${newOwner} ${selectedFilePath} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
  };

  const handleChgrp = (newGroup: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === selectedFilePath ? { ...f, group: newGroup } : f))
    );
    addLog({
      level: 'INFO',
      source: 'CHGRP',
      message: `chgrp ${newGroup} ${selectedFilePath} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
  };

  const currentOctal = getOctalString(selectedFile.permissions);
  const currentSymbolic = formatSymbolicMode(selectedFile.permissions, false);

  // Evaluate tests immediately for all 3 actions
  const readAllowed = evaluatePosixPermission(selectedUser, selectedFile, 'r');
  const writeAllowed = evaluatePosixPermission(selectedUser, selectedFile, 'w');
  const execAllowed = evaluatePosixPermission(selectedUser, selectedFile, 'x');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono uppercase">
            <Shield className="w-4 h-4" />
            <span>{isAr ? 'مختبر أذونات الملفات والتحكم التقديري (DAC Lab)' : 'POSIX File Permissions & DAC Calculator'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'حساب مصفوفة الصلاحيات (rwx) والأوضاع الثمانية والرمزية' : 'Permission Calculator, Symbolic Modes & Access Enforcement'}
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

      {/* Target Selector & Mode Indicators */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileCode className="w-5 h-5 text-amber-400" />
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">{isAr ? 'الملف المستهدف:' : 'TARGET FILE:'}</span>
            <select
              value={selectedFilePath}
              onChange={(e) => {
                setSelectedFilePath(e.target.value);
                const target = files.find((f) => f.path === e.target.value);
                if (target) setOctalInput(getOctalString(target.permissions));
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white font-mono focus:outline-none"
            >
              {files.map((f) => (
                <option key={f.path} value={f.path}>
                  {f.path} ({f.owner}:{f.group})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'الوضع' : 'MODE'}</span>
            <span className="text-base font-bold text-amber-400">{currentOctal}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase">{isAr ? 'الرمز' : 'SYMBOLIC'}</span>
            <span className="text-sm font-bold text-cyan-400">{currentSymbolic}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Permission Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Owner Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase font-mono">
              1. {isAr ? 'المالك' : 'Owner'} ({selectedFile.owner})
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {calcOctalDigit(selectedFile.permissions.owner)}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'r', labelEn: 'Read (r = 4)', labelAr: 'قراءة (r = 4)' },
              { id: 'w', labelEn: 'Write (w = 2)', labelAr: 'كتابة (w = 2)' },
              { id: 'x', labelEn: 'Execute (x = 1)', labelAr: 'تشغيل (x = 1)' },
            ].map((bit) => (
              <label
                key={bit.id}
                className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <span>{isAr ? bit.labelAr : bit.labelEn}</span>
                <input
                  type="checkbox"
                  checked={selectedFile.permissions.owner[bit.id as 'r' | 'w' | 'x']}
                  onChange={() => handleToggleBit('owner', bit.id as any)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
              </label>
            ))}
          </div>

          {/* Chown Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
              {isAr ? 'تغيير المالك (chown):' : 'Change Owner (chown):'}
            </span>
            <select
              value={selectedFile.owner}
              onChange={(e) => handleChown(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="root">root</option>
              <option value="alice">alice</option>
              <option value="bob">bob</option>
              <option value="www-data">www-data</option>
            </select>
          </div>
        </div>

        {/* Group Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase font-mono">
              2. {isAr ? 'المجموعة' : 'Group'} ({selectedFile.group})
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {calcOctalDigit(selectedFile.permissions.group)}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'r', labelEn: 'Read (r = 4)', labelAr: 'قراءة (r = 4)' },
              { id: 'w', labelEn: 'Write (w = 2)', labelAr: 'كتابة (w = 2)' },
              { id: 'x', labelEn: 'Execute (x = 1)', labelAr: 'تشغيل (x = 1)' },
            ].map((bit) => (
              <label
                key={bit.id}
                className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <span>{isAr ? bit.labelAr : bit.labelEn}</span>
                <input
                  type="checkbox"
                  checked={selectedFile.permissions.group[bit.id as 'r' | 'w' | 'x']}
                  onChange={() => handleToggleBit('group', bit.id as any)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 w-4 h-4"
                />
              </label>
            ))}
          </div>

          {/* Chgrp Selector */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
              {isAr ? 'تغيير المجموعة (chgrp):' : 'Change Group (chgrp):'}
            </span>
            <select
              value={selectedFile.group}
              onChange={(e) => handleChgrp(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="root">root</option>
              <option value="developers">developers</option>
              <option value="devops">devops</option>
              <option value="shadow">shadow</option>
              <option value="www-data">www-data</option>
            </select>
          </div>
        </div>

        {/* Other Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase font-mono">
              3. {isAr ? 'الآخرون' : 'Others'} (World)
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {calcOctalDigit(selectedFile.permissions.other)}
            </span>
          </div>

          <div className="space-y-2">
            {[
              { id: 'r', labelEn: 'Read (r = 4)', labelAr: 'قراءة (r = 4)' },
              { id: 'w', labelEn: 'Write (w = 2)', labelAr: 'كتابة (w = 2)' },
              { id: 'x', labelEn: 'Execute (x = 1)', labelAr: 'تشغيل (x = 1)' },
            ].map((bit) => (
              <label
                key={bit.id}
                className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <span>{isAr ? bit.labelAr : bit.labelEn}</span>
                <input
                  type="checkbox"
                  checked={selectedFile.permissions.other[bit.id as 'r' | 'w' | 'x']}
                  onChange={() => handleToggleBit('other', bit.id as any)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                />
              </label>
            ))}
          </div>

          {/* Quick Chmod Form */}
          <form onSubmit={handleOctalSubmit} className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">
              {isAr ? 'تطبيق chmod مباشر:' : 'Apply chmod directly:'}
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={3}
                value={octalInput}
                onChange={(e) => setOctalInput(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-center font-mono font-bold text-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {isAr ? 'تطبيق' : 'Apply'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Immediate Effective Access Live Deck */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isAr ? 'فحص الصلاحية الفعلية الفوري للنواة' : 'Immediate Kernel POSIX Permission Evaluator'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{isAr ? 'اختبار كـ:' : 'Test as:'}</span>
            <select
              value={selectedUser.username}
              onChange={(e) => {
                const u = testUsers.find((x) => x.username === e.target.value);
                if (u) setSelectedUser(u);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none"
            >
              {testUsers.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username} ({u.primaryGroup})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Action Badges Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              readAllowed
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <div>
              <span className="font-bold block">{isAr ? 'محاولة القراءة (cat)' : 'Attempt Read (cat)'}</span>
              <span className="text-[10px] opacity-75">{readAllowed ? 'ALLOW' : 'DENIED (EACCES)'}</span>
            </div>
            {readAllowed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              writeAllowed
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <div>
              <span className="font-bold block">{isAr ? 'محاولة التعديل (nano)' : 'Attempt Write (nano)'}</span>
              <span className="text-[10px] opacity-75">{writeAllowed ? 'ALLOW' : 'DENIED (EACCES)'}</span>
            </div>
            {writeAllowed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
          </div>

          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              execAllowed
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <div>
              <span className="font-bold block">{isAr ? 'محاولة التشغيل (./)' : 'Attempt Execute (./)'}</span>
              <span className="text-[10px] opacity-75">{execAllowed ? 'ALLOW' : 'DENIED (EACCES)'}</span>
            </div>
            {execAllowed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-rose-400" />}
          </div>
        </div>
      </div>
    </div>
  );
};
