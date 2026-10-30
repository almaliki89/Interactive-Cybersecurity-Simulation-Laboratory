import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  HardDrive,
  Flame,
  Grid3X3,
} from 'lucide-react';

interface HardwareRowhammerLabProps {
  language?: 'ar' | 'en';
}

interface RowhammerScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  dramType: 'DDR3_LEGACY' | 'DDR4_TRR' | 'LPDDR4_MOBILE';
  targetStructure: 'PAGE_TABLE_ENTRY' | 'RSA_PRIVATE_KEY' | 'SUDO_UID';
  accessPattern: string;
  descriptionEn: string;
  descriptionAr: string;
  exploitImpact: string;
  exploitImpactAr: string;
}

const ROWHAMMER_SCENARIOS: RowhammerScenario[] = [
  {
    id: 'HAMMER-01',
    nameEn: 'PTE Hijacking for Kernel Privilege Escalation',
    nameAr: 'اختطاف مداخل جدول الصفحات PTE لتصعيد الصلاحيات للنواة',
    dramType: 'DDR3_LEGACY',
    targetStructure: 'PAGE_TABLE_ENTRY',
    accessPattern: 'Double-sided aggressor rows hammering target victim row at 0x7FFF1000.',
    descriptionEn: 'Repeatedly accessing adjacent memory rows causes electromagnetic leakage, flipping a bit in a Page Table Entry (PTE) to point to an attacker-controlled page.',
    descriptionAr: 'الوصول المتكرر لصفوف الذاكرة المتجاورة يسبب تسريباً كهرومغناطيسياً يقلب بت في جدول الصفحات ليشير لصفحة يتحكم بها المهاجم.',
    exploitImpact: 'Full System Ring-0 Privilege Escalation',
    exploitImpactAr: 'تصعيد صلاحيات كامل للوصول لنواة النظام Ring-0',
  },
  {
    id: 'HAMMER-02',
    nameEn: 'RSA-2048 Private Key Bit-Flip (Fault Attack)',
    nameAr: 'قلب بت في مفتاح RSA-2048 الخاص (هجوم الأعطال المحفزة)',
    dramType: 'DDR4_TRR',
    targetStructure: 'RSA_PRIVATE_KEY',
    accessPattern: 'Many-sided TRRespass bypass pattern targeting cryptographic buffers.',
    descriptionEn: 'Targeting DRAM rows containing cached private keys; flipping a single bit during signature generation allows key recovery via CRT-RSA fault analysis.',
    descriptionAr: 'استهداف صفوف DRAM المحتوية على مفاتيح خاصة؛ قلب بت واحد أثناء عملية التوقيع يتيح استعادة المفتاح عبر تحليل أعطال CRT-RSA.',
    exploitImpact: 'Total Cryptographic Key Compromise',
    exploitImpactAr: 'اختراق كامل للمفاتيح التشفيرية واستعادتها',
  },
  {
    id: 'HAMMER-03',
    nameEn: 'Mobile Sandbox Escape via LPDDR4 Flip-Phenomenon',
    nameAr: 'الهروب من صندوق حماية الهاتف عبر ظاهرة قلب البت في LPDDR4',
    dramType: 'LPDDR4_MOBILE',
    targetStructure: 'SUDO_UID',
    accessPattern: 'High-frequency ionic leakage hammering in mobile memory environment.',
    descriptionEn: 'Exploiting the shared memory controller in mobile SoCs to flip the User ID (UID) of a sandboxed process from 1001 to 0 (root).',
    descriptionAr: 'استغلال متحكم الذاكرة المشترك في معالجات الهواتف لقلب معرف المستخدم (UID) من 1001 إلى 0 (root) للهروب من الصندوق.',
    exploitImpact: 'Android/iOS Sandbox Escape & Root Access',
    exploitImpactAr: 'الهروب من صندوق حماية الهاتف والحصول على صلاحيات Root',
  },
];

