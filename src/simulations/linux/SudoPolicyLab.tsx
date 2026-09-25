import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Lock,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { evaluateSudoPolicy, SudoPolicyRule } from './logic/sudo';

interface SudoPolicyLabProps {
  onBackToMap?: () => void;
}

export const SudoPolicyLab: React.FC<SudoPolicyLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [policies, setPolicies] = useState<SudoPolicyRule[]>([
    {
      userPattern: '%wheel',
      hostPattern: 'ALL',
      runAsUser: 'ALL',
      commands: ['ALL'],
      nopasswd: false,
    },
    {
      userPattern: 'alice',
      hostPattern: 'ALL',
      runAsUser: 'root',
      commands: ['/bin/systemctl restart nginx'],
      nopasswd: true,
    },
    {
      userPattern: 'bob',
      hostPattern: 'ALL',
      runAsUser: 'root',
      commands: ['/bin/cat /var/log/nginx/access.log'],
      nopasswd: false,
    },
  ]);

  const testUsers = [
    { username: 'alice', groups: ['developers'] },
    { username: 'bob', groups: ['developers'] },
    { username: 'admin', groups: ['wheel', 'developers'] },
  ];

  const testCommands = [
    { cmd: '/bin/systemctl restart nginx', descEn: 'Restart web daemon', descAr: 'إعادة تشغيل خدمة الويب' },
    { cmd: '/bin/cat /var/log/nginx/access.log', descEn: 'Read web access log', descAr: 'قراءة سجل زوار خادم الويب' },
    { cmd: '/sbin/ip link set eth0 down', descEn: 'Edit network config', descAr: 'تعديل إعدادات واجهة الشبكة' },
    { cmd: '/usr/sbin/useradd helper', descEn: 'Manage user accounts', descAr: 'إدارة وإنشاء حسابات المستخدمين' },
  ];

  const [selectedUser, setSelectedUser] = useState(testUsers[0]);
  const [selectedCommand, setSelectedCommand] = useState(testCommands[0].cmd);

  // New rule inputs
  const [newPattern, setNewPattern] = useState('alice');
  const [newCommand, setNewCommand] = useState('/bin/systemctl restart nginx');
  const [newNoPasswd, setNewNoPasswd] = useState(false);

  // Evaluate policy immediately
  const evaluation = evaluateSudoPolicy(selectedUser, selectedCommand, policies);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim() || !newCommand.trim()) return;

    const rule: SudoPolicyRule = {
      userPattern: newPattern.trim(),
      hostPattern: 'ALL',
      runAsUser: 'root',
      commands: [newCommand.trim()],
      nopasswd: newNoPasswd,
    };

    setPolicies((prev) => [...prev, rule]);
    addLog({
      level: 'WARN',
      source: 'VISUDO',
      message: `Updated /etc/sudoers with new rule for '${rule.userPattern}' at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'SECURITY_LOG_CREATED',
      description: `Rule added to /etc/sudoers for '${rule.userPattern}'`,
    });
  };

  const handleRemoveRule = (index: number) => {
    setPolicies((prev) => prev.filter((_, i) => i !== index));
    addLog({
      level: 'INFO',
      source: 'VISUDO',
      message: `Deleted rule #${index + 1} from /etc/sudoers at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
  };

  const handleSimulateExecution = () => {
    addLog({
      level: evaluation.allowed ? 'INFO' : 'ERROR',
      source: 'SUDO',
      message: `${selectedUser.username} : TTY=pts/0 ; COMMAND=${selectedCommand} ; RESULT=${evaluation.allowed ? 'OK' : 'DENIED'} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: evaluation.allowed ? 'SUDO_ALLOWED' : 'SUDO_DENIED',
      description: `${selectedUser.username} sudo '${selectedCommand}'`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-mono uppercase">
            <Lock className="w-4 h-4" />
            <span>{isAr ? 'مختبر سياسات تصعيد الامتيازات (Sudo Policy Lab)' : 'Sudoers Administrative Privilege Escalation Lab'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تدقيق ملف /etc/sudoers وإنفاذ مبدأ الحد الأدنى من الصلاحيات' : 'Sudo Policy Configuration & Defensive Privilege Hardening'}
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
        {/* Left Column: /etc/sudoers Editor */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white font-mono uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>/etc/sudoers {isAr ? '(جدول القواعد النشطة)' : '(Active Policy Table)'}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">{policies.length} Rules</span>
          </div>

          <div className="space-y-2">
            {policies.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 truncate pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{rule.userPattern}</span>
                    <span className="text-slate-500">{rule.hostPattern}=(ALL)</span>
                    {rule.nopasswd && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300 font-bold">
                        NOPASSWD
                      </span>
                    )}
                  </div>
                  <div className="text-slate-300 text-[11px] truncate">
                    {rule.commands.join(', ')}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors shrink-0"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Sudo Rule */}
          <form onSubmit={handleAddRule} className="border-t border-slate-800 pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'إضافة قاعدة تدقيق جديدة إلى sudoers' : 'Append Sudoers Rule'}</span>
            </span>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder={isAr ? 'مستخدم أو %مجموعة...' : 'user or %group...'}
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
              />
              <select
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
              >
                {testCommands.map((c) => (
                  <option key={c.cmd} value={c.cmd}>
                    {c.cmd}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNoPasswd}
                  onChange={(e) => setNewNoPasswd(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
                />
                <span>{isAr ? 'تفعيل NOPASSWD (دون طلب كلمة مرور)' : 'Enable NOPASSWD (Bypass password)'}</span>
              </label>

              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                {isAr ? 'حفظ القاعدة' : 'Add Rule'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Execution Tester & Explanation */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'مُختبر فحص طلبات Sudo المباشر' : 'Live Privilege Escalation Tester'}</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                {isAr ? 'المستخدم المنفذ:' : 'EXECUTING USER:'}
              </label>
              <select
                value={selectedUser.username}
                onChange={(e) => {
                  const u = testUsers.find((x) => x.username === e.target.value);
                  if (u) setSelectedUser(u);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                {testUsers.map((u) => (
                  <option key={u.username} value={u.username}>
                    {u.username} (groups: {u.groups.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-1">
                {isAr ? 'الأمر المراد تنفيذه كـ root:' : 'COMMAND TO RUN WITH SUDO:'}
              </label>
              <select
                value={selectedCommand}
                onChange={(e) => setSelectedCommand(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
              >
                {testCommands.map((c) => (
                  <option key={c.cmd} value={c.cmd}>
                    {c.cmd}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSimulateExecution}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors font-mono"
            >
              $ sudo {selectedCommand.split(' ')[0]}
            </button>
          </div>

          {/* Decision Outcome Card */}
          <div
            className={`p-4 rounded-xl border text-xs font-mono space-y-2 mt-4 transition-all ${
              evaluation.allowed
                ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {evaluation.allowed ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="font-bold uppercase tracking-wider">
                {evaluation.allowed
                  ? (isAr ? 'مسموح بتصعيد الامتيازات' : 'SUDO ELEVATION ALLOWED')
                  : (isAr ? 'تم رفض التنفيذ (غير مصرح)' : 'SUDO ELEVATION DENIED')}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed">
              {isAr ? evaluation.reasonAr : evaluation.reasonEn}
            </p>

            {evaluation.allowed && (
              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                {evaluation.passwordRequired
                  ? (isAr ? '🔐 يتطلب إدخال كلمة مرور المستخدم' : '🔐 Requires user password prompt')
                  : (isAr ? '⚡ NOPASSWD: يتم التنفيذ الفوري دون طلب كلمة مرور' : '⚡ NOPASSWD: Instant execution without prompt')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
