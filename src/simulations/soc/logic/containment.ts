/**
 * OMEGA V11 — Containment Decision & Business Impact Evaluation Engine
 * Evaluates defensive response actions for security effectiveness and business proportionality.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type ContainmentActionType =
  | 'DISABLE_USER_ACCOUNT'
  | 'REVOKE_ACTIVE_SESSIONS'
  | 'ISOLATE_HOST_NETWORK'
  | 'BLOCK_SOURCE_IP'
  | 'RESTRICT_FIREWALL_ACL'
  | 'REVERT_PRIVILEGED_GROUP'
  | 'ENABLE_DEBUG_AUDIT_LOGGING'
  | 'SHUTDOWN_ENTIRE_SERVER'
  | 'DISABLE_FINANCE_DEPARTMENT'
  | 'BLOCK_ALL_INBOUND_TRAFFIC';

export interface ContainmentOption {
  id: ContainmentActionType;
  nameEn: string;
  nameAr: string;
  category: 'IDENTITY' | 'ENDPOINT' | 'NETWORK' | 'APPLICATION' | 'OVERLY_DESTRUCTIVE';
  descriptionEn: string;
  descriptionAr: string;
  securityBenefitEn: string;
  securityBenefitAr: string;
  businessImpactEn: string;
  businessImpactAr: string;
  isProportional: boolean;
  isOverlyDestructive: boolean;
}

export interface ContainmentDecisionResult {
  actionId: ContainmentActionType;
  executed: boolean;
  effectiveForThreat: boolean;
  businessContinuityPreserved: boolean;
  proportionalityScore: number; // 0 to 100
  feedbackEn: string;
  feedbackAr: string;
}

export const CONTAINMENT_ACTIONS: ContainmentOption[] = [
  {
    id: 'REVOKE_ACTIVE_SESSIONS',
    nameEn: 'Revoke User Active Sessions & Rotate Tokens',
    nameAr: 'إلغاء الجلسات النشطة للمستخدم وتدوير الرموز',
    category: 'IDENTITY',
    descriptionEn: 'Invalidates existing Kerberos tickets, web tokens, and browser session cookies for the suspect user.',
    descriptionAr: 'إبطال تذاكر Kerberos والرموز النشطة وكوكيز الجلسة للمستخدم المشتبه به.',
    securityBenefitEn: 'Immediately terminates active attacker session hijacking without locking the employee out permanently.',
    securityBenefitAr: 'إنهاء جلسة المهاجم النشطة فوراً دون حرمان الموظف من العمل مستقبلاً.',
    businessImpactEn: 'Minimal: User will simply need to re-authenticate cleanly via MFA.',
    businessImpactAr: 'تأثير طفيف: سيتطلب من المستخدم فقط إعادة المصادقة باستخدام التحقق الثنائي.',
    isProportional: true,
    isOverlyDestructive: false,
  },
  {
    id: 'REVERT_PRIVILEGED_GROUP',
    nameEn: 'Revert Unauthorized Group Membership (Remove from Domain Admins)',
    nameAr: 'استرجاع عضوية المجموعات (إزالة الحساب من مسؤولي النطاق)',
    category: 'IDENTITY',
    descriptionEn: 'Removes the compromised account from elevated Active Directory administrative groups.',
    descriptionAr: 'إزالة الحساب المخترق من مجموعات الإدارة المميزة في Active Directory.',
    securityBenefitEn: 'Closes privilege escalation backdoor immediately.',
    securityBenefitAr: 'إغلاق الباب الخلفي لرفع الصلاحيات بشكل فوري.',
    businessImpactEn: 'Zero business impact: Standard users do not require Domain Admin rights.',
    businessImpactAr: 'لا يوجد تأثير سلبي: المستخدمون العاديون لا يحتاجون لصلاحيات Domain Admin.',
    isProportional: true,
    isOverlyDestructive: false,
  },
  {
    id: 'ISOLATE_HOST_NETWORK',
    nameEn: 'Isolate Suspect Workstation from Internal LAN (Keep SOC Agent)',
    nameAr: 'عزل الجهاز المشتبه به عن الشبكة الداخلية (مع إبقاء قناة SOC)',
    category: 'ENDPOINT',
    descriptionEn: 'Applies host firewall policy blocking peer-to-peer traffic while preserving EDR telemetry.',
    descriptionAr: 'تطبيق جدار حماية محلي يمنع الاتصال الداخلي مع الحفاظ على اتصال وكيل SOC.',
    securityBenefitEn: 'Halts lateral movement to other internal workstations and servers.',
    securityBenefitAr: 'منع الانتشار الأفقي نحو باقي الأجهزة والخوادم في الشبكة الداخلية.',
    businessImpactEn: 'Isolated to single suspect machine; other department users continue unaffected.',
    businessImpactAr: 'يقتصر التأثير على جهاز واحد مشتبه به؛ بينما يستمر باقي القسم في العمل بشكل طبيعي.',
    isProportional: true,
    isOverlyDestructive: false,
  },
  {
    id: 'BLOCK_SOURCE_IP',
    nameEn: 'Block External Threat IP at Perimeter Firewall',
    nameAr: 'حظر عنوان IP الخارجي المهاجم في جدار الحماية المحيطي',
    category: 'NETWORK',
    descriptionEn: 'Drops traffic originating from the malicious public IP address at edge boundary.',
    descriptionAr: 'إسقاط حزم البيانات القادمة من عنوان IP العام المهاجم على أطراف الشبكة.',
    securityBenefitEn: 'Stops external brute-force and C2 command channels.',
    securityBenefitAr: 'إيقاف محاولات التخمين وقنوات التحكم من الخارج.',
    businessImpactEn: 'Zero internal disruption.',
    businessImpactAr: 'لا يوجد أي تأثير على العمليات الداخلية المشروعة.',
    isProportional: true,
    isOverlyDestructive: false,
  },
  {
    id: 'ENABLE_DEBUG_AUDIT_LOGGING',
    nameEn: 'Enable Enhanced High-Fidelity Forensic Audit Logging',
    nameAr: 'تفعيل التسجيل الأمني الموسع عالي الدقة للتحقيق الجنائي',
    category: 'APPLICATION',
    descriptionEn: 'Turns on verbose audit events for database queries, Kerberos TGS requests, and API endpoints.',
    descriptionAr: 'تفعيل السجلات التفصيلية لاستعلامات قواعد البيانات وطلبات Kerberos وبوابات API.',
    securityBenefitEn: 'Provides forensic clarity during ongoing investigation.',
    securityBenefitAr: 'توفير وضوح جنائي وأدلة شاملة أثناء التحقيق المستمر.',
    businessImpactEn: 'Negligible computing overhead.',
    businessImpactAr: 'استهلاك طفيف وغير مؤثر لموارد المعالجة.',
    isProportional: true,
    isOverlyDestructive: false,
  },

  // Overly Destructive Actions (Anti-Cheat / Learning Examples)
  {
    id: 'SHUTDOWN_ENTIRE_SERVER',
    nameEn: 'Power Down Core Finance Application Server (APP-SRV-01)',
    nameAr: 'إيقاف تشغيل خادم تطبيقات المالية الرئيسي بالكامل',
    category: 'OVERLY_DESTRUCTIVE',
    descriptionEn: 'Forcefully shuts down the primary production server hosting enterprise portals.',
    descriptionAr: 'إيقاف تشغيل الخادم الإنتاجي الرئيسي المستضيف لبوابات المؤسسة قسراً.',
    securityBenefitEn: 'Stops threat activity, but breaks all enterprise operations.',
    securityBenefitAr: 'يوقف نشاط التهديد، ولكنه يعطل كافة عمليات المؤسسة الحيوية.',
    businessImpactEn: 'CRITICAL FAILURE: Customer Portal and Finance ledger completely down!',
    businessImpactAr: 'فشل حرج: تعطل كامل لبوابة العملاء ونظام المحاسبة للشركة!',
    isProportional: false,
    isOverlyDestructive: true,
  },
  {
    id: 'DISABLE_FINANCE_DEPARTMENT',
    nameEn: 'Disable All Finance Department User Accounts',
    nameAr: 'تعطيل حسابات جميع موظفي الإدارة المالية دفعة واحدة',
    category: 'OVERLY_DESTRUCTIVE',
    descriptionEn: 'Locks out every employee in the finance organization indiscriminately.',
    descriptionAr: 'قفل حسابات جميع موظفي المالية دون تمييز.',
    securityBenefitEn: 'Overkill measure.',
    securityBenefitAr: 'إجراء مفرط وغير مبرر.',
    businessImpactEn: 'CRITICAL FAILURE: Entire payroll and invoicing pipeline halted.',
    businessImpactAr: 'فشل حرج: توقف كامل لرواتب وفواتير الشركة.',
    isProportional: false,
    isOverlyDestructive: true,
  },
  {
    id: 'BLOCK_ALL_INBOUND_TRAFFIC',
    nameEn: 'Drop All Inbound Traffic Across Company Firewalls',
    nameAr: 'حظر جميع حزم الاتصال الواردة للشركة بالكامل',
    category: 'OVERLY_DESTRUCTIVE',
    descriptionEn: 'Completely disconnects the enterprise from the Internet.',
    descriptionAr: 'فصل المؤسسة بالكامل عن شبكة الإنترنت العالمية.',
    securityBenefitEn: 'Stops remote attackers, but disconnects all legitimate customers.',
    securityBenefitAr: 'يمنع المهاجم، ولكنه يقطع الاتصال عن جميع العملاء والموظفين.',
    businessImpactEn: 'CRITICAL OUTAGE: Complete corporate blackout.',
    businessImpactAr: 'انقطاع كارثي: شلل تام لخدمات الشركة.',
    isProportional: false,
    isOverlyDestructive: true,
  },
];

/**
 * Evaluates containment decisions
 */
