import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Zap,
  Terminal,
  Server,
  Lock,
  Mail,
  Workflow,
  Plus,
  Trash2,
  ChevronRight,
  Code2,
  Activity,
  Cpu,
} from 'lucide-react';

export interface PlaybookStep {
  id: string;
  name: string;
  nameAr: string;
  category: 'trigger' | 'enrichment' | 'containment' | 'communication' | 'condition';
  action: string;
  target: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'skipped';
  log?: string;
  logAr?: string;
  payload?: Record<string, unknown>;
}

export interface PlaybookTemplate {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  triggerEvent: string;
  estimatedMttrSec: number;
  steps: PlaybookStep[];
}

const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  {
    id: 'ransomware_auto_contain',
    title: 'Ransomware Zero-Touch Host Containment',
    titleAr: 'عزل المضيف الفوري التلقائي لهجمات الفدية',
    description: 'Automatically isolate infected endpoints, terminate crypto processes, and revoke domain tickets when ransomware indicators occur.',
    descriptionAr: 'عزل فوري لنقطة النهاية المصابة وإنهاء العمليات المشبوهة وإلغاء تذاكر الدومين عند رصد مؤشرات الفدية.',
    triggerEvent: 'T1486: Mass Encryption & Shadow Copy Deletion',
    estimatedMttrSec: 3.2,
    steps: [
      {
        id: 'step_1',
        name: 'Detect Shadow Copy Deletion (T1490)',
        nameAr: 'رصد محاولة حذف النسخ الاحتياطية',
        category: 'trigger',
        action: 'SIEM_CORRELATE_ALERT',
        target: 'vssadmin.exe delete shadows /all',
        status: 'idle',
        payload: { ruleId: 'RUL-EDR-902', host: 'FIN-WKS-042', user: 'corp\\finance_usr' },
      },
      {
        id: 'step_2',
        name: 'VirusTotal & EDR Process Hash Reputation',
        nameAr: 'فحص تجزئة العملية عبر EDR واستخبارات التهديدات',
        category: 'enrichment',
        action: 'QUERY_THREAT_INTEL',
        target: 'SHA256: d5a7b8c... (LockBit 3.0 Variant)',
        status: 'idle',
        payload: { maliciousScore: '68/72 engines', family: 'Ransomware.Win32.LockBit' },
      },
      {
        id: 'step_3',
        name: 'Instant EDR Network Host Isolation',
        nameAr: 'عزل نقطة النهاية شبكياً عبر وكيل EDR',
        category: 'containment',
        action: 'EDR_ISOLATE_HOST',
        target: 'FIN-WKS-042 (10.0.12.85)',
        status: 'idle',
        payload: { isolated: true, allowableTraffic: 'EDR-Agent-Only' },
      },
      {
        id: 'step_4',
        name: 'Terminate Malicious Process Tree',
        nameAr: 'إنهاء شجرة العمليات الخبيثة قسرياً',
        category: 'containment',
        action: 'KILL_PROCESS_TREE',
        target: 'PID 4892 (malware_stub.exe)',
        status: 'idle',
        payload: { killedProcesses: ['malware_stub.exe', 'powershell.exe', 'cmd.exe'] },
      },
      {
        id: 'step_5',
        name: 'Revoke AD Kerberos TGT & Lock Identity',
        nameAr: 'إلغاء تذاكر Kerberos وإغلاق حساب المستخدم مؤقتاً',
        category: 'containment',
        action: 'ACTIVE_DIRECTORY_LOCKOUT',
        target: 'corp\\finance_usr',
        status: 'idle',
        payload: { adAction: 'Revoke-KerberosTicket & Disable-ADAccount' },
      },
      {
        id: 'step_6',
        name: 'Dispatch P1 Notification & Slack Incident Channel',
        nameAr: 'إرسال إشعار طارئ P1 وإنشاء قناة الحادث',
        category: 'communication',
        action: 'DISPATCH_SOC_PAGER',
        target: '#incident-p1-ransomware',
        status: 'idle',
        payload: { channel: '#incident-4912', priority: 'CRITICAL_P1' },
      },
    ],
  },
  {
    id: 'phishing_auto_remediate',
    title: 'Phishing Credential Harvester Auto-Purge',
    titleAr: 'التطهير التلقائي لرسائل التصيد وحجب روابط الاحتيال',
    description: 'Inspect malicious URL, block at NGFW, hard-delete weaponized email from all mailboxes, and force credential rotation.',
    descriptionAr: 'فحص الرابط المشبوه، حجبه على الجدار الناري، حذف الرسالة من كافة صناديق البريد وإجبار تدوير كلمة المرور.',
    triggerEvent: 'T1566: Spearphishing Link Clicked by User',
    estimatedMttrSec: 2.1,
    steps: [
      {
        id: 'step_1',
        name: 'Phishing Link Detection via Mail Gateway',
        nameAr: 'رصد رابط تصيد عبر بوابة البريد الإلكتروني',
        category: 'trigger',
        action: 'GATEWAY_EVENT_PARSE',
        target: 'https://login-microsoft-secure.attacker.cc/auth',
        status: 'idle',
        payload: { sender: 'spoofed-admin@payroll-update.com', recipients: 14 },
      },
      {
        id: 'step_2',
        name: 'URL Reputation & Sandbox Detonation',
        nameAr: 'تحليل الرابط وتفجيره في بيئة الاختبار (Sandbox)',
        category: 'enrichment',
        action: 'SANDBOX_DETONATE_URL',
        target: 'Verdict: Malicious Credential Phish',
        status: 'idle',
        payload: { category: 'Phishing', riskScore: 98 },
      },
      {
        id: 'step_3',
        name: 'Push Firewall & Web Gateway Block Rule',
        nameAr: 'دفع قاعدة حجب على الجدار الناري وبوابة الويب',
        category: 'containment',
        action: 'NGFW_BLOCK_DOMAIN',
        target: 'attacker.cc & 185.220.101.5',
        status: 'idle',
        payload: { policy: 'DROP_AND_RESET', syncStatus: 'Global Sync' },
      },
      {
        id: 'step_4',
        name: 'Exchange Online Global Mailbox Purge',
        nameAr: 'حذف الرسالة الملغومة من كافة صناديق البريد عبر API',
        category: 'containment',
        action: 'O365_GRAPH_HARD_DELETE',
        target: 'Message-ID: <20261027@payroll-update.com>',
        status: 'idle',
        payload: { purgedCount: 14, unreadRemoved: 11, readRemoved: 3 },
      },
      {
        id: 'step_5',
        name: 'Force Password Reset for Exposed Users',
        nameAr: 'إجبار إعادة تعيين كلمة المرور للمستخدمين المتأثرين',
        category: 'containment',
        action: 'RESET_CREDENTIALS',
        target: '3 users who clicked link',
        status: 'idle',
        payload: { sessionsRevoked: 3, mfaEnforced: true },
      },
    ],
  },
  {
    id: 'impossible_travel_lockout',
    title: 'Impossible Travel & Anomalous Session Revocation',
    titleAr: 'إلغاء الجلسات المشبوهة وحظر الانتقال الجغرافي المستحيل',
    description: 'Detect geographically impossible concurrent logins and instantly invalidate cloud tokens.',
    descriptionAr: 'رصد تسجيل دخول متزامن من دولتين متباعدتين وإلغاء توكنات السحابة فوراً.',
    triggerEvent: 'T1078: Valid Accounts Concurrent Auth (NY + Tokyo in 8 mins)',
    estimatedMttrSec: 1.5,
    steps: [
      {
        id: 'step_1',
        name: 'GeoIP Velocity Risk Calculation',
        nameAr: 'حساب سرعة الانتقال الجغرافي للمصادقة',
        category: 'trigger',
        action: 'GEO_VELOCITY_CHECK',
        target: 'NYC (IP: 72.229.x.x) -> Tokyo (IP: 133.242.x.x) in 8m',
        status: 'idle',
        payload: { calculatedSpeed: '5,800 mph', probability: 'Impossible' },
      },
      {
        id: 'step_2',
        name: 'Invalidate All Active OAuth Tokens & Cookies',
        nameAr: 'إلغاء كافة رموز OAuth وملفات الجلسة النشطة',
        category: 'containment',
        action: 'REVOKE_OAUTH_REFRESH_TOKENS',
        target: 'Identity: alex.chen@corp.io',
        status: 'idle',
        payload: { tokensRevoked: 4, appsDisconnected: ['Teams', 'Outlook', 'AWS'] },
      },
      {
        id: 'step_3',
        name: 'Enforce Step-Up FIDO2 Hardware Key Verification',
        nameAr: 'فرض مصادقة معززة بمفتاح أمان FIDO2',
        category: 'containment',
        action: 'REQUIRE_STEPUP_AUTH',
        target: 'FIDO2 / WebAuthn Biometric Required',
        status: 'idle',
        payload: { bypassAllowed: false },
      },
    ],
  },
];

