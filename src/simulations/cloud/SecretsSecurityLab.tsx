/**
 * OMEGA V13 — Cloud Security World
 * SecretsSecurityLab.tsx
 *
 * Interactive Cloud Secrets Manager, KMS Encryption, Automated Rotation,
 * and Cleartext Credential Leak Detection Lab.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultSecrets,
  createDefaultKmsKeys,
  scanForCleartextSecrets,
  SecretLeakFinding,
  CloudSecret,
} from './logic/secrets';
import { Lock, KeyRound, AlertTriangle, CheckCircle2, RotateCw, Search, ShieldCheck } from 'lucide-react';

export const SecretsSecurityLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [secrets, setSecrets] = useState<CloudSecret[]>(createDefaultSecrets());
  const [kmsKeys] = useState(createDefaultKmsKeys());
  const [selectedSecretId, setSelectedSecretId] = useState<string>(secrets[0].id);

  const sampleTargets = [
    {
      location: 'Container Env: /app/docker-compose.yml',
      sourceType: 'CONTAINER_SPEC' as const,
      textContent: 'DB_CONNECTION=postgres://admin:SuperSecretPass2026!@10.100.20.15:5432/finance',
    },
    {
      location: 'Lambda Env Vars: PaymentWorker',
      sourceType: 'ENV_VAR' as const,
      textContent: 'PAYMENT_GATEWAY_TOKEN=sk_live_948201948201839201928401',
    },
    {
      location: 'Git Commit: .env.staging',
      sourceType: 'SOURCE_CODE' as const,
      textContent: 'NEXORA_BACKEND_ACCESS_KEY=NXAKIAIOSFODNN7ALEX9',
    },
  ];

  const [leakFindings, setLeakFindings] = useState<SecretLeakFinding[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const selectedSecret = secrets.find((s) => s.id === selectedSecretId) || secrets[0];

  const triggerScan = () => {
    setIsScanning(true);
    const findings = scanForCleartextSecrets(sampleTargets);
    setLeakFindings(findings);
    setIsScanning(false);
  };

  const toggleRotation = (secretId: string) => {
    setSecrets((prev) =>
      prev.map((s) => {
        if (s.id !== secretId) return s;
        return {
          ...s,
          rotationEnabled: !s.rotationEnabled,
          rotationIntervalDays: s.rotationEnabled ? 0 : 30,
        };
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-mono mb-1">
            <Lock className="w-4 h-4" />
            <span>CLOUD SECRETS MANAGER & KMS ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر إدارة الأسرار والتشفير والكشف عن التسريب' : 'Secrets Management, KMS & Leak Detection Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'تجنب كتابة المفاتيح وكلمات المرور في الأكواد ومتغيرات البيئة؛ وفعل التدوير التلقائي واستخدم فاحص التسريب.'
              : 'Eliminate cleartext API tokens in code and containers; automate 30-day secret rotation and detect exposed keys.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Secrets Directory */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'الأسرار السحابية المدارة' : 'Managed Cloud Secrets'}</span>
            <span className="text-[10px] text-orange-400 font-mono">{secrets.length} SECRETS</span>
          </div>

          <div className="flex flex-col gap-2">
            {secrets.map((sec) => {
              const isSelected = sec.id === selectedSecretId;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSecretId(sec.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">{sec.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        sec.status === 'COMPROMISED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {sec.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>Rotation: {sec.rotationEnabled ? `${sec.rotationIntervalDays}d` : 'Disabled'}</span>
                    <span>Versions: {sec.versions.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Secret Details & Cleartext Scanner */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Secret Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-950/60 border border-orange-800/60 text-orange-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedSecret.name}</h3>
                  <span className="text-xs text-slate-400 font-mono break-all">{selectedSecret.arn}</span>
                </div>
              </div>

              <button
                onClick={() => toggleRotation(selectedSecret.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                  selectedSecret.rotationEnabled
                    ? 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200'
                    : 'bg-rose-900 hover:bg-rose-800 text-rose-200'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{selectedSecret.rotationEnabled ? 'Rotation Active' : 'Enable 30d Rotation'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'مفتاح التشفير' : 'KMS KEY'}</span>
                <span className="font-bold text-orange-300">{selectedSecret.kmsKeyId}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'آخر تدوير' : 'LAST ROTATION'}</span>
                <span className="font-bold text-white">Virtual T+{selectedSecret.lastRotatedVirtualTime}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">{isAr ? 'الحالة' : 'STATUS'}</span>
                <span className={selectedSecret.status === 'ACTIVE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {selectedSecret.status}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cleartext Secret Scanner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <Search className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'فاحص تسريب الأسرار في الأكواد والبيئة' : 'Cleartext Secret Leak Scanner'}</span>
                </div>

                <button
                  onClick={triggerScan}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isScanning ? 'Scanning...' : isAr ? 'فحص المصادر الآن' : 'Run Secret Scan'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {isAr
                  ? 'يفحص متغيرات بيئة الحاويات وملفات التكوين وسجلات Git للكشف عن مفاتيح الوصول المشفرة بنصوص واضحة.'
                  : 'Scans container specs, Lambda environment variables, and Git commits for exposed API keys and passwords.'}
              </p>

              {/* Findings */}
              {leakFindings.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs text-slate-500 font-mono">
                  {isAr ? 'اضغط "فحص المصادر الآن" لاكتشاف المفاتيح المسربة' : 'Click "Run Secret Scan" to inspect configurations'}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto">
                  {leakFindings.map((f) => (
                    <div key={f.id} className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/80 text-xs font-mono">
                      <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                        <span>{f.secretNameGuess}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-white">CRITICAL LEAK</span>
                      </div>
                      <div className="text-[11px] text-slate-400">Location: {f.location}</div>
                      <div className="text-[10px] text-amber-300 bg-slate-950 p-1.5 rounded mt-1.5 truncate">
                        Matched: {f.detectedPattern}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {isAr
                ? 'الحل الجذري: لا تقم أبدًا بتخزين بيانات الاعتماد في متغيرات البيئة، بل اعتمد على هويات أعباء العمل (Instance Profiles).'
                : 'Definitive Solution: Never store long-lived credentials in environment variables; adopt Workload Identity Federation.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
