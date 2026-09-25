/**
 * Web & Application Security: Secure Multi-Tier Architecture Logic
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface ArchitectureLayer {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'Edge' | 'Network' | 'Gateway' | 'Application' | 'Data' | 'Security';
  assignedControls: string[];
}

export interface ArchitectureControlDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  validLayers: string[];
  mandatoryForEnterprise: boolean;
}

export const ARCHITECTURE_CONTROLS: ArchitectureControlDefinition[] = [
  {
    id: 'ctrl-ddos-edge',
    nameEn: 'DDoS Mitigation & Edge Caching',
    nameAr: 'حماية DDoS والتخزين المؤقت الطرفي',
    descriptionEn: 'Absorbs volumetric network floods before hitting origin infrastructure.',
    descriptionAr: 'امتصاص الهجمات الحجمية قبل وصولها إلى خوادم البنية التحتية.',
    validLayers: ['layer-cdn-edge'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-waf-inspection',
    nameEn: 'Web Application Firewall (WAF) Rules',
    nameAr: 'قواعد جدار حماية تطبيقات الويب (WAF)',
    descriptionEn: 'Inspects HTTP payloads for SQLi, XSS, and known exploit signatures.',
    descriptionAr: 'فحص حمولات HTTP للكشف عن هجمات الحقن والأنماط الخبيثة.',
    validLayers: ['layer-waf'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-tls-termination',
    nameEn: 'TLS 1.3 Termination & HSTS',
    nameAr: 'إنهاء تشفير TLS 1.3 وفرض HSTS',
    descriptionEn: 'Encrypts in-flight transit and offloads cryptography from workers.',
    descriptionAr: 'تشفير الاتصال أثناء النقل وتفريغ معالجة التشفير عن الخوادم.',
    validLayers: ['layer-reverse-proxy', 'layer-cdn-edge'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-rate-limiting',
    nameEn: 'API Gateway Rate Limiting',
    nameAr: 'تقييد معدل الطلبات في بوابة API',
    descriptionEn: 'Prevents brute force, credential stuffing, and resource exhaustion.',
    descriptionAr: 'منع هجمات التخمين الشامل واستنزاف الموارد.',
    validLayers: ['layer-waf', 'layer-reverse-proxy', 'layer-api-gateway'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-input-validation',
    nameEn: 'Strict Input Schema Validation',
    nameAr: 'التحقق الصارم من بنية المدخلات',
    descriptionEn: 'Validates type, length, and format of untrusted request payloads.',
    descriptionAr: 'التحقق من أنواع وأطوال وصيغ بيانات المستخدم غير الموثوقة.',
    validLayers: ['layer-web-app', 'layer-api-gateway'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-rbac-ownership',
    nameEn: 'RBAC & Object Ownership Authorization',
    nameAr: 'التحكم بالوصول حسب الأدوار وملكية الكائنات',
    descriptionEn: 'Enforces business authorization and stops IDOR / BOLA vulnerabilities.',
    descriptionAr: 'فرض الصلاحيات ومنع ثغرات الوصول غير المصرح به للكائنات.',
    validLayers: ['layer-web-app', 'layer-api-gateway'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-parameterized-db',
    nameEn: 'Parameterized Prepared Statements',
    nameAr: 'الاستعلامات المعلمية المجهزة لقاعدة البيانات',
    descriptionEn: 'Completely separates SQL code from user data in database transactions.',
    descriptionAr: 'فصل أوامر SQL عن بيانات المستخدم في استعلامات قاعدة البيانات.',
    validLayers: ['layer-database', 'layer-web-app'],
    mandatoryForEnterprise: true,
  },
  {
    id: 'ctrl-audit-siem',
    nameEn: 'Centralized Security Telemetry & SIEM Forwarding',
    nameAr: 'سجلات التدقيق المركزية والتوجيه لـ SIEM',
    descriptionEn: 'Sends real-time security events, auth failures, and admin actions to SOC.',
    descriptionAr: 'إرسال سجلات الأمان وأحداث المصادقة لمركز العمليات الأمنية (SOC).',
    validLayers: ['layer-logging-siem'],
    mandatoryForEnterprise: true,
  },
];

export interface ArchitectureEvaluationResult {
  valid: boolean;
  score: number;
  missingControls: string[];
  misplacedControls: { controlId: string; layerId: string; reasonEn: string; reasonAr: string }[];
  layerHealth: Record<string, { healthy: boolean; activeControlsCount: number }>;
  summaryEn: string;
  summaryAr: string;
}

/**
 * Validates whether defensive controls are placed at the correct architectural tiers
 */
export function evaluateArchitecturePosture(
  layers: ArchitectureLayer[]
): ArchitectureEvaluationResult {
  const missingControls: string[] = [];
  const misplacedControls: ArchitectureEvaluationResult['misplacedControls'] = [];
  const layerHealth: Record<string, { healthy: boolean; activeControlsCount: number }> = {};

  const assignedControlIds = new Set<string>();
  layers.forEach((l) => {
    l.assignedControls.forEach((c) => assignedControlIds.add(c));
    layerHealth[l.id] = { healthy: l.assignedControls.length > 0, activeControlsCount: l.assignedControls.length };
  });

  // Check misplaced controls
  for (const layer of layers) {
    for (const ctrlId of layer.assignedControls) {
      const def = ARCHITECTURE_CONTROLS.find((c) => c.id === ctrlId);
      if (def && !def.validLayers.includes(layer.id)) {
        misplacedControls.push({
          controlId: ctrlId,
          layerId: layer.id,
          reasonEn: `Control '${def.nameEn}' cannot be effectively enforced at layer '${layer.nameEn}'. Valid layers: [${def.validLayers.join(', ')}].`,
          reasonAr: `الضابط الأمني '${def.nameAr}' لا يمكن فرضه بفعالية في الطبقة '${layer.nameAr}'.`,
        });
      }
    }
  }

  // Check mandatory controls
  for (const def of ARCHITECTURE_CONTROLS) {
    if (def.mandatoryForEnterprise && !assignedControlIds.has(def.id)) {
      missingControls.push(def.id);
    }
  }

  const totalMandatory = ARCHITECTURE_CONTROLS.filter((c) => c.mandatoryForEnterprise).length;
  const activeMandatory = totalMandatory - missingControls.length;
  const penalties = misplacedControls.length * 10;
  const rawScore = Math.max(0, Math.round((activeMandatory / totalMandatory) * 100) - penalties);

  const isValid = missingControls.length === 0 && misplacedControls.length === 0;

  return {
    valid: isValid,
    score: rawScore,
    missingControls,
    misplacedControls,
    layerHealth,
    summaryEn: isValid
      ? 'Defense-in-Depth Architecture Verified: All security tiers properly hardened.'
      : `Architecture Deficiencies: ${missingControls.length} mandatory control(s) missing, ${misplacedControls.length} misplaced.`,
    summaryAr: isValid
      ? 'تم التحقق من بنية الدفاع في العمق: جميع الطبقات الأمنية محكمة ومضبوطة بالشكل الصحيح.'
      : `نقص في البنية الأمنية: ينقص ${missingControls.length} ضابط إلزامي، وهناك ${misplacedControls.length} في طبقات غير ملائمة.`,
  };
}
