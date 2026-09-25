import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import {
  loadHttpRequestScenario,
  deriveHttpRequestStateFromEvents,
  DerivedHttpPipelineState,
  HttpPipelineFailure,
} from './runtime/HttpRequestScenario';
import {
  Globe,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Server,
  Database,
  Lock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sliders,
  CheckCircle2,
  XCircle,
  FileCode,
  Sparkles,
  Info,
  Terminal,
} from 'lucide-react';

interface HttpLifecycleLabProps {
  onBackToMap?: () => void;
  onNavigateToSessions?: () => void;
}

export const HttpLifecycleLab: React.FC<HttpLifecycleLabProps> = ({
  onBackToMap,
  onNavigateToSessions,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Runtime-backed state from simulationStore
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const runtimeEvents = useSimulationStore((s) => s.events);

  // Request Configuration (User Intent)
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [selectedPath, setSelectedPath] = useState<string>('/api/v1/orders/1001');
  const [selectedUser, setSelectedUser] = useState<string>('alice');
  const [failureScenario, setFailureScenario] = useState<HttpPipelineFailure>('NONE');

  // Interactive Replay / Time-travel state (null = live virtualTime)
  const [replayTime, setReplayTime] = useState<number | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'overview' | 'request' | 'response' | 'timeline' | 'crypto'>('overview');

  const effectiveTime = replayTime !== null ? replayTime : virtualTime;
  const derived: DerivedHttpPipelineState = deriveHttpRequestStateFromEvents(
    runtimeEvents,
    effectiveTime
  );

  const handleStart = () => {
    setReplayTime(null);
    globalSimulationRuntime.reset();

    loadHttpRequestScenario(globalSimulationRuntime, {
      method: selectedMethod,
      path: selectedPath,
      userId: selectedUser === 'alice' ? 'usr-alice' : selectedUser === 'bob' ? 'usr-bob' : 'usr-sara-fin',
      username: selectedUser,
      role: selectedUser === 'sara_finance' ? 'Finance' : 'Customer',
      failureScenario,
      startVirtualTime: 0,
      stepIntervalMs: 100,
    });

    globalSimulationRuntime.start();
  };

  const handleStep = () => {
    setReplayTime(null);
    const hasHttpEvents = runtimeEvents.some((e) => e.type.startsWith('HTTP_'));
    if (!hasHttpEvents) {
      loadHttpRequestScenario(globalSimulationRuntime, {
        method: selectedMethod,
        path: selectedPath,
        userId: selectedUser === 'alice' ? 'usr-alice' : selectedUser === 'bob' ? 'usr-bob' : 'usr-sara-fin',
        username: selectedUser,
        role: selectedUser === 'sara_finance' ? 'Finance' : 'Customer',
        failureScenario,
        startVirtualTime: virtualTime,
        stepIntervalMs: 100,
      });
    }
    globalSimulationRuntime.step(100);
  };

  const handlePauseResume = () => {
    if (clockStatus === 'running') {
      globalSimulationRuntime.pause();
    } else {
      globalSimulationRuntime.resume();
    }
  };

  const handleReset = () => {
    setReplayTime(null);
    globalSimulationRuntime.reset();
  };

  const stagesList = [
    { id: 'BROWSER_INIT', name: 'Browser Client', icon: Globe },
    { id: 'DNS_RESOLVED', name: 'DNS Resolver', icon: Server },
    { id: 'TCP_ESTABLISHED', name: 'TCP 3-Way', icon: Terminal },
    { id: 'TLS_ESTABLISHED', name: 'TLS 1.3 Tunnel', icon: Lock },
    { id: 'REVERSE_PROXY', name: 'Reverse Proxy (Nginx)', icon: Shield },
    { id: 'ROUTE_MATCHED', name: 'Express Router', icon: FileCode },
    { id: 'SESSION_RESOLVED', name: 'Session Guard', icon: Key },
    { id: 'AUTH_EVALUATED', name: 'AuthZ (RBAC/IDOR)', icon: ShieldCheck },
    { id: 'INPUT_VALIDATED', name: 'Input Validator', icon: Sliders },
    { id: 'DB_QUERIED', name: 'PostgreSQL Database', icon: Database },
    { id: 'RESPONSE_SENT', name: 'HTTP 200 Delivered', icon: CheckCircle2 },
  ];

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
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'مختبر دورة حياة طلب HTTP متعدد الطبقات' : 'Full HTTP Request Lifecycle Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تتبع المسار الفيزيائي والمنطقي الكامل للطلب: من متصفح العميل عبر DNS و TCP و TLS و Nginx والتطبيق حتى قاعدة البيانات'
                : 'Interactive multi-tier request pipeline: Browser -> DNS -> TCP -> TLS -> Proxy -> App -> AuthZ -> DB -> Response'}
            </p>
          </div>
        </div>

        {onNavigateToSessions && (
          <button
            onClick={onNavigateToSessions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{isAr ? 'أمن الجلسات والكوكيز' : 'Session Security Lab'}</span>
          </button>
        )}
      </div>

      {/* Control & Configuration Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
        {/* Left: Request Parameters */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-slate-400 font-bold block mb-1">HTTP Method:</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Target Path:</label>
            <select
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value="/api/v1/orders/1001">/api/v1/orders/1001 (Alice Order)</option>
              <option value="/api/v1/orders/1002">/api/v1/orders/1002 (Bob Order)</option>
              <option value="/api/v1/finance/reports">/api/v1/finance/reports</option>
              <option value="/api/v1/profile">/api/v1/profile</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Client User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
            >
              <option value="alice">Alice (Customer, Owner of #1001)</option>
              <option value="bob">Bob (Customer, Owner of #1002)</option>
              <option value="sara_finance">Sara (Finance Role)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Failure Simulation:</label>
            <select
              value={failureScenario}
              onChange={(e) => setFailureScenario(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-yellow-300 font-bold"
            >
              <option value="NONE">None (200 OK)</option>
              <option value="AUTH_REQUIRED_401">401 No Active Session</option>
              <option value="BOLA_IDOR_403">403 BOLA / IDOR (Bob reads #1001)</option>
              <option value="ROLE_FORBIDDEN_403">403 Role Forbidden (Finance)</option>
              <option value="VALIDATION_FAILED_422">422 Schema Validation Error</option>
              <option value="RATE_LIMIT_429">429 Rate Limit Exceeded</option>
              <option value="CSRF_INVALID_403">403 Missing CSRF Token</option>
            </select>
          </div>
        </div>

        {/* Right: Runtime Controls */}
        <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
          <button
            onClick={handleStart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isAr ? 'إرسال الطلب' : 'Dispatch'}</span>
          </button>

          <button
            onClick={handleStep}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطوة' : 'Step'}</span>
          </button>

          <button
            onClick={handlePauseResume}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            {clockStatus === 'running' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-[11px] text-slate-400 flex items-center gap-1 w-full justify-end pt-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>T+{effectiveTime}ms ({clockStatus})</span>
          </div>
        </div>
      </div>

      {/* Multi-Tier Pipeline Stage Nodes Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider">
            {isAr ? 'مراحل خط أنابيب معالجة الطلب (Request Pipeline)' : 'Request Processing Pipeline Stages'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            derived.currentStage === 'RESPONSE_SENT'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : derived.currentStage === 'FAILED'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            Current State: {derived.currentStage}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {stagesList.map((st, i) => {
            const Icon = st.icon;
            const isCompleted = derived.pipelineLogs.some((l) => l.stage.toLowerCase().includes(st.name.toLowerCase().slice(0, 5)));
            const isFailed = derived.currentStage === 'FAILED' && i === derived.pipelineLogs.length - 1;

            return (
              <div
                key={st.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  isFailed
                    ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-950/30'
                    : isCompleted
                    ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">0{i + 1}</span>
                  <Icon className={`w-4 h-4 ${isFailed ? 'text-red-400' : isCompleted ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
                <div className="font-mono text-xs font-bold text-slate-200 truncate">
                  {st.name}
                </div>
                <div className="text-[10px] font-mono">
                  {isFailed ? (
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>
                  ) : isCompleted ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Executed</span>
                  ) : (
                    <span className="text-slate-600">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspector Deck */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {(['overview', 'request', 'response', 'timeline', 'crypto'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveInspectorTab(tab)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all ${
                activeInspectorTab === tab
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeInspectorTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold block">Decision Verdict:</span>
              <div className={`p-3 rounded-lg border text-xs font-bold ${
                derived.currentStage === 'RESPONSE_SENT'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : derived.currentStage === 'FAILED'
                  ? 'bg-red-950/40 border-red-500/40 text-red-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}>
                {derived.errorMessageEn || `HTTP ${derived.response?.statusCode || 200} OK Delivered`}
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-bold block">Security Context:</span>
              <ul className="space-y-1 text-slate-300">
                <li>• Client User: <span className="text-cyan-400">{selectedUser}</span></li>
                <li>• Authenticated ID: <span className="text-cyan-400">{derived.request.authenticatedUserId || 'None (Unauthenticated)'}</span></li>
                <li>• Target Resource: <span className="text-cyan-400">{selectedPath}</span></li>
                <li>• Database Query: <span className="text-amber-400">{derived.databaseQuery || 'SELECT * FROM orders WHERE ...'}</span></li>
              </ul>
            </div>
          </div>
        )}

        {activeInspectorTab === 'timeline' && (
          <div className="space-y-2">
            {derived.pipelineLogs.map((log) => (
              <div
                key={log.eventId}
                className={`p-3 rounded-xl border flex items-center justify-between gap-4 ${
                  log.failure ? 'bg-red-950/30 border-red-500/40 text-red-200' : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-[10px]">
                    T+{log.time}ms
                  </span>
                  <span className="font-bold text-slate-200">{log.stage}:</span>
                  <span>{isAr ? log.messageAr : log.messageEn}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeInspectorTab === 'request' && (
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto">
            {JSON.stringify(derived.request, null, 2)}
          </pre>
        )}

        {activeInspectorTab === 'response' && (
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto">
            {JSON.stringify(derived.response || { status: 'Pending or in-flight' }, null, 2)}
          </pre>
        )}

        {activeInspectorTab === 'crypto' && (
          <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-300 font-bold block">TLS 1.3 Cryptographic Session Parameters:</span>
            <div className="grid grid-cols-2 gap-3 text-slate-400">
              <div>Cipher Suite: <span className="text-purple-400">{derived.tlsCipherSuite || 'TLS_AES_256_GCM_SHA384'}</span></div>
              <div>Key Exchange: <span className="text-purple-400">ECDHE (X25519)</span></div>
              <div>Server Certificate: <span className="text-purple-400">CN=portal.corp.nexora.local (RSA 4096)</span></div>
              <div>Transport Security: <span className="text-purple-400">HSTS Preloaded (max-age=31536000)</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
