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
import { createDefaultDevSecOpsMasterState, validateDevSecOpsMasterChallenge, evaluateDevSecOpsPipeline, validateBuildProvenance, verifyArtifactIntegrity } from '../../simulations/devsecops/logic/masterState';

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

  describe('Comprehensive DevSecOps Master State & Closure Tests', () => {
    it('verifies default state is unsolved and fails validation', () => {
      const state = createDefaultDevSecOpsMasterState();
      const validation = validateDevSecOpsMasterChallenge(state);
      expect(validation.isPassed).toBe(false);
      expect(validation.score).toBeLessThan(100);
      expect(validation.failedChecks.length).toBeGreaterThan(0);
    });

    it('verifies that full remediation and hardening meets closure criteria', () => {
      const state = createDefaultDevSecOpsMasterState();

      // 1. SAST
      state.sastFindings = state.sastFindings.map((f) => ({ ...f, remediated: true }));
      // 2. SCA
      state.dependencies = state.dependencies.map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      // 3. Secrets Scan
      state.secretMatches = state.secretMatches.map((m) => ({ ...m, remediated: true, inCommitHistory: false }));
      // 4. IaC Terraform
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      // 5. Container Images
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: true,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: true,
        hasCriticalVulns: false
      };
      // 6. SBOM Components
      state.sbomComponents = [
        {
          id: 'sbom-react',
          name: 'react',
          version: '19.0.1',
          purl: 'pkg:npm/react@19.0.1',
          type: 'framework',
          license: 'MIT',
          supplier: 'Meta Open Source',
          hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }]
        },
        {
          id: 'sbom-express',
          name: 'express',
          version: '4.21.2',
          purl: 'pkg:npm/express@4.21.2',
          type: 'library',
          license: 'MIT',
          supplier: 'OpenJS Foundation',
          hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }]
        },
        {
          id: 'sbom-distroless',
          name: 'gcr.io/distroless/static-debian12',
          version: 'nonroot',
          purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
          type: 'container',
          license: 'Apache-2.0',
          supplier: 'Google Container Registry',
          hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }]
        }
      ];
      // 7. SLSA
      state.slsaAttestation = {
        slsaLevel: 3,
        builderId: 'https://github.com/actions/runner',
        buildType: 'https://slsa.dev/provenance/v1',
        materials: [
          { uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }
        ],
        isSignedRekorLog: true,
        verified: true
      };
      // 8. Signatures
      state.signatures[0] = {
        artifactName: 'nexora-enterprise-service',
        digest: 'sha256:d57e1234567890abcdef',
        signed: true,
        signature: 'sig-prod-fa88193aa77ff01b',
        signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main',
        certificateIssuer: 'https://token.actions.githubusercontent.com',
        rekorEntry: 'rekor-uuid-7711-aa99',
        verified: true
      };
      // 9. Pipeline config
      state.pipelineConfig = {
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
        allowBypassOnFailure: false,
      };
      // 10. Drift
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: true }));
      // 11. Compliance
      state.complianceState = {
        pciDssCompliant: true,
        soc2Compliant: true,
        iso27001Compliant: true,
        failedControls: []
      };
      // 12. Artifact Integrity
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef';

      // Perform real verification procedures
      const pipeResult = evaluateDevSecOpsPipeline(state);
      state.testedPipelinePassed = pipeResult.allowed && pipeResult.decision === 'ALLOW' && pipeResult.failedGates.length === 0;

      const provResult = validateBuildProvenance(state.slsaAttestation, state.artifactState);
      state.testedProvenancePassed = provResult.verified;

      const integrityResult = verifyArtifactIntegrity(state.artifactState, state.signatures[0], state.slsaAttestation);
      state.testedArtifactIntegrityPassed = integrityResult.verified;

      const validation = validateDevSecOpsMasterChallenge(state);
      expect(validation.isPassed).toBe(true);
      expect(validation.score).toBe(100);
      expect(validation.failedChecks.length).toBe(0);
    });

    it('rejects master challenge if pipeline verification has not run', () => {
      const state = createDefaultDevSecOpsMasterState();
      
      // Fully harden state
      state.sastFindings = state.sastFindings.map((f) => ({ ...f, remediated: true }));
      state.dependencies = state.dependencies.map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      state.secretMatches = state.secretMatches.map((m) => ({ ...m, remediated: true, inCommitHistory: false }));
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: true,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: true,
        hasCriticalVulns: false
      };
      state.sbomComponents = [
        { id: 'sbom-react', name: 'react', version: '19.0.1', purl: 'pkg:npm/react@19.0.1', type: 'framework', license: 'MIT', supplier: 'Meta', hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }] },
        { id: 'sbom-express', name: 'express', version: '4.21.2', purl: 'pkg:npm/express@4.21.2', type: 'library', license: 'MIT', supplier: 'OpenJS', hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }] },
        { id: 'sbom-distroless', name: 'gcr.io/distroless/static-debian12', version: 'nonroot', purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', type: 'container', license: 'Apache-2.0', supplier: 'Google', hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }] }
      ];
      state.slsaAttestation = { slsaLevel: 3, builderId: 'https://github.com/actions/runner', buildType: 'https://slsa.dev/provenance/v1', materials: [{ uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }], isSignedRekorLog: true, verified: true };
      state.signatures[0] = { artifactName: 'nexora-enterprise-service', digest: 'sha256:d57e1234567890abcdef', signed: true, signature: 'sig-prod-fa88193aa77ff01b', signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main', certificateIssuer: 'https://token.actions.githubusercontent.com', rekorEntry: 'rekor-uuid-7711-aa99', verified: true };
      state.pipelineConfig = { id: 'pipe-production-build', name: 'Prod Pipeline', repository: 'github.com/nexora/enterprise-platform', branch: 'main', requireSastGate: true, requireScaGate: true, requireSecretScanGate: true, requireIacScanGate: true, requireContainerScanGate: true, requireCosignSignatureGate: true, allowBypassOnFailure: false };
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: true }));
      state.complianceState = { pciDssCompliant: true, soc2Compliant: true, iso27001Compliant: true, failedControls: [] };
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef';

      // Set only SLSA and Artifact Integrity verification flags
      state.testedPipelinePassed = false;
      state.testedProvenancePassed = true;
      state.testedArtifactIntegrityPassed = true;

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.failedChecks).toContain('Run and pass the final secure CI/CD pipeline verification.');
    });

    it('rejects master challenge if provenance verification has not run', () => {
      const state = createDefaultDevSecOpsMasterState();
      
      // Fully harden state
      state.sastFindings = state.sastFindings.map((f) => ({ ...f, remediated: true }));
      state.dependencies = state.dependencies.map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      state.secretMatches = state.secretMatches.map((m) => ({ ...m, remediated: true, inCommitHistory: false }));
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: true,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: true,
        hasCriticalVulns: false
      };
      state.sbomComponents = [
        { id: 'sbom-react', name: 'react', version: '19.0.1', purl: 'pkg:npm/react@19.0.1', type: 'framework', license: 'MIT', supplier: 'Meta', hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }] },
        { id: 'sbom-express', name: 'express', version: '4.21.2', purl: 'pkg:npm/express@4.21.2', type: 'library', license: 'MIT', supplier: 'OpenJS', hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }] },
        { id: 'sbom-distroless', name: 'gcr.io/distroless/static-debian12', version: 'nonroot', purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', type: 'container', license: 'Apache-2.0', supplier: 'Google', hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }] }
      ];
      state.slsaAttestation = { slsaLevel: 3, builderId: 'https://github.com/actions/runner', buildType: 'https://slsa.dev/provenance/v1', materials: [{ uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }], isSignedRekorLog: true, verified: true };
      state.signatures[0] = { artifactName: 'nexora-enterprise-service', digest: 'sha256:d57e1234567890abcdef', signed: true, signature: 'sig-prod-fa88193aa77ff01b', signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main', certificateIssuer: 'https://token.actions.githubusercontent.com', rekorEntry: 'rekor-uuid-7711-aa99', verified: true };
      state.pipelineConfig = { id: 'pipe-production-build', name: 'Prod Pipeline', repository: 'github.com/nexora/enterprise-platform', branch: 'main', requireSastGate: true, requireScaGate: true, requireSecretScanGate: true, requireIacScanGate: true, requireContainerScanGate: true, requireCosignSignatureGate: true, allowBypassOnFailure: false };
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: true }));
      state.complianceState = { pciDssCompliant: true, soc2Compliant: true, iso27001Compliant: true, failedControls: [] };
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef';

      // Set only Pipeline and Artifact Integrity verification flags
      state.testedPipelinePassed = true;
      state.testedProvenancePassed = false;
      state.testedArtifactIntegrityPassed = true;

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.failedChecks).toContain('Run and pass SLSA provenance verification.');
    });

    it('rejects master challenge if artifact integrity verification has not run', () => {
      const state = createDefaultDevSecOpsMasterState();
      
      // Fully harden state
      state.sastFindings = state.sastFindings.map((f) => ({ ...f, remediated: true }));
      state.dependencies = state.dependencies.map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      state.secretMatches = state.secretMatches.map((m) => ({ ...m, remediated: true, inCommitHistory: false }));
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: true,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: true,
        hasCriticalVulns: false
      };
      state.sbomComponents = [
        { id: 'sbom-react', name: 'react', version: '19.0.1', purl: 'pkg:npm/react@19.0.1', type: 'framework', license: 'MIT', supplier: 'Meta', hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }] },
        { id: 'sbom-express', name: 'express', version: '4.21.2', purl: 'pkg:npm/express@4.21.2', type: 'library', license: 'MIT', supplier: 'OpenJS', hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }] },
        { id: 'sbom-distroless', name: 'gcr.io/distroless/static-debian12', version: 'nonroot', purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', type: 'container', license: 'Apache-2.0', supplier: 'Google', hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }] }
      ];
      state.slsaAttestation = { slsaLevel: 3, builderId: 'https://github.com/actions/runner', buildType: 'https://slsa.dev/provenance/v1', materials: [{ uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }], isSignedRekorLog: true, verified: true };
      state.signatures[0] = { artifactName: 'nexora-enterprise-service', digest: 'sha256:d57e1234567890abcdef', signed: true, signature: 'sig-prod-fa88193aa77ff01b', signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main', certificateIssuer: 'https://token.actions.githubusercontent.com', rekorEntry: 'rekor-uuid-7711-aa99', verified: true };
      state.pipelineConfig = { id: 'pipe-production-build', name: 'Prod Pipeline', repository: 'github.com/nexora/enterprise-platform', branch: 'main', requireSastGate: true, requireScaGate: true, requireSecretScanGate: true, requireIacScanGate: true, requireContainerScanGate: true, requireCosignSignatureGate: true, allowBypassOnFailure: false };
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: true }));
      state.complianceState = { pciDssCompliant: true, soc2Compliant: true, iso27001Compliant: true, failedControls: [] };
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef';

      // Set only Pipeline and SLSA verification flags
      state.testedPipelinePassed = true;
      state.testedProvenancePassed = true;
      state.testedArtifactIntegrityPassed = false;

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.failedChecks).toContain('Run and pass artifact cryptographic integrity verification.');
    });

    it('rejects bypass of verification flags on default insecure state with anti-cheat validation', () => {
      const state = createDefaultDevSecOpsMasterState();
      
      // Attempt bypass cheat: set flags to true without remediating code flaws
      state.testedPipelinePassed = true;
      state.testedProvenancePassed = true;
      state.testedArtifactIntegrityPassed = true;

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.score).toBeLessThan(100);
      expect(res.failedChecks.length).toBeGreaterThan(0);
    });

    it('rejects deletion of SAST findings with anti-cheat violation', () => {
      const state = createDefaultDevSecOpsMasterState();
      state.sastFindings = []; // empty array cheat
      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.score).toBe(0);
      expect(res.antiCheatViolations).toContain('SAST findings array tampered or deleted. Vulnerabilities must be preserved and fully remediated.');
    });

    it('rejects deletion of SCA dependencies with anti-cheat violation', () => {
      const state = createDefaultDevSecOpsMasterState();
      state.dependencies = []; // empty array cheat
      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.score).toBe(0);
      expect(res.antiCheatViolations).toContain('SCA dependencies array tampered or deleted. Package records must be preserved and fully updated.');
    });

    it('rejects active pipeline bypass with anti-cheat violation', () => {
      const state = createDefaultDevSecOpsMasterState();
      
      // Fully remediate everything
      state.sastFindings = state.sastFindings.map((f) => ({ ...f, remediated: true }));
      state.dependencies = state.dependencies.map((d) => ({ ...d, remediated: true, licenseCompliant: true }));
      state.secretMatches = state.secretMatches.map((m) => ({ ...m, remediated: true, inCommitHistory: false }));
      state.terraformResources = state.terraformResources.map((r) => ({ ...r, remediated: true, hasMisconfiguration: false }));
      state.containerImages[0] = {
        imageName: 'nexora-enterprise-service',
        tag: 'v1.4.2',
        digest: 'sha256:d57e1234567890abcdef',
        vulnerabilitiesCount: 0,
        signed: true,
        trustedRegistry: true,
        embeddedSecretsCount: 0,
        sbomVerified: true,
        hasCriticalVulns: false
      };
      state.sbomComponents = [
        {
          id: 'sbom-react',
          name: 'react',
          version: '19.0.1',
          purl: 'pkg:npm/react@19.0.1',
          type: 'framework',
          license: 'MIT',
          supplier: 'Meta Open Source',
          hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }]
        },
        {
          id: 'sbom-express',
          name: 'express',
          version: '4.21.2',
          purl: 'pkg:npm/express@4.21.2',
          type: 'library',
          license: 'MIT',
          supplier: 'OpenJS Foundation',
          hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }]
        },
        {
          id: 'sbom-distroless',
          name: 'gcr.io/distroless/static-debian12',
          version: 'nonroot',
          purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
          type: 'container',
          license: 'Apache-2.0',
          supplier: 'Google Container Registry',
          hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }]
        }
      ];
      state.slsaAttestation = {
        slsaLevel: 3,
        builderId: 'https://github.com/actions/runner',
        buildType: 'https://slsa.dev/provenance/v1',
        materials: [
          { uri: 'git+https://github.com/nexora/enterprise-platform', digest: 'sha256:7f9a28b61a3d90fcb3b811883b276709...' }
        ],
        isSignedRekorLog: true,
        verified: true
      };
      state.signatures[0] = {
        artifactName: 'nexora-enterprise-service',
        digest: 'sha256:d57e1234567890abcdef',
        signed: true,
        signature: 'sig-prod-fa88193aa77ff01b',
        signerIdentity: 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main',
        certificateIssuer: 'https://token.actions.githubusercontent.com',
        rekorEntry: 'rekor-uuid-7711-aa99',
        verified: true
      };
      state.driftFindings = state.driftFindings.map((d) => ({ ...d, autoRemediated: true }));
      state.complianceState = {
        pciDssCompliant: true,
        soc2Compliant: true,
        iso27001Compliant: true,
        failedControls: []
      };
      state.artifactState.tampered = false;
      state.artifactState.digest = 'sha256:d57e1234567890abcdef';

      // Ensure allowBypassOnFailure is true (which is a cheat attempt)
      state.pipelineConfig = {
        id: 'pipe-production-build',
        name: 'Production DevSecOps Pipeline',
        repository: 'github.com/nexora/enterprise-platform',
        branch: 'main',
        requireSastGate: true,
        requireScaGate: true,
        requireSecretScanGate: true,
        requireIacScanGate: true,
        requireContainerScanGate: true,
        requireCosignSignatureGate: true,
        allowBypassOnFailure: true, // cheat flag!
      };

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.isPassed).toBe(false);
      expect(res.score).toBe(0);
      expect(res.antiCheatViolations).toContain('CI/CD Pipeline configuration bypass is active. Security quality gates must be non-bypassable (allowBypassOnFailure must be false) to achieve OMEGA status.');
    });

    it('rejects forged/untrusted SLSA builder with anti-cheat violation', () => {
      const state = createDefaultDevSecOpsMasterState();
      // Force verified = true but supply a rogue builder ID (forgery check)
      state.slsaAttestation.verified = true;
      state.slsaAttestation.builderId = 'https://github.com/untrusted/rogue-builder';

      const res = validateDevSecOpsMasterChallenge(state);
      expect(res.antiCheatViolations).toContain('SLSA Provenance builder is forged or untrusted.');
    });
  });
});
