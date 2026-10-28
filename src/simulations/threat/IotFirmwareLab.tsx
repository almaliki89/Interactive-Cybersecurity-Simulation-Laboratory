import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
  FolderTree,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  FileCode,
  HardDrive,
  Usb,
} from 'lucide-react';

interface IotFirmwareLabProps {
  language?: 'ar' | 'en';
}

interface FirmwareScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'UART_JTAG_DUMP' | 'HARDCODED_KEY_EXTRACT' | 'UBOOT_ENV_INJECT';
  hardwareInterface: string;
  extractedArtifact: string;
  descriptionEn: string;
  descriptionAr: string;
  isThreat: boolean;
}

const FIRMWARE_SCENARIOS: FirmwareScenario[] = [
  {
    id: 'IOT-01',
    nameEn: 'SPI Flash Chip Off-Board Firmware Extraction (UART/JTAG)',
    nameAr: 'تفريغ وتفكيك ذاكرة فلاش SPI عبر واجهة UART/JTAG العتادية',
    category: 'UART_JTAG_DUMP',
    hardwareInterface: 'SPI SOIC-8 Clip (16MB Winbond Flash @ 3.3V)',
    extractedArtifact: 'firmware_dump.bin [SquashFS RootFS extracted, Linux Kernel 4.14.9]',
    descriptionEn: 'Attacker connects hardware clip directly to flash chip pins to dump entire binary firmware image without authenticating to device.',
    descriptionAr: 'المهاجم يوصل مشبك عتادي مباشرة بأطراف شريحة الفلاش لاستخراج صورة النظام بالكامل دون الحاجة لتسجيل الدخول.',
    isThreat: true,
  },
  {
    id: 'IOT-02',
    nameEn: 'Hardcoded Private SSL Key & Backdoor Credential Discovery',
    nameAr: 'استخراج المفاتيح السرية الصلبة وكلمات مرور الباب الخلفي',
    category: 'HARDCODED_KEY_EXTRACT',
    hardwareInterface: 'Extracted SquashFS Filesystem (/etc/ssl/ & /etc/shadow)',
    extractedArtifact: 'PRIVATE_KEY: device_root_rsa.key | ROOT_HASH: $1$md5$backdoor_admin_pass',
    descriptionEn: 'Static analysis of decompressed IoT rootfs reveals unencrypted master private keys and legacy MD5 root backdoor password.',
    descriptionAr: 'تحليل ثابت لنظام ملفات الجهاز المضمن يكشف مفاتيح تشفير رئيسية صلبة وكلمة مرور حساب المدير المخفية.',
    isThreat: true,
  },
  {
    id: 'IOT-03',
    nameEn: 'U-Boot Bootloader Command Line Shell Injection',
    nameAr: 'حقن وسائط الإقلاع في محمل الإقلاع U-Boot للحصول على Root',
    category: 'UBOOT_ENV_INJECT',
    hardwareInterface: 'UART Serial Terminal (115200 Baud, 8N1)',
    extractedArtifact: 'setenv bootargs "console=ttyS0,115200 root=/dev/mtdblock3 init=/bin/sh"',
    descriptionEn: 'Interrupting U-Boot countdown over serial console and injecting init=/bin/sh into bootargs to drop directly into unauthenticated root shell.',
    descriptionAr: 'إيقاف العد التنازلي لإقلاع U-Boot عبر واجهة السيريال وحقن أمر تشغيل شيل /bin/sh مباشرة بصلاحيات الجذر.',
    isThreat: true,
  },
];

