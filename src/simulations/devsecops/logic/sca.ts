/**
 * OMEGA V15 — Software Composition Analysis (SCA) & Dependency Vulnerability Engine
 * Scans third-party packages for CVEs, typosquatting attacks, and copyleft open-source licenses.
 */

import { ScaDependency } from './types';

export function getInitialDependencies(): ScaDependency[] {
  return [
    {
      id: 'dep-axios',
      packageName: 'axios',
      currentVersion: '0.21.1',
      patchedVersion: '1.7.4',
      license: 'MIT',
      licenseCompliant: true,
      vulnerabilityCve: 'CVE-2023-45857',
      severity: 'HIGH',
      cvss: 7.5,
      descriptionAr: 'ثغرة Server-Side Request Forgery (SSRF) في مكتبة axios عند معالجة التوجيهات المفتوحة.',
      descriptionEn: 'Axios vulnerable to Server-Side Request Forgery (SSRF) via absolute URL redirect bypass.',
      isTyposquatting: false,
      remediated: false,
    },
    {
      id: 'dep-express-typo',
      packageName: 'expresss-js', // Typosquatting package!
      currentVersion: '4.18.0',
      patchedVersion: 'express@4.19.2',
      license: 'UNLICENSED',
      licenseCompliant: false,
      vulnerabilityCve: 'MALICIOUS-NPM-TYPOSQUAT',
      severity: 'CRITICAL',
      cvss: 9.8,
      descriptionAr: 'برمجية خبيثة اننتحالية (Typosquatting) سرقت أسرار البيئة وارسلتهما لسيرفر المهاجم.',
      descriptionEn: 'Malicious typosquatting package masquerading as express. Harvests process.env secrets.',
      isTyposquatting: true,
      remediated: false,
    },
    {
      id: 'dep-copyleft-lib',
      packageName: 'gpl-utils-parser',
      currentVersion: '1.0.0',
      patchedVersion: 'apache-parser@2.0.0',
      license: 'AGPL-3.0',
      licenseCompliant: false, // Non-compliant copyleft license for commercial product
      severity: 'MEDIUM',
      cvss: 5.0,
      descriptionAr: 'ترخيص AGPL-3.0 يحظر الاستخدام التجاري المغلق ويجبر الشركة على فتح شفرتها المصدرية للعامة.',
      descriptionEn: 'AGPL-3.0 copyleft license imposes viral source code disclosure obligations on SaaS product.',
      isTyposquatting: false,
      remediated: false,
    },
  ];
}

export function scanScaDependencies(deps: ScaDependency[]): {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  typosquattingCount: number;
  licenseViolationsCount: number;
  scaScore: number;
  passedScaGate: boolean;
} {
  let criticalCount = 0;
  let highCount = 0;
  let typosquattingCount = 0;
  let licenseViolationsCount = 0;

  for (const dep of deps) {
    if (!dep.remediated) {
      if (dep.severity === 'CRITICAL' || dep.isTyposquatting) criticalCount++;
      else if (dep.severity === 'HIGH') highCount++;

      if (dep.isTyposquatting) typosquattingCount++;
      if (!dep.licenseCompliant) licenseViolationsCount++;
    }
  }

  const activeCount = criticalCount + highCount;
  let scaScore = 100;
  scaScore -= criticalCount * 40;
  scaScore -= highCount * 20;
  scaScore -= licenseViolationsCount * 15;
  scaScore = Math.max(0, Math.min(100, scaScore));

  return {
    totalVulnerabilities: activeCount,
    criticalCount,
    highCount,
    typosquattingCount,
    licenseViolationsCount,
    scaScore,
    passedScaGate: criticalCount === 0 && highCount === 0 && licenseViolationsCount === 0,
  };
}
