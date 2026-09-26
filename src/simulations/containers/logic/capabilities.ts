/**
 * OMEGA V14 — Linux Capabilities Security Engine
 * Evaluates POSIX capabilities, dangerous privilege retention, and drop-all policies.
 */

import { LinuxCapability } from './types';

export interface CapabilityInfo {
  name: LinuxCapability;
  isDangerous: boolean;
  category: 'SYSTEM_ADMIN' | 'NETWORK' | 'FILE_SYSTEM' | 'PROCESS';
  descriptionAr: string;
  descriptionEn: string;
  exploitVectorAr: string;
  exploitVectorEn: string;
}

export const ALL_CAPABILITIES_MAP: Record<LinuxCapability, CapabilityInfo> = {
  CAP_SYS_ADMIN: {
    name: 'CAP_SYS_ADMIN',
    isDangerous: true,
    category: 'SYSTEM_ADMIN',
    descriptionAr: 'الصلاحية الأخطر على الإطلاق (تعادل Root تقريباً): تركيب أنظمة الملفات، التلاعب بنقاط cgroup، وفحص الأجهزة.',
    descriptionEn: 'The root equivalent capability: allows mounting filesystems, cgroup manipulation, bpf syscalls, and device control.',
    exploitVectorAr: 'تسمح بكسر عزل الحاوية عبر ثغرات cgroup release_agent وتركيب أقراص المضيف.',
    exploitVectorEn: 'Enables container escape via cgroup release_agent injection and host drive remounting.',
  },
  CAP_SYS_PTRACE: {
    name: 'CAP_SYS_PTRACE',
    isDangerous: true,
    category: 'PROCESS',
    descriptionAr: 'تتبع وفحص العمليات الأخرى باستخدام ptrace.',
    descriptionEn: 'Allows tracing arbitrary processes using ptrace and inspecting memory.',
    exploitVectorAr: 'حقن شفرة خبيثة (Shellcode) داخل عمليات المضيف أو الحاويات الأخرى في نفس مساحة PID.',
    exploitVectorEn: 'Enables process memory injection and hijacked execution across shared PID namespaces.',
  },
  CAP_SYS_MODULE: {
    name: 'CAP_SYS_MODULE',
    isDangerous: true,
    category: 'SYSTEM_ADMIN',
    descriptionAr: 'تحميل وإلغاء تحميل وحدات نواة لينكس (Kernel Modules - LKM).',
    descriptionEn: 'Allows loading and unloading raw Linux Kernel Modules (LKM).',
    exploitVectorAr: 'تحميل Rootkit مباشر داخل نواة المضيف للسيطرة التامة على الخادم.',
    exploitVectorEn: 'Directly load kernel-mode rootkits granting permanent undetectable ring-0 takeover.',
  },
  CAP_SYS_RAWIO: {
    name: 'CAP_SYS_RAWIO',
    isDangerous: true,
    category: 'SYSTEM_ADMIN',
    descriptionAr: 'الوصول المباشر إلى منافذ الإدخال/الإخراج والذاكرة المادية /dev/mem.',
    descriptionEn: 'Raw I/O port and direct physical memory (/dev/mem) operations.',
    exploitVectorAr: 'قراءة ذاكرة النواة ومفاتيح التشفير المادية للعتاد.',
    exploitVectorEn: 'Read raw physical kernel RAM, bypassing all OS permission boundaries.',
  },
  CAP_SYS_BOOT: {
    name: 'CAP_SYS_BOOT',
    isDangerous: true,
    category: 'SYSTEM_ADMIN',
    descriptionAr: 'إعادة تشغيل أو إيقاف تشغيل خادم المضيف.',
    descriptionEn: 'Allows rebooting the host operating system or triggering kexec.',
    exploitVectorAr: 'تعطيل خادم المضيف بالكامل والتسبب بحجب الخدمة.',
    exploitVectorEn: 'Immediate Denial-of-Service by commanding the host node to reboot.',
  },
  CAP_NET_ADMIN: {
    name: 'CAP_NET_ADMIN',
    isDangerous: true,
    category: 'NETWORK',
    descriptionAr: 'تعديل جداول التوجيه، إعداد واجهات الشبكة، والتلاعب بقواعد iptables.',
    descriptionEn: 'Full control over network interfaces, routing tables, and iptables/nftables firewall rules.',
    exploitVectorAr: 'إعادة توجيه حركة البيانات واعتراض حزم الاتصال الخاصة بالحاويات الأخرى (Man-in-the-Middle).',
    exploitVectorEn: 'Enables traffic hijacking, route poisoning, and firewall rule tampering.',
  },
  CAP_NET_RAW: {
    name: 'CAP_NET_RAW',
    isDangerous: true,
    category: 'NETWORK',
    descriptionAr: 'إنشاء حزم شبكية خام (Raw Sockets) وتزوير العناوين وحزم ICMP/ARP.',
    descriptionEn: 'Allows creation of raw IP sockets and crafting arbitrary Layer 2/3 packets.',
    exploitVectorAr: 'تنفيذ هجمات انتحال ARP Spoofing وتزوير حزم الشبكة الداخلية.',
    exploitVectorEn: 'Facilitates ARP spoofing, IP header forgery, and raw packet sniffing.',
  },
  CAP_DAC_OVERRIDE: {
    name: 'CAP_DAC_OVERRIDE',
    isDangerous: true,
    category: 'FILE_SYSTEM',
    descriptionAr: 'تجاوز أذونات القراءة والكتابة والتنفيذ لجميع ملفات النظام (Bypass DAC).',
    descriptionEn: 'Bypasses discretionary access controls (rwx permissions on all files).',
    exploitVectorAr: 'قراءة وتعديل أي ملف حتى لو كانت صلاحيته 000 أو مملوك لمستخدم آخر.',
    exploitVectorEn: 'Read and overwrite any system file regardless of POSIX permission bits.',
  },
  CAP_NET_BIND_SERVICE: {
    name: 'CAP_NET_BIND_SERVICE',
    isDangerous: false,
    category: 'NETWORK',
    descriptionAr: 'ربط الخدمة بالمنافذ المميزة الأقل من 1024 (مثل المنفذ 80 و 443).',
    descriptionEn: 'Allows binding to privileged ports below 1024 (80, 443).',
    exploitVectorAr: 'خطر منخفض؛ ضرورية لخوادم الويب الكلاسيكية العاملة على المنفذ 80.',
    exploitVectorEn: 'Low risk; strictly enables HTTP/HTTPS binding on standard ports.',
  },
  CAP_CHOWN: {
    name: 'CAP_CHOWN',
    isDangerous: false,
    category: 'FILE_SYSTEM',
    descriptionAr: 'تغيير مالك الملفات والمجلدات.',
    descriptionEn: 'Allows arbitrary changes to file UIDs and GIDs.',
    exploitVectorAr: 'قد يستغل لتغيير ملكية ملفات حساسة إذا كان مقترناً بمجلدات مشتركة.',
    exploitVectorEn: 'Can modify ownership of shared files in multi-tenant environments.',
  },
  CAP_FOWNER: {
    name: 'CAP_FOWNER',
    isDangerous: false,
    category: 'FILE_SYSTEM',
    descriptionAr: 'تجاوز فحوصات المالك عند تعديل أذونات الملفات.',
    descriptionEn: 'Bypasses permission checks on operations that normally require file ownership.',
    exploitVectorAr: 'تعديل تصاريح الملفات غير المملوكة.',
    exploitVectorEn: 'Permission manipulation on foreign files.',
  },
  CAP_FSETID: {
    name: 'CAP_FSETID',
    isDangerous: false,
    category: 'FILE_SYSTEM',
    descriptionAr: 'الحفاظ على بتات SUID و SGID عند تعديل الملفات.',
    descriptionEn: 'Preserves SUID/SGID bits when a file is modified.',
    exploitVectorAr: 'إنشاء برامج SUID تنفيذية مصممة للترقية.',
    exploitVectorEn: 'SUID binary persistence creation.',
  },
  CAP_KILL: {
    name: 'CAP_KILL',
    isDangerous: false,
    category: 'PROCESS',
    descriptionAr: 'إرسال إشارات الإنهاء للعمليات التابعة لمستخدمين آخرين.',
    descriptionEn: 'Allows sending signals (SIGKILL/SIGTERM) to arbitrary processes.',
    exploitVectorAr: 'إيقاف عمليات الخدمات الأخرى.',
    exploitVectorEn: 'Denial of service against other co-located processes.',
  },
  CAP_SETUID: {
    name: 'CAP_SETUID',
    isDangerous: true,
    category: 'PROCESS',
    descriptionAr: 'تغيير هوية المستخدم للعملية (UID).',
    descriptionEn: 'Allows arbitrary manipulation of process UIDs.',
    exploitVectorAr: 'الترقية للمستخدم root من خلال تغيير UID.',
    exploitVectorEn: 'Instant privilege escalation to root identity.',
  },
  CAP_SETGID: {
    name: 'CAP_SETGID',
    isDangerous: false,
    category: 'PROCESS',
    descriptionAr: 'تغيير هوية المجموعة للعملية (GID).',
    descriptionEn: 'Allows arbitrary manipulation of process GIDs.',
    exploitVectorAr: 'الانضمام لمجموعات إدارية ذات صلاحيات عالية.',
    exploitVectorEn: 'Access sensitive files through privileged group membership.',
  },
  CAP_SETPCAP: {
    name: 'CAP_SETPCAP',
    isDangerous: true,
    category: 'PROCESS',
    descriptionAr: 'تعديل مصفوفة الصلاحيات الممنوحة للعمليات الأبناء.',
    descriptionEn: 'Allows altering process capability bounding sets.',
    exploitVectorAr: 'منح صلاحيات إضافية للعمليات الفرعية.',
    exploitVectorEn: 'Bestow elevated capabilities onto child processes.',
  },
  CAP_AUDIT_WRITE: {
    name: 'CAP_AUDIT_WRITE',
    isDangerous: false,
    category: 'SYSTEM_ADMIN',
    descriptionAr: 'كتابة السجلات في سجلات تدقيق النواة (Kernel Audit Log).',
    descriptionEn: 'Allows writing records to kernel audit logs.',
    exploitVectorAr: 'إغراق سجلات التدقيق بسجلات وهمية.',
    exploitVectorEn: 'Audit log flooding.',
  },
};

