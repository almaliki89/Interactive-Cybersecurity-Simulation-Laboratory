/**
 * OMEGA V15 — DevSecOps & Software Supply Chain World Logic Tests
 * Fully deterministic unit & logic test suite.
 */

import { describe, it, expect } from 'vitest';
import { getInitialSastFindings, scanCodeForSastVulnerabilities } from '../../simulations/devsecops/logic/sast';
import { getInitialDependencies, scanScaDependencies } from '../../simulations/devsecops/logic/sca';
import { getInitialSecretMatches, scanRepositorySecrets } from '../../simulations/devsecops/logic/secretsScan';
import { getInitialTerraformResources, scanTerraformCode } from '../../simulations/devsecops/logic/iacTerraform';
import { getInitialPipelineConfig, evaluatePipelineJobs } from '../../simulations/devsecops/logic/pipelineGates';
import { getSampleSbomComponents, getInitialSlsaAttestation } from '../../simulations/devsecops/logic/sbom';
import { getInitialDevSecOpsAntiCheatFlags, evaluateDevSecOpsMasterChallenge } from '../../simulations/devsecops/logic/antiCheat';

describe('OMEGA V15 — DevSecOps, IaC Security & Supply Chain World', () => {
  describe('SAST Code Vulnerability Scanner Engine', () => {
    it('detects initial SQLi and XSS code flaws and fails gate', () => {
      const findings = getInitialSastFindings();
      const res = scanCodeForSastVulnerabilities(findings);
      expect(res.criticalCount).toBeGreaterThan(0);
      expect(res.passedSastGate).toBe(false);
    });

    it('passes SAST gate when all code flaws are remediated', () => {
      const findings = getInitialSastFindings().map((f) => ({ ...f, remediated: true }));
      const res = scanCodeForSastVulnerabilities(findings);
      expect(res.criticalCount).toBe(0);
      expect(res.sastScore).toBe(100);
      expect(res.passedSastGate).toBe(true);
    });
  });

  describe('SCA Dependency & License Compliance Engine', () => {
    it('flags typosquatting malware packages and copyleft licenses', () => {
      const deps = getInitialDependencies();
      const res = scanScaDependencies(deps);
      expect(res.typosquattingCount).toBeGreaterThan(0);
      expect(res.licenseViolationsCount).toBeGreaterThan(0);
      expect(res.passedScaGate).toBe(false);
    });

    it('passes SCA gate after updating packages to patched non-viral versions', () => {
      const deps = getInitialDependencies().map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      const res = scanScaDependencies(deps);
      expect(res.criticalCount).toBe(0);
      expect(res.scaScore).toBe(100);
      expect(res.passedScaGate).toBe(true);
    });
  });

  describe('Git Pre-Commit & High-Entropy Secret Scanner Engine', () => {
    it('detects unscrubbed AWS and Stripe keys in repository', () => {
      const secrets = getInitialSecretMatches();
      const res = scanRepositorySecrets(secrets);
      expect(res.totalLeakedSecrets).toBeGreaterThan(0);
      expect(res.passedSecretGate).toBe(false);
    });

    it('passes Secret gate when secrets are scrubbed from commit history', () => {
      const secrets = getInitialSecretMatches().map((s) => ({ ...s, remediated: true }));
      const res = scanRepositorySecrets(secrets);
      expect(res.totalLeakedSecrets).toBe(0);
      expect(res.passedSecretGate).toBe(true);
    });
  });

  describe('IaC Terraform & Policy-as-Code Engine', () => {
    it('flags 0.0.0.0/0 SSH ingress and unencrypted S3 bucket', () => {
      const tf = getInitialTerraformResources();
      const res = scanTerraformCode(tf);
      expect(res.criticalCount).toBeGreaterThan(0);
      expect(res.passedIacGate).toBe(false);
    });

    it('passes IaC gate when Terraform code is hardened', () => {
      const tf = getInitialTerraformResources().map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      const res = scanTerraformCode(tf);
      expect(res.criticalCount).toBe(0);
      expect(res.passedIacGate).toBe(true);
    });
  });

  describe('CI/CD Automated Security Quality Gates Engine', () => {
    it('blocks pipeline execution when critical findings are present', () => {
      const config = getInitialPipelineConfig();
      const jobs = evaluatePipelineJobs(config, {
        sastCriticals: 1,
        scaCriticals: 1,
        secretsLeaked: 1,
        iacCriticals: 1,
      });

      const failedJobs = jobs.filter((j) => j.status === 'FAILED');
      expect(failedJobs.length).toBeGreaterThan(0);
    });
  });

  describe('SBOM & SLSA Attestation Engine', () => {
    it('validates CycloneDX components and SLSA Level 3 certification', () => {
      const sbom = getSampleSbomComponents();
      const slsa = getInitialSlsaAttestation();
      expect(sbom.length).toBe(3);
      expect(slsa.slsaLevel).toBe(3);
      expect(slsa.verified).toBe(true);
    });
  });

  describe('DevSecOps Anti-Cheat Master Engine', () => {
    it('starts with 0% score and unfulfilled tasks', () => {
      const flags = getInitialDevSecOpsAntiCheatFlags();
      const evalResult = evaluateDevSecOpsMasterChallenge(flags);
      expect(evalResult.isMastered).toBe(false);
      expect(evalResult.score).toBe(0);
    });

    it('achieves mastery when all 7 DevSecOps criteria are met', () => {
      const flags = {
        sastVulnerabilitiesFixed: true,
        scaPackagesUpdatedAndLicensesVerified: true,
        hardcodedSecretsScrubbedFromGitHistory: true,
        terraformTemplatesHardenedAndOpenPortsClosed: true,
        ciSecurityGatesEnforcedWithZeroBypass: true,
        sbomGeneratedAndSlsaAttested: true,
        infrastructureDriftRemediated: true,
      };
      const evalResult = evaluateDevSecOpsMasterChallenge(flags);
      expect(evalResult.isMastered).toBe(true);
      expect(evalResult.score).toBe(100);
      expect(evalResult.completedTasks).toBe(7);
    });
  });
});
