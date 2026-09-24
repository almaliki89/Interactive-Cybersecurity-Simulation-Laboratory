import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FolderGit2,
  Users,
  Key,
  Shield,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  Lock,
} from 'lucide-react';

export const ActiveDirectorySimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  // Kerberos Ticket Exchange State
  const [kerberosStep, setKerberosStep] = useState<number>(0); // 0=idle, 1=AS-REQ/REP (TGT), 2=TGS-REQ/REP (Service Ticket), 3=AP-REQ (Connected)
  const [preAuthRequired, setPreAuthRequired] = useState(true);
  const [aesEncryptionOnly, setAesEncryptionOnly] = useState(true);

  const stepLabels = [
    { ar: '1. جاهز لبدء المصادقة', en: '1. Idle / Ready' },
    { ar: '2. طلب واستلام تذكرة TGT من خادم AS', en: '2. AS-REQ & TGT Received' },
    { ar: '3. طلب واستلام تذكرة الخدمة TGS', en: '3. TGS-REQ & Service Ticket Received' },
    { ar: '4. الاتصال بخادم الخدمة الهدف بنجاح', en: '4. AP-REQ / Service Session Established' },
  ];

  const challenge: Challenge = {
    id: 'ad-kerberos-challenge',
    simulationId: 'active_directory',
    title: language === 'ar' ? 'تحدي مصادقة Kerberos وتأمين تذاكر TGS' : 'Kerberos Ticket Exchange & Hardening Challenge',
    difficulty: 'Advanced',
    category: language === 'ar' ? 'دليل النطاق النشط والهوية' : 'Active Directory',
    mission:
      language === 'ar'
        ? 'أكمل دورة تبادل تذاكر Kerberos بنجاح مع فرض التشفير القوي AES لمنع هجمات Kerberoasting.'
        : 'Complete full Kerberos ticket exchange and enforce strong AES encryption to prevent Kerberoasting.',
    initialExplanation:
      language === 'ar'
        ? 'يطلب العميل تذكرة TGT أولاً، ثم يطلب تذكرة الخدمة TGS للوصول للخادم دون إرسال كلمة المرور عبر الشبكة.'
        : 'Client obtains TGT from AS, requests TGS service ticket, and presents it to target service without sending password.',
    objectives: [
      {
        id: 'obj-tgt',
        title: language === 'ar' ? 'استلام تذكرة TGT' : 'Obtain Ticket Granting Ticket (TGT)',
        description: language === 'ar' ? 'مصادقة العميل مع خادم AS' : 'Authenticate client with KDC AS',
        isCompleted: kerberosStep >= 1,
        validationKey: 'tgt_ok',
      },
      {
        id: 'obj-tgs',
        title: language === 'ar' ? 'استلام تذكرة الخدمة TGS' : 'Obtain Service Ticket (TGS)',
        description: language === 'ar' ? 'طلب الوصول لخادم الملفات المشترك' : 'Request TGS ticket for file share service',
        isCompleted: kerberosStep >= 2,
        validationKey: 'tgs_ok',
      },
      {
        id: 'obj-aes',
        title: language === 'ar' ? 'حصر التشفير على AES' : 'Enforce AES Encryption',
        description: language === 'ar' ? 'إلغاء تشفير RC4 الضعيف لحماية التذاكر' : 'Disable legacy RC4 encryption on SPNs',
        isCompleted: aesEncryptionOnly,
        validationKey: 'aes_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'انقر على "الخطوة التالية" لإتمام تبادل التذاكر وتأكد من تفعيل خيار AES.' : 'Step through ticket flow and enforce AES.',
    ],
  };

  const validateChallenge = () => {
    if (kerberosStep >= 3 && aesEncryptionOnly) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'تمت مصادقة Kerberos بنجاح وتحصين التذاكر ضد هجمات Kerberoasting!'
            : 'Kerberos authentication completed and hardened against offline ticket cracking!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'أكمل خطوات المصادقة وتأكد من تفعيل AES.' : 'Complete ticket exchange steps with AES enabled.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي مصادقة Kerberos وعمارة Active Directory' : 'Active Directory & Kerberos Protocol Simulator'}
      subtitle={language === 'ar' ? 'تذاكر TGT و TGS، خوادم KDC، وتحصين حسابات الخدمات SPN' : 'AS-REQ, TGT, TGS Exchange & Kerberoasting Defenses'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setKerberosStep((prev) => Math.min(3, prev + 1))}
              disabled={kerberosStep >= 3}
              className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'ar' ? 'الخطوة التالية في تبادل التذاكر' : 'Next Kerberos Step'}</span>
            </button>
            <button
              onClick={() => setKerberosStep(0)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={preAuthRequired}
                onChange={(e) => setPreAuthRequired(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'فرض المصادقة المسبقة (Pre-Auth)' : 'Pre-Authentication Enforced'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={aesEncryptionOnly}
                onChange={(e) => setAesEncryptionOnly(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'تشفير AES فقط (حظر RC4)' : 'AES-256 Only (No RC4)'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Kerberos Flow Diagram */}
        <div className="max-w-4xl w-full mb-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              {language === 'ar' ? 'مراحل تبادل تذاكر Kerberos:' : 'Kerberos 3-Tier Ticket Flow:'}
            </span>
            <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
              {language === 'ar' ? stepLabels[kerberosStep].ar : stepLabels[kerberosStep].en}
            </span>
          </div>

          {/* Step Sequence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className={`p-4 rounded-xl border transition-all ${kerberosStep >= 1 ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <span className="font-bold block text-white mb-1">1. AS Exchange (TGT)</span>
              <p className="text-[11px] opacity-80">Client ↔ KDC Auth Service</p>
              <span className="text-[10px] block mt-2 text-cyan-300">
                {kerberosStep >= 1 ? '✓ TGT Acquired (krbtgt)' : 'Pending AS-REQ'}
              </span>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${kerberosStep >= 2 ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <span className="font-bold block text-white mb-1">2. TGS Exchange (Service)</span>
              <p className="text-[11px] opacity-80">Client ↔ Ticket Granting Service</p>
              <span className="text-[10px] block mt-2 text-indigo-300">
                {kerberosStep >= 2 ? (aesEncryptionOnly ? '✓ TGS Issued (AES-256)' : '⚠ TGS Issued (RC4 Weak)') : 'Pending TGS-REQ'}
              </span>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${kerberosStep >= 3 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <span className="font-bold block text-white mb-1">3. AP Exchange (Access)</span>
              <p className="text-[11px] opacity-80">Client ↔ Target Service Server</p>
              <span className="text-[10px] block mt-2 text-emerald-300">
                {kerberosStep >= 3 ? '✓ Authenticated Session Open' : 'Pending Service AP-REQ'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