export const HardwareRowhammerLab: React.FC<HardwareRowhammerLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('HAMMER-01');
  const [isHammering, setIsHammering] = useState<boolean>(false);
  const [hammerLog, setHammerLog] = useState<{
    status: 'HARDWARE_FAULT_BLOCKED' | 'DRAM_BIT_FLIP_SUCCESS';
    telemetry: string;
    physicalStatus: string;
    activeDefenses: string[];
  } | null>(null);

  // Hardware Mitigations
  const [defenseTargetRowRefresh, setDefenseTargetRowRefresh] = useState<boolean>(false);
  const [defenseEccMemory, setDefenseEccMemory] = useState<boolean>(false);
  const [defenseParaHarden, setDefenseParaHarden] = useState<boolean>(false);

  const scenario = useMemo(
    () => ROWHAMMER_SCENARIOS.find((s) => s.id === selectedScenarioId) || ROWHAMMER_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleTriggerRowhammer = () => {
    setIsHammering(true);
    setHammerLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (defenseEccMemory) {
        activeDefenses.push('Error Correction Code (ECC) DRAM: Multi-bit flip detected & single-bit flip corrected instantly');
        isBlocked = true;
      } else if (defenseTargetRowRefresh && scenario.dramType === 'DDR4_TRR') {
        activeDefenses.push('Target Row Refresh (TRR): Memory controller detected high-activation count and refreshed victim row');
        isBlocked = true;
      } else if (defenseParaHarden && scenario.id === 'HAMMER-01') {
        activeDefenses.push('PARA (Probabilistic Adjacent Row Activation): Hardware-level probabilistic refresh neutralized hammers');
        isBlocked = true;
      }

      if (isBlocked) {
        setHammerLog({
          status: 'HARDWARE_FAULT_BLOCKED',
          telemetry: isAr
            ? '[تم حظر عطل الذاكرة الفيزيائي] تقنية ECC أو TRR اكتشفت التنشيط المفرط وحمت صفوف الذاكرة.'
            : '[HARDWARE FAULT BLOCKED] ECC or TRR mitigation detected high-activation and protected victim rows.',
          physicalStatus: isAr
            ? 'سلامة البيانات في DRAM محفوظة 100%. لم يحدث أي تغيير في قيم البتات المستهدفة.'
            : 'DRAM data integrity 100% preserved. Zero bit-flips occurred in target addresses.',
          activeDefenses,
        });
      } else {
        setHammerLog({
          status: 'DRAM_BIT_FLIP_SUCCESS',
          telemetry: `PHYSICAL FAULT: Bit 4 of Row 0x7FFF1000 flipped (1 -> 0). Leakage successful.`,
          physicalStatus: isAr
            ? `إنذار أمني فيزيائي: ${scenario.exploitImpactAr} نتيجة نجاح هجوم Rowhammer!`
            : `CRITICAL HARDWARE COMPROMISE: ${scenario.exploitImpact} due to successful DRAM bit-flip!`,
          activeDefenses: [],
        });
      }

      setIsHammering(false);
    }, 600);
  };

  const handleResetDram = () => {
    setHammerLog(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Grid3X3 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr
                ? 'مختبر هجمات Rowhammer وقلب بتات الذاكرة الفيزيائية (DRAM Rowhammer Lab)'
                : 'Hardware Rowhammer & DRAM Bit-Flipping Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                Physical Layer / DRAM Exploitation
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة استغلال التسريب الكهرومغناطيسي في رقاقات الذاكرة لقلب قيم البتات وتصعيد الصلاحيات، مع تفعيل دفاعات ECC و TRR.'
                : 'Simulate electromagnetic leakage in DRAM chips to flip bits and escalate privileges, validating ECC and TRR hardware defenses.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetDram}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {isAr ? 'تصفير حالة الذاكرة' : 'Clear DRAM State'}
        </button>
      </div>

      {/* Main Grid: Left Scenario Selector & Defenses, Right Aggressor visualization & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Rowhammer Scenarios & Mitigations */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات استهداف العتاد' : 'DRAM Aggressor Scenarios'}
          </h3>

          <div className="space-y-2">
            {ROWHAMMER_SCENARIOS.map((rs) => {
              const isSelected = rs.id === selectedScenarioId;
              return (
                <button
                  key={rs.id}
                  onClick={() => {
                    setSelectedScenarioId(rs.id);
                    setHammerLog(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">{rs.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {rs.dramType}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? rs.nameAr : rs.nameEn}</span>
                  <div className="text-[10px] text-rose-400 font-mono">Target: {rs.targetStructure}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? rs.descriptionAr : rs.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Hardware Mitigations */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'تقنيات تحصين الذاكرة والمعالج' : 'Hardware-Level DRAM Mitigations'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'ذاكرة تصحيح الأخطاء ECC DRAM' : 'ECC (Error Correction Code) Memory'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseEccMemory}
                  onChange={(e) => setDefenseEccMemory(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'تقنية تحديث الصفوف المستهدفة TRR' : 'Target Row Refresh (TRR) Enforcement'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseTargetRowRefresh}
                  onChange={(e) => setDefenseTargetRowRefresh(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">
                  {isAr ? 'التحديث الاحتمالي للصفوف المتجاورة PARA' : 'PARA (Probabilistic Adjacent Row Activation)'}
                </span>
                <input
                  type="checkbox"
                  checked={defenseParaHarden}
                  onChange={(e) => setDefenseParaHarden(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Row Hammering Visualization & Status */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              {isAr ? 'شاشة مراقبة شحنات خلايا الذاكرة' : 'DRAM Cell Voltage & Leakage Inspector'}
            </h3>
            <button
              onClick={handleTriggerRowhammer}
              disabled={isHammering}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isHammering ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flame className="w-3.5 h-3.5" />}
              {isAr ? 'بدء الطرق المتكرر (Hammering)' : 'Execute Memory Hammering'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'نمط الوصول المتسارع:' : 'Memory Access Pattern:'}</span>
              <span className="text-amber-400 font-bold">{scenario.accessPattern}</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
              <span className="text-slate-400 font-bold block">{isAr ? 'الأثر الأمني المتوقع:' : 'Exploit Security Consequence:'}</span>
              <span className="text-rose-400 font-bold">{isAr ? scenario.exploitImpactAr : scenario.exploitImpact}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'معاينة فضاء العناوين الفيزيائي:' : 'Physical Address Space Map:'}</span>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-500 text-[10px]">Row N-1 (Aggressor)</span>
                <div className={`h-1.5 flex-1 rounded-full ${isHammering ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-300 text-[10px] font-bold">Row N (Victim)</span>
                <div className={`h-1.5 flex-1 rounded-full ${hammerLog?.status === 'DRAM_BIT_FLIP_SUCCESS' ? 'bg-rose-500' : 'bg-emerald-950'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-500 text-[10px]">Row N+1 (Aggressor)</span>
                <div className={`h-1.5 flex-1 rounded-full ${isHammering ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div>
              </div>
            </div>
          </div>

          {/* Rowhammer Diagnostics Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[170px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'سجل تشخيص متحكم الذاكرة' : 'Memory Controller (IMC) Hardware Log'}</span>
            </div>

            {hammerLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    hammerLog.status === 'HARDWARE_FAULT_BLOCKED'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {hammerLog.status === 'HARDWARE_FAULT_BLOCKED' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم إحباط قلب البتات بنجاح' : 'MEMORY INTEGRITY PRESERVED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'اختراق فيزيائي حرج - تم قلب البت!' : 'CRITICAL BIT-FLIP SUCCESSFUL'}</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{hammerLog.telemetry}</p>
                  <p className="text-[11px] mt-1 font-semibold text-amber-300">{hammerLog.physicalStatus}</p>
                </div>

                {hammerLog.activeDefenses.length > 0 && (
                  <div className="p-2.5 bg-slate-900 border border-slate-800 rounded space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      {isAr ? 'دفاعات العتاد المفعلة:' : 'Active Hardware Mitigations:'}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {hammerLog.activeDefenses.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <HardDrive className="w-8 h-8 mb-2 opacity-30 text-amber-500" />
                <p>
                  {isAr
                    ? 'رقاقات DRAM جاهزة. اضغط "بدء الطرق" لاختبار متانة العتاد ضد ظاهرة قلب البتات Rowhammer.'
                    : 'DRAM chips ready. Click "Execute Memory Hammering" to test hardware resilience against the Rowhammer phenomenon.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
