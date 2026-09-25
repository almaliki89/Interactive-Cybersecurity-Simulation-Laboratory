import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  INITIAL_USERS,
  AdUser,
} from './logic/directory';
import {
  KerberosState,
  KerberosTicket,
  KerberosFailureReason,
  EncryptionType,
  advanceKerberosProtocol,
  KerberosExchangeContext,
} from './logic/kerberos';
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
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
} from 'lucide-react';

interface KerberosSimulationProps {
  onBackToMap?: () => void;
  onNavigateToAuthz?: () => void;
  onAddEvent?: (event: any) => void;
}

export const KerberosSimulation: React.FC<KerberosSimulationProps> = ({
  onBackToMap,
  onNavigateToAuthz,
  onAddEvent,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // State machine state
  const [kerberosState, setKerberosState] = useState<KerberosState>('IDLE');
  const [selectedUser, setSelectedUser] = useState<string>('sara');
  const [targetSpn, setTargetSpn] = useState<string>('cifs/fin-srv01.corp.nexora.local');
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('AES-256');

  // Simulation failure controls
  const [forcedFailure, setForcedFailure] = useState<KerberosFailureReason>('NONE');
  const [clientVirtualTimeOffset, setClientVirtualTimeOffset] = useState<number>(0); // Clock skew simulation in virtual seconds
  const [tgtTicket, setTgtTicket] = useState<KerberosTicket | undefined>(undefined);
  const [serviceTicket, setServiceTicket] = useState<KerberosTicket | undefined>(undefined);
  const [selectedTicketForInspect, setSelectedTicketForInspect] = useState<KerberosTicket | null>(null);

  // Exchange logs
  const [exchangeLogs, setExchangeLogs] = useState<
    { state: KerberosState; messageEn: string; messageAr: string; time: number; failure?: boolean }[]
  >([]);

  const currentUser = INITIAL_USERS.find((u) => u.samAccountName === selectedUser) || INITIAL_USERS[0];

  const handleStep = () => {
    const clientTime = virtualTime + clientVirtualTimeOffset;
    const kdcTime = virtualTime;

    const ctx: KerberosExchangeContext = {
      clientPrincipal: currentUser.userPrincipalName,
      targetSpn,
      clientVirtualTime: clientTime,
      kdcVirtualTime: kdcTime,
      accountEnabled: currentUser.enabled,
      passwordValid: forcedFailure !== 'WRONG_PASSWORD',
      userKnown: forcedFailure !== 'USER_UNKNOWN',
      spnKnown: forcedFailure !== 'SPN_UNKNOWN',
      kdcAvailable: forcedFailure !== 'KDC_UNAVAILABLE',
      pacGroups: ['S-1-5-21-392841-513', 'S-1-5-21-392841-1101'], // Domain Users, Finance-Users
      encryptionType,
      ticketLifetime: 600,
      maxClockSkew: 300,
      forcedFailure,
      seq: exchangeLogs.length + 1,
    };

    const res = advanceKerberosProtocol(kerberosState, ctx, tgtTicket, serviceTicket);
    setKerberosState(res.nextState);

    if (res.ticketIssued) {
      if (res.ticketIssued.type === 'TGT') {
        setTgtTicket(res.ticketIssued);
      } else {
        setServiceTicket(res.ticketIssued);
      }
    }

    const isFailure = res.nextState === 'FAILED';
    setExchangeLogs((prev) => [
      ...prev,
      {
        state: res.nextState,
        messageEn: res.messageEn,
        messageAr: res.messageAr,
        time: res.virtualTimestamp,
        failure: isFailure,
      },
    ]);

    // Emit synthetic AD event
    if (onAddEvent) {
      let eventId = 4768; // TGT request
      let actionEn = 'Kerberos TGT requested';
      let actionAr = 'تم طلب تذكرة TGT';

      if (res.nextState === 'SERVICE_TICKET_ISSUED') {
        eventId = 4769;
        actionEn = 'Kerberos Service Ticket requested';
        actionAr = 'تم طلب تذكرة خدمة Kerberos';
      } else if (res.nextState === 'FAILED') {
        eventId = 4771;
        actionEn = 'Kerberos pre-authentication failed';
        actionAr = 'فشلت المصادقة المسبقة لـ Kerberos';
      }

      onAddEvent({
        id: `ad-evt-krb-${virtualTime}-${exchangeLogs.length + 1}`,
        eventId,
        channel: 'Security',
        provider: 'Microsoft-Windows-Security-Auditing',
        virtualTime,
        severity: isFailure ? 'Warning' : 'Information',
        subjectUser: currentUser.samAccountName,
        targetUserOrObject: targetSpn,
        computer: 'DC01-NEXORA',
        actionEn,
        actionAr,
        detailsEn: res.messageEn,
        detailsAr: res.messageAr,
        category: 'Logon/Logoff',
      });
    }
  };

  const handleReset = () => {
    setKerberosState('IDLE');
    setTgtTicket(undefined);
    setServiceTicket(undefined);
    setSelectedTicketForInspect(null);
    setExchangeLogs([]);
  };

  const stepsList = [
    { id: 'AS_REQ', labelEn: '1. AS-REQ (Client -> KDC)', labelAr: '1. طلب AS-REQ (العميل -> KDC)' },
    { id: 'TGT', labelEn: '2. AS-REP (TGT Issued)', labelAr: '2. استلام تذكرة TGT' },
    { id: 'TGS_REQ', labelEn: '3. TGS-REQ (Client -> KDC)', labelAr: '3. طلب TGS-REQ بتذكرة TGT' },
    { id: 'SERVICE_TICKET', labelEn: '4. TGS-REP (Service Ticket)', labelAr: '4. استلام تذكرة الخدمة' },
    { id: 'AP_REQ', labelEn: '5. AP-REQ (Client -> Server)', labelAr: '5. تقديم AP-REQ لخادم التطبيق' },
    { id: 'AUTHENTICATED', labelEn: '6. Authenticated Session', labelAr: '6. اكتمال المصادقة وجلسة العمل' },
  ];

  const getStepProgressIndex = (state: KerberosState): number => {
    switch (state) {
      case 'IDLE':
        return 0;
      case 'AS_REQ_SENT':
        return 1;
      case 'TGT_ISSUED':
        return 2;
      case 'TGS_REQ_SENT':
        return 3;
      case 'SERVICE_TICKET_ISSUED':
        return 4;
      case 'AP_REQ_SENT':
        return 5;
      case 'AUTHENTICATED':
        return 6;
      case 'FAILED':
        return -1;
    }
  };

  const currentProgress = getStepProgressIndex(kerberosState);

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
                ? 'تتبع حزم AS-REQ و TGT و TGS-REQ وتذاكر الخدمة، مع فحص حزم PAC وضوابط انحراف الساعة والتشفير'
                : 'Interactive step-by-step Kerberos authentication engine with PAC token inspection and security failure testing'}
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
            onChange={(e) => setEncryptionType(e.target.value as EncryptionType)}
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

      {/* Stepping Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleStep}
            disabled={kerberosState === 'AUTHENTICATED' || kerberosState === 'FAILED'}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {kerberosState === 'IDLE'
                ? isAr
                  ? 'بدء مصادقة Kerberos (AS-REQ)'
                  : 'Start Kerberos Exchange (AS-REQ)'
                : isAr
                ? 'الخطوة التالية في البروتوكول'
                : 'Advance Next Protocol Step'}
            </span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isAr ? 'إعادة ضبط المحاكاة' : 'Reset Exchange'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Current State:</span>
          <span
            className={`px-3 py-1 rounded-xl font-bold border ${
              kerberosState === 'AUTHENTICATED'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : kerberosState === 'FAILED'
                ? 'bg-red-950 text-red-300 border-red-700'
                : 'bg-slate-950 text-cyan-300 border-slate-800'
            }`}
          >
            {kerberosState}
          </span>
        </div>
      </div>

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
              <span className="text-white">T+{virtualTime + clientVirtualTimeOffset}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cred Cache:</span>
              <span className="text-emerald-400">
                {tgtTicket ? 'TGT Present' : 'Empty'} • {serviceTicket ? 'TGS Present' : 'No TGS'}
              </span>
            </div>
          </div>

          {/* Ticket Badges */}
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
              <span className={kerberosState === 'AUTHENTICATED' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {kerberosState === 'AUTHENTICATED' ? 'SESSION ESTABLISHED' : 'PENDING'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            {kerberosState === 'AUTHENTICATED'
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
                T+{selectedTicketForInspect.issuedAtVirtualTime}s → T+{selectedTicketForInspect.expiresAtVirtualTime}s
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

      {/* Exchange Timeline Logs */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{isAr ? 'سجل تبادل رسائل Kerberos الزمني:' : 'Kerberos Message Timeline:'}</span>
        </h3>

        {exchangeLogs.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-center">
            {isAr
              ? 'انقر على "بدء مصادقة Kerberos" لتتبع مراحل تبادل التذاكر.'
              : 'Click "Start Kerberos Exchange" to initiate the protocol sequence.'}
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
                  T+{log.time}s
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