export const SoarPlaybookStudio: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('ransomware_auto_contain');
  const [playbooks, setPlaybooks] = useState<PlaybookTemplate[]>(PLAYBOOK_TEMPLATES);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  const activePlaybook = playbooks.find((p) => p.id === selectedTemplateId) || playbooks[0];

  const handleRunPlaybook = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionLogs([
      `[${new Date().toLocaleTimeString()}] SOAR Engine initialized. Triggering playbook: "${activePlaybook.title}"...`,
    ]);

    // Reset steps
    const updatedSteps = activePlaybook.steps.map((s) => ({ ...s, status: 'idle' as const }));
    setPlaybooks((prev) =>
      prev.map((p) => (p.id === activePlaybook.id ? { ...p, steps: updatedSteps } : p))
    );

    for (let i = 0; i < activePlaybook.steps.length; i++) {
      setActiveStepIndex(i);

      // Set running
      setPlaybooks((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaybook.id) return p;
          const nextSteps = [...p.steps];
          nextSteps[i] = { ...nextSteps[i], status: 'running' };
          return { ...p, steps: nextSteps };
        })
      );

      // Simulated execution delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const step = activePlaybook.steps[i];
      const logEntry = `[${new Date().toLocaleTimeString()}] EXECUTE [${step.action}] on ${step.target} -> SUCCESS. Payload: ${JSON.stringify(step.payload || {})}`;

      setExecutionLogs((prev) => [logEntry, ...prev]);

      // Set completed
      setPlaybooks((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaybook.id) return p;
          const nextSteps = [...p.steps];
          nextSteps[i] = { ...nextSteps[i], status: 'success' };
          return { ...p, steps: nextSteps };
        })
      );
    }

    setActiveStepIndex(-1);
    setIsRunning(false);
    setExecutionLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] SOAR Playbook completed successfully. Target threat contained in ${activePlaybook.estimatedMttrSec}s!`,
      ...prev,
    ]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveStepIndex(-1);
    setExecutionLogs([]);
    setPlaybooks((prev) =>
      prev.map((p) => {
        if (p.id !== activePlaybook.id) return p;
        return {
          ...p,
          steps: p.steps.map((s) => ({ ...s, status: 'idle' })),
        };
      })
    );
  };

  const getCategoryColor = (category: PlaybookStep['category']) => {
    switch (category) {
      case 'trigger':
        return 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      case 'enrichment':
        return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300';
      case 'containment':
        return 'border-rose-500/40 bg-rose-500/10 text-rose-300';
      case 'communication':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
      default:
        return 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Studio Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                {isAr ? 'استوديو أتمتة الاستجابة الأمنية (SOAR)' : 'SOAR Automated Playbook Studio'}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {isAr ? 'أتمتة بدون تدخل بشري' : 'Zero-Touch SOAR'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAr
                  ? 'بناء واختبار مسارات الاستجابة التلقائية للحد من زمن الاحتواء (MTTR) من ساعات إلى ثوانٍ'
                  : 'Design, simulate, and execute automated orchestration workflows to shrink MTTR from hours to seconds'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunPlaybook}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-cyan-600/50 text-cyan-200 cursor-not-allowed'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning
              ? isAr
                ? 'جارٍ تشغيل المسار...'
                : 'Executing Workflow...'
              : isAr
              ? 'تشغيل المسار التلقائي'
              : 'Execute Playbook'}
          </button>

          <button
            onClick={handleReset}
            disabled={isRunning}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title={isAr ? 'إعادة ضبط' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Template Selector + Interactive Canvas + Live Terminal */}
      <div className="p-4 sm:p-6 space-y-6 flex-1 max-w-7xl w-full mx-auto">
        {/* Template Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {playbooks.map((pb) => {
            const isSelected = pb.id === selectedTemplateId;
            return (
              <button
                key={pb.id}
                onClick={() => {
                  if (!isRunning) setSelectedTemplateId(pb.id);
                }}
                className={`text-start p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-cyan-400 font-semibold">{isAr ? pb.titleAr : pb.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                    MTTR: ~{pb.estimatedMttrSec}s
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {isAr ? pb.descriptionAr : pb.description}
                </p>
                <div className="mt-3 text-[10px] font-mono text-amber-400/90 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">{pb.triggerEvent}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Workflow Diagram / Step Sequence */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-300">
                {isAr ? 'مخطط سير العمل الآلي (Workflow Nodes)' : 'Automated Playbook Nodes'}
              </h3>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {activePlaybook.steps.length} {isAr ? 'خطوات آلية' : 'Automated Steps'}
            </div>
          </div>

          {/* Sequential Step Nodes */}
          <div className="space-y-3">
            {activePlaybook.steps.map((step, idx) => {
              const isStepRunning = step.status === 'running';
              const isStepDone = step.status === 'success';

              return (
                <div key={step.id} className="relative">
                  {/* Connecting Line */}
                  {idx < activePlaybook.steps.length - 1 && (
                    <div className="absolute top-10 start-6 w-0.5 h-6 bg-slate-800 -z-0" />
                  )}

                  <div
                    className={`relative z-10 flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border transition-all ${
                      isStepRunning
                        ? 'border-cyan-400 bg-cyan-950/40 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/20 animate-pulse'
                        : isStepDone
                        ? 'border-emerald-500/40 bg-emerald-950/20'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Step Number / Status Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold border shrink-0 ${
                          isStepDone
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : isStepRunning
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-spin'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isStepDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isStepRunning ? (
                          <Cpu className="w-4 h-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {isAr ? step.nameAr : step.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase border ${getCategoryColor(
                              step.category
                            )}`}
                          >
                            {step.category}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <code className="text-cyan-400">{step.action}</code>
                          <span>→</span>
                          <span className="text-slate-300">{step.target}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step Payload / Status Pill */}
                    <div className="mt-2 sm:mt-0 flex items-center gap-2">
                      {step.payload && (
                        <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 max-w-xs truncate">
                          {Object.entries(step.payload)
                            .map(([k, v]) => `${k}:${v}`)
                            .join(' | ')}
                        </div>
                      )}
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          isStepDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isStepRunning
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {step.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Execution Console & Output */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAr ? 'سجل تشغيل أوركسترا الاستجابة (SOAR Execution Stream)' : 'SOAR Orchestration Audit Trail'}</span>
            </div>
            <span>{executionLogs.length} events logged</span>
          </div>

          <div className="h-44 overflow-y-auto space-y-1.5 font-mono text-[11px] p-2 bg-slate-900/40 rounded-lg border border-slate-900">
            {executionLogs.length === 0 ? (
              <div className="text-slate-600 italic p-2">
                {isAr
                  ? 'اضغط على "تشغيل المسار التلقائي" لمحاكاة تنفيذ الأتمتة المباشر وسجل استدعاءات الـ API.'
                  : 'Click "Execute Playbook" to simulate real-time API dispatch, containment actions, and ticket generation.'}
              </div>
            ) : (
              executionLogs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    log.includes('SUCCESS') || log.includes('successfully')
                      ? 'text-emerald-400'
                      : log.includes('Triggering')
                      ? 'text-cyan-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