export function evaluateContainmentDecision(
  selectedActionIds: ContainmentActionType[]
): ContainmentDecisionResult[] {
  return selectedActionIds.map((actionId) => {
    const option = CONTAINMENT_ACTIONS.find((a) => a.id === actionId);
    if (!option) {
      return {
        actionId,
        executed: false,
        effectiveForThreat: false,
        businessContinuityPreserved: false,
        proportionalityScore: 0,
        feedbackEn: 'Unknown containment action.',
        feedbackAr: 'إجراء عزل غير معروف.',
      };
    }

    if (option.isOverlyDestructive) {
      return {
        actionId,
        executed: true,
        effectiveForThreat: true,
        businessContinuityPreserved: false,
        proportionalityScore: 0,
        feedbackEn: `FAIL: Overly destructive response (${option.nameEn}). Broke legitimate business continuity.`,
        feedbackAr: `فشل: إجراء مفرط التدمير (${option.nameAr}). أدى لتعطيل استمرارية أعمال الشركة.`,
      };
    }

    return {
      actionId,
      executed: true,
      effectiveForThreat: true,
      businessContinuityPreserved: true,
      proportionalityScore: 100,
      feedbackEn: `PASS: Proportional containment applied (${option.nameEn}). Security threat neutralized while preserving business services.`,
      feedbackAr: `نجاح: تم تطبيق إجراء عزل متناسب ومدروس (${option.nameAr}). تم احتواء التهديد مع الحفاظ على الخدمات.`,
    };
  });
}
