/**
 * OMEGA V15 — CI/CD Security Quality Gates Engine
 * Evaluates SAST, SCA, Secret Scanning, and IaC gate status to block vulnerable builds.
 */

import { CiCdPipelineConfig, PipelineStageJob } from './types';

export function getInitialPipelineConfig(): CiCdPipelineConfig {
  return {
    id: 'pipe-production-build',
    name: 'Production DevSecOps Deployment Pipeline',
    repository: 'github.com/nexora/enterprise-platform',
    branch: 'main',
    requireSastGate: true,
    requireScaGate: true,
    requireSecretScanGate: true,
    requireIacScanGate: true,
    requireContainerScanGate: true,
    requireCosignSignatureGate: true,
    allowBypassOnFailure: false, // Strict zero-trust CI
  };
}

export function evaluatePipelineJobs(
  config: CiCdPipelineConfig,
  findings: { sastCriticals: number; scaCriticals: number; secretsLeaked: number; iacCriticals: number }
): PipelineStageJob[] {
  const jobs: PipelineStageJob[] = [
    {
      id: 'job-lint',
      name: 'ESLint & TypeScript Static Check',
      type: 'LINT',
      status: 'PASSED',
      gateEnabled: true,
      findingsCount: 0,
      logsAr: 'تم اجتياز فحوصات البناء وإعراب الكود بنجاح دون أخطاء.',
      logsEn: 'TypeScript compilation and ESLint completed with 0 errors.',
    },
    {
      id: 'job-sast',
      name: 'SAST Code Security Scan (Semgrep)',
      type: 'SAST',
      status: findings.sastCriticals > 0 && config.requireSastGate ? 'FAILED' : 'PASSED',
      gateEnabled: config.requireSastGate,
      findingsCount: findings.sastCriticals,
      logsAr: findings.sastCriticals > 0 ? `فشل البناء: تم رصد ${findings.sastCriticals} ثغرة حرجة (SQLi / XSS).` : 'اجتاز فحص SAST بنجاح.',
      logsEn: findings.sastCriticals > 0 ? `Build Failed: Detected ${findings.sastCriticals} critical SAST flaws.` : 'SAST scan passed clean.',
    },
    {
      id: 'job-sca',
      name: 'SCA Dependency & License Scan',
      type: 'SCA',
      status: findings.scaCriticals > 0 && config.requireScaGate ? 'FAILED' : 'PASSED',
      gateEnabled: config.requireScaGate,
      findingsCount: findings.scaCriticals,
      logsAr: findings.scaCriticals > 0 ? `فشل البناء: تم رصد حزمة خبيثة أو ثغرة عالية الخطورة.` : 'اجتاز فحص SCA بنجاح.',
      logsEn: findings.scaCriticals > 0 ? `Build Failed: Detected ${findings.scaCriticals} critical vulnerabilities.` : 'SCA audit passed clean.',
    },
    {
      id: 'job-secret-scan',
      name: 'Git Secret & High-Entropy Scanner',
      type: 'SECRET_SCAN',
      status: findings.secretsLeaked > 0 && config.requireSecretScanGate ? 'FAILED' : 'PASSED',
      gateEnabled: config.requireSecretScanGate,
      findingsCount: findings.secretsLeaked,
      logsAr: findings.secretsLeaked > 0 ? `فشل البناء: تم رصد أسرار ومفاتيح API مكشوفة في الكود!` : 'اجتاز فحص الأسرار بنجاح.',
      logsEn: findings.secretsLeaked > 0 ? `Build Failed: Hardcoded production secrets detected in commit!` : 'Secret scan passed clean.',
    },
    {
      id: 'job-iac-scan',
      name: 'Terraform IaC Security Gate (Checkov)',
      type: 'IAC_SCAN',
      status: findings.iacCriticals > 0 && config.requireIacScanGate ? 'FAILED' : 'PASSED',
      gateEnabled: config.requireIacScanGate,
      findingsCount: findings.iacCriticals,
      logsAr: findings.iacCriticals > 0 ? `فشل البناء: تم رصد أخطاء تكوين في قوالب Terraform.` : 'اجتاز فحص IaC بنجاح.',
      logsEn: findings.iacCriticals > 0 ? `Build Failed: Detected ${findings.iacCriticals} critical IaC misconfigurations.` : 'IaC scan passed clean.',
    },
  ];

  return jobs;
}
