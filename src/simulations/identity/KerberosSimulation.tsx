import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import {
  INITIAL_USERS,
  AdUser,
} from './logic/directory';
import {
  KerberosState,
  KerberosTicket,
  KerberosFailureReason,
  EncryptionType,
} from './logic/kerberos';
import {
  loadKerberosScenario,
  deriveKerberosStateFromEvents,
  DerivedKerberosState,
} from './runtime/KerberosScenario';
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Laptop,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  FileCheck,
  History,
} from 'lucide-react';

interface KerberosSimulationProps {
  onBackToMap?: () => void;
  onNavigateToAuthz?: () => void;
}

export const KerberosSimulation: React.FC<KerberosSimulationProps> = ({
  onBackToMap,
  onNavigateToAuthz,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Runtime-backed state from simulationStore
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const runtimeEvents = useSimulationStore((s) => s.events);

  // Configuration options (User intent)
  const [selectedUser, setSelectedUser] = useState<string>('sara');
  const [targetSpn, setTargetSpn] = useState<string>('cifs/fin-srv01.corp.nexora.local');
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('AES-256');
  const [forcedFailure, setForcedFailure] = useState<KerberosFailureReason>('NONE');

  // Interactive Replay / Time-travel state (null = live virtualTime)
  const [replayVirtualTime, setReplayVirtualTime] = useState<number | null>(null);
  const [selectedTicketForInspect, setSelectedTicketForInspect] = useState<KerberosTicket | null>(null);

  // Authoritative Derived State from Global Runtime Events!
  const effectiveTime = replayVirtualTime !== null ? replayVirtualTime : virtualTime;
  const derivedState: DerivedKerberosState = deriveKerberosStateFromEvents(
    runtimeEvents,
    effectiveTime
  );

  const {
    protocolState,
    tgtTicket,
    serviceTicket,
    exchangeLogs,
    failureReason,
    errorMessageEn,
    errorMessageAr,
  } = derivedState;

  const currentUser = INITIAL_USERS.find((u) => u.samAccountName === selectedUser) || INITIAL_USERS[0];

  // Protocol Orchestration delegating to globalSimulationRuntime
  const handleStart = () => {
    setReplayVirtualTime(null);
    globalSimulationRuntime.reset();

    loadKerberosScenario(globalSimulationRuntime, {
      clientPrincipal: currentUser.userPrincipalName,
      targetSpn,
      encryptionType,
      failureScenario: forcedFailure,
      startVirtualTime: 0,
      stepIntervalMs: 500,
    });

    globalSimulationRuntime.start();
  };

  const handleStep = () => {
    setReplayVirtualTime(null);

    // If scenario hasn't been scheduled yet, schedule it
    const hasKerberosEvents = runtimeEvents.some((e) => e.type.startsWith('KERBEROS_'));
    if (!hasKerberosEvents) {
      loadKerberosScenario(globalSimulationRuntime, {
        clientPrincipal: currentUser.userPrincipalName,
        targetSpn,
        encryptionType,
        failureScenario: forcedFailure,
        startVirtualTime: virtualTime,
        stepIntervalMs: 500,
      });
    }

    // Step the simulation clock forward deterministically by 500 virtual ms
    globalSimulationRuntime.step(500);
  };

  const handlePauseResume = () => {
    if (clockStatus === 'running') {
      globalSimulationRuntime.pause();
    } else {
      globalSimulationRuntime.resume();
    }
  };

  const handleReset = () => {
    setReplayVirtualTime(null);
    setSelectedTicketForInspect(null);
    globalSimulationRuntime.reset();
  };

  const handleSpeedChange = (speed: number) => {
    globalSimulationRuntime.setSpeed(speed);
  };

  const handleReplaySeek = (time: number) => {
    setReplayVirtualTime(time);
  };

  // Find max event virtual time for replay slider
  const maxEventTime = Math.max(
    ...runtimeEvents.filter((e) => e.type.startsWith('KERBEROS_')).map((e) => e.virtualTime ?? 0),
    virtualTime,
    2500
  );

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
              <Key className="w-6 h-6 text-cyan-400" />
              <span>{isAr ? 'محاكي بروتوكول مصادقة Kerberos الثلاثي' : 'Kerberos 3-Tier Protocol Simulation'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تشغيل حتمي مربوط بمحرك SimulationRuntime العام: يتأثر بالإيقاف المؤقت، السرعة، والخطوة، ويدعم إعادة التشغيل الزمني'
                : 'Runtime-driven simulation obeying SimulationRuntime clock, speed, pause, step, and deterministic replay'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAuthz && (
            <button
              onClick={onNavigateToAuthz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? 'فحص تفويض الموارد' : 'Resource Authorization'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
        {/* User Principal */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold block">{isAr ? 'المستخدم:' : 'User Principal:'}</label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              handleReset();
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            {INITIAL_USERS.map((u) => (
              <option key={u.id} value={u.samAccountName}>
                {u.samAccountName} ({u.displayName})
              </option>
            ))}
          </select>
        </div>

        {/* Target SPN */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold block">{isAr ? 'اسم الخدمة (SPN):' : 'Target Service (SPN):'}</label>
          <select
            value={targetSpn}
            onChange={(e) => {
              setTargetSpn(e.target.value);
              handleReset();
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="cifs/fin-srv01.corp.nexora.local">cifs/fin-srv01 (Finance File Share)</option>
            <option value="mssql/srv-sql01.corp.nexora.local:1433">mssql/srv-sql01 (SQL Database)</option>
            <option value="http/intranet.corp.nexora.local">http/intranet (Internal Web Portal)</option>
          </select>
        </div>

        {/* Encryption Type */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold block">{isAr ? 'خوارزمية التشفير:' : 'Encryption Type:'}</label>
          <select
            value={encryptionType}
            onChange={(e) => {
              setEncryptionType(e.target.value as EncryptionType);
              handleReset();
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="AES-256">AES-256 (Modern & Secure)</option>
            <option value="RC4">RC4 (Legacy / Kerberoastable)</option>
          </select>
        </div>

        {/* Failure Scenario Injection */}
        <div className="space-y-1.5">
          <label className="text-slate-300 font-bold block">{isAr ? 'سيناريو الفحص الأمني:' : 'Security Failure Test:'}</label>
          <select
            value={forcedFailure}
            onChange={(e) => {
              setForcedFailure(e.target.value as KerberosFailureReason);
              handleReset();
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="NONE">Normal Authentication Flow</option>
            <option value="WRONG_PASSWORD">Bad Password (Error 0x18)</option>
            <option value="ACCOUNT_DISABLED">Disabled Account</option>
            <option value="CLOCK_SKEW">Clock Skew Exceeded (&gt; 300s)</option>
            <option value="TGT_EXPIRED">Expired TGT (TGS Denied)</option>
            <option value="SPN_UNKNOWN">Unknown SPN</option>
            <option value="KDC_UNAVAILABLE">KDC Unreachable</option>
          </select>
        </div>
      </div>

      {/* Runtime Simulation Controls (Play, Pause, Step, Speed, Clock, Replay) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Start / Run */}
          <button
            onClick={handleStart}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isAr ? 'بدء التبادل التلقائي' : 'Start Flow (Auto)'}</span>
          </button>

          {/* Pause / Resume */}
          <button
            onClick={handlePauseResume}
            disabled={clockStatus === 'idle'}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
          >
            {clockStatus === 'running' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{isAr ? 'إيقاف مؤقت' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isAr ? 'استئناف' : 'Resume'}</span>
              </>
            )}
          </button>

          {/* Step Control */}
          <button
            onClick={handleStep}
            disabled={protocolState === 'AUTHENTICATED' || protocolState === 'FAILED'}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1.5"
            title="Advance exactly 500 virtual milliseconds"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{isAr ? 'خطوة واحدة (+500ms)' : 'Step (+500ms)'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isAr ? 'إعادة ضبط المحاكاة' : 'Reset Exchange'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 ml-2 border-l border-slate-800 pl-3">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  clockSpeed === s
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Virtual Time & Status Badges */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Virtual Time: <strong className="text-white">T+{effectiveTime}ms</strong></span>
          </span>

          <span
            className={`px-3 py-1 rounded-xl font-bold border ${
              protocolState === 'AUTHENTICATED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : protocolState === 'FAILED'
                ? 'bg-red-950 text-red-300 border-red-700'
                : 'bg-slate-950 text-cyan-300 border-slate-800'
            }`}
          >
            {protocolState}
          </span>
        </div>
      </div>

      {/* Time-Travel Replay Slider */}
      {runtimeEvents.some((e) => e.type.startsWith('KERBEROS_')) && (
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'شريط إعادة التشغيل الزمني (Deterministic Time-Travel Replay):' : 'Replay Slider (Inspect ticket state at any virtual timestamp):'}</span>
            </span>
            <span className="text-cyan-400 font-bold">
              {replayVirtualTime !== null ? `Seeking: T+${replayVirtualTime}ms` : 'Live (Current State)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={maxEventTime}
              step="100"
              value={effectiveTime}
              onChange={(e) => handleReplaySeek(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            {replayVirtualTime !== null && (
              <button
                onClick={() => setReplayVirtualTime(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
              >
                Go Live
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3-Tier Visual Architecture & Ticket Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Client Node */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>1. Client Workstation</span>
            </span>
            <span className="text-[10px] text-slate-400">FIN-WS-01</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Identity:</span>
              <span className="text-cyan-300 font-bold">{currentUser.samAccountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Virtual Clock:</span>
              <span className="text-white">T+{effectiveTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cred Cache:</span>
              <span className="text-emerald-400">
                {tgtTicket ? 'TGT Present' : 'Empty'} • {serviceTicket ? 'TGS Present' : 'No TGS'}
              </span>
            </div>
          </div>

          {/* Ticket Badges (Derived from Runtime!) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            {tgtTicket && (
              <div
                onClick={() => setSelectedTicketForInspect(tgtTicket)}
                className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-700/80 text-cyan-200 cursor-pointer hover:border-cyan-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold">TGT (krbtgt)</span>
                </div>
                <span className="text-[10px] text-cyan-400">Inspect</span>
              </div>
            )}
            {serviceTicket && (
              <div
                onClick={() => setSelectedTicketForInspect(serviceTicket)}
                className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-700/80 text-purple-200 cursor-pointer hover:border-purple-400 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-bold">Service Ticket (CIFS)</span>
                </div>
                <span className="text-[10px] text-purple-400">Inspect</span>
              </div>
            )}
          </div>
        </div>

        {/* Tier 2: Domain Controller / KDC */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-800/60 space-y-4 text-xs font-mono shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>2. KDC (Domain Controller)</span>
            </span>
            <span className="text-[10px] text-slate-400">DC01-NEXORA</span>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 block text-[11px]">Authentication Service (AS)</span>
              <p className="text-[10px] text-slate-400">
                Validates pre-authentication timestamp and issues TGT encrypted with krbtgt secret key.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-purple-400 block text-[11px]">Ticket Granting Service (TGS)</span>
              <p className="text-[10px] text-slate-400">
                Validates TGT, extracts PAC security claims, and issues Service Ticket encrypted with target service account secret key.
              </p>
            </div>
          </div>
        </div>

        {/* Tier 3: Target Application Server */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>3. Target Service Host</span>
            </span>
            <span className="text-[10px] text-slate-400">FIN-SRV-01</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Service Principal:</span>
              <span className="text-purple-300 font-bold truncate max-w-[150px]">{targetSpn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protocol Port:</span>
              <span className="text-white">TCP 445 (SMB/CIFS)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mutual Auth:</span>
              <span className={protocolState === 'AUTHENTICATED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {protocolState === 'AUTHENTICATED' ? 'SESSION ESTABLISHED' : 'PENDING'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            {protocolState === 'AUTHENTICATED'
              ? 'Decrypted Service Ticket using server secret key. Validated Authenticator timestamp and PAC.'
              : 'Awaiting AP-REQ from client containing encrypted service ticket.'}
          </div>
        </div>
      </div>

      {/* Ticket Inspector Modal / Drawer */}
      {selectedTicketForInspect && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/80 shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {selectedTicketForInspect.type === 'TGT'
                  ? 'Ticket Granting Ticket (TGT) Inspector'
                  : 'Service Ticket (TGS) Inspector'}
              </h3>
            </div>
            <button
              onClick={() => setSelectedTicketForInspect(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-900 border border-slate-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Ticket ID</span>
              <span className="text-cyan-300 font-bold break-all">{selectedTicketForInspect.id}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Client Principal</span>
              <span className="text-white font-bold">{selectedTicketForInspect.clientPrincipal}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Service Principal</span>
              <span className="text-purple-300 font-bold">{selectedTicketForInspect.servicePrincipal}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Realm</span>
              <span className="text-white font-bold">{selectedTicketForInspect.realm}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Validity Window</span>
              <span className="text-emerald-400">
                T+{selectedTicketForInspect.issuedAtVirtualTime}ms → T+{selectedTicketForInspect.expiresAtVirtualTime}ms
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500 block">Encryption & Session Key</span>
              <span className="text-amber-400">
                {selectedTicketForInspect.encryptionType} • {selectedTicketForInspect.sessionKey}
              </span>
            </div>
          </div>

          {/* PAC Payload Inspection */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider block text-[11px]">
              Privilege Attribute Certificate (PAC) Claims:
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedTicketForInspect.pacGroups.map((sid, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-purple-300 text-[11px]">
                  {sid}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exchange Timeline Logs (Projected from SimulationRuntime Events) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'سجل تبادل رسائل Kerberos المستمد من المحرك العام:' : 'Runtime Kerberos Message Timeline:'}</span>
        </h3>

        {exchangeLogs.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-center">
            {isAr
              ? 'انقر على "بدء التبادل التلقائي" أو "خطوة واحدة" لتشغيل السيناريو عبر محرك المحاكاة.'
              : 'Click "Start Flow" or "Step" to run the scenario through the global simulation runtime.'}
          </div>
        ) : (
          <div className="space-y-2">
            {exchangeLogs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 ${
                  log.failure
                    ? 'bg-red-950/40 border-red-700 text-red-200'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-cyan-400 font-bold shrink-0 mt-0.5">
                  T+{log.time}ms
                </span>
                <span className="text-white font-bold shrink-0">[{log.state}]</span>
                <span className="leading-relaxed">{isAr ? log.messageAr : log.messageEn}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
