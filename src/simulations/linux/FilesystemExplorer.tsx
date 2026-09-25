import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Folder,
  FolderTree,
  FileText,
  FileCode,
  Shield,
  Lock,
  Eye,
  Info,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { parseOctalMode, formatSymbolicMode } from './logic/permissions';

export interface FSEntry {
  name: string;
  path: string;
  type: 'dir' | 'file';
  owner: string;
  group: string;
  permissions: string; // octal e.g. '755'
  size: string;
  purposeEn: string;
  purposeAr: string;
  securityRelevanceEn: string;
  securityRelevanceAr: string;
  children?: FSEntry[];
}

interface FilesystemExplorerProps {
  onBackToMap?: () => void;
}

export const FilesystemExplorer: React.FC<FilesystemExplorerProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const initialTree: FSEntry[] = [
    {
      name: 'bin',
      path: '/bin',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'Essential system binary executables for all users',
      purposeAr: 'ملفات البرامج التنفيذية الأساسية لكافة المستخدمين',
      securityRelevanceEn: 'Integrity must be monitored against binary tampering (Rootkits).',
      securityRelevanceAr: 'يجب مراقبة سلامة الملفات لمنع استبدالها ببرمجيات خبيثة.',
    },
    {
      name: 'boot',
      path: '/boot',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'Boot loader files and Linux kernel images (vmlinuz)',
      purposeAr: 'ملفات إقلاع النظام وصور نواة لينكس (vmlinuz)',
      securityRelevanceEn: 'Needs Secure Boot and read-only protection to prevent bootkits.',
      securityRelevanceAr: 'يتطلب حماية الإقلاع الآمن ومنع التعديل لتفادي Bootkits.',
    },
    {
      name: 'dev',
      path: '/dev',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '3.2 KB',
      purposeEn: 'Device special files representing hardware nodes',
      purposeAr: 'ملفات الأجهزة الخاصة التي تمثل مكونات العتاد',
      securityRelevanceEn: 'Raw storage devices (/dev/sda) must restrict direct write access.',
      securityRelevanceAr: 'أقراص التخزين الخام (/dev/sda) يجب حمايتها من الكتابة المباشرة.',
    },
    {
      name: 'etc',
      path: '/etc',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'Host-specific system-wide configuration files',
      purposeAr: 'ملفات إعدادات وتهيئة النظام والخدمات',
      securityRelevanceEn: 'Contains sensitive credentials and access policy definitions.',
      securityRelevanceAr: 'يحتوي على بيانات الاعتماد الحساسة وسياسات الوصول.',
      children: [
        {
          name: 'shadow',
          path: '/etc/shadow',
          type: 'file',
          owner: 'root',
          group: 'shadow',
          permissions: '600',
          size: '1.2 KB',
          purposeEn: 'Hashed passwords and account expiration details',
          purposeAr: 'تجزئات كلمات المرور وتفاصيل صلاحية الحسابات',
          securityRelevanceEn: 'High Priority: readable by root only (chmod 600 or 400).',
          securityRelevanceAr: 'أولوية قصوى: مقصور على المستخدم الجذر فقط لمنع كشف الهاشات.',
        },
        {
          name: 'passwd',
          path: '/etc/passwd',
          type: 'file',
          owner: 'root',
          group: 'root',
          permissions: '644',
          size: '2.5 KB',
          purposeEn: 'User account metadata (UID, GID, shell, home dir)',
          purposeAr: 'بيانات حسابات المستخدمين (UID, GID, المسار الافتراضي)',
          securityRelevanceEn: 'World-readable by design; passwords must not be stored here.',
          securityRelevanceAr: 'متاح للقراءة لجميع البرامج؛ ممنوع حفظ كلمات المرور فيه.',
        },
        {
          name: 'sudoers',
          path: '/etc/sudoers',
          type: 'file',
          owner: 'root',
          group: 'root',
          permissions: '440',
          size: '820 B',
          purposeEn: 'Defines root privilege elevation rules for sudo',
          purposeAr: 'يحدد صلاحيات تصعيد الامتيازات لأمر sudo',
          securityRelevanceEn: 'Must be read-only and restricted to prevent unauthorized elevation.',
          securityRelevanceAr: 'يجب أن يكون للقراءة فقط ومقيداً لمنع تصعيد الصلاحيات غير المشروع.',
        },
      ],
    },
    {
      name: 'home',
      path: '/home',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'User personal directories and home environments',
      purposeAr: 'المجلدات الشخصية لعموم مستخدمي النظام',
      securityRelevanceEn: 'Individual home directories must be protected with chmod 700.',
      securityRelevanceAr: 'يجب عزل مجلد كل مستخدم بصلاحيات 700 لمنع التطفل.',
      children: [
        {
          name: 'alice',
          path: '/home/alice',
          type: 'dir',
          owner: 'alice',
          group: 'developers',
          permissions: '700',
          size: '4.0 KB',
          purposeEn: 'Home directory for user alice',
          purposeAr: 'المجلد الشخصي للمستخدمة أليس',
          securityRelevanceEn: 'Private user files, SSH keys (~/.ssh), and shell history.',
          securityRelevanceAr: 'ملفات خاصة ومفاتيح SSH وسجل الأوامر.',
        },
        {
          name: 'bob',
          path: '/home/bob',
          type: 'dir',
          owner: 'bob',
          group: 'developers',
          permissions: '700',
          size: '4.0 KB',
          purposeEn: 'Home directory for user bob',
          purposeAr: 'المجلد الشخصي للمستخدم بوب',
          securityRelevanceEn: 'Isolate user space to prevent horizontal privilege escalation.',
          securityRelevanceAr: 'عزل مساحة المستخدم لمنع التصعيد العرضي للصلاحيات.',
        },
      ],
    },
    {
      name: 'opt',
      path: '/opt',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'Optional third-party software and self-contained packages',
      purposeAr: 'حزم البرمجيات الإضافية والتطبيقات المستقلة',
      securityRelevanceEn: 'Ensure non-root accounts cannot overwrite shared binaries.',
      securityRelevanceAr: 'التأكد من عدم قدرة المستخدمين العاديين على تعديل البرامج المشتركة.',
    },
    {
      name: 'proc',
      path: '/proc',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '555',
      size: '0 B',
      purposeEn: 'Virtual pseudo-filesystem representing kernel and process states',
      purposeAr: 'نظام ملفات افتراضي يمثل حالة النواة والعمليات الجارية',
      securityRelevanceEn: 'hidepid options can conceal processes from other local users.',
      securityRelevanceAr: 'يمكن استخدام خيار hidepid لمنع المستخدمين من كشف عمليات الآخرين.',
    },
    {
      name: 'root',
      path: '/root',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '700',
      size: '4.0 KB',
      purposeEn: 'Home directory for the superuser (root)',
      purposeAr: 'المجلد الشخصي للمستخدم الجذر الفائق (root)',
      securityRelevanceEn: 'Strictly restricted to UID 0 only. Contains root SSH keys.',
      securityRelevanceAr: 'مقصور تماماً على UID 0؛ يحتوي على مفاتيح إدارة الخادم.',
    },
    {
      name: 'tmp',
      path: '/tmp',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '1777',
      size: '4.0 KB',
      purposeEn: 'Temporary files storage accessible by all processes',
      purposeAr: 'مجلد الملفات المؤقتة المتاح لجميع البرامج والعمليات',
      securityRelevanceEn: 'Must have Sticky Bit (+t) enabled to prevent file deletion by other users.',
      securityRelevanceAr: 'يجب تفعيل بت التثبيت (Sticky Bit +t) لمنع حذف المستخدم لملفات غيره.',
    },
    {
      name: 'usr',
      path: '/usr',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'User utilities, libraries, and secondary system hierarchy',
      purposeAr: 'أدوات ومكتبات النظام المشتركة للتطبيقات',
      securityRelevanceEn: 'Contains setuid binaries (like /usr/bin/passwd or sudo).',
      securityRelevanceAr: 'يحتوي على برامج ببت الترقية (SUID) مثل passwd و sudo.',
    },
    {
      name: 'var',
      path: '/var',
      type: 'dir',
      owner: 'root',
      group: 'root',
      permissions: '755',
      size: '4.0 KB',
      purposeEn: 'Variable data files: logs, spools, caches, and web roots',
      purposeAr: 'البيانات المتغيرة: السجلات، التخزين المؤقت، وخوادم الويب',
      securityRelevanceEn: '/var/log must be protected against tampering or deletion by attackers.',
      securityRelevanceAr: 'يجب حماية مجلد السجلات /var/log من الحذف أو التلاعب من المهاجمين.',
      children: [
        {
          name: 'log',
          path: '/var/log',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: '755',
          size: '4.0 KB',
          purposeEn: 'System security and audit log repository',
          purposeAr: 'مستودع سجلات الأمان والمراقبة للنظام',
          securityRelevanceEn: 'Critical for incident response and digital forensics.',
          securityRelevanceAr: 'عنصر حاسم في الاستجابة للحوادث والتحقيق الجنائي الرقمي.',
        },
        {
          name: 'www',
          path: '/var/www',
          type: 'dir',
          owner: 'root',
          group: 'root',
          permissions: '755',
          size: '4.0 KB',
          purposeEn: 'Default web root directory for HTTP services',
          purposeAr: 'المسار الافتراضي لملفات ومواقع الويب',
          securityRelevanceEn: 'Restrict write permissions to prevent web shell uploads.',
          securityRelevanceAr: 'تقييد إذن الكتابة لمنع رفع شفرات الاختراق (Web Shells).',
        },
      ],
    },
  ];

  const [selectedEntry, setSelectedEntry] = useState<FSEntry>(initialTree[3].children![0]); // /etc/shadow
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/etc', '/var']));

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const perms = parseOctalMode(selectedEntry.permissions);
  const symbolic = formatSymbolicMode(perms, selectedEntry.type === 'dir');

  const renderTree = (entries: FSEntry[], level = 0) => {
    return (
      <div className="space-y-1">
        {entries.map((entry) => {
          const isSelected = selectedEntry.path === entry.path;
          const isExpanded = expandedPaths.has(entry.path);
          const hasChildren = entry.children && entry.children.length > 0;

          return (
            <div key={entry.path} style={{ paddingLeft: `${level * 14}px` }}>
              <button
                onClick={() => {
                  setSelectedEntry(entry);
                  if (hasChildren) toggleExpand(entry.path);
                }}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-amber-950/60 border border-amber-600/80 text-amber-200'
                    : 'bg-slate-950 border border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {hasChildren ? (
                    isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )
                  ) : (
                    <span className="w-3.5" />
                  )}
                  {entry.type === 'dir' ? (
                    <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <span className="truncate">{entry.name}</span>
                </div>

                <span className="text-[10px] text-slate-500 font-bold ml-2 shrink-0">
                  {entry.permissions}
                </span>
              </button>

              {hasChildren && isExpanded && renderTree(entry.children!, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono uppercase">
            <FolderTree className="w-4 h-4" />
            <span>{isAr ? 'مستكشف التسلسل الهرمي لنظام الملفات (FHS)' : 'Filesystem Hierarchy Standard (FHS) Explorer'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'هيكل دلائل نظام لينكس والأصول الأمنية' : 'Linux Directory Structure & Security Purpose'}
          </h2>
        </div>

        {onBackToMap && (
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <BackArrow className="w-3.5 h-3.5" />
            <span>{isAr ? 'العودة للخارطة' : 'Back to World Map'}</span>
          </button>
        )}
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Navigator */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 font-mono uppercase">
            <span>{isAr ? 'شجرة الدلائل (/)' : 'Directory Tree (/)'}</span>
            <span className="text-[10px] text-slate-500">{isAr ? 'انقر للفحص' : 'Click to inspect'}</span>
          </div>

          <div className="max-h-[550px] overflow-y-auto pr-1">
            {renderTree(initialTree)}
          </div>
        </div>

        {/* Right: File Inspector Card */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {selectedEntry.type === 'dir' ? (
                <Folder className="w-5 h-5 text-amber-400" />
              ) : (
                <FileCode className="w-5 h-5 text-cyan-400" />
              )}
              <span className="text-base font-bold font-mono text-white truncate">
                {selectedEntry.path}
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
              {selectedEntry.size}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'المالك' : 'Owner'}</span>
              <span className="text-slate-200 font-bold">{selectedEntry.owner}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'المجموعة' : 'Group'}</span>
              <span className="text-slate-200 font-bold">{selectedEntry.group}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'الوضع الثماني' : 'Octal Mode'}</span>
              <span className="text-cyan-400 font-bold">{selectedEntry.permissions}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase block">{isAr ? 'الترميز الرمزي' : 'Symbolic'}</span>
              <span className="text-emerald-400 font-bold">{symbolic}</span>
            </div>
          </div>

          {/* Operational Purpose */}
          <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {isAr ? 'الوظيفة التشغيلية في النظام:' : 'System Operational Purpose:'}
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? selectedEntry.purposeAr : selectedEntry.purposeEn}
            </p>
          </div>

          {/* Security Relevance Deck */}
          <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono">
              <Shield className="w-4 h-4" />
              <span>{isAr ? 'الأهمية الأمنية وضوابط الحماية' : 'Security Assessment & Hardening Guidance'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isAr ? selectedEntry.securityRelevanceAr : selectedEntry.securityRelevanceEn}
            </p>
          </div>

          {/* Permission Class Breakdown */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono block">
              {isAr ? 'تفكيك صلاحيات الوصول (Access Rights):' : 'Effective POSIX Classes Matrix:'}
            </span>

            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'المالك (u)' : 'Owner (u)'}</span>
                <span className="text-cyan-400 font-bold">
                  {perms.owner.r ? 'r' : '-'}{perms.owner.w ? 'w' : '-'}{perms.owner.x ? 'x' : '-'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'المجموعة (g)' : 'Group (g)'}</span>
                <span className="text-cyan-400 font-bold">
                  {perms.group.r ? 'r' : '-'}{perms.group.w ? 'w' : '-'}{perms.group.x ? 'x' : '-'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block mb-1">{isAr ? 'الآخرون (o)' : 'Other (o)'}</span>
                <span className="text-cyan-400 font-bold">
                  {perms.other.r ? 'r' : '-'}{perms.other.w ? 'w' : '-'}{perms.other.x ? 'x' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
