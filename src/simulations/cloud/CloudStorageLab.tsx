/**
 * OMEGA V13 — Cloud Security World
 * CloudStorageLab.tsx
 *
 * Interactive Cloud Object Storage (S3) Security Lab.
 * Teaches Block Public Access (BPA), KMS Server-Side Encryption at Rest,
 * Bucket Policies, and Preventing Catastrophic Data Exfiltration.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultStorageBuckets,
  evaluateBucketPublicExposure,
  CloudStorageBucket,
} from './logic/storage';
import { Database, Shield, AlertTriangle, CheckCircle2, Lock, Unlock, Eye, FileText } from 'lucide-react';

export const CloudStorageLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [buckets, setBuckets] = useState<CloudStorageBucket[]>(createDefaultStorageBuckets());
  const [selectedBucketId, setSelectedBucketId] = useState<string>(buckets[0].id);

  const selectedBucket = buckets.find((b) => b.id === selectedBucketId) || buckets[0];
  const exposure = evaluateBucketPublicExposure(selectedBucket);

  const toggleBpaControl = (controlKey: keyof CloudStorageBucket['publicAccessBlock']) => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBucket.id) return b;
        const newBpa = {
          ...b.publicAccessBlock,
          [controlKey]: !b.publicAccessBlock[controlKey],
        };
        const allActive = newBpa.blockPublicAcls && newBpa.ignorePublicAcls && newBpa.blockPublicPolicy && newBpa.restrictPublicBuckets;
        return {
          ...b,
          publicAccessBlock: newBpa,
          isPubliclyExposed: !allActive,
        };
      })
    );
  };

  const toggleEncryption = () => {
    setBuckets((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBucket.id) return b;
        return {
          ...b,
          encryption: {
            ...b.encryption,
            enabled: !b.encryption.enabled,
          },
        };
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-1">
            <Database className="w-4 h-4" />
            <span>CLOUD STORAGE SECURITY & BLOCK PUBLIC ACCESS</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر أمن التخزين السحابي وحظر الوصول العام (S3 & BPA)' : 'Cloud Storage & Block Public Access Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'تعد الحاويات المكشوفة سببًا رئيسيًا في أكبر التسريبات السحابية. تعلم كيفية قفل الحاويات وتفعيل تشفير KMS.'
              : 'Public storage buckets cause the majority of enterprise cloud data breaches. Enforce Block Public Access (BPA) and KMS encryption.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Buckets List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'حاويات التخزين في المؤسسة' : 'Cloud Storage Buckets'}</span>
            <span className="text-[10px] text-amber-400 font-mono">{buckets.length} BUCKETS</span>
          </div>

          <div className="flex flex-col gap-2">
            {buckets.map((b) => {
              const isSelected = b.id === selectedBucketId;
              const bExp = evaluateBucketPublicExposure(b);
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBucketId(b.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">{b.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        bExp.isPublic
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {bExp.isPublic ? 'PUBLIC EXPOSURE' : 'PRIVATE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>Region: {b.region}</span>
                    <span>Objects: {b.objects.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Bucket Configuration & BPA Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Exposure Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              exposure.isPublic
                ? 'bg-rose-950/40 border-rose-700 text-rose-200'
                : 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {exposure.isPublic ? (
                <Unlock className="w-6 h-6 text-rose-400 shrink-0" />
              ) : (
                <Lock className="w-6 h-6 text-emerald-400 shrink-0" />
              )}
              <div>
                <h3 className="text-xs font-bold">
                  {exposure.isPublic
                    ? isAr
                      ? 'تحذير: الحاوية متاحة للعامة دون توثيق عبر الإنترنت!'
                      : 'CRITICAL ALERT: Bucket is Publicly Accessible to Anyone on Internet!'
                    : isAr
                    ? 'الحاوية مؤمنة بالكامل: محظور أي وصول عام'
                    : 'Bucket is Fully Hardened: All Public Access Blocked'}
                </h3>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isAr ? exposure.reasonsAr.join(' ') : exposure.reasonsEn.join(' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Block Public Access (BPA) Control Matrix */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'ضوابط حظر الوصول العام (Block Public Access Controls)' : 'Block Public Access (BPA) Matrix'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  key: 'blockPublicAcls' as const,
                  titleEn: 'Block Public ACLs',
                  titleAr: 'حظر قوائم التحكم بالوصول العامة (ACLs)',
                  descEn: 'Blocks public access granted through new ACLs.',
                  descAr: 'حظر أي وصول عام يُمنح عبر قوائم ACL الجديدة.',
                },
                {
                  key: 'ignorePublicAcls' as const,
                  titleEn: 'Ignore Public ACLs',
                  titleAr: 'تجاهل قوائم التحكم العامة (ACLs)',
                  descEn: 'Ignores all public ACLs on bucket and objects.',
                  descAr: 'تجاهل جميع قوائم ACL العامة على الحاوية وملفاتها.',
                },
                {
                  key: 'blockPublicPolicy' as const,
                  titleEn: 'Block Public Policy',
                  titleAr: 'حظر السياسات العامة',
                  descEn: 'Prevents applying public bucket policies (*).',
                  descAr: 'منع تطبيق أي سياسة تسمح بالوصول العام للحاوية.',
                },
                {
                  key: 'restrictPublicBuckets' as const,
                  titleEn: 'Restrict Public Buckets',
                  titleAr: 'تقييد الحاويات العامة',
                  descEn: 'Restricts public bucket access to AWS services & authorized users only.',
                  descAr: 'حصر وصول الحاويات العامة على الخدمات السحابية والمصرح لهم.',
                },
              ].map((ctrl) => {
                const isActive = selectedBucket.publicAccessBlock[ctrl.key];
                return (
                  <div
                    key={ctrl.key}
                    onClick={() => toggleBpaControl(ctrl.key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-700/80 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{isAr ? ctrl.titleAr : ctrl.titleEn}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{isAr ? ctrl.descAr : ctrl.descEn}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                        isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                      }`}
                    >
                      {isActive ? 'ENABLED' : 'OFF'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Encryption Control */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">
                  {isAr ? 'تشفير السكون عبر مفاتيح KMS' : 'KMS Server-Side Encryption at Rest'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedBucket.encryption.enabled
                    ? isAr
                      ? `مفعل باستخدام خوارزمية ${selectedBucket.encryption.algorithm}`
                      : `Enforced with ${selectedBucket.encryption.algorithm} (${selectedBucket.encryption.kmsKeyId || 'Default'})`
                    : isAr
                    ? 'غير مشفر! البيانات مخزنة بنص غير محمي.'
                    : 'Unencrypted! Data stored in plain text at rest.'}
                </span>
              </div>
              <button
                onClick={toggleEncryption}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                  selectedBucket.encryption.enabled
                    ? 'bg-emerald-800 hover:bg-emerald-700 text-white'
                    : 'bg-rose-800 hover:bg-rose-700 text-white'
                }`}
              >
                {selectedBucket.encryption.enabled ? 'Disable' : 'Enable KMS'}
              </button>
            </div>
          </div>

          {/* Stored Objects Explorer */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <h4 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? 'الملفات المخزنة في الحاوية' : 'Stored Bucket Objects'}</span>
            </h4>

            {selectedBucket.objects.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                {isAr ? 'الحاوية فارغة' : 'Bucket is currently empty'}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedBucket.objects.map((obj) => (
                  <div key={obj.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{obj.key}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {obj.sensitivityLevel}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{obj.contentPreview}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
