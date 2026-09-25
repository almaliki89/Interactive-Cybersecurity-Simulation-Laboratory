import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { validateForensicInvestigationState, ForensicsMasterState } from './logic/hardening';
import { createDefaultForensicsCase, ForensicEvidence } from './logic/evidence';
import { SYNTHETIC_MASTER_TIMELINE } from './logic/timeline';
import { Award, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, RotateCcw, Cpu } from 'lucide-react';

export const ForensicsMasterChallenge: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const defaultCase = createDefaultForensicsCase(0);

  const [state, setState] = useState<ForensicsMasterState>({
    caseOpened: true,
    selectedScopeHosts: ['FIN-WS-01', 'DC-01', 'LINUX-SRV-01', 'APP-SRV-01', 'FIN-SRV'],
    preservedVolatileMemoryFirst: true,
    acquiredEvidence: [
      {
        id: 'EVD-MEM-FIN-WS01',
        type: 'MEMORY_IMAGE',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 10,
        originalHash: 'sha256:11112222333344445555666677778888',
        currentHash: 'sha256:11112222333344445555666677778888',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { ramDump: 'FIN-WS-01.raw' },
      },
      {
        id: 'EVD-DISK-FIN-WS01',
        type: 'DISK_IMAGE',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 20,
        originalHash: 'sha256:88887777666655554444333322221111',
        currentHash: 'sha256:88887777666655554444333322221111',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { diskImage: 'FIN-WS-01.E01' },
      },
      {
        id: 'EVD-LOG-WIN-SEC',
        type: 'LOG_EXPORT',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 30,
        originalHash: 'sha256:99998888777766665555444433332222',
        currentHash: 'sha256:99998888777766665555444433332222',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { logExport: 'Security.evtx' },
      },
      {
        id: 'EVD-LOG-LINUX-AUTH',
        type: 'LOG_EXPORT',
        sourceHost: 'LINUX-SRV-01',
        sourceUser: 'root',
        acquiredAtVirtualTime: 40,
        originalHash: 'sha256:ababababcdcdcdcd1212121234343434',
        currentHash: 'sha256:ababababcdcdcdcd1212121234343434',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { logFile: '/var/log/auth.log' },
      },
      {
        id: 'EVD-NET-PCAP-01',
        type: 'NETWORK_CAPTURE',
        sourceHost: 'FW-CORE-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 50,
        originalHash: 'sha256:00001111222233334444555566667777',
        currentHash: 'sha256:00001111222233334444555566667777',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { pcap: 'fw_capture.pcap' },
      },
      {
        id: 'EVD-BROWSER-HIST',
        type: 'BROWSER_ARTIFACT',
        sourceHost: 'FIN-WS-01',
        sourceUser: 'sara',
        acquiredAtVirtualTime: 60,
        originalHash: 'sha256:55554444333322221111000099998888',
        currentHash: 'sha256:55554444333322221111000099998888',
        preserved: true,
        integrityStatus: 'VERIFIED',
        metadata: { history: 'History.db' },
      },
    ],
    custodyRecords: [
      {
        id: 'CUST-001',
        evidenceId: 'EVD-MEM-FIN-WS01',
        virtualTime: 10,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'RAM Dump acquired',
      },
      {
        id: 'CUST-002',
        evidenceId: 'EVD-MEM-FIN-WS01',
        virtualTime: 15,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
      {
        id: 'CUST-003',
        evidenceId: 'EVD-DISK-FIN-WS01',
        virtualTime: 20,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'Disk Image acquired',
      },
      {
        id: 'CUST-004',
        evidenceId: 'EVD-DISK-FIN-WS01',
        virtualTime: 25,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
      {
        id: 'CUST-005',
        evidenceId: 'EVD-LOG-WIN-SEC',
        virtualTime: 30,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'Security.evtx exported',
      },
      {
        id: 'CUST-006',
        evidenceId: 'EVD-LOG-WIN-SEC',
        virtualTime: 35,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
      {
        id: 'CUST-007',
        evidenceId: 'EVD-LOG-LINUX-AUTH',
        virtualTime: 40,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'auth.log exported',
      },
      {
        id: 'CUST-008',
        evidenceId: 'EVD-LOG-LINUX-AUTH',
        virtualTime: 45,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
      {
        id: 'CUST-009',
        evidenceId: 'EVD-NET-PCAP-01',
        virtualTime: 50,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'pcap exported',
      },
      {
        id: 'CUST-010',
        evidenceId: 'EVD-NET-PCAP-01',
        virtualTime: 55,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
      {
        id: 'CUST-011',
        evidenceId: 'EVD-BROWSER-HIST',
        virtualTime: 60,
        action: 'COLLECTED',
        actor: 'Lead Investigator',
        notes: 'History.db exported',
      },
      {
        id: 'CUST-012',
        evidenceId: 'EVD-BROWSER-HIST',
        virtualTime: 65,
        action: 'VERIFIED',
        actor: 'Evidence Officer',
        notes: 'Hash verified',
      },
    ],
    verifiedEvidenceHashes: ['EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01', 'EVD-LOG-WIN-SEC', 'EVD-LOG-LINUX-AUTH', 'EVD-NET-PCAP-01', 'EVD-BROWSER-HIST'],
    reconstructedTimeline: SYNTHETIC_MASTER_TIMELINE,
    identifiedLogTampering: true,
    rootCauseFinding: {
      initialAccessVector: 'Brute-force password spray targeting user sara, Kerberos AS-REQ pre-auth bypass',
      affectedIdentity: 'sara',
      affectedHost: 'FIN-WS-01',
      privilegeChange: 'Domain Admins',
      impactedResources: ['\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx'],
      evidenceIds: ['EVD-LOG-WIN-SEC', 'EVD-MEM-FIN-WS01', 'EVD-DISK-FIN-WS01'],
    },
    selectedContainmentActionIds: ['ACT-ISOLATE-NETWORK', 'ACT-REVOKE-SARA-SESSIONS', 'ACT-REVERT-PRIVILEGE'],
    systemRecoveryState: {
      compromisedAccountReset: true,
      unauthorizedPrivilegesReverted: true,
      suspiciousProcessesTerminated: true,
      maliciousFilesEradicated: true,
      auditLoggingEnabled: true,
      networkSecurityPoliciesApplied: true,
      businessApplicationTested: true,
      lingeringSuspiciousState: false,
    },
    lessonsDocumented: true,

    // Anti-cheat flags
    deletedOriginalEvidence: false,
    poweredOffBeforeMemoryAcquisition: false,
    markedAllFilesMalicious: false,
    reinstalledWithoutInvestigation: false,
    blockedEntireCompanyNetwork: false,
    disabledAllFinanceUsers: false,
    closedCaseWithoutRootCause: false,
  });

  const valResult = validateForensicInvestigationState(state);

  const toggleAntiCheatFlag = (flagKey: keyof ForensicsMasterState) => {
    setState((prev) => ({ ...prev, [flagKey]: !prev[flagKey] }));
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>{isAr ? 'التحدي الشامل للتحقيق الجنائي الرقمي' : 'Forensics Master Challenge & Validator'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? `اختبار الجاهزية الجنائية وشامل ضوابط التحقيق (${defaultCase.id})` : `Forensic Investigation Master Controls & Anti-Cheat Audit (${defaultCase.id})`}
          </h1>
        </div>

        <div className={`px-4 py-2 rounded-2xl border text-sm font-black flex items-center gap-2 ${
          valResult.success
            ? 'bg-emerald-950 border-emerald-700 text-emerald-300 shadow-xl shadow-emerald-950/60'
            : 'bg-rose-950 border-rose-800 text-rose-300 shadow-xl shadow-rose-950/60'
        }`}>
          {valResult.success ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span>{valResult.score}/100 POINTS — {valResult.success ? (isAr ? 'اجتياز معتمد' : 'MASTER PASSED') : (isAr ? 'غير مكتمل' : 'FAILED')}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
        <span className="text-slate-300 font-bold">{isAr ? valResult.summaryAr : valResult.summaryEn}</span>
        <span className="text-slate-500">Passed Checks: {valResult.passedChecks.length} / {valResult.checkDetails.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? 'تفاصيل بنود الفحص الضابطة بالتحقيق (11 Master Controls)' : 'Master Investigation Control Audit Checks'}</span>
          </h2>

          <div className="flex flex-col gap-2.5">
            {valResult.checkDetails.map((chk) => (
              <div
                key={chk.id}
                className={`p-4 rounded-xl border flex flex-col gap-1 text-xs font-mono ${
                  chk.passed
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-200'
                    : 'bg-rose-950/50 border-rose-800 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    {chk.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span>{isAr ? chk.nameAr : chk.nameEn}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${chk.passed ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-900 text-rose-200'}`}>
                    {chk.score}/{chk.weight} Pts
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 pl-6">
                  {isAr ? chk.feedbackAr : chk.feedbackEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4 h-fit">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'اختبار آليات حظر التحايل (Anti-Cheat Engine)' : 'Anti-Cheat Violations Tester'}</span>
          </h2>

          <div className="flex flex-col gap-2 text-xs">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.deletedOriginalEvidence}
                onChange={() => toggleAntiCheatFlag('deletedOriginalEvidence')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'حذف دليل أصلي (Evidence Tampering)' : 'Delete original evidence'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.poweredOffBeforeMemoryAcquisition}
                onChange={() => toggleAntiCheatFlag('poweredOffBeforeMemoryAcquisition')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'إيقاف إجباري قبل أخذ لقطة RAM' : 'Hard reboot before RAM capture'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.markedAllFilesMalicious}
                onChange={() => toggleAntiCheatFlag('markedAllFilesMalicious')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'تصنيف كافة الملفات كملفات ضارة' : 'Mark all files malicious'}</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-rose-700">
              <input
                type="checkbox"
                checked={state.blockedEntireCompanyNetwork}
                onChange={() => toggleAntiCheatFlag('blockedEntireCompanyNetwork')}
                className="rounded accent-rose-500"
              />
              <span className="text-slate-300">{isAr ? 'حظر شبكة الشركة بأكملها' : 'Block entire company network'}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
