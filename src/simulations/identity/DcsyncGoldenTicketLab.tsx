import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Crown,
  Key,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Lock,
  Unlock,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Server,
  Network,
  Database,
  RefreshCw,
} from 'lucide-react';

export const DcsyncGoldenTicketLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [step, setStep] = useState<number>(1);
  const [replicationAclRevoked, setReplicationAclRevoked] = useState(false);

  // DCSync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [stolenKrbtgtHash, setStolenKrbtgtHash] = useState<string | null>(null);

  // Golden Ticket State
  const [domainName, setDomainName] = useState('CORP.NEXORA.LOCAL');
  const [domainSid, setDomainSid] = useState('S-1-5-21-3892019482-2938102938-1092830192');
  const [impersonatedUser, setImpersonatedUser] = useState('EnterpriseAdmin_Stealth');
  const [validityDays, setValidityDays] = useState(3650);
  const [forgedTicket, setForgedTicket] = useState<string | null>(null);

  const handleRunDcsync = () => {
    setIsSyncing(true);
    setStolenKrbtgtHash(null);

    setTimeout(() => {
      setIsSyncing(false);
      if (replicationAclRevoked) {
        setStolenKrbtgtHash(null);
        return;
      }
      setStolenKrbtgtHash('d9b28a7e4c5f01928374650192837465');
      setStep(2);
    }, 1000);
  };

  const handleForgeGoldenTicket = () => {
    if (!stolenKrbtgtHash) return;
    const ticketPayload = `[Kerberos-TGT-v5] User=${impersonatedUser}@${domainName} | Realm=${domainName} | TicketEncHash=${stolenKrbtgtHash} | SIDs=[${domainSid}-500, ${domainSid}-519] | ValidUntil=${new Date(Date.now() + validityDays * 86400000).toLocaleDateString()}`;
    setForgedTicket(ticketPayload);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setIsSyncing(false);
    setStolenKrbtgtHash(null);
    setForgedTicket(null);
    setReplicationAclRevoked(false);
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4" />
            <span>{isAr ? 'معمل هجوم DCSync وتزوير التذكرة الذهبية (Golden Ticket)' : 'DCSync & Golden Ticket Persistence Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'سرقة هاش KRBTGT وتزوير تذاكر Kerberos غير المحدودة' : 'DRSUAPI_REPLICATION_&_KRBTGT_TGT_FORGERY'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setReplicationAclRevoked(!replicationAclRevoked)}
            data-testid="btn-toggle-dcsync-acl"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              replicationAclRevoked
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{replicationAclRevoked ? (isAr ? 'حسابات النسخ ملغاة (DCSync Blocked)' : 'Replication ACLs Revoked') : (isAr ? 'إلغاء صلاحية DCSync' : 'Revoke DCSync ACL Rights')}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
        <span className="font-bold text-purple-400 block">
          {isAr ? 'آلية هجوم DCSync والتذكرة الذهبية (Golden Ticket Attack):' : 'DCSync & Golden Ticket Mechanism:'}
        </span>
        <p className="text-slate-400">
          {isAr
            ? 'يستغل المهاجم صلاحيات DS-Replication لمطالبة متحكم الدومين بنسخ التجزئات، وبمجرد الحصول على هاش krbtgt، يمكنه تزوير تذكرة TGT صلاحيتها 10 سنوات تمنح نفوذ مطلق على كافة السيرفرات.'
            : 'Using DS-Replication rights via DRSUAPI, attackers request domain hashes. With the krbtgt account NTLM hash, they forge self-signed Kerberos TGTs valid for 10 years.'}
        </p>
      </div>

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { num: 1, titleEn: '1. DCSync Hash Dump', titleAr: '1. سحب الهاش بـ DCSync' },
          { num: 2, titleEn: '2. Golden Ticket Forgery', titleAr: '2. تزوير التذكرة الذهبية' },
          { num: 3, titleEn: '3. Domain Persistence', titleAr: '3. السيطرة الدائمة' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              step === s.num
                ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
                : step > s.num
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                : 'bg-slate-900/30 border-slate-900 text-slate-500'
            }`}
          >
            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
              step === s.num ? 'bg-purple-500 text-slate-950' : step > s.num ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {s.num}
            </span>
            <span className="text-xs font-bold truncate">{isAr ? s.titleAr : s.titleEn}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: DCSync DRSUAPI Execution */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'الخطوة 1: استدعاء واجهة DRSUAPI لمطالبة DC بـ GetNCChanges' : 'Step 1: Execute DCSync RPC via DRSUAPI (mimikatz lsadump::dcsync)'}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Target Account: krbtgt</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-300" dir="ltr">
            mimikatz # lsadump::dcsync /domain:CORP.NEXORA.LOCAL /user:krbtgt
          </div>

          <button
            onClick={handleRunDcsync}
            disabled={isSyncing}
            data-testid="btn-run-dcsync"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-950/40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isSyncing ? (isAr ? 'جاري محاكاة مزامنة DC...' : 'Executing DRSUAPI RPC...') : (isAr ? 'تشغيل هجوم DCSync' : 'Execute DCSync Hash Theft')}</span>
          </button>

          {replicationAclRevoked && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{isAr ? 'فشل DCSync: تم سحب صلاحيات DS-Replication-Get-Changes-All من الحساب.' : 'DCSync Access Denied: DS-Replication ACLs successfully revoked.'}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Golden Ticket Parameter Customization */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'الخطوة 2: تخصيص وتزوير تذكرة Kerberos TGT (Golden Ticket)' : 'Step 2: Customizing Golden Ticket Parameters'}</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">krbtgt NTLM: {stolenKrbtgtHash}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">{isAr ? 'اسم المستخدم المزور (Impersonated User):' : 'Forged Username:'}</label>
              <input
                type="text"
                value={impersonatedUser}
                onChange={(e) => setImpersonatedUser(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">{isAr ? 'مدة صلاحية التذكرة بالأيام (Ticket Lifetime):' : 'Validity Duration (Days):'}</label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value, 10) || 3650)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleForgeGoldenTicket}
            data-testid="btn-forge-golden-ticket"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-purple-950/40"
          >
            <Crown className="w-4 h-4" />
            <span>{isAr ? 'تزوير التذكرة الذهبية وحقنها بالذاكرة' : 'Forge Golden Ticket & Inject into LSASS'}</span>
          </button>
        </div>
      )}

      {/* STEP 3: Domain Persistence Output */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-400" />
              <span>{isAr ? 'الخطوة 3: التذكرة الذهبية المزورة وجاهزية الوصول الدائم' : 'Step 3: Golden Ticket Created & Persistent Forest Domain Admin'}</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Persistence Active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-purple-900/50 space-y-2">
            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Forged Kerberos TGT Ticket Payload:</span>
            <div className="font-mono text-xs text-purple-300 break-all leading-relaxed select-text" dir="ltr">
              {forgedTicket}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800 text-purple-300 text-xs flex items-center gap-3">
            <Unlock className="w-6 h-6 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block">
                {isAr ? 'تم تحقيق السيطرة المطلقة على الدومين (Persistence Established)' : 'Full Forest Domain Admin Access Granted!'}
              </span>
              <span className="text-xs opacity-80">
                {isAr
                  ? 'التذكرة المزورة تعطي المهاجم نفوذ كمدير شامل لكافة خوادم وسجلات الدومين حتى بعد تغيير كلمة سر المستخدم.'
                  : 'Allows full domain access to any service (CIFS, HTTP, LDAP) for 10 years even if target user changes password.'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
