import React, { useState, useEffect } from 'react';
import {
  useSimulationStore,
  registerChallengeValidator,
  unregisterChallengeValidator,
} from '../../stores/simulationStore';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Server,
  FileCode,
  Lock,
  Cpu,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';
import {
  validateLinuxHardeningState,
  LinuxHardeningState,
  LinuxHardeningValidationResult,
  HardeningFileNode,
} from './logic/hardening';
import { LinuxProcess, initProcessTree, killProcess } from './logic/processes';
import { LinuxService, initLinuxServices, stopService, toggleServiceEnabled } from './logic/services';
import { SudoPolicyRule } from './logic/sudo';

interface LinuxHardeningChallengeProps {
  onBackToMap?: () => void;
  onNavigateToLab?: (labId: string) => void;
}

export const LinuxHardeningChallenge: React.FC<LinuxHardeningChallengeProps> = ({
  onBackToMap,
  onNavigateToLab,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const completeChallenge = useSimulationStore((s) => s.completeChallenge);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // Initial vulnerable state
  const initialFiles: HardeningFileNode[] = [
    { path: '/etc/shadow', owner: 'root', group: 'shadow', permissions: '644' }, // VULNERABLE: world readable!
    { path: '/etc/sudoers', owner: 'root', group: 'root', permissions: '440' },
    { path: '/home/alice', owner: 'alice', group: 'developers', permissions: '755' }, // VULNERABLE: world readable!
    { path: '/var/www/html/index.html', owner: 'alice', group: 'developers', permissions: '644' },
  ];

  const initialSudo: SudoPolicyRule[] = [
    { userPattern: '%wheel', hostPattern: 'ALL', runAsUser: 'ALL', commands: ['ALL'], nopasswd: false },
    { userPattern: 'alice', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/systemctl restart nginx'], nopasswd: true },
    { userPattern: 'bob', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/cat /var/log/nginx/access.log'], nopasswd: false }, // VULNERABLE: Bob has root log access
  ];

  const [files, setFiles] = useState<HardeningFileNode[]>(initialFiles);
  const [processes, setProcesses] = useState<LinuxProcess[]>(initProcessTree()); // includes postgres (PID 200)
  const [services, setServices] = useState<LinuxService[]>([
    ...initLinuxServices(),
    {
      id: 'telnet',
      name: 'Legacy Telnet Daemon',
      descriptionEn: 'Cleartext remote terminal',
      descriptionAr: 'طرفية غير مشفرة',
      processName: 'in.telnetd',
      user: 'root',
      port: 23,
      protocol: 'TCP',
      enabled: true, // VULNERABLE: enabled!
      running: true, // VULNERABLE: running!
      securityCritical: false,
    },
  ]);
  const [sudoPolicies, setSudoPolicies] = useState<SudoPolicyRule[]>(initialSudo);

  const [auditResult, setAuditResult] = useState<LinuxHardeningValidationResult | null>(null);

  useEffect(() => {
    registerChallengeValidator('linux-hardening', () => {
      const currentState: LinuxHardeningState = {
        files,
        processes,
        services,
        sudoPolicies,
      };
      const res = validateLinuxHardeningState(currentState);
      return { success: res.success, score: res.score, details: res };
    });
    return () => {
      unregisterChallengeValidator('linux-hardening');
    };
  }, [files, processes, services, sudoPolicies]);

  const handleRunAudit = () => {
    const currentState: LinuxHardeningState = {
      files,
      processes,
      services,
      sudoPolicies,
    };

    const res = validateLinuxHardeningState(currentState);
    setAuditResult(res);

    addLog({
      level: res.success ? 'INFO' : 'WARN',
      source: 'AUDITOR',
      message: `Audit completed: Score ${res.score}% (${res.passedChecks.length} passed, ${res.failedChecks.length} failed) at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });

    if (res.success) {
      completeChallenge('linux-hardening', {
        success: true,
        score: res.score,
        details: res,
      });
      addEvent({
        type: 'SECURITY_LOG_CREATED',
        description: 'Server WEB-SRV-01 successfully passed 100% Linux Security Hardening Audit!',
      });
    }
  };

  const handleResetChallenge = () => {
    setFiles(initialFiles);
    setProcesses(initProcessTree());
    setServices([
      ...initLinuxServices(),
      {
        id: 'telnet',
        name: 'Legacy Telnet Daemon',
        descriptionEn: 'Cleartext remote terminal',
        descriptionAr: 'طرفية غير مشفرة',
        processName: 'in.telnetd',
        user: 'root',
        port: 23,
        protocol: 'TCP',
        enabled: true,
        running: true,
        securityCritical: false,
      },
    ]);
    setSudoPolicies(initialSudo);
    setAuditResult(null);
  };

  // Quick Remediation Handlers
  const remediateShadowPerms = () => {
    setFiles((prev) =>
      prev.map((f) => (f.path === '/etc/shadow' ? { ...f, permissions: '600' } : f))
    );
  };

  const remediateAliceHome = () => {
    setFiles((prev) =>
      prev.map((f) => (f.path === '/home/alice' ? { ...f, permissions: '700' } : f))
    );
  };

  const remediateBobSudo = () => {
    setSudoPolicies((prev) => prev.filter((p) => p.userPattern !== 'bob'));
  };

  const remediateStopPostgres = () => {
    setProcesses((prev) => killProcess(prev, 200));
    setServices((prev) =>
      prev.map((s) => (s.id === 'postgresql' ? { ...s, running: false, enabled: false } : s))
    );
  };

  const remediateDisableTelnet = () => {
    setServices((prev) =>
      prev.map((s) => (s.id === 'telnet' ? { ...s, running: false, enabled: false } : s))
    );
  };

  const remediateEnsureLogging = () => {
    setServices((prev) =>
      prev.map((s) => (s.id === 'rsyslog' ? { ...s, running: true, enabled: true } : s))
    );
    if (!processes.some((p) => p.name === 'rsyslogd')) {
      setProcesses((prev) => [
        ...prev,
        { pid: 250, ppid: 1, user: 'root', name: 'rsyslogd', state: 'running', cpu: 0.1, executable: '/usr/sbin/rsyslogd' },
      ]);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 font-mono uppercase">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'التحدي الرئيسي الأول لأنظمة التشغيل (Linux Master Challenge)' : 'NEXORA Digital Enterprise Master Challenge'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'تحصين خادم الإنتاج السحابي WEB-SRV-01' : 'Harden Public Production Application Server (WEB-SRV-01)'}
          </h2>
          <p className="text-xs text-slate-400">
            {isAr
              ? 'الخادم يواجه الإنترنت العام ويحتوي على ثغرات في أذونات الملفات، سياسات Sudo، والخدمات النشطة. أصلح كافة الثغرات لتحقيق الامتثال الكامل بنسبة 100%.'
              : 'Audit real server state across DAC permissions, sudo policies, process tree attack surface, and service exposure.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset Server'}</span>
          </button>

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Remediation Controls Deck */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-white uppercase flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'عناصر الضبط والإصلاح الدفاعي' : 'Active Server Hardening Controls'}</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Remediation 1: /etc/shadow */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">/etc/shadow Permissions</span>
                <span className="text-[10px] text-slate-500">
                  Current Mode: <span className="text-amber-400 font-bold">{files.find((f) => f.path === '/etc/shadow')?.permissions}</span> (Requires 600)
                </span>
              </div>
              <button
                onClick={remediateShadowPerms}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                chmod 600
              </button>
            </div>

            {/* Remediation 2: Sudo Bob */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">Sudoers /etc/sudoers (Bob)</span>
                <span className="text-[10px] text-slate-500">
                  {sudoPolicies.some((p) => p.userPattern === 'bob')
                    ? (isAr ? 'Bob يملك صلاحية cat root مفرطة' : 'Bob has root log read privileges')
                    : (isAr ? 'تم تقييد صلاحيات Bob بنجاح' : 'Bob rights restricted to least privilege')}
                </span>
              </div>
              <button
                onClick={remediateBobSudo}
                disabled={!sudoPolicies.some((p) => p.userPattern === 'bob')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                {isAr ? 'حذف امتياز Bob' : 'Revoke Sudo'}
              </button>
            </div>

            {/* Remediation 3: Stop Postgres */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">PostgreSQL (Port 5432)</span>
                <span className="text-[10px] text-slate-500">
                  {processes.some((p) => p.name === 'postgres')
                    ? (isAr ? 'الخدمة قيد التشغيل على منفذ 5432' : 'Process running, port 5432 active')
                    : (isAr ? 'تم إيقاف قاعدة البيانات وتقليص السطح' : 'Process stopped, surface minimized')}
                </span>
              </div>
              <button
                onClick={remediateStopPostgres}
                disabled={!processes.some((p) => p.name === 'postgres')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                {isAr ? 'إيقاف الخدمة' : 'Stop Daemon'}
              </button>
            </div>

            {/* Remediation 4: Alice Home */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">/home/alice Directory</span>
                <span className="text-[10px] text-slate-500">
                  Current Mode: <span className="text-amber-400 font-bold">{files.find((f) => f.path === '/home/alice')?.permissions}</span> (Requires 700)
                </span>
              </div>
              <button
                onClick={remediateAliceHome}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                chmod 700
              </button>
            </div>

            {/* Remediation 5: Telnet */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">Insecure Telnet (Port 23)</span>
                <span className="text-[10px] text-slate-500">
                  {services.find((s) => s.id === 'telnet')?.running
                    ? (isAr ? 'الخدمة غير المشفرة تعمل وتستمع على 23' : 'Cleartext daemon listening on port 23')
                    : (isAr ? 'تم تعطيل الخدمة وحظر المنفذ' : 'Service disabled, port 23 closed')}
                </span>
              </div>
              <button
                onClick={remediateDisableTelnet}
                disabled={!services.find((s) => s.id === 'telnet')?.running}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                {isAr ? 'تعطيل Telnet' : 'Disable Telnet'}
              </button>
            </div>

            {/* Remediation 6: Ensure Logging */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-200 block">rsyslogd Audit Daemon</span>
                <span className="text-[10px] text-slate-500">
                  {processes.some((p) => p.name === 'rsyslogd')
                    ? (isAr ? 'خدمة المراقبة تعمل وتلتقط السجلات' : 'Audit collector operational')
                    : (isAr ? 'المراقبة متوقفة' : 'Service stopped')}
                </span>
              </div>
              <button
                onClick={remediateEnsureLogging}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg transition-colors shrink-0"
              >
                {isAr ? 'تشغيل المراقبة' : 'Start rsyslog'}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunAudit}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition transform hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isAr ? 'تشغيل فحص الامتثال والتحصين المباشر' : 'Execute Real-State Security Audit'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Structured Audit Scorecard */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'تقرير الامتثال والتدقيق الأمني' : 'Automated Hardening Scorecard'}</span>
            </h3>

            {auditResult && (
              <span
                className={`text-base font-bold font-mono ${
                  auditResult.score === 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                Score: {auditResult.score}%
              </span>
            )}
          </div>

          {auditResult ? (
            <div className="space-y-3 font-mono text-xs">
              {auditResult.checkDetails.map((check) => (
                <div
                  key={check.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    check.passed
                      ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <span className="font-bold block text-[11px]">
                        {isAr ? check.nameAr : check.nameEn}
                      </span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {isAr ? check.detailsAr : check.detailsEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {auditResult.success ? (
                <div className="p-4 bg-emerald-950 border border-emerald-600 rounded-xl text-center space-y-1 mt-4">
                  <div className="text-emerald-300 font-bold text-sm">
                    🏆 {isAr ? 'تم اجتياز التحدي بنجاح!' : 'ALL SECURITY CHECKS PASSED!'}
                  </div>
                  <p className="text-[11px] text-emerald-400">
                    {isAr
                      ? 'تم تحصين خادم لينكس WEB-SRV-01 بنسبة 100% وحماية ملفات الاعتماد وحظر المنافذ غير الضرورية.'
                      : 'WEB-SRV-01 is hardened to standard: shadow protected, sudo constrained, unnecessary processes reaped.'}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-center text-amber-300 text-[11px]">
                  {isAr
                    ? 'يوجد بنود لم تجتز الفحص. استخدم أزرار المعالجة أو نفذ التعديل في المختبرات وأعد الفحص.'
                    : 'Remediation needed. Correct failed items above and re-run audit.'}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 text-slate-500 font-mono text-xs space-y-2">
              <ShieldAlert className="w-8 h-8 opacity-40 text-amber-400" />
              <span>{isAr ? 'اضغط "تشغيل فحص الامتثال" لبدء التدقيق المباشر' : 'Click "Execute Real-State Security Audit" to inspect server'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
