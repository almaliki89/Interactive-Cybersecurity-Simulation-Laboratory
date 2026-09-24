import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Terminal,
  FolderTree,
  User,
  Users,
  Cpu,
  Server,
  FileCode,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { getEffectiveGroups, canUserAccessResource, LinuxUser, LinuxResource } from './logic/identity';
import { parseOctalMode, formatSymbolicMode, calcOctalDigit, PosixPermissions } from './logic/permissions';
import { evaluateSudoPolicy, SudoPolicyRule } from './logic/sudo';
import { initProcessTree, killProcess, startProcess, LinuxProcess } from './logic/processes';

interface FSNode {
  path: string;
  owner: string;
  group: string;
  permissions: string; // octal
  type: 'file' | 'directory';
  size: string;
  securityRelevanceAr: string;
  securityRelevanceEn: string;
}

export const LinuxSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'hub' | 'fs' | 'sudo' | 'proc' | 'logs' | 'challenge'>('hub');

  // --- Users & Groups State ---
  const [users, setUsers] = useState<LinuxUser[]>([
    { username: 'root', primaryGroup: 'root', supplementaryGroups: ['wheel'] },
    { username: 'alice', primaryGroup: 'developers', supplementaryGroups: ['devops'] },
    { username: 'bob', primaryGroup: 'developers', supplementaryGroups: [] },
    { username: 'www-data', primaryGroup: 'www-data', supplementaryGroups: [] },
  ]);
  const [newUsername, setNewUsername] = useState('');
  const [newUserGroup, setNewUserGroup] = useState('developers');

  // --- Filesystem State ---
  const [fs, setFs] = useState<FSNode[]>([
    { path: '/etc/shadow', owner: 'root', group: 'shadow', permissions: '600', type: 'file', size: '1.2 KB', securityRelevanceEn: 'Contains encrypted user passwords. Must be restricted to root only.', securityRelevanceAr: 'يحتوي على كلمات المرور المشفرة للمستخدمين. يجب حصر الوصول للـ root فقط.' },
    { path: '/etc/sudoers', owner: 'root', group: 'root', permissions: '440', type: 'file', size: '820 B', securityRelevanceEn: 'Defines privileges for sudo command. Keep restricted to prevent local privilege escalation.', securityRelevanceAr: 'يحدد صلاحيات استخدام أمر sudo. يجب حمايته لمنع التصعيد المحلي للصلاحيات.' },
    { path: '/var/www/html/index.html', owner: 'alice', group: 'developers', permissions: '644', type: 'file', size: '2.4 KB', securityRelevanceEn: 'Public web file. Needs web-daemon read permission.', securityRelevanceAr: 'ملف الويب العام. يتطلب صلاحية قراءة لخادم الويب (www-data).' },
    { path: '/usr/local/bin/deploy.sh', owner: 'alice', group: 'devops', permissions: '750', type: 'file', size: '1.1 KB', securityRelevanceEn: 'Deployment script. Only developers and devops can execute it.', securityRelevanceAr: 'برنامج نصي للنشر. فقط المطورون ومسؤولو DevOps يملكون صلاحية تشغيله.' },
    { path: '/home/alice', owner: 'alice', group: 'developers', permissions: '700', type: 'directory', size: '4.0 KB', securityRelevanceEn: 'Alices home folder. Should not be visible or readable by other users.', securityRelevanceAr: 'المجلد الشخصي لأليس. لا ينبغي للآخرين الاطلاع على محتوياته أو قراءته.' },
  ]);
  const [selectedFilePath, setSelectedFilePath] = useState('/etc/shadow');
  const selectedFile = fs.find((f) => f.path === selectedFilePath) || fs[0];

  // Manual permissions for editing
  const [editingPerms, setEditingPerms] = useState<PosixPermissions>(parseOctalMode(selectedFile.permissions));
  useEffect(() => {
    setEditingPerms(parseOctalMode(selectedFile.permissions));
  }, [selectedFilePath, selectedFile.permissions]);

  // Access check tester state
  const [testerUsername, setTesterUsername] = useState('alice');
  const [testerAction, setTesterAction] = useState<'r' | 'w' | 'x'>('r');
  const [testResult, setTestResult] = useState<{ allowed: boolean; reasonEn: string; reasonAr: string } | null>(null);

  // --- Sudo State ---
  const [sudoPolicies, setSudoPolicies] = useState<SudoPolicyRule[]>([
    { userPattern: '%wheel', hostPattern: 'ALL', runAsUser: 'ALL', commands: ['ALL'], nopasswd: false },
    { userPattern: 'alice', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/systemctl restart nginx'], nopasswd: true },
    { userPattern: 'bob', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/cat /var/log/nginx/access.log'], nopasswd: false },
  ]);
  const [sudoUser, setSudoUser] = useState('alice');
  const [sudoCommand, setSudoCommand] = useState('/bin/systemctl restart nginx');
  const [sudoResult, setSudoResult] = useState<{ allowed: boolean; passwordRequired: boolean; reasonEn: string; reasonAr: string } | null>(null);

  // --- Process & Services State ---
  const [processes, setProcesses] = useState<LinuxProcess[]>(initProcessTree());

  // --- Logs state (local shadow sync) ---
  const [logs, setLogs] = useState<{ time: string; source: string; message: string; severity: 'INFO' | 'WARN' | 'ERROR' }[]>([
    { time: '14:30:10', source: 'KERNEL_VFS', message: 'rsyslogd started successfully', severity: 'INFO' },
    { time: '14:30:12', source: 'SYSTEMD', message: 'systemctl daemon-reload executed by root', severity: 'INFO' },
  ]);

  const addLocalLog = (source: string, message: string, severity: 'INFO' | 'WARN' | 'ERROR') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, source, message, severity }, ...prev].slice(0, 100));
    addLog({ level: severity, source, message, category: 'SYSTEM' });
  };

  // Run tester on select changes
  const runAccessTester = (user: string, action: 'r' | 'w' | 'x', fileNode: FSNode) => {
    const matchingUser = users.find((u) => u.username === user) || users[0];
    const resource: LinuxResource = {
      path: fileNode.path,
      owner: fileNode.owner,
      group: fileNode.group,
      permissions: parseOctalMode(fileNode.permissions),
    };
    const res = canUserAccessResource(matchingUser, resource, action);
    setTestResult({ allowed: res.allowed, reasonEn: res.reasonEn, reasonAr: res.reasonAr });
    addLocalLog('KERNEL_VFS', `Access check: ${user} attempt '${action}' on ${fileNode.path} -> ${res.allowed ? 'GRANTED' : 'DENIED'}`, res.allowed ? 'INFO' : 'WARN');
  };

  // --- Challenge Validation State ---
  const [validationScore, setValidationScore] = useState<number | null>(null);
  const [failedObjectives, setFailedObjectives] = useState<string[]>([]);
  const [passedObjectives, setPassedObjectives] = useState<string[]>([]);

  const handleApplyPermissions = () => {
    const newOctal = `${calcOctalDigit(editingPerms.owner)}${calcOctalDigit(editingPerms.group)}${calcOctalDigit(editingPerms.other)}`;
    setFs((prev) =>
      prev.map((f) => (f.path === selectedFilePath ? { ...f, permissions: newOctal } : f))
    );
    addLocalLog('CHMOD_DAEMON', `Permissions updated on ${selectedFilePath} to ${newOctal} (${formatSymbolicMode(editingPerms, selectedFile.type === 'directory')})`, 'INFO');
    addEvent({ type: 'FILE_PERMISSION_CHANGED', description: `Modified permissions on ${selectedFilePath} to ${newOctal}` });
    
    // Auto-update tester immediately
    setTimeout(() => {
      const updatedFile = { ...selectedFile, permissions: newOctal };
      runAccessTester(testerUsername, testerAction, updatedFile);
    }, 50);
  };

  const handleExecuteSudo = () => {
    const matchingUser = users.find((u) => u.username === sudoUser) || users[0];
    const res = evaluateSudoPolicy(
      { username: matchingUser.username, groups: getEffectiveGroups(matchingUser) },
      sudoCommand,
      sudoPolicies
    );
    setSudoResult(res);
    addLocalLog('SUDO_ENGINE', `Sudo execution request: ${sudoUser} sudo ${sudoCommand} -> ${res.allowed ? 'ALLOWED' : 'DENIED'}`, res.allowed ? 'INFO' : 'ERROR');
    addEvent({ type: res.allowed ? 'SUDO_ALLOWED' : 'SUDO_DENIED', description: `${sudoUser} requested sudo execution of ${sudoCommand}` });
  };

  const handleKillProcess = (pid: number) => {
    const target = processes.find((p) => p.pid === pid);
    if (!target) return;
    setProcesses((prev) => killProcess(prev, pid));
    addLocalLog('KERNEL_PROCESS', `Terminated process PID ${pid} (${target.name})`, 'WARN');
    addEvent({ type: 'PROCESS_STOPPED', description: `Killed process ${target.name} (PID ${pid})` });
  };

  const handleStartProcess = (name: string, executable: string, user: string, port?: number) => {
    setProcesses((prev) => startProcess(prev, 1, user, name, executable, port));
    addLocalLog('KERNEL_PROCESS', `Started new process: ${name} (User: ${user}, Executable: ${executable})`, 'INFO');
    addEvent({ type: 'PROCESS_STARTED', description: `Launched process ${name} as ${user}` });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    if (users.find((u) => u.username === newUsername)) return;
    const newUser: LinuxUser = { username: newUsername, primaryGroup: newUserGroup, supplementaryGroups: [] };
    setUsers((prev) => [...prev, newUser]);
    addLocalLog('USERADD_DAEMON', `Created user account '${newUsername}' inside primary group '${newUserGroup}'`, 'INFO');
    addEvent({ type: 'USER_CREATED', description: `User account '${newUsername}' registered.` });
    setNewUsername('');
  };

  // --- Hardening Challenge Logic ---
  const runHardeningValidation = (): { success: boolean; message: string } => {
    const failed: string[] = [];
    const passed: string[] = [];

    // Objective 1: Restrict /etc/shadow to root only (600 or 400)
    const shadow = fs.find((f) => f.path === '/etc/shadow');
    if (shadow && (shadow.permissions === '600' || shadow.permissions === '400' || shadow.permissions === '000')) {
      passed.push(isAr ? 'حماية ملف /etc/shadow ضد الآخرين والمجموعات' : 'Hardened /etc/shadow permission matrix (root-only)');
    } else {
      failed.push(isAr ? 'تأمين ملف /etc/shadow: ما زال يملك صلاحيات وصول للمجموعات أو الآخرين' : 'Unsecured /etc/shadow: permission allows group or other reads.');
    }

    // Objective 2: Sudo access restricted to wheel group / prevent insecure bob commands
    const shadowPermittedForBob = evaluateSudoPolicy(
      { username: 'bob', groups: [] },
      '/bin/cat /var/log/nginx/access.log',
      sudoPolicies
    ).allowed;
    if (!shadowPermittedForBob) {
      passed.push(isAr ? 'تقييد صلاحيات Sudo للمستخدم Bob ومنع قراءة السجلات الحساسة' : 'Restricted Bobs sudo policy over secure system logs');
    } else {
      failed.push(isAr ? 'خطر أمني: ما زال بإمكان Bob قراءة سجلات خادم الويب كجذر root عبر Sudo' : 'Privilege risk: Bob still has unauthorized sudo privileges.');
    }

    // Objective 3: Unnecessary database process or worker service stopped (e.g. Postgres stopped)
    const postgresProc = processes.find((p) => p.name === 'postgres');
    if (!postgresProc) {
      passed.push(isAr ? 'إيقاف وتعطيل خدمات قاعدة البيانات الزائدة (postgres)' : 'Disabled unnecessary postgres database daemon');
    } else {
      failed.push(isAr ? 'خادم قاعدة البيانات postgres ما زال يعمل ويستهلك طاقة المنفذ 5432' : 'Unnecessary database service postgres is still listening on port 5432.');
    }

    // Objective 4: home/alice folder should be closed (e.g. 700)
    const aliceHome = fs.find((f) => f.path === '/home/alice');
    if (aliceHome && (aliceHome.permissions === '700' || aliceHome.permissions === '600')) {
      passed.push(isAr ? 'عزل مجلد البيت الشخصي لـ Alice عن بقية المستخدمين' : 'Secured home folder for alice against world access');
    } else {
      failed.push(isAr ? 'مجلد البيت لـ Alice غير محمي بالكامل ويسمح للآخرين بالوصول' : 'Alice home directory is world-readable.');
    }

    setFailedObjectives(failed);
    setPassedObjectives(passed);
    const total = passed.length + failed.length;
    const score = total > 0 ? Math.round((passed.length / total) * 100) : 0;
    setValidationScore(score);

    if (score === 100) {
      completeChallenge('linux-hardening');
      addLocalLog('SECURITY_AUDIT', 'PASSED HARDENING VERIFICATION: Linux server secured perfectly! 100% Policy Compliance.', 'INFO');
    } else {
      addLocalLog('SECURITY_AUDIT', `AUDIT FAILED: Score: ${score}%. Pending remediation objectives remaining.`, 'ERROR');
    }

    return {
      success: score === 100,
      message: score === 100
        ? (isAr ? 'تم تحصين خادم لينكس بنجاح وبنسبة امتثال 100%!' : 'Linux server hardened successfully with 100% compliance!')
        : (isAr ? 'فشل فحص التحصين: يرجى مراجعة وتعديل الثغرات الأمنية المتبقية.' : 'Hardening verification failed: please remediate remaining security flaws.'),
    };
  };

  const linuxChallenge: Challenge = {
    id: 'linux-hardening',
    simulationId: 'linux',
    title: isAr ? 'تحدي تحصين خادم لينكس WEB-SRV-01' : 'Linux WEB-SRV-01 Security Hardening',
    difficulty: 'Intermediate',
    category: isAr ? 'أمن أنظمة التشغيل' : 'Operating System Security',
    mission: isAr
      ? 'قم بتأمين الخادم ضد الثغرات: حماية ملفات الاعتماد، تقييد صلاحيات sudo للمطورين، إغلاق خدمات قاعدة البيانات postgres غير الضرورية، وتأمين المجلدات الشخصية للمستخدمين.'
      : 'Harden the Linux web server: restrict shadow credentials, restrict excessive sudo policies, terminate running database processes, and isolate home directories.',
    initialExplanation: isAr
      ? 'ستتعلم كيف يقوم نظام لينكس بالتحقق من الهوية والصلاحيات عبر POSIX DAC و Sudoers والعمليات الجارية في الوقت الفعلي.'
      : 'Configure and test Unix Access Control, audit active processes, and secure sudo commands to enforce compliance.',
    objectives: [
      { id: 'shadow', title: isAr ? 'تأمين /etc/shadow' : 'Secure /etc/shadow to 600', description: '', isCompleted: passedObjectives.length > 0 && !failedObjectives.some((o) => o.includes('shadow')), validationKey: 'shadow' },
      { id: 'sudo', title: isAr ? 'تقييد Sudo لـ Bob' : 'Restrict Sudo over Secure Logs', description: '', isCompleted: passedObjectives.length > 0 && !failedObjectives.some((o) => o.includes('Bob')), validationKey: 'sudo' },
      { id: 'proc', title: isAr ? 'إغلاق Postgres' : 'Disable postgres Process', description: '', isCompleted: passedObjectives.length > 0 && !failedObjectives.some((o) => o.includes('postgres')), validationKey: 'proc' },
    ],
    hints: [
      isAr ? 'اضبط ملف /etc/shadow على الصلاحية 600.' : 'Set /etc/shadow file to 600 octal mode.',
      isAr ? 'اذهب لعلامة تبويب العمليات واقتل عملية postgres.' : 'Kill the postgres server process from the Process Tree tab.',
    ],
  };

  return (
    <Workspace
      title={isAr ? 'عالم أمن أنظمة تشغيل لينكس' : 'Linux Operating System Security World'}
      subtitle={isAr ? 'التحكم بالوصول، صلاحيات الملفات، سياسات Sudo، والعمليات الحية' : 'Access Control, POSIX Perms, Sudoers Policies, and Active Processes'}
      challenge={linuxChallenge}
      onValidateChallenge={runHardeningValidation}
      onRestart={() => {
        setFs([
          { path: '/etc/shadow', owner: 'root', group: 'shadow', permissions: '644', type: 'file', size: '1.2 KB', securityRelevanceEn: 'Contains encrypted user passwords. Must be restricted to root only.', securityRelevanceAr: 'يحتوي على كلمات المرور المشفرة للمستخدمين. يجب حصر الوصول للـ root فقط.' },
          { path: '/etc/sudoers', owner: 'root', group: 'root', permissions: '440', type: 'file', size: '820 B', securityRelevanceEn: 'Defines privileges for sudo command. Keep restricted to prevent local privilege escalation.', securityRelevanceAr: 'يحدد صلاحيات استخدام أمر sudo. يجب حمايته لمنع التصعيد المحلي للصلاحيات.' },
          { path: '/var/www/html/index.html', owner: 'alice', group: 'developers', permissions: '644', type: 'file', size: '2.4 KB', securityRelevanceEn: 'Public web file. Needs web-daemon read permission.', securityRelevanceAr: 'ملف الويب العام. يتطلب صلاحية قراءة لخادم الويب (www-data).' },
          { path: '/usr/local/bin/deploy.sh', owner: 'alice', group: 'devops', permissions: '750', type: 'file', size: '1.1 KB', securityRelevanceEn: 'Deployment script. Only developers and devops can execute it.', securityRelevanceAr: 'برنامج نصي للنشر. فقط المطورون ومسؤولو DevOps يملكون صلاحية تشغيله.' },
          { path: '/home/alice', owner: 'alice', group: 'developers', permissions: '755', type: 'directory', size: '4.0 KB', securityRelevanceEn: 'Alices home folder. Should not be visible or readable by other users.', securityRelevanceAr: 'المجلد الشخصي لأليس. لا ينبغي للآخرين الاطلاع على محتوياته أو قراءته.' },
        ]);
        setProcesses(initProcessTree());
        setSudoPolicies([
          { userPattern: '%wheel', hostPattern: 'ALL', runAsUser: 'ALL', commands: ['ALL'], nopasswd: false },
          { userPattern: 'alice', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/systemctl restart nginx'], nopasswd: true },
          { userPattern: 'bob', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/cat /var/log/nginx/access.log'], nopasswd: false },
        ]);
        setValidationScore(null);
        setFailedObjectives([]);
        setPassedObjectives([]);
        setTestResult(null);
        setSudoResult(null);
        addLocalLog('SYSTEM_RECOVERY', 'Environment configuration reset to defaults', 'INFO');
      }}
    >
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 overflow-x-auto gap-2">
          {[
            { id: 'hub', labelEn: 'World Hub Map', labelAr: 'مستكشف النظام الهيكلي' },
            { id: 'fs', labelEn: 'Filesystem & Perms', labelAr: 'الملفات والصلاحيات' },
            { id: 'sudo', labelEn: 'Sudo Policy Lab', labelAr: 'سياسات Sudo' },
            { id: 'proc', labelEn: 'Process & Services', labelAr: 'العمليات والخدمات' },
            { id: 'logs', labelEn: 'Log Investigator', labelAr: 'سجل الأحداث' },
            { id: 'challenge', labelEn: 'Hardening Audit', labelAr: 'تحصين النظام' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Workspace Display Area */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: WORLD HUB MAP */}
          {activeTab === 'hub' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'علاقات الهوية والوصول في نظام التشغيل' : 'Identity & Protection Relationships'}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {isAr
                    ? 'يعتمد أمان نظام لينكس على ترابط وثيق بين أربعة عناصر أساسية: الهوية (المستخدمين والمجموعات)، العمليات الجارية، صلاحيات الملفات POSIX، وسجلات المراقبة.'
                    : 'Understand how OS access security maps together: Identity maps to Processes, which spawn Services, access Files via POSIX perms, and emit Security Event Logs.'}
                </p>
              </div>

              {/* Graphical Network Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { titleEn: 'Identity & Groups', titleAr: 'الهوية والمجموعات', items: ['root (UID 0)', 'alice (developers)', 'www-data (web-daemon)', 'bob (developer)'] },
                  { titleEn: 'Running Processes', titleAr: 'العمليات الفعالة', items: ['systemd (PID 1)', 'sshd (Port 22)', 'nginx (Port 80)', 'postgres (Port 5432)'] },
                  { titleEn: 'Access Security', titleAr: 'أمان الملفات', items: ['/etc/shadow (root-only)', '/etc/sudoers (privileges)', 'index.html (web-read)', 'deploy.sh (executable)'] },
                  { titleEn: 'Event Telemetry', titleAr: 'سجل المراقبة', items: ['sudo execution logs', 'kernel permissions audit', 'process start/stop logs', 'auth success/failures'] }
                ].map((col, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 relative hover:border-slate-700 transition-all">
                    <h4 className="text-xs font-bold text-cyan-400 mb-3 border-b border-slate-800 pb-2">{isAr ? col.titleAr : col.titleEn}</h4>
                    <ul className="space-y-2">
                      {col.items.map((it, i) => (
                        <li key={i} className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-300">
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Live Status Summary Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{isAr ? 'عدد المستخدمين النشطين' : 'Active System Users'}</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{users.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{isAr ? 'العمليات النشطة بالنظام' : 'Active System Processes'}</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{processes.length}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{isAr ? 'إجراءات الأمان المحددة' : 'Protected File Handles'}</span>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{fs.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILESYSTEM & POSIX PERMISSIONS */}
          {activeTab === 'fs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Directory Explorer (Left Column) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <FolderTree className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'شجرة النظام الهيكلية' : 'Interactive Directory Tree'}</span>
                </h3>

                <div className="space-y-2">
                  {fs.map((node) => (
                    <button
                      key={node.path}
                      onClick={() => setSelectedFilePath(node.path)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                        selectedFilePath === node.path
                          ? 'bg-cyan-950/60 border border-cyan-800 text-cyan-200'
                          : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate">{node.path}</span>
                      <span className="text-[10px] opacity-70 font-bold tracking-wider uppercase ml-2">
                        {node.permissions}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Account Creator Sub-Deck */}
                <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">{isAr ? 'إنشاء حساب مستخدم جديد' : 'Provision Linux User Account'}</h4>
                  <form onSubmit={handleCreateUser} className="space-y-2">
                    <input
                      type="text"
                      placeholder={isAr ? 'اسم المستخدم...' : 'Enter username...'}
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
                    />
                    <select
                      value={newUserGroup}
                      onChange={(e) => setNewUserGroup(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="developers">developers</option>
                      <option value="devops">devops</option>
                      <option value="shadow">shadow</option>
                      <option value="www-data">www-data</option>
                    </select>
                    <button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors"
                    >
                      {isAr ? 'إضافة مستخدم' : 'Create User Account'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Selected File Details & Permission Calculator (Middle Column) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'فحص وتعديل أذونات الملف' : 'POSIX DAC File Inspector'}</span>
                </h3>

                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">{isAr ? 'المسار الفعلي:' : 'TARGET PATH:'}</span>
                  <span className="text-sm font-mono text-cyan-300 font-bold">{selectedFile.path}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'المالك الحالي:' : 'OWNER:'}</span>
                    <span className="text-slate-200">{selectedFile.owner}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{isAr ? 'المجموعة:' : 'GROUP:'}</span>
                    <span className="text-slate-200">{selectedFile.group}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">{isAr ? 'الأهمية الأمنية للملف:' : 'SECURITY RELEVANCE:'}</span>
                  <p className="text-xs text-slate-400 leading-relaxed">{isAr ? selectedFile.securityRelevanceAr : selectedFile.securityRelevanceEn}</p>
                </div>

                {/* DAC Owner/Group/Other Grid editing */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>{isAr ? 'المالك' : 'Owner'}</span>
                    <span>{isAr ? 'المجموعة' : 'Group'}</span>
                    <span>{isAr ? 'الآخرون' : 'Others'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Owner bits */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                      {['r', 'w', 'x'].map((bit) => (
                        <label key={bit} className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                          <span className="font-mono uppercase">{bit}</span>
                          <input
                            type="checkbox"
                            checked={(editingPerms.owner as any)[bit]}
                            onChange={(e) => setEditingPerms((prev) => ({
                              ...prev,
                              owner: { ...prev.owner, [bit]: e.target.checked }
                            }))}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                          />
                        </label>
                      ))}
                    </div>
                    {/* Group bits */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                      {['r', 'w', 'x'].map((bit) => (
                        <label key={bit} className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                          <span className="font-mono uppercase">{bit}</span>
                          <input
                            type="checkbox"
                            checked={(editingPerms.group as any)[bit]}
                            onChange={(e) => setEditingPerms((prev) => ({
                              ...prev,
                              group: { ...prev.group, [bit]: e.target.checked }
                            }))}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                          />
                        </label>
                      ))}
                    </div>
                    {/* Other bits */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2">
                      {['r', 'w', 'x'].map((bit) => (
                        <label key={bit} className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                          <span className="font-mono uppercase">{bit}</span>
                          <input
                            type="checkbox"
                            checked={(editingPerms.other as any)[bit]}
                            onChange={(e) => setEditingPerms((prev) => ({
                              ...prev,
                              other: { ...prev.other, [bit]: e.target.checked }
                            }))}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleApplyPermissions}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                >
                  {isAr ? 'تطبيق الصلاحيات (Apply chmod)' : 'Apply POSIX Permissions (chmod)'}
                </button>
              </div>

              {/* Access Tester Side Panel (Right Column) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'مُختبر الفحص وصلاحية الوصول' : 'OS Kernel Access Evaluator'}</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isAr ? 'فحص كالمستخدم:' : 'EVALUATE AS USER:'}</label>
                    <select
                      value={testerUsername}
                      onChange={(e) => {
                        setTesterUsername(e.target.value);
                        runAccessTester(e.target.value, testerAction, selectedFile);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    >
                      {users.map((u) => (
                        <option key={u.username} value={u.username}>
                          {u.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isAr ? 'الإجراء المراد اختباره:' : 'ATTEMPTED POSIX ACTION:'}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'r', labelEn: 'Read (cat)', labelAr: 'قراءة' },
                        { id: 'w', labelEn: 'Write (nano)', labelAr: 'كتابة' },
                        { id: 'x', labelEn: 'Exec (./)', labelAr: 'تشغيل' },
                      ].map((act) => (
                        <button
                          key={act.id}
                          onClick={() => {
                            setTesterAction(act.id as any);
                            runAccessTester(testerUsername, act.id as any, selectedFile);
                          }}
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            testerAction === act.id
                              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isAr ? act.labelAr : act.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Display evaluation outcome immediately */}
                {testResult ? (
                  <div
                    className={`p-4 rounded-xl border text-xs font-mono space-y-2 mt-4 ${
                      testResult.allowed
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {testResult.allowed ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                      )}
                      <span className="font-bold uppercase tracking-wider">
                        {testResult.allowed ? (isAr ? 'مسموح بالوصول' : 'ACCESS GRANTED') : (isAr ? 'تم رفض الوصول' : 'ACCESS DENIED')}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">{isAr ? testResult.reasonAr : testResult.reasonEn}</p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    {isAr ? 'حدد مستخدماً أو فعلاً لبدء فحص الوصول' : 'Select user or trigger action to see evaluation'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SUDO POLICY LAB */}
          {activeTab === 'sudo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sudo Rules Definition Desk */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>{isAr ? 'ملف سياسات المسؤول والمجموعات (/etc/sudoers)' : 'Sudoers System Policy Desk'}</span>
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr
                    ? 'يتحكم ملف /etc/sudoers بتصعيد الصلاحيات التقديري للمستخدمين العاديين من خلال السماح لهم بتشغيل أوامر النظام كمسؤول جذر (root).'
                    : 'The /etc/sudoers configuration controls how regular accounts execute terminal instructions with root administrative privileges.'}
                </p>

                <div className="space-y-3">
                  <div className="text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-cyan-400 space-y-1">
                    <span className="text-[10px] text-slate-500 block mb-1">ACTIVE POLICY RULES:</span>
                    <div>%wheel ALL=(ALL) ALL</div>
                    <div>alice ALL=(root) NOPASSWD: /bin/systemctl restart nginx</div>
                    <div>bob ALL=(root) /bin/cat /var/log/nginx/access.log</div>
                  </div>

                  {/* Privilege escalation audit controls */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300">{isAr ? 'إجراء فحص Sudo' : 'Trigger Sudo Access Audit'}</h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold block">{isAr ? 'المستخدم الطالب للصلاحية:' : 'REQUESTING USER:'}</label>
                      <select
                        value={sudoUser}
                        onChange={(e) => setSudoUser(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                      >
                        {users.map((u) => (
                          <option key={u.username} value={u.username}>
                            {u.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold block">{isAr ? 'الأمر المطلوب تشغيله:' : 'COMMAND TO EXECUTE:'}</label>
                      <select
                        value={sudoCommand}
                        onChange={(e) => setSudoCommand(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                      >
                        <option value="/bin/systemctl restart nginx">/bin/systemctl restart nginx</option>
                        <option value="/bin/cat /var/log/nginx/access.log">/bin/cat /var/log/nginx/access.log</option>
                        <option value="/usr/sbin/useradd helper">/usr/sbin/useradd helper</option>
                      </select>
                    </div>

                    <button
                      onClick={handleExecuteSudo}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                    >
                      {isAr ? 'تشغيل أمر sudo' : 'Execute sudo Command'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sudo Execution Outcome View */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'محاكي مخرجات الطرفية والتحقق' : 'Sudo Terminal Console'}</span>
                </h3>

                {sudoResult ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border font-mono text-xs ${
                      sudoResult.allowed
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {sudoResult.allowed ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-rose-400" />
                        )}
                        <span className="font-bold">
                          {sudoResult.allowed ? (isAr ? 'تمت المصادقة والموافقة' : 'SUDO APPROVAL SUCCESS') : (isAr ? 'تم رفض الطلب' : 'SUDO POLICY DENIED')}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{isAr ? sudoResult.reasonAr : sudoResult.reasonEn}</p>
                    </div>

                    {sudoResult.allowed && (
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                        <div className="text-slate-500">[$] sudo {sudoCommand}</div>
                        {sudoResult.passwordRequired ? (
                          <div className="text-yellow-400">[sudo] password for {sudoUser}: ********</div>
                        ) : (
                          <div className="text-slate-500">[sudo] NOPASSWD rule triggered. No authentication requested.</div>
                        )}
                        <div className="text-emerald-400 mt-2 font-bold">[Success] Operation executed on system successfully.</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-xs text-slate-500 font-mono">
                    {isAr ? 'اضغط على زر "تشغيل أمر sudo" لمشاهدة المخرجات هنا' : 'Click execute sudo to see kernel privilege result'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROCESS & SERVICES TREE */}
          {activeTab === 'proc' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Process Tree List (Left Column) */}
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? 'مستعرض العمليات الفعالة وسلسلة الآباء' : 'Active Operating System Processes'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{processes.length} Processes</span>
                </h3>

                <div className="space-y-2">
                  {processes.map((proc) => (
                    <div
                      key={proc.pid}
                      className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-4 font-mono text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[10px] font-bold w-12">PID {proc.pid}</span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-200">{proc.name}</span>
                          <span className="text-[10px] text-slate-500 block">
                            User: <span className="text-cyan-400">{proc.user}</span> | PPID: {proc.ppid} | Executable: {proc.executable}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {proc.port && (
                          <span className="bg-amber-950/40 border border-amber-800/60 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                            PORT {proc.port}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                          proc.state === 'running'
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}>
                          {proc.state}
                        </span>
                        
                        {proc.pid !== 1 && (
                          <button
                            onClick={() => handleKillProcess(proc.pid)}
                            className="p-1.5 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-800 rounded-lg hover:border-rose-800 transition-all"
                            title="Kill Process"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Control panel (Right Column) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إدارة خدمات الخادم وتفعيل المنافذ' : 'Service Exposure & Ports Control'}</span>
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {isAr
                    ? 'يرتبط تشغيل أي خدمة شبكية بفتح منفذ (Listening Port). يمكنك إطلاق أو قتل الخدمات وملاحظة أثر فتح المنافذ بالشبكة.'
                    : 'A network service binds to an explicit port to accept connections. Launching or stopping processes immediately triggers port exposure.'}
                </p>

                <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300">{isAr ? 'تشغيل خدمة إضافية:' : 'Launch System Service'}</h4>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleStartProcess('postgres', '/usr/lib/postgresql/bin/postgres', 'postgres', 5432)}
                      disabled={processes.some((p) => p.name === 'postgres')}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 text-xs py-2 rounded-lg border border-slate-800 font-semibold transition-colors"
                    >
                      + Start postgres (Port 5432)
                    </button>
                    <button
                      onClick={() => handleStartProcess('nginx-master', '/usr/sbin/nginx', 'root', 80)}
                      disabled={processes.some((p) => p.name === 'nginx-master')}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 text-xs py-2 rounded-lg border border-slate-800 font-semibold transition-colors"
                    >
                      + Start nginx (Port 80)
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">{isAr ? 'قائمة المنافذ المفتوحة الحالية:' : 'Active Port Listeners'}</h4>
                  <div className="space-y-1 font-mono text-xs">
                    {processes.filter((p) => p.port).map((p) => (
                      <div key={p.pid} className="flex justify-between items-center text-amber-400 text-[11px]">
                        <span>0.0.0.0:{p.port}</span>
                        <span className="text-slate-500">({p.name})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOG INVESTIGATOR */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{isAr ? 'مستعرض سجلات الأحداث والمراقبة (auditd)' : 'System Audit Log investigator'}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'يتم تسجيل كافة إجراءات POSIX و Sudo وتغيير العمليات هنا فوراً' : 'Toggles, processes, and kernel privilege requests record entries dynamically'}</p>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs px-3 py-1.5 rounded-lg font-bold"
                >
                  {isAr ? 'تفريغ السجل' : 'Clear System Logs'}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-x-auto h-96 space-y-2">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-slate-900 pb-2 text-[11px]">
                      <span className="text-slate-500 text-[10px] shrink-0">{log.time}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                        log.severity === 'ERROR'
                          ? 'bg-rose-950 text-rose-400'
                          : log.severity === 'WARN'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-cyan-950 text-cyan-400'
                      }`}>
                        {log.severity}
                      </span>
                      <span className="text-slate-400 font-bold shrink-0">[{log.source}]</span>
                      <span className="text-slate-300 leading-relaxed">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-600 py-24 font-mono text-xs">
                    {isAr ? 'سجل المراقبة فارغ حالياً. قم بإجراء تغييرات في النظام لتوليد السجلات.' : 'No audit entries logged yet. Initiate POSIX actions or state updates.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: HARDENING MASTER CHALLENGE */}
          {activeTab === 'challenge' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-950/60 border border-amber-800 flex items-center justify-center text-amber-400 rounded-xl">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200">{isAr ? 'مُدقق السياسات الأمنية والتحصين' : 'Automated Linux Hardening Auditor'}</h3>
                    <p className="text-xs text-slate-400">{isAr ? 'سيقوم هذا المدقق بفحص ملفات النظام والعمليات وسياسات Sudo للتحقق من خلو الخادم من الثغرات.' : 'Run compliance checks over POSIX tables, running daemons, and privileges.'}</p>
                  </div>
                </div>

                <div className="flex justify-center py-4">
                  <button
                    onClick={runHardeningValidation}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition transform hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isAr ? 'بدء فحص الامتثال والتحصين' : 'Execute Policy Verification Audit'}</span>
                  </button>
                </div>
              </div>

              {/* Scorecard rendering */}
              {validationScore !== null && (
                <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{isAr ? 'تقرير تقييم خادم لينكس' : 'System Compliance Audit Report'}</h4>
                    <span className={`text-xl font-bold font-mono ${validationScore === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Score: {validationScore}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {passedObjectives.map((obj, i) => (
                      <div key={i} className="bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl flex items-start gap-3 text-xs text-emerald-200 font-mono">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs uppercase block">{isAr ? 'عنصر آمن ومحصن' : 'Compliance Objective Secured'}</span>
                          <p className="text-[11px] text-slate-400 mt-1">{obj}</p>
                        </div>
                      </div>
                    ))}

                    {failedObjectives.map((obj, i) => (
                      <div key={i} className="bg-rose-950/40 border border-rose-800/80 p-3 rounded-xl flex items-start gap-3 text-xs text-rose-300 font-mono">
                        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs uppercase block">{isAr ? 'ثغرة بحاجة للمعالجة' : 'Audit Objective Remediation Required'}</span>
                          <p className="text-[11px] text-slate-400 mt-1">{obj}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {validationScore === 100 ? (
                    <div className="bg-emerald-950 border border-emerald-700 p-4 rounded-xl text-center font-bold text-xs text-emerald-200">
                      🏆 {isAr ? 'تهانينا! خادم لينكس محصن بنسبة 100% ومتوافق مع المعايير الأمنية لشركة NEXORA.' : 'Congratulations! Linux server is fully secured with 100% compliance!'}
                    </div>
                  ) : (
                    <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-center font-semibold text-xs text-amber-300 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{isAr ? 'يرجى مراجعة الثغرات ومعالجتها ثم إعادة تشغيل الفحص.' : 'Review remediation items above to reach full compliance.'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Workspace>
  );
};
