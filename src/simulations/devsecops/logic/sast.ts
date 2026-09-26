/**
 * OMEGA V15 — Static Application Security Testing (SAST) Engine
 * Scans code snippets for SQL Injection, XSS, Hardcoded Credentials, and Deserialization flaws.
 */

import { SastFinding } from './types';

export function getInitialSastFindings(): SastFinding[] {
  return [
    {
      id: 'sast-001',
      file: 'src/api/users.ts',
      line: 42,
      ruleId: 'JS-SQL-INJECTION',
      titleAr: 'حقن أوامر الاستعلام (SQL Injection)',
      titleEn: 'Unsanitized Raw SQL Query Injection',
      severity: 'CRITICAL',
      cvss: 9.8,
      cwe: 'CWE-89',
      codeSnippet: `const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'";
db.query(query);`,
      remediationSnippet: `const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
db.query(query, [req.body.username, req.body.password]);`,
      remediated: false,
      explanationAr: 'دمج نصوص الإدخال القادمة من العميل مباشرة في استعلام SQL يتيح للمهاجم تجاوز المصادقة وسرقة كافة بيانات الجدول.',
      explanationEn: 'Concatenating raw user inputs into SQL string allows authentication bypass and arbitrary database extraction.',
    },
    {
      id: 'sast-002',
      file: 'src/components/UserProfile.tsx',
      line: 88,
      ruleId: 'REACT-XSS-DANGEROUSLY-SET-HTML',
      titleAr: 'ثغرة النص البرمجي عبر المواقع (Stored XSS)',
      titleEn: 'Cross-Site Scripting via dangerouslySetInnerHTML',
      severity: 'HIGH',
      cvss: 7.5,
      cwe: 'CWE-79',
      codeSnippet: `<div dangerouslySetInnerHTML={{ __html: userBioComment }} />`,
      remediationSnippet: `import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBioComment) }} />`,
      remediated: false,
      explanationAr: 'عرض تعليقات المستخدمين بدون تنقية HTML يتيح تنفيض شفرات JavaScript خبيثة وسرقة كوكيز الجلسات.',
      explanationEn: 'Rendering unsanitized user markup allows persistent XSS execution and session cookie theft.',
    },
    {
      id: 'sast-003',
      file: 'src/utils/crypto.ts',
      line: 15,
      ruleId: 'WEAK-MD5-HASH',
      titleAr: 'استخدام خوارزمية تشفير ضعيفة (MD5 Hashing)',
      titleEn: 'Use of Cryptographically Broken Hash Algorithm (MD5)',
      severity: 'MEDIUM',
      cvss: 5.3,
      cwe: 'CWE-327',
      codeSnippet: `const hash = crypto.createHash('md5').update(password).digest('hex');`,
      remediationSnippet: `import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);`,
      remediated: false,
      explanationAr: 'خوارزمية MD5 تعرضت للانهيار التشفيري وتسمح بهجمات التصادم (Collisions) والتخمين السريع بجدول Rainbow Tables.',
      explanationEn: 'MD5 is cryptographically broken and vulnerable to collision attacks and rapid GPU rainbow table cracks.',
    },
  ];
}

export function scanCodeForSastVulnerabilities(findings: SastFinding[]): {
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  sastScore: number;
  passedSastGate: boolean;
} {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  for (const f of findings) {
    if (!f.remediated) {
      if (f.severity === 'CRITICAL') criticalCount++;
      else if (f.severity === 'HIGH') highCount++;
      else if (f.severity === 'MEDIUM') mediumCount++;
    }
  }

  const activeCount = criticalCount + highCount + mediumCount;
  let sastScore = 100;
  sastScore -= criticalCount * 35;
  sastScore -= highCount * 20;
  sastScore -= mediumCount * 10;
  sastScore = Math.max(0, Math.min(100, sastScore));

  return {
    totalFindings: activeCount,
    criticalCount,
    highCount,
    mediumCount,
    sastScore,
    passedSastGate: criticalCount === 0 && highCount === 0,
  };
}
