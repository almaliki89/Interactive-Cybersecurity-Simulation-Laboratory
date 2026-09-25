/**
 * OMEGA V12 — Containment Tradeoffs & Forensic Preservation Logic
 * Evaluates defensive containment choices against security, business continuity, and forensic integrity.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface ForensicContainmentOption {
  id: string;
  actionEn: string;
  actionAr: string;
  securityEffectEn: string;
  securityEffectAr: string;
  businessImpactEn: string;
  businessImpactAr: string;
  forensicImpactEn: string;
  forensicImpactAr: string;
  destroysVolatileMemory: boolean;
  isProportional: boolean;
}

export const CONTAINMENT_OPTIONS_CATALOG: ForensicContainmentOption[] = [
  {
    id: 'ACT-POWER-OFF',
    actionEn: 'Power off system immediately (Hard Shutdown)',
    actionAr: 'إيقاف تشغيل النظام فوراً (إيقاف إجباري)',
    securityEffectEn: 'Stops all malicious network & process activity instantly.',
    securityEffectAr: 'يوقف كافة الأنشطة المشبوهة والشبكية فوراً.',
    businessImpactEn: 'Immediate downtime for host FIN-WS-01.',
    businessImpactAr: 'توقف فوري عن العمل للجهاز FIN-WS-01.',
    forensicImpactEn: 'CRITICAL: Destroys volatile RAM memory evidence permanently!',
    forensicImpactAr: 'حرج: يدمر أدلة الذاكرة العشوائية المؤقتة RAM للابد!',
    destroysVolatileMemory: true,
    isProportional: false,
  },
  {
    id: 'ACT-ISOLATE-NETWORK',
    actionEn: 'Isolate host network adapter (Keep powered on)',
    actionAr: 'عزل كارت الشبكة للجهاز (مع إبقائه يعمل)',
    securityEffectEn: 'Blocks C2 and lateral movement while preserving process state.',
    securityEffectAr: 'يمنع الاتصال الخارجي والتحرك الجانبي مع الحفاظ على حالة العمليات.',
    businessImpactEn: 'Host isolated from corporate network; user sara offline.',
    businessImpactAr: 'عزل الجهاز عن شبكة الشركة؛ المستخدمة سارة أوفلاين.',
    forensicImpactEn: 'SAFE: Preserves volatile RAM memory for forensic acquisition.',
    forensicImpactAr: 'آمن: يحافظ على الذاكرة المؤقتة RAM للاستحواذ الجنائي.',
    destroysVolatileMemory: false,
    isProportional: true,
  },
  {
    id: 'ACT-REVOKE-SARA-SESSIONS',
    actionEn: 'Revoke sara active Kerberos & OAuth sessions & reset password',
    actionAr: 'إلغاء جلسات كيربيروس الفعالة للمستخدمة سارة وإعادة ضبط كلمة السر',
    securityEffectEn: 'Terminates unauthorized access using compromised sara identity.',
    securityEffectAr: 'ينهي الوصول غير المصرح به باستخدام هوية سارة المخترقة.',
    businessImpactEn: 'User sara must re-authenticate after identity verification.',
    businessImpactAr: 'يتوجب على سارة إعادة المصادقة بعد التحقق من الهوية.',
    forensicImpactEn: 'NO IMPACT: Preserves endpoint and server evidence logs.',
    forensicImpactAr: 'لا تأثير: يحافظ على سجلات أدلة الأجهزة والخوادم.',
    destroysVolatileMemory: false,
    isProportional: true,
  },
  {
    id: 'ACT-REVERT-PRIVILEGE',
    actionEn: 'Revert unauthorized Domain Admin group membership for sara',
    actionAr: 'إلغاء إضافة سارة لمجموعة Domain Admins وإعادتها لوضعها الطبيعي',
    securityEffectEn: 'Removes elevated administrative privileges from attacker.',
    securityEffectAr: 'يزيل الصلاحيات الإدارية المرتفعة عن المهاجم.',
    businessImpactEn: 'None to normal business operations; restores privilege boundaries.',
    businessImpactAr: 'لا يوجد تأثير على الأعمال؛ يعيد صلاحيات النظام لوضعها السليم.',
    forensicImpactEn: 'NO IMPACT: AD audit log of change preserved in security events.',
    forensicImpactAr: 'لا تأثير: محفوط في سجلات تدقيق الدليل النشط.',
    destroysVolatileMemory: false,
    isProportional: true,
  },
  {
    id: 'ACT-STOP-MALICIOUS-PROC',
    actionEn: 'Terminate suspicious child process (pid 4912 / cmd.exe)',
    actionAr: 'إنهاء العملية المشبوهة (pid 4912 / cmd.exe)',
    securityEffectEn: 'Halts active interactive shell command execution.',
    securityEffectAr: 'يوقف تنفيذ الأوامر التفاعلية الجارية.',
    businessImpactEn: 'None; target process is unauthorized.',
    businessImpactAr: 'لا يوجد؛ العملية المستهدفة غير مصرح بها.',
    forensicImpactEn: 'SAFE if process snapshot & memory acquired first.',
    forensicImpactAr: 'آمن بشرط أخذ لقطة من الذاكرة والعمليات أولاً.',
    destroysVolatileMemory: false,
    isProportional: true,
  },
];

export function evaluateContainmentOption(optionId: string): ForensicContainmentOption | undefined {
  return CONTAINMENT_OPTIONS_CATALOG.find((o) => o.id === optionId);
}