export function evaluateContainerCapabilities(
  retainedCaps: LinuxCapability[],
  hasDropAll: boolean
): {
  retainedCount: number;
  dangerousCount: number;
  isHardened: boolean;
  score: number;
  recommendationsAr: string[];
  recommendationsEn: string[];
} {
  const activeCaps = hasDropAll ? [] : retainedCaps;
  let dangerousCount = 0;
  const recommendationsAr: string[] = [];
  const recommendationsEn: string[] = [];

  for (const cap of activeCaps) {
    const info = ALL_CAPABILITIES_MAP[cap];
    if (info && info.isDangerous) {
      dangerousCount++;
      recommendationsAr.push(`إسقاط الصلاحية الخطرة: ${cap} (${info.descriptionAr})`);
      recommendationsEn.push(`Drop dangerous capability: ${cap} (${info.descriptionEn})`);
    }
  }

  if (!hasDropAll) {
    recommendationsAr.unshift('يوصى باستخدام capabilities.drop: ["ALL"] ثم إضافة الصلاحيات الضرورية فقط بدقة.');
    recommendationsEn.unshift('Best practice: Enforce capabilities.drop: ["ALL"] and add back only strictly required caps.');
  }

  const isHardened = hasDropAll || dangerousCount === 0;
  let score = 100;
  if (!hasDropAll) score -= 20;
  score -= dangerousCount * 15;
  score = Math.max(0, Math.min(100, score));

  return {
    retainedCount: activeCaps.length,
    dangerousCount,
    isHardened,
    score,
    recommendationsAr,
    recommendationsEn,
  };
}
