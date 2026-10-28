import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Flame,
  Search,
  Key,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
  Network,
} from 'lucide-react';

export const KerberoastingLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [step, setStep] = useState<number>(1);
  const [ldapQuery, setLdapQuery] = useState('(&(samAccountType=805306368)(servicePrincipalName=*))');
  const [selectedSpn, setSelectedSpn] = useState<string | null>(null);
  const [extractedTicket, setExtractedTicket] = useState<string | null>(null);
  const [isCracking, setIsCracking] = useState(false);
  const [crackedPassword, setCrackedPassword] = useState<string | null>(null);
  const [gmsaEnforced, setGmsaEnforced] = useState(false);

  const spns = [
    {
      spn: 'MSSQLSvc/db01.corp.nexora.local:1433',
      account: 'svc_sql_admin',
      encryption: 'RC4-HMAC (Weak)',
      delegation: 'Unconstrained',
      descriptionEn: 'Database Service Account with Local Admin on DB01',
      descriptionAr: 'حساب خدمة قواعد البيانات مع صلاحية مدير محلي على DB01',
      vulnerable: true,
      hashcatFormat: '$krb5tgs$23$*svc_sql_admin*CORP.NEXORA.LOCAL*MSSQLSvc/db01*$3f98a7c2e...b541',
      passwordFound: 'Summer2026!',
    },
    {
      spn: 'HTTP/portal.corp.nexora.local',
      account: 'gmsa_web_prod$',
      encryption: 'AES256-CTS-HMAC-SHA1-96',
      delegation: 'Constrained',
      descriptionEn: 'Group Managed Service Account (gMSA, 128-char auto-rotated password)',
      descriptionAr: 'حساب خدمة مدار جماعياً gMSA بكلمة سر 128 خانة تدور آلياً',
      vulnerable: false,
      hashcatFormat: '$krb5tgs$18$*gmsa_web_prod$*CORP.NEXORA.LOCAL*HTTP/portal*...aes256',
      passwordFound: null,
    },
  ];

  const handleRunQuery = () => {
    setStep(2);
  };

  const handleRequestTgs = (spnItem: typeof spns[0]) => {
    setSelectedSpn(spnItem.spn);
    setExtractedTicket(spnItem.hashcatFormat);
    setStep(3);
  };

  const handleCrackTicket = () => {
    setIsCracking(true);
    setTimeout(() => {
      setIsCracking(false);
      const target = spns.find((s) => s.spn === selectedSpn);
      if (target?.vulnerable && !gmsaEnforced) {
        setCrackedPassword(target.passwordFound);
        setStep(4);
      } else {
        setCrackedPassword(null);
        setStep(4);
      }
    }, 1200);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSpn(null);
    setExtractedTicket(null);
    setCrackedPassword(null);
    setIsCracking(false);
  };

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto custom-scrollbar select-none">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>{isAr ? 'معمل هجوم Kerberoasting والحركة الجانبية' : 'Kerberoasting & Lateral Movement Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1 uppercase tracking-tight">
            {isAr ? 'استخراج تذاكر TGS وكسر حسابات الخدمات غير المحمية' : 'KERBEROASTING_ATTACK_&_DEFENSE_PIPELINE'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGmsaEnforced(!gmsaEnforced)}
            data-testid="btn-toggle-gmsa"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              gmsaEnforced
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{gmsaEnforced ? (isAr ? 'حماية gMSA مفعلة (محصن)' : 'gMSA Enforced (Hardened)') : (isAr ? 'تفعيل حماية gMSA و AES' : 'Enable gMSA Hardening')}</span>
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

      {/* Stepper Wizard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { num: 1, titleEn: '1. SPN Discovery', titleAr: '1. اكتشاف SPN' },
          { num: 2, titleEn: '2. TGS-REQ Ticket', titleAr: '2. طلب تذكرة TGS' },
          { num: 3, titleEn: '3. Offline Cracking', titleAr: '3. كسر التجزئة' },
          { num: 4, titleEn: '4. Attack Path Graph', titleAr: '4. مسار الاختراق' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              step === s.num
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                : step > s.num
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400'
                : 'bg-slate-900/30 border-slate-900 text-slate-500'
            }`}
          >
            <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
              step === s.num ? 'bg-cyan-500 text-slate-950' : step > s.num ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
            }`}>
              {s.num}
            </span>
            <span className="text-xs font-bold truncate">{isAr ? s.titleAr : s.titleEn}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: SPN Discovery */}
      {step === 1 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'الخطوة 1: استعلام LDAP للبحث عن حسابات الخدمات (SPN Scanning)' : 'Step 1: Discover Service Principal Names via LDAP'}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Kerberoasting Phase 1</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold">{isAr ? 'استعلام LDAP لاكتشاف حسابات المستخدمين المرتبطة بـ SPN:' : 'LDAP Filter for SPN accounts:'}</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 select-all" dir="ltr">
              {ldapQuery}
            </div>
          </div>

          <button
            onClick={handleRunQuery}
            data-testid="btn-run-spn-query"
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-cyan-950/40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isAr ? 'تشغيل استعلام اكتشاف الـ SPN' : 'Execute SPN Discovery Scan'}</span>
          </button>
        </div>
      )}

      {/* STEP 2: SPN Selection & TGS Request */}
      {step === 2 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'الخطوة 2: حسابات الخدمات المكتشفة - طلب تذكرة TGS-REQ' : 'Step 2: Discovered Service Accounts — Request TGS Ticket'}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{spns.length} SPNs Found</span>
          </div>

          <div className="space-y-3">
            {spns.map((s) => (
              <div
                key={s.spn}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400" dir="ltr">{s.spn}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">{s.account}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      s.vulnerable && !gmsaEnforced ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {gmsaEnforced ? 'gMSA (AES-256)' : s.encryption}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{isAr ? s.descriptionAr : s.descriptionEn}</p>
                </div>

                <button
                  onClick={() => handleRequestTgs(s)}
                  data-testid={`btn-request-tgs-${s.account}`}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-rose-950/40"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طلب واستخراج تذكرة TGS' : 'Request & Roasting TGS'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Offline Cracking */}
      {step === 3 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-rose-400" />
              <span>{isAr ? 'الخطوة 3: تذكرة TGS المستخرجة وكسر كلمة المرور (Hashcat)' : 'Step 3: Extracted TGS Ticket & Offline Hash Cracking'}</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">{selectedSpn}</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold">{isAr ? 'صيغة التذكرة المستخرجة لبرامج الكسر (Hashcat Mode 13100 / John):' : 'Extracted Ticket (Hashcat Mode 13100):'}</label>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-rose-300 break-all select-all leading-relaxed" dir="ltr">
              {extractedTicket}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCrackTicket}
              disabled={isCracking}
              data-testid="btn-crack-ticket"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-rose-950/40"
            >
              <Lock className="w-4 h-4" />
              <span>{isCracking ? (isAr ? 'جاري تجربة قائمة الكلمات (Wordlist)...' : 'Cracking dictionary attack...') : (isAr ? 'بدء كسر التجزئة بـ RockYou.txt' : 'Start Offline Dictionary Attack')}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Attack Path Graph & Lateral Movement */}
      {step === 4 && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? 'الخطوة 4: مسار الاختراق والتصعيد الأفقي والعمودي (Attack Path)' : 'Step 4: Lateral Movement Attack Path Graph'}</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Privilege Escalation Complete</span>
          </div>

          {/* Outcome Result Card */}
          <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            crackedPassword
              ? 'bg-rose-950/40 border-rose-800 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
          }`}>
            <div className="flex items-center gap-3">
              {crackedPassword ? <Unlock className="w-6 h-6 text-rose-400" /> : <ShieldCheck className="w-6 h-6 text-emerald-400" />}
              <div>
                <span className="font-bold text-sm block">
                  {crackedPassword
                    ? isAr ? `تم كسر كلمة المرور بنجاح: ${crackedPassword}` : `Kerberoast Successful! Cleartext Password: ${crackedPassword}`
                    : isAr ? 'فشل الكسر: كلمة المرور محمية بـ gMSA وتشفير AES-256 المتطور.' : 'Cracking Failed: Protected by gMSA and AES-256.'}
                </span>
                <span className="text-xs opacity-80">
                  {crackedPassword
                    ? isAr ? 'الحساب غير المحمي يتيح للمهاجم السيطرة على قاعدة البيانات والتصعيد لمدير النطاق.' : 'Compromised service account yields Local Admin on DB01 and Domain Admin pivot.'
                    : isAr ? 'الحساب محصن ضد هجمات Kerberoasting تماماً.' : 'Account is strictly immune to offline Kerberoasting.'}
                </span>
              </div>
            </div>
          </div>

          {/* BloodHound-style Attack Chain Sequence */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{isAr ? 'سلسلة السيطرة والتصعيد (Lateral Movement Chain):' : 'BloodHound Attack Chain Steps:'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Node 1: Initial Foothold</span>
                <span className="text-slate-300 font-bold block">user_omar (Sales WS)</span>
                <span className="text-[10px] text-slate-500 block">Standard domain authenticated user</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/50 space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Node 2: Kerberoasting</span>
                <span className="text-rose-300 font-bold block">svc_sql_admin</span>
                <span className="text-[10px] text-slate-400 block">TGS decrypted ➔ Password cracked</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/50 space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">Node 3: Lateral Movement</span>
                <span className="text-amber-300 font-bold block">DB01 (SQL Server)</span>
                <span className="text-[10px] text-slate-400 block">Local Admin ➔ Memory LSA dump</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-purple-900/50 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Node 4: Full Takeover</span>
                <span className="text-purple-300 font-bold block">DC01 (Domain Controller)</span>
                <span className="text-[10px] text-slate-400 block">Domain Admins Group Compromised</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
