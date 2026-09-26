/**
 * OMEGA V15 — DevSecOps, IaC Security & Software Supply Chain World
 * Core Type Definitions & Data Structures
 * Deterministic, comprehensive model of DevSecOps CI/CD Pipelines & Supply Chain Security.
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SastFinding {
  id: string;
  file: string;
  line: number;
  ruleId: string;
  titleAr: string;
  titleEn: string;
  severity: SeverityLevel;
  cvss: number;
  cwe: string;
  codeSnippet: string;
  remediationSnippet: string;
  remediated: boolean;
  explanationAr: string;
  explanationEn: string;
}

export interface ScaDependency {
  id: string;
  packageName: string;
  currentVersion: string;
  patchedVersion: string;
  license: 'MIT' | 'Apache-2.0' | 'GPL-3.0' | 'AGPL-3.0' | 'UNLICENSED';
  licenseCompliant: boolean;
  vulnerabilityCve?: string;
  severity: SeverityLevel;
  cvss: number;
  descriptionAr: string;
  descriptionEn: string;
  isTyposquatting: boolean;
  remediated: boolean;
}

export interface GitSecretMatch {
  id: string;
  filePath: string;
  line: number;
  secretType: 'AWS_ACCESS_KEY' | 'GITHUB_TOKEN' | 'STRIPE_SECRET_KEY' | 'RSA_PRIVATE_KEY' | 'GENERIC_API_KEY';
  maskedSecret: string;
  entropyScore: number; // e.g. 5.8 (high entropy)
  inCommitHistory: boolean;
  remediated: boolean;
  remediationActionAr: string;
  remediationActionEn: string;
}

export interface TerraformResource {
  id: string;
  resourceType: 'aws_security_group' | 'aws_s3_bucket' | 'aws_db_instance' | 'aws_ebs_volume' | 'aws_iam_policy';
  resourceName: string;
  hclCode: string;
  hardenedHclCode: string;
  hasMisconfiguration: boolean;
  ruleName: string;
  severity: SeverityLevel;
  descriptionAr: string;
  descriptionEn: string;
  remediated: boolean;
}

export interface PipelineStageJob {
  id: string;
  name: string;
  type: 'LINT' | 'SAST' | 'SCA' | 'SECRET_SCAN' | 'IAC_SCAN' | 'CONTAINER_SCAN' | 'SIGN' | 'DEPLOY';
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'RUNNING';
  gateEnabled: boolean;
  findingsCount: number;
  logsAr: string;
  logsEn: string;
}

export interface CiCdPipelineConfig {
  id: string;
  name: string;
  repository: string;
  branch: string;
  requireSastGate: boolean;
  requireScaGate: boolean;
  requireSecretScanGate: boolean;
  requireIacScanGate: boolean;
  requireContainerScanGate: boolean;
  requireCosignSignatureGate: boolean;
  allowBypassOnFailure: boolean;
}

export interface SbomComponent {
  id: string;
  name: string;
  version: string;
  purl: string; // Package URL e.g. pkg:npm/express@4.18.2
  type: 'library' | 'framework' | 'container' | 'operating-system';
  license: string;
  hashes: { algo: 'SHA-256' | 'SHA-512'; digest: string }[];
  supplier: string;
}

export interface SlsaAttestation {
  slsaLevel: 1 | 2 | 3 | 4;
  builderId: string; // e.g. "https://github.com/actions/runner"
  buildType: string;
  materials: { uri: string; digest: string }[];
  isSignedRekorLog: boolean;
  verified: boolean;
}

export interface InfrastructureDriftFinding {
  resourceId: string;
  expectedTerraformState: string;
  actualCloudLiveState: string;
  driftType: 'UNAUTHORIZED_PORT_OPENED' | 'PUBLIC_ACCESS_ENABLED' | 'ENCRYPTION_DISABLED';
  riskAr: string;
  riskEn: string;
  autoRemediated: boolean;
}

export interface DevSecOpsAntiCheatFlags {
  sastVulnerabilitiesFixed: boolean;
  scaPackagesUpdatedAndLicensesVerified: boolean;
  hardcodedSecretsScrubbedFromGitHistory: boolean;
  terraformTemplatesHardenedAndOpenPortsClosed: boolean;
  ciSecurityGatesEnforcedWithZeroBypass: boolean;
  sbomGeneratedAndSlsaAttested: boolean;
  infrastructureDriftRemediated: boolean;
}
