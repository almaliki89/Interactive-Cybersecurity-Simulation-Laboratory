/**
 * OMEGA V15 — DevSecOps & Supply Chain Anti-Cheat Engine
 * Validates genuine user state configuration changes and enforces non-bypassable mastery criteria.
 */

import { DevSecOpsAntiCheatFlags } from './types';

export function getInitialDevSecOpsAntiCheatFlags(): DevSecOpsAntiCheatFlags {
  return {
    sastVulnerabilitiesFixed: false,
    scaPackagesUpdatedAndLicensesVerified: false,
    hardcodedSecretsScrubbedFromGitHistory: false,
    terraformTemplatesHardenedAndOpenPortsClosed: false,
    ciSecurityGatesEnforcedWithZeroBypass: false,
    sbomGeneratedAndSlsaAttested: false,
    infrastructureDriftRemediated: false,
  };
}

export function evaluateDevSecOpsMasterChallenge(flags: DevSecOpsAntiCheatFlags): {
  isMastered: boolean;
  score: number;
  completedTasks: number;
  totalTasks: number;
  remainingTasksAr: string[];
  remainingTasksEn: string[];
} {
  const criteria = [
    {
      key: 'sastVulnerabilitiesFixed',
      passed: flags.sastVulnerabilitiesFixed,
      descAr: 'إصلاح ثغرات الكود المصدري (SQLi & XSS) والتحقق عبرSemgrep SAST',
      descEn: 'Remediate source code vulnerabilities (SQLi & XSS) verified by Semgrep SAST',
    },
    {
      key: 'scaPackagesUpdatedAndLicensesVerified',
      passed: flags.scaPackagesUpdatedAndLicensesVerified,
      descAr: 'تحديث التبعيات البرمجية وإزالة الحزم الخبيثة وترخيص AGPL',
      descEn: 'Update vulnerable packages, eliminate typosquatting malware & AGPL copyleft violations',
    },
    {
      key: 'hardcodedSecretsScrubbedFromGitHistory',
      passed: flags.hardcodedSecretsScrubbedFromGitHistory,
      descAr: 'تطهير أسرار ومفاتيح API من سجلات Git وتغيير المفاتيح المسربة',
      descEn: 'Scrub hardcoded credentials from Git history and rotate leaked API tokens',
    },
    {
      key: 'terraformTemplatesHardenedAndOpenPortsClosed',
      passed: flags.terraformTemplatesHardenedAndOpenPortsClosed,
      descAr: 'إغلاق منافذ SSH المكشوفة وتفعيل تشفير S3 KMS في قوالب Terraform',
      descEn: 'Harden Terraform templates: close 0.0.0.0/0 SSH ingress and enforce S3 SSE-KMS',
    },
    {
      key: 'ciSecurityGatesEnforcedWithZeroBypass',
      passed: flags.ciSecurityGatesEnforcedWithZeroBypass,
      descAr: 'تفعيل بوابات الفحص الإلزامية في خط CI/CD وحظر التجاوز عند الفشل',
      descEn: 'Enforce mandatory CI/CD security quality gates with zero bypass permission',
    },
    {
      key: 'sbomGeneratedAndSlsaAttested',
      passed: flags.sbomGeneratedAndSlsaAttested,
      descAr: 'توليد جرد SBOM بصيغة CycloneDX والتحقق من شهادة SLSA Level 3 Provenance',
      descEn: 'Generate CycloneDX SBOM inventory and verify SLSA Level 3 provenance attestation',
    },
    {
      key: 'infrastructureDriftRemediated',
      passed: flags.infrastructureDriftRemediated,
      descAr: 'اكتشاف وإعادة مزامنة انحراف البنية التحتية (Infrastructure Drift)',
      descEn: 'Detect and auto-remediate out-of-band cloud infrastructure drift vs Terraform state',
    },
  ];

  let completedTasks = 0;
  const remainingTasksAr: string[] = [];
  const remainingTasksEn: string[] = [];

  for (const c of criteria) {
    if (c.passed) {
      completedTasks++;
    } else {
      remainingTasksAr.push(c.descAr);
      remainingTasksEn.push(c.descEn);
    }
  }

  const totalTasks = criteria.length;
  const score = Math.round((completedTasks / totalTasks) * 100);
  const isMastered = completedTasks === totalTasks;

  return {
    isMastered,
    score,
    completedTasks,
    totalTasks,
    remainingTasksAr,
    remainingTasksEn,
  };
}
