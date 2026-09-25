/**
 * Web & Application Security: HTTP Security Headers Evaluation Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface HeaderEvaluationFinding {
  headerName: string;
  status: 'STRONG' | 'WEAK' | 'MISSING';
  currentValue?: string;
  recommendedValue: string;
  purposeEn: string;
  purposeAr: string;
  riskIfMissingEn: string;
  riskIfMissingAr: string;
}

export interface SecurityHeadersReport {
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  score: number; // 0 to 100
  findings: HeaderEvaluationFinding[];
  summaryEn: string;
  summaryAr: string;
}

export const RECOMMENDED_SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'; object-src 'none';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-Frame-Options': 'DENY',
};

/**
 * Evaluates the security header posture of an HTTP response
 */
export function evaluateSecurityHeaders(
  headers: Record<string, string>
): SecurityHeadersReport {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }

  const findings: HeaderEvaluationFinding[] = [];
  let totalScore = 0;

  // 1. Content-Security-Policy (Weight: 30)
  const csp = normalized['content-security-policy'];
  if (!csp) {
    findings.push({
      headerName: 'Content-Security-Policy',
      status: 'MISSING',
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy'],
      purposeEn: 'Restricts script origins and mitigates XSS, data exfiltration, and clickjacking.',
      purposeAr: 'تقييد مصادر السكربتات والتصدي لهجمات XSS وتسريب البيانات.',
      riskIfMissingEn: 'Vulnerable to cross-site scripting and unauthorized resource loading.',
      riskIfMissingAr: 'عرضة لثغرات حقن السكربتات وتحميل موارد خارجية غير مصرح بها.',
    });
  } else if (csp.includes("'unsafe-inline'") && csp.includes('script-src')) {
    totalScore += 15;
    findings.push({
      headerName: 'Content-Security-Policy',
      status: 'WEAK',
      currentValue: csp,
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy'],
      purposeEn: 'CSP is present but permits unsafe-inline scripts, weakening XSS mitigation.',
      purposeAr: 'سياسة CSP موجودة ولكنها تسمح بالسكربتات المضمنة، مما يضعف الحماية.',
      riskIfMissingEn: 'Inline script injection may still execute.',
      riskIfMissingAr: 'قد تنجح هجمات حقن السكربتات المضمنة.',
    });
  } else {
    totalScore += 30;
    findings.push({
      headerName: 'Content-Security-Policy',
      status: 'STRONG',
      currentValue: csp,
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Content-Security-Policy'],
      purposeEn: 'Strict CSP policy blocks unauthorized scripts and object embeds.',
      purposeAr: 'سياسة CSP صارمة تحظر السكربتات غير المصرح بها.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  // 2. Strict-Transport-Security (Weight: 20)
  const hsts = normalized['strict-transport-security'];
  if (!hsts) {
    findings.push({
      headerName: 'Strict-Transport-Security',
      status: 'MISSING',
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security'],
      purposeEn: 'Enforces HTTPS encryption and prevents SSL stripping / MITM downgrade attacks.',
      purposeAr: 'فرض تشفير HTTPS ومنع هجمات تجريد SSL وتخفيض الأمان.',
      riskIfMissingEn: 'Traffic may be intercepted via HTTP downgrades.',
      riskIfMissingAr: 'يمكن اعتراض حركة البيانات عبر تحويل الاتصال إلى HTTP غير المشفر.',
    });
  } else if (!hsts.includes('max-age=') || !hsts.includes('includeSubDomains')) {
    totalScore += 10;
    findings.push({
      headerName: 'Strict-Transport-Security',
      status: 'WEAK',
      currentValue: hsts,
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security'],
      purposeEn: 'HSTS is active but lacks long max-age or includeSubDomains directives.',
      purposeAr: 'خاصية HSTS مفعلة ولكنها تفتقر لفترة زمنية طويلة أو شمول النطاقات الفرعية.',
      riskIfMissingEn: 'Subdomains remain vulnerable to plaintext HTTP interception.',
      riskIfMissingAr: 'النطاقات الفرعية تبقى عرضة للاعتراض.',
    });
  } else {
    totalScore += 20;
    findings.push({
      headerName: 'Strict-Transport-Security',
      status: 'STRONG',
      currentValue: hsts,
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Strict-Transport-Security'],
      purposeEn: 'Full 1-year HSTS with subdomains and preload support.',
      purposeAr: 'تفعيل كامل لـ HSTS لمدة عام مع النطاقات الفرعية.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  // 3. X-Content-Type-Options (Weight: 15)
  const nosniff = normalized['x-content-type-options'];
  if (!nosniff || nosniff.toLowerCase() !== 'nosniff') {
    findings.push({
      headerName: 'X-Content-Type-Options',
      status: 'MISSING',
      recommendedValue: 'nosniff',
      purposeEn: 'Prevents MIME-sniffing attacks where browsers execute non-script files as script.',
      purposeAr: 'منع تخمين أنواع وسائط MIME وتشغيل الملفات كنصوص برمجية.',
      riskIfMissingEn: 'User uploads might be executed as script by browser MIME sniffing.',
      riskIfMissingAr: 'قد يقوم المتصفح بتخمين نوع الملف وتشغيله كسكربت خبيث.',
    });
  } else {
    totalScore += 15;
    findings.push({
      headerName: 'X-Content-Type-Options',
      status: 'STRONG',
      currentValue: nosniff,
      recommendedValue: 'nosniff',
      purposeEn: 'nosniff active: browser strictly respects declared Content-Type.',
      purposeAr: 'nosniff مفعل: المتصفح يلتزم حصراً بنوع المحتوى المصرح به.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  // 4. X-Frame-Options / Frame-Ancestors (Weight: 15)
  const xfo = normalized['x-frame-options'];
  if (!xfo && (!csp || !csp.includes('frame-ancestors'))) {
    findings.push({
      headerName: 'X-Frame-Options',
      status: 'MISSING',
      recommendedValue: 'DENY',
      purposeEn: 'Prevents Clickjacking by disallowing page embedding in external iframes.',
      purposeAr: 'منع هجمات خطف النقرات (Clickjacking) بحظر تضمين الصفحة في iframes خارجية.',
      riskIfMissingEn: 'Attacker can overlay transparent iframe over target page.',
      riskIfMissingAr: 'يمكن للمهاجم تضمين الصفحة في إطار شفاف لخداع المستخدم.',
    });
  } else {
    totalScore += 15;
    findings.push({
      headerName: 'X-Frame-Options',
      status: 'STRONG',
      currentValue: xfo || 'frame-ancestors defined in CSP',
      recommendedValue: 'DENY',
      purposeEn: 'Frame embedding blocked or restricted to same origin.',
      purposeAr: 'تضمين الصفحة في إطارات محظور أو مقيد لنفس النطاق.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  // 5. Referrer-Policy (Weight: 10)
  const refPol = normalized['referrer-policy'];
  if (!refPol) {
    findings.push({
      headerName: 'Referrer-Policy',
      status: 'MISSING',
      recommendedValue: 'strict-origin-when-cross-origin',
      purposeEn: 'Prevents leaking sensitive URL query parameters to external origins.',
      purposeAr: 'منع تسريب معلمات الروابط الحساسة إلى خوادم خارجية.',
      riskIfMissingEn: 'Sensitive URL parameters (tokens, IDs) leaked in Referer header.',
      riskIfMissingAr: 'تسريب معلمات الروابط الحساسة في ترويسة Referer.',
    });
  } else {
    totalScore += 10;
    findings.push({
      headerName: 'Referrer-Policy',
      status: 'STRONG',
      currentValue: refPol,
      recommendedValue: 'strict-origin-when-cross-origin',
      purposeEn: 'Referrer policy limits cross-origin URL metadata leakage.',
      purposeAr: 'سياسة الإحالة تحد من تسريب بيانات الروابط للخوادم الخارجية.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  // 6. Permissions-Policy (Weight: 10)
  const permPol = normalized['permissions-policy'];
  if (!permPol) {
    findings.push({
      headerName: 'Permissions-Policy',
      status: 'MISSING',
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Permissions-Policy'],
      purposeEn: 'Disables access to browser hardware APIs (camera, microphone, geolocation).',
      purposeAr: 'تعطيل الوصول إلى عتاد المتصفح الحساس كالكاميرا والميكروفون وتحديد الموقع.',
      riskIfMissingEn: 'Embedded third-party scripts could invoke sensitive device APIs.',
      riskIfMissingAr: 'قد تستدعي السكربتات المضمنة واجهات العتاد الحساسة دون علم المستخدم.',
    });
  } else {
    totalScore += 10;
    findings.push({
      headerName: 'Permissions-Policy',
      status: 'STRONG',
      currentValue: permPol,
      recommendedValue: RECOMMENDED_SECURITY_HEADERS['Permissions-Policy'],
      purposeEn: 'Hardware API permissions locked down.',
      purposeAr: 'صلاحيات العتاد محكمة الإغلاق.',
      riskIfMissingEn: 'N/A',
      riskIfMissingAr: 'لا يوجد',
    });
  }

  let grade: SecurityHeadersReport['grade'] = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 65) grade = 'B';
  else if (totalScore >= 50) grade = 'C';

  return {
    grade,
    score: totalScore,
    findings,
    summaryEn: `Security Headers Posture: Grade ${grade} (${totalScore}/100)`,
    summaryAr: `تقييم الترويسات الأمنية: الدرجة ${grade} (${totalScore}/100)`,
  };
}