export const IotFirmwareLab: React.FC<IotFirmwareLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('IOT-01');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<{
    status: 'HARDENED_BY_SECURE_BOOT' | 'FIRMWARE_COMPROMISED';
    extractedData: string;
    actionDetails: string;
    activeDefenses: string[];
  } | null>(null);

  // IoT Hardware & Firmware Defenses
  const [defenseSecureBootRoT, setDefenseSecureBootRoT] = useState<boolean>(false);
  const [defenseEfuseJtagLock, setDefenseEfuseJtagLock] = useState<boolean>(false);
  const [defenseEncryptedRootfs, setDefenseEncryptedRootfs] = useState<boolean>(false);

  const scenario = useMemo(
    () => FIRMWARE_SCENARIOS.find((f) => f.id === selectedScenarioId) || FIRMWARE_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleRunFirmwareAudit = () => {
    setIsAuditing(true);
    setAuditLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;

      if (scenario.category === 'UART_JTAG_DUMP' && defenseEfuseJtagLock) {
        activeDefenses.push('Hardware eFuses: Permanent JTAG / UART Debugging Port Electronic Lockout');
        isBlocked = true;
      } else if (scenario.category === 'HARDCODED_KEY_EXTRACT' && defenseEncryptedRootfs) {
        activeDefenses.push('AES-256 Encrypted RootFS with Hardware Keystore Bound Secret');
        isBlocked = true;
      } else if (scenario.category === 'UBOOT_ENV_INJECT' && defenseSecureBootRoT) {
        activeDefenses.push('Cryptographic Secure Boot: Sealed Bootloader Signature Verification (U-Boot Lock)');
        isBlocked = true;
      }

      if (isBlocked) {
        setAuditLog({
          status: 'HARDENED_BY_SECURE_BOOT',
          extractedData: isAr
            ? '[فشل استخراج البيانات العتادية] تم حماية البرمجيات الثابتة بواسطة قفل الفيوزات وتشفير النظام.'
            : '[HARDWARE EXTRACTION FAILED] JTAG locked via blown eFuses or RootFS ciphertext unreadable without hardware key.',
          actionDetails: isAr ? 'تم منع استخراج الـ Firmware أو كسر الإقلاع بنجاح.' : 'Secure Boot / eFuses halted debugging access. Device integrity verified.',
          activeDefenses,
        });
      } else {
        setAuditLog({
          status: 'FIRMWARE_COMPROMISED',
          extractedData: scenario.extractedArtifact,
          actionDetails: isAr
            ? 'تحذير: تم تفريغ البرمجيات الثابتة واستخراج المفاتيح الحساسة لغياب القفل العتادي!'
            : 'CRITICAL FIRMWARE EXPLOIT: Unprotected flash chip dumped or root shell spawned via U-Boot!',
          activeDefenses: [],
        });
      }

      setIsAuditing(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان رقاقات إنترنت الأشياء والبرمجيات الثابتة (IoT Firmware & Hardware Security)' : 'IoT Firmware Reversing & Hardware Debugging Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 rounded-full font-mono">
                JTAG / UART / U-Boot RoT
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية لتفريغ ذاكرة SPI Flash، واستخراج المفاتيح المشفرة، واختراق محمل الإقلاع U-Boot.'
                : 'Interactive SPI flash dumping, hardcoded secret extraction, U-Boot shell injection, and eFuse lockouts.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isAr ? 'منفذ التصحيح العتادي:' : 'Hardware Probe Interface:'}</span>
          <span className="px-2 py-1 bg-amber-950 border border-amber-800 text-amber-300 rounded font-bold">
            UART (115200 8N1) / JTAG ACTIVE
          </span>
        </div>
      </div>

      {/* Main Grid: Attack Vector Selection + Firmware Analysis Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Defenses */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات اختراق الـ Firmware' : 'Firmware Attack Scenarios'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
            {FIRMWARE_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-500 text-slate-100 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded font-semibold">
                      {sc.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* IoT Firmware Defenses */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'دروع تحصين العتاد والبرمجيات الثابتة' : 'Hardware & Firmware Controls'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'قفل منافذ JTAG/UART بالفيوزات الإلكترونية eFuses' : 'Hardware eFuses JTAG/UART Lockout'}</span>
                <input
                  type="checkbox"
                  checked={defenseEfuseJtagLock}
                  onChange={(e) => setDefenseEfuseJtagLock(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تشفير نظام الملفات AES-256 RootFS' : 'AES-256 Encrypted RootFS with Keystore'}</span>
                <input
                  type="checkbox"
                  checked={defenseEncryptedRootfs}
                  onChange={(e) => setDefenseEncryptedRootfs(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'سلسلة الإقلاع الموثوقة Secure Boot RoT' : 'Cryptographic Secure Boot Chain (RoT)'}</span>
                <input
                  type="checkbox"
                  checked={defenseSecureBootRoT}
                  onChange={(e) => setDefenseSecureBootRoT(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Terminal & Firmware Inspection Screen */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              {isAr ? 'شاشة تفريغ وتحليل الـ Firmware' : 'Firmware Extraction Console'}
            </h3>
            <button
              onClick={handleRunFirmwareAudit}
              disabled={isAuditing}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-amber-400/30 disabled:opacity-50"
            >
              {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Usb className="w-3.5 h-3.5" />}
              {isAr ? 'بدء سحب وفحص الذاكرة' : 'Execute Hardware Dump'}
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs font-mono space-y-1">
            <span className="text-slate-400 font-bold block">{isAr ? 'الواجهة المستهدفة بالشريحة:' : 'Target Hardware Interface:'}</span>
            <span className="text-amber-400 font-bold">{scenario.hardwareInterface}</span>
          </div>

          {/* Audit Output Log */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
              <span className="font-bold text-slate-300">{isAr ? 'مخرجات تحليل الذاكرة والـ Firmware' : 'Extracted Artifacts & Shell Telemetry'}</span>
            </div>

            {auditLog ? (
              <div className="space-y-3 text-xs font-mono">
                <div
                  className={`p-3 rounded border ${
                    auditLog.status === 'HARDENED_BY_SECURE_BOOT'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-800 text-rose-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {auditLog.status === 'HARDENED_BY_SECURE_BOOT' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>{isAr ? 'تم حماية الجهاز وإغلاق واجهات التصحيح' : 'FIRMWARE HARDENED & PROTECTED'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <span>{isAr ? 'إنذار: تم استخراج ملفات ومفاتيح الـ Firmware!' : 'CRITICAL FIRMWARE ARTIFACTS DUMPED'}</span>
                      </>
                    )}
                  </div>
                  {auditLog.actionDetails}
                </div>

                <div className="p-2.5 bg-slate-900 border border-slate-800 text-amber-300 rounded text-[11px] overflow-x-auto">
                  {auditLog.extractedData}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'اختر سيناريو وانقر على "بدء سحب وفحص الذاكرة" لاختبار صلابة أجهزة IoT.'
                    : 'Select an IoT attack scenario and click "Execute Hardware Dump".'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
