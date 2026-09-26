/**
 * OMEGA V15.1 — DevSecOps Unified Master State & Decisive Pipeline Engine
 * Centralizes state, enforces deterministic gate rules, and validates the entire supply chain.
 */

import {
  SastFinding,
  ScaDependency,
  GitSecretMatch,
  TerraformResource,
  PipelineStageJob,
  CiCdPipelineConfig,
  SbomComponent,
  SlsaAttestation,
  InfrastructureDriftFinding,
  DevSecOpsAntiCheatFlags
} from './types';

// ==================================================
// 1. DATA STRUCTURES FOR DEVSECOPS MASTER STATE
// ==================================================

export interface ContainerImageState {
  imageName: string;
  tag: string;
  digest: string;
  vulnerabilitiesCount: number;
  signed: boolean;
  trustedRegistry: boolean;
  embeddedSecretsCount: number;
  sbomVerified: boolean;
  hasCriticalVulns: boolean;
}

export interface SoftwareSignatureState {
  artifactName: string;
  digest: string;
  signed: boolean;
  signature: string;
  signerIdentity: string;
  certificateIssuer: string;
  rekorEntry: string;
  verified: boolean;
}

export interface DevSecOpsComplianceState {
  pciDssCompliant: boolean;
  soc2Compliant: boolean;
  iso27001Compliant: boolean;
  failedControls: string[];
}

export interface DevSecOpsArtifactState {
  artifactName: string;
  digest: string;
  sizeBytes: number;
  builtAtVirtualTime: number;
  tampered: boolean;
}

export interface DevSecOpsMasterState {
  sastFindings: SastFinding[];
  dependencies: ScaDependency[];
  secretMatches: GitSecretMatch[];
  terraformResources: TerraformResource[];
  containerImages: ContainerImageState[];
  sbomComponents: SbomComponent[];
  slsaAttestation: SlsaAttestation;
  signatures: SoftwareSignatureState[];
  pipelineConfig: CiCdPipelineConfig;
  pipelineJobs: PipelineStageJob[];
  driftFindings: InfrastructureDriftFinding[];
  complianceState: DevSecOpsComplianceState;
  artifactState: DevSecOpsArtifactState;
  testedPipelinePassed: boolean;
  testedProvenancePassed: boolean;
  testedArtifactIntegrityPassed: boolean;
  antiCheatFlags?: DevSecOpsAntiCheatFlags;
}

// ==================================================
// 2. DEFAULT MASTER STATE (STARTS UNSOLVED)
// ==================================================

export function createDefaultDevSecOpsMasterState(): DevSecOpsMasterState {
  return {
    sastFindings: [
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
        codeSnippet: `const query = "SELECT * FROM users WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'";\ndb.query(query);`,
        remediationSnippet: `const query = "SELECT * FROM users WHERE username = $1 AND password = $2";\ndb.query(query, [req.body.username, req.body.password]);`,
        remediated: false,
        explanationAr: 'دمج نصوص الإدخال القادمة من العميل مباشرة في استعلام SQL يتيح للمهاجم تجاوز المصادقة وسرقة كافة بيانات الجدول.',
        explanationEn: 'Concatenating raw user inputs into SQL string allows authentication bypass and arbitrary database extraction.'
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
        remediationSnippet: `import DOMPurify from 'dompurify';\n<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBioComment) }} />`,
        remediated: false,
        explanationAr: 'عرض تعليقات المستخدمين بدون تنقية HTML يتيح تنفيض شفرات JavaScript خبيثة وسرقة كوكيز الجلسات.',
        explanationEn: 'Rendering unsanitized user markup allows persistent XSS execution and session cookie theft.'
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
        remediationSnippet: `import bcrypt from 'bcrypt';\nconst hash = await bcrypt.hash(password, 12);`,
        remediated: false,
        explanationAr: 'خوارزمية MD5 تعرضت للانهيار التشفيري وتسمح بهجمات التصادم والتخمين السريع.',
        explanationEn: 'MD5 is cryptographically broken and vulnerable to collision attacks and rapid cracking.'
      }
    ],
    dependencies: [
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
        remediated: false
      },
      {
        id: 'dep-express-typo',
        packageName: 'expresss-js', // typosquatting package
        currentVersion: '4.18.0',
        patchedVersion: 'express@4.19.2',
        license: 'UNLICENSED',
        licenseCompliant: false,
        vulnerabilityCve: 'MALICIOUS-NPM-TYPOSQUAT',
        severity: 'CRITICAL',
        cvss: 9.8,
        descriptionAr: 'برمجية خبيثة انتحالية (Typosquatting) سرقت أسرار البيئة وأرسلتها لسيرفر المهاجم.',
        descriptionEn: 'Malicious typosquatting package masquerading as express. Harvests process.env secrets.',
        isTyposquatting: true,
        remediated: false
      },
      {
        id: 'dep-copyleft-lib',
        packageName: 'gpl-utils-parser',
        currentVersion: '1.0.0',
        patchedVersion: 'apache-parser@2.0.0',
        license: 'AGPL-3.0',
        licenseCompliant: false, // Non-compliant copyleft
        severity: 'MEDIUM',
        cvss: 5.0,
        descriptionAr: 'ترخيص AGPL-3.0 يحظر الاستخدام التجاري المغلق ويجبر الشركة على فتح شفرتها المصدرية للعامة.',
        descriptionEn: 'AGPL-3.0 copyleft license imposes viral source code disclosure obligations on SaaS product.',
        isTyposquatting: false,
        remediated: false
      }
    ],
    secretMatches: [
      {
        id: 'sec-aws-access-key',
        filePath: '.env.production',
        line: 4,
        secretType: 'AWS_ACCESS_KEY',
        maskedSecret: 'AKIAIOSFODNN7EXAMPLE (High Entropy)',
        entropyScore: 5.92,
        inCommitHistory: true,
        remediated: false,
        remediationActionAr: 'إلغاء المفتاح فوراً من AWS IAM، وتطهير سجلات Git التاريخية عبر git-filter-repo.',
        remediationActionEn: 'Revoke key in AWS IAM immediately; scrub Git commit history using git-filter-repo.'
      },
      {
        id: 'sec-stripe-payment-key',
        filePath: 'config/payment.json',
        line: 18,
        secretType: 'STRIPE_SECRET_KEY',
        maskedSecret: 'sk_live_51M0...994z1',
        entropyScore: 6.14,
        inCommitHistory: true,
        remediated: false,
        remediationActionAr: 'تدوير مفتاح Stripe البنكي واستخدام AWS Secrets Manager بدلاً من التضمين المباشر.',
        remediationActionEn: 'Rotate Stripe production secret and pull from AWS Secrets Manager dynamically at runtime.'
      }
    ],
    terraformResources: [
      {
        id: 'tf-sg-public-ssh',
        resourceType: 'aws_security_group',
        resourceName: 'allow_public_management',
        hclCode: `resource "aws_security_group" "public_sg" {\n  name = "public-ssh-sg"\n  ingress {\n    from_port   = 22\n    to_port     = 22\n    protocol    = "tcp"\n    cidr_blocks = ["0.0.0.0/0"] # DANGEROUS PUBLIC SSH!\n  }\n}`,
        hardenedHclCode: `resource "aws_security_group" "public_sg" {\n  name = "public-ssh-sg"\n  ingress {\n    from_port   = 22\n    to_port     = 22\n    protocol    = "tcp"\n    cidr_blocks = ["10.0.0.0/8"] # Restricted to internal VPN CIDR\n  }\n}`,
        hasMisconfiguration: true,
        ruleName: 'CKV_AWS_24: Restrict SSH Ingress 0.0.0.0/0',
        severity: 'CRITICAL',
        descriptionAr: 'فتح منفذ إدارة SSH (22) لجميع العناوين في العالم (0.0.0.0/0) يعرض الخادم لهجمات التخمين والاختراق المباشر.',
        descriptionEn: 'Exposing administrative SSH port 22 to 0.0.0.0/0 invites automated brute-force attacks.',
        remediated: false
      },
      {
        id: 'tf-s3-unencrypted',
        resourceType: 'aws_s3_bucket',
        resourceName: 'customer_data_storage',
        hclCode: `resource "aws_s3_bucket" "data_bucket" {\n  bucket = "nexora-customer-pii-data"\n  acl    = "public-read" # DANGEROUS PUBLIC S3 BUCKET!\n}`,
        hardenedHclCode: `resource "aws_s3_bucket" "data_bucket" {\n  bucket = "nexora-customer-pii-data"\n}\n\nresource "aws_s3_bucket_server_side_encryption_configuration" "kms" {\n  bucket = aws_s3_bucket.data_bucket.id\n  rule {\n    apply_server_side_encryption_by_default {\n      sse_algorithm = "aws:kms"\n    }\n  }\n}`,
        hasMisconfiguration: true,
        ruleName: 'CKV_AWS_20: Ensure S3 Bucket SSE Encryption & Public Block',
        severity: 'CRITICAL',
        descriptionAr: 'وحدة التخزين S3 مكشوفة للإنترنت وتفتقر للتشفير أثناء التخزين SSE-KMS.',
        descriptionEn: 'S3 storage container exposed publicly without SSE-KMS encryption at rest.',
        remediated: false
      }
    ],
    containerImages: [
      {
        imageName: 'nexora-enterprise-service',
        tag: 'latest', // Unpinned tag weakness
        digest: '', // Unpinned digest weakness
        vulnerabilitiesCount: 14,
        signed: false, // Unsigned weakness
        trustedRegistry: false, // Untrusted registry weakness
        embeddedSecretsCount: 1, // Embedded secret weakness
        sbomVerified: false,
        hasCriticalVulns: true
      }
    ],
    sbomComponents: [
      {
        id: 'sbom-react',
        name: 'react',
        version: '19.0.1',
        purl: 'pkg:npm/react@19.0.1',
        type: 'framework',
        license: 'MIT',
        supplier: 'Meta Open Source',
        hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }]
      } // Incomplete SBOM (missing other components like express or distroless base)
    ],
    slsaAttestation: {
      slsaLevel: 1, // Insufficient SLSA Level
      builderId: 'https://github.com/untrusted/builder', // Malicious builder weakness
      buildType: 'https://slsa.dev/provenance/v0.1',
      materials: [
        { uri: 'git+https://github.com/hacker/fake-platform', digest: 'sha256:000000...' } // Wrong repository mismatch
      ],
      isSignedRekorLog: false, // Missing Rekor evidence
      verified: false // Invalid provenance
    },
    signatures: [
      {
        artifactName: 'nexora-enterprise-service',
        digest: 'sha256:d57e1234567890abcdef',
        signed: false, // Unsigned build artifact
        signature: '',
        signerIdentity: 'malicious-identity',
        certificateIssuer: 'untrusted-issuer',
        rekorEntry: '',
        verified: false
      }
    ],
    pipelineConfig: {
      id: 'pipe-production-build',
      name: 'Production DevSecOps Deployment Pipeline',
      repository: 'github.com/nexora/enterprise-platform',
      branch: 'main',
      requireSastGate: false, // Weak configuration
      requireScaGate: false, // Weak configuration
      requireSecretScanGate: false, // Weak configuration
      requireIacScanGate: false, // Weak configuration
      requireContainerScanGate: false, // Weak configuration
      requireCosignSignatureGate: false, // Weak configuration
      allowBypassOnFailure: true // Pipeline bypass weakness
    },
    pipelineJobs: [],
    driftFindings: [
      {
        resourceId: 'aws_security_group.sg_app_ingress',
        expectedTerraformState: 'ingress { from_port = 443, to_port = 443, cidr = ["10.0.0.0/8"] }',
        actualCloudLiveState: 'ingress { from_port = 22, to_port = 22, cidr = ["0.0.0.0/0"] } # MANUAL OUT-OF-BAND CHANGE!',
        driftType: 'UNAUTHORIZED_PORT_OPENED',
        riskAr: 'تم فتح منفذ SSH عبر وحدة تحكم السحابة يدوياً دون توثيقه في كود Terraform، مما يخرق قواعد الحوكمة.',
        riskEn: 'Manual out-of-band AWS console SSH port open bypassing Terraform code review.',
        autoRemediated: false
      }
    ],
    complianceState: {
      pciDssCompliant: false,
      soc2Compliant: false,
      iso27001Compliant: false,
      failedControls: ['PCI-DSS-v4.0: Requirement 6.4.3', 'SOC2: Trust Services Criteria CC7.1']
    },
    artifactState: {
      artifactName: 'nexora-enterprise-service',
      digest: 'sha256:d57e1234567890abcdef',
      sizeBytes: 15420993,
      builtAtVirtualTime: 0,
      tampered: true // Tampered build artifact
    },
    testedPipelinePassed: false,
    testedProvenancePassed: false,
    testedArtifactIntegrityPassed: false,
    antiCheatFlags: {
      sastVulnerabilitiesFixed: false,
      scaPackagesUpdatedAndLicensesVerified: false,
      hardcodedSecretsScrubbedFromGitHistory: false,
      terraformTemplatesHardenedAndOpenPortsClosed: false,
      ciSecurityGatesEnforcedWithZeroBypass: false,
      sbomGeneratedAndSlsaAttested: false,
      infrastructureDriftRemediated: false
    }
  };
}

// ==================================================
// 3. PIPELINE DECISION ENGINE
// ==================================================

export interface DevSecOpsPipelineDecision {
  allowed: boolean;
  decision: 'ALLOW' | 'BLOCK';
  failedGates: string[];
  passedGates: string[];
  jobs: PipelineStageJob[];
  reasonEn: string;
  reasonAr: string;
}

export function evaluateDevSecOpsPipeline(state: DevSecOpsMasterState): DevSecOpsPipelineDecision {
  const failedGates: string[] = [];
  const passedGates: string[] = [];
  const jobs: PipelineStageJob[] = [];
  const config = state.pipelineConfig;

  // 1. LINT Gate
  jobs.push({
    id: 'job-lint',
    name: 'ESLint & TypeScript Static Check',
    type: 'LINT' as any,
    status: 'PASSED',
    gateEnabled: true,
    findingsCount: 0,
    logsAr: 'تم اجتياز فحوصات البناء وإعراب الكود بنجاح دون أخطاء.',
    logsEn: 'TypeScript compilation and ESLint completed with 0 errors.'
  });
  passedGates.push('LINT');

  // 2. SAST Gate
  const activeSastCriticalOrHigh = state.sastFindings.filter(f => !f.remediated && (f.severity === 'CRITICAL' || f.severity === 'HIGH'));
  const sastCount = activeSastCriticalOrHigh.length;
  const sastFailed = sastCount > 0 && config.requireSastGate;
  if (sastFailed) {
    failedGates.push('SAST');
  } else if (config.requireSastGate) {
    passedGates.push('SAST');
  }
  jobs.push({
    id: 'job-sast',
    name: 'SAST Code Security Scan (Semgrep)',
    type: 'SAST' as any,
    status: sastFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireSastGate,
    findingsCount: sastCount,
    logsAr: sastFailed ? `فشل البناء: تم رصد ${sastCount} ثغرة نشطة عالية/حرجة.` : 'اجتاز فحص SAST الكود بنجاح.',
    logsEn: sastFailed ? `Build Failed: Detected ${sastCount} active high/critical SAST flaws.` : 'SAST scan completed clean.'
  });

  // 3. SCA Gate
  const scaVulnerableCount = state.dependencies.filter(d => !d.remediated && (d.severity === 'CRITICAL' || d.severity === 'HIGH' || d.isTyposquatting || !d.licenseCompliant)).length;
  const scaFailed = scaVulnerableCount > 0 && config.requireScaGate;
  if (scaFailed) {
    failedGates.push('SCA');
  } else if (config.requireScaGate) {
    passedGates.push('SCA');
  }
  jobs.push({
    id: 'job-sca',
    name: 'SCA Dependency & License Scan (Snyk)',
    type: 'SCA' as any,
    status: scaFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireScaGate,
    findingsCount: scaVulnerableCount,
    logsAr: scaFailed ? `فشل البناء: تم رصد حزمة خبيثة، ثغرة CVE حرجة، أو انتهاك رخصة AGPL.` : 'اجتاز فحص SCA بنجاح دون ثغرات أو مشاكل تراخيص.',
    logsEn: scaFailed ? `Build Failed: Found vulnerable packages, typosquatting, or licensing violations.` : 'SCA audit completed cleanly.'
  });

  // 4. SECRET_SCAN Gate
  const activeSecrets = state.secretMatches.filter(s => !s.remediated);
  const secretCount = activeSecrets.length;
  const secretFailed = secretCount > 0 && config.requireSecretScanGate;
  if (secretFailed) {
    failedGates.push('SECRET_SCAN');
  } else if (config.requireSecretScanGate) {
    passedGates.push('SECRET_SCAN');
  }
  jobs.push({
    id: 'job-secret-scan',
    name: 'Git Secret & High-Entropy Scanner (TruffleHog)',
    type: 'SECRET_SCAN' as any,
    status: secretFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireSecretScanGate,
    findingsCount: secretCount,
    logsAr: secretFailed ? `فشل البناء: تم رصد أسرار نشطة ومفاتيح مكشوفة في مستودع الكود.` : 'اجتاز فحص الأسرار بنجاح بنسبة 100٪.',
    logsEn: secretFailed ? `Build Failed: Active credentials detected in the code tree or historical commits.` : 'No unscrubbed credentials found in repository.'
  });

  // 5. IAC_SCAN Gate
  const activeIacMisconfigs = state.terraformResources.filter(r => !r.remediated && r.hasMisconfiguration);
  const iacCount = activeIacMisconfigs.length;
  const iacFailed = iacCount > 0 && config.requireIacScanGate;
  if (iacFailed) {
    failedGates.push('IAC_SCAN');
  } else if (config.requireIacScanGate) {
    passedGates.push('IAC_SCAN');
  }
  jobs.push({
    id: 'job-iac-scan',
    name: 'Terraform IaC Security Gate (Checkov)',
    type: 'IAC_SCAN' as any,
    status: iacFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireIacScanGate,
    findingsCount: iacCount,
    logsAr: iacFailed ? `فشل البناء: تم رصد ثغرات إدارة عامة أو غياب التشفير في ملفات HCL.` : 'تم تمرير فحص IaC بنجاح.',
    logsEn: iacFailed ? `Build Failed: Detected ${iacCount} public ports or unencrypted buckets in HCL templates.` : 'IaC static scan matched strict baseline.'
  });

  // 6. CONTAINER_SCAN Gate
  // Checked against containerImages
  const containerImage = state.containerImages[0];
  const containerFailed = config.requireContainerScanGate && (
    !containerImage ||
    containerImage.hasCriticalVulns ||
    !containerImage.signed ||
    !containerImage.trustedRegistry ||
    containerImage.embeddedSecretsCount > 0 ||
    containerImage.tag === 'latest' ||
    !containerImage.digest
  );
  const containerFindingsCount = containerImage ? (containerImage.vulnerabilitiesCount + containerImage.embeddedSecretsCount) : 1;
  if (containerFailed) {
    failedGates.push('CONTAINER_SCAN');
  } else if (config.requireContainerScanGate) {
    passedGates.push('CONTAINER_SCAN');
  }
  jobs.push({
    id: 'job-container-scan',
    name: 'Container Image OS & Config Scan (Trivy)',
    type: 'CONTAINER_SCAN' as any,
    status: containerFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireContainerScanGate,
    findingsCount: containerFindingsCount,
    logsAr: containerFailed ? 'فشل الفحص: الصورة تحتوي ثغرات، غير موقعة، تستخدم أحدث علامة (latest)، أو مسربة أسراراً.' : 'اجتاز فحص الصورة وتثبيت التوقيع البنيوي بنجاح.',
    logsEn: containerFailed ? 'Container validation failed: Unsigned image, critical CVEs, unpinned latest tag, or embedded secrets.' : 'Minimal distroless image scanned clean with pinned digest.'
  });

  // 7. SBOM Gate
  const sbomResult = validateSbom(state.sbomComponents, state.artifactState);
  const sbomFailed = !sbomResult.valid;
  if (sbomFailed) {
    failedGates.push('SBOM');
  } else {
    passedGates.push('SBOM');
  }
  jobs.push({
    id: 'job-sbom',
    name: 'SBOM Inventory Verification',
    type: 'DEPLOY' as any, // mapping under pipeline stage jobs
    status: sbomFailed ? 'FAILED' : 'PASSED',
    gateEnabled: true,
    findingsCount: sbomFailed ? 1 : 0,
    logsAr: sbomFailed ? `فشل التحقق من SBOM: ${sbomResult.reasonAr}` : 'تم إصدار والتحقق من جرد SBOM بصيغة CycloneDX بنجاح.',
    logsEn: sbomFailed ? `SBOM Validation Failed: ${sbomResult.reasonEn}` : 'CycloneDX SBOM schema validated and full dependency list recorded.'
  });

  // 8. SIGNATURE Gate
  const signatureState = state.signatures[0];
  const integrityResult = verifyArtifactIntegrity(state.artifactState, signatureState, state.slsaAttestation);
  const signatureFailed = config.requireCosignSignatureGate && (!signatureState || !signatureState.signed || !integrityResult.signatureValid);
  if (signatureFailed) {
    failedGates.push('SIGNATURE');
  } else if (config.requireCosignSignatureGate) {
    passedGates.push('SIGNATURE');
  }
  jobs.push({
    id: 'job-sign',
    name: 'Artifact Software Signing (Cosign)',
    type: 'SIGN' as any,
    status: signatureFailed ? 'FAILED' : 'PASSED',
    gateEnabled: config.requireCosignSignatureGate,
    findingsCount: signatureFailed ? 1 : 0,
    logsAr: signatureFailed ? 'فشل التوقيع: الأداة لم تعثر على توقيع رقمي صالح موثق في لوحة Rekor.' : 'التوقيع الرقمي للبرمجية تم تفعيله والتحقق منه وسجل الشفافية سليم.',
    logsEn: signatureFailed ? 'Signature Validation Failed: Missing Cosign cert-chain or verified Rekor transparency log.' : 'Cosign cryptographically verified artifact integrity.'
  });

  // 9. PROVENANCE Gate
  const provenanceResult = validateBuildProvenance(state.slsaAttestation, state.artifactState);
  const provenanceFailed = !provenanceResult.verified;
  if (provenanceFailed) {
    failedGates.push('PROVENANCE');
  } else {
    passedGates.push('PROVENANCE');
  }
  jobs.push({
    id: 'job-provenance',
    name: 'SLSA Build Provenance Audit',
    type: 'DEPLOY' as any,
    status: provenanceFailed ? 'FAILED' : 'PASSED',
    gateEnabled: true,
    findingsCount: provenanceFailed ? 1 : 0,
    logsAr: provenanceFailed ? `فشل التحقق من SLSA: ${provenanceResult.reasonAr}` : 'تم التحقق من موثوقية الباني ومصداقية شهادة المنشأ SLSA Level 3.',
    logsEn: provenanceFailed ? `Provenance Mismatch: ${provenanceResult.reasonEn}` : 'SLSA Level 3 provenance metadata matched the build runtime exactly.'
  });

  // 10. COMPLIANCE Gate
  const complianceFailed = state.complianceState.failedControls.length > 0;
  if (complianceFailed) {
    failedGates.push('COMPLIANCE');
  } else {
    passedGates.push('COMPLIANCE');
  }
  jobs.push({
    id: 'job-compliance',
    name: 'DevSecOps Regulatory Compliance Auditor',
    type: 'DEPLOY' as any,
    status: complianceFailed ? 'FAILED' : 'PASSED',
    gateEnabled: true,
    findingsCount: state.complianceState.failedControls.length,
    logsAr: complianceFailed ? `فشل مراجعة الامتثال: ضوابط معطلة (${state.complianceState.failedControls.join(', ')})` : 'البناء ملتزم بمتطلبات PCI-DSS v4.0 و CC7.1 بالكامل.',
    logsEn: complianceFailed ? `Compliance audit failed: Broken regulatory controls: ${state.complianceState.failedControls.join(', ')}` : 'SaaS deployment meets PCI-DSS and SOC2 Trust Criteria CC7.1.'
  });

  // 11. DRIFT Gate
  const activeDrift = state.driftFindings.filter(d => !d.autoRemediated);
  const driftFailed = activeDrift.length > 0;
  if (driftFailed) {
    failedGates.push('DRIFT');
  } else {
    passedGates.push('DRIFT');
  }
  jobs.push({
    id: 'job-drift',
    name: 'Infrastructure Drift Checker',
    type: 'DEPLOY' as any,
    status: driftFailed ? 'FAILED' : 'PASSED',
    gateEnabled: true,
    findingsCount: activeDrift.length,
    logsAr: driftFailed ? 'انحراف مرصود: البنية التحتية تحتوي على تغييرات يدوية خارج كود السياسة.' : 'البنية التحتية السحابية Live متطابقة 100٪ مع سجلات حالة Terraform.',
    logsEn: driftFailed ? 'Drift Detected: Out-of-band resources are currently live without matching IaC review.' : 'Live infrastructure matches declarative IaC state with zero drift.'
  });

  // Decide pipeline execution outcome
  // To allow a pipeline to deploy, ALL required and enabled gates must pass.
  // In addition, if allowBypassOnFailure is true, the user CAN bypass, but for a true OMEGA secure release (and challenge pass), we block if there are failures.
  // The deterministic default is BLOCK.
  const hasFailures = failedGates.length > 0;
  const isBypassed = config.allowBypassOnFailure && hasFailures;
  const allowed = !hasFailures;

  let decision: 'ALLOW' | 'BLOCK' = allowed ? 'ALLOW' : 'BLOCK';
  let reasonEn = '';
  let reasonAr = '';

  if (allowed) {
    reasonEn = 'CI/CD pipeline passed all security quality gates. Deployment authorized.';
    reasonAr = 'اجتاز خط تجميع البرمجيات كافة بوابات الحماية الرقمية. تم التصريح بالنشر والتشغيل.';
  } else {
    reasonEn = `Pipeline BLOCKED. Failed Security Gates: ${failedGates.join(', ')}. Zero-trust build enforcement is active.`;
    reasonAr = `تم حظر التجميع الرقمي. بوابات الحماية غير المجتازة: ${failedGates.join(', ')}. سياسة المنع التلقائي والصفر ثقة قيد العمل.`;
  }

  return {
    allowed,
    decision,
    failedGates,
    passedGates,
    jobs,
    reasonEn,
    reasonAr
  };
}

// ==================================================
// 4. ARTIFACT INTEGRITY ENGINE
// ==================================================

export function verifyArtifactIntegrity(
  artifactState: DevSecOpsArtifactState,
  signature: SoftwareSignatureState,
  slsaAttestation: SlsaAttestation
): {
  verified: boolean;
  digestMatched: boolean;
  signatureValid: boolean;
  signerTrusted: boolean;
  transparencyVerified: boolean;
  reasonEn: string;
  reasonAr: string;
} {
  const digestMatched = signature && signature.digest === artifactState.digest;
  const signatureValid = signature && signature.signed && signature.signature.startsWith('sig-prod-');
  const signerTrusted = signature && signature.signerIdentity === 'github.com/nexora/enterprise-platform/.github/workflows/ci-cd-pipeline.yml@refs/heads/main';
  const transparencyVerified = signature && signature.rekorEntry.startsWith('rekor-uuid-') && slsaAttestation.isSignedRekorLog;
  const notTampered = !artifactState.tampered;

  const verified = digestMatched && signatureValid && signerTrusted && transparencyVerified && notTampered;

  let reasonEn = '';
  let reasonAr = '';

  if (verified) {
    reasonEn = 'Artifact cryptographic integrity verified. Signature and transparency records are authentic.';
    reasonAr = 'تم التحقق من النزاهة التشفيرية للمنتج الرقمي. التوقيع وسجلات تتبع الشفافية مطابقة وأصلية.';
  } else {
    const flaws: string[] = [];
    const flawsAr: string[] = [];
    if (!digestMatched) { flaws.push('digest mismatch'); flawsAr.push('عدم تطابق البصمة'); }
    if (!signatureValid) { flaws.push('invalid or missing signature'); flawsAr.push('توقيع رقمي غير صالح أو مفقود'); }
    if (!signerTrusted) { flaws.push('untrusted signer identity'); flawsAr.push('هوية الباني غير موثوقة'); }
    if (!transparencyVerified) { flaws.push('missing Rekor transparency log proof'); flawsAr.push('غياب إثبات سجل الشفافية Rekor'); }
    if (!notTampered) { flaws.push('artifact tampered after build'); flawsAr.push('تم العبث بالمنتج الرقمي بعد البناء'); }
    reasonEn = `Verification FAILED: ${flaws.join(', ')}.`;
    reasonAr = `فشل التحقق التشفيري: ${flawsAr.join('، ')}.`;
  }

  return {
    verified,
    digestMatched,
    signatureValid,
    signerTrusted,
    transparencyVerified,
    reasonEn,
    reasonAr
  };
}

// ==================================================
// 5. SBOM VALIDATION
// ==================================================

export function validateSbom(
  sbomComponents: SbomComponent[],
  artifactState: DevSecOpsArtifactState
): {
  valid: boolean;
  sbomExists: boolean;
  inventoryComplete: boolean;
  noHiddenComponents: boolean;
  hashesAvailable: boolean;
  formatValid: boolean;
  reasonEn: string;
  reasonAr: string;
} {
  const sbomExists = sbomComponents.length > 0;
  
  // Checking for essential software blocks: 'react', 'express', and 'gcr.io/distroless/static-debian12'
  const packageNames = sbomComponents.map(c => c.name);
  const inventoryComplete = sbomExists &&
    packageNames.includes('react') &&
    packageNames.includes('express') &&
    packageNames.includes('gcr.io/distroless/static-debian12');

  // Any typosquatting component present in the SBOM means it's invalid
  const hasTyposquat = packageNames.some(name => name.includes('expresss'));
  const noHiddenComponents = sbomExists && !hasTyposquat;

  // Hashes available for all declared components
  const hashesAvailable = sbomExists && sbomComponents.every(c => c.hashes && c.hashes.length > 0 && c.hashes[0].digest.length > 10);
  
  // Proper Package URL compliance check
  const formatValid = sbomExists && sbomComponents.every(c => c.purl && c.purl.startsWith('pkg:'));

  const valid = sbomExists && inventoryComplete && noHiddenComponents && hashesAvailable && formatValid;

  let reasonEn = '';
  let reasonAr = '';

  if (valid) {
    reasonEn = 'CycloneDX Software Bill of Materials is valid, complete, and contains all expected pinned packages.';
    reasonAr = 'جرد قائمة المواد البرمجية (SBOM) مكتمل، سليم ومطابق لكافة المتطلبات الهيكلية للحزم.';
  } else {
    const flaws: string[] = [];
    const flawsAr: string[] = [];
    if (!sbomExists) { flaws.push('SBOM is empty'); flawsAr.push('قائمة SBOM فارغة'); }
    else {
      if (!inventoryComplete) { flaws.push('missing core inventory dependencies'); flawsAr.push('تبعيات أساسية مفقودة'); }
      if (!noHiddenComponents) { flaws.push('detected malicious or undocumented package'); flawsAr.push('رصد حزمة برمجية خبيثة أو غير موثقة'); }
      if (!hashesAvailable) { flaws.push('missing integrity hashes'); flawsAr.push('بصمات التشفير مفقودة للقطع البرمجية'); }
      if (!formatValid) { flaws.push('purl formatting violations'); flawsAr.push('أخطاء صياغة purl القياسية'); }
    }
    reasonEn = `SBOM Validation Failed: ${flaws.join(', ')}.`;
    reasonAr = `فشل تدقيق قائمة المواد: ${flawsAr.join('، ')}.`;
  }

  return {
    valid,
    sbomExists,
    inventoryComplete,
    noHiddenComponents,
    hashesAvailable,
    formatValid,
    reasonEn,
    reasonAr
  };
}

// ==================================================
// 6. SLSA / PROVENANCE VALIDATION
// ==================================================

export function validateBuildProvenance(
  slsaAttestation: SlsaAttestation,
  artifactState: DevSecOpsArtifactState
): {
  verified: boolean;
  builderTrusted: boolean;
  repositoryMatched: boolean;
  commitMatched: boolean;
  workflowMatched: boolean;
  digestMatched: boolean;
  signatureValid: boolean;
  transparencyVerified: boolean;
  slsaLevelSufficient: boolean;
  reasonEn: string;
  reasonAr: string;
} {
  const builderTrusted = slsaAttestation.builderId === 'https://github.com/actions/runner';
  
  // Materials checking for the core repo URI
  const materialRepo = slsaAttestation.materials.find(m => m.uri.includes('github.com/nexora/enterprise-platform'));
  const repositoryMatched = !!materialRepo;

  // Assume valid commit check if it contains a non-empty string with repository matching
  const commitMatched = repositoryMatched && !!materialRepo.digest && materialRepo.digest.length > 5;
  
  // Workflow is trusted GitHub workflows
  const workflowMatched = slsaAttestation.buildType.includes('https://slsa.dev/provenance/');
  
  // Attestation digest verification matches actual built artifact digest
  // e.g. material digest or the direct artifact state digest matches SLSA output
  const digestMatched = !!materialRepo && artifactState.digest !== '' && !artifactState.tampered;

  const signatureValid = slsaAttestation.verified;
  const transparencyVerified = slsaAttestation.isSignedRekorLog;
  const slsaLevelSufficient = slsaAttestation.slsaLevel >= 3;

  const verified = builderTrusted && repositoryMatched && commitMatched && workflowMatched && digestMatched && signatureValid && transparencyVerified && slsaLevelSufficient;

  let reasonEn = '';
  let reasonAr = '';

  if (verified) {
    reasonEn = 'SLSA Level 3 build provenance verified. Zero tampering detected between code commit and release binary.';
    reasonAr = 'تم التحقق من شهادة المنشأ البرمجي SLSA Level 3. البناء موثوق ومحمي تماماً من التلاعب.';
  } else {
    const flaws: string[] = [];
    const flawsAr: string[] = [];
    if (!builderTrusted) { flaws.push('untrusted builder host'); flawsAr.push('باني برمجيات غير موثوق'); }
    if (!repositoryMatched) { flaws.push('source repository URL mismatch'); flawsAr.push('عنوان مستودع المصدر غير مطابق'); }
    if (!commitMatched) { flaws.push('commit SHA validation failed'); flawsAr.push('فشل التحقق من بصمة التجميع Git SHA'); }
    if (!workflowMatched) { flaws.push('untrusted build workflow recipe'); flawsAr.push('وصفة سير عمل البناء غير موثوقة'); }
    if (!digestMatched) { flaws.push('artifact digest mismatch vs provenance materials'); flawsAr.push('بصمة البناء لا تطابق المواد المسجلة في شهادة المنشأ'); }
    if (!signatureValid) { flaws.push('invalid provenance signature'); flawsAr.push('توقيع شهادة المنشأ غير صالح'); }
    if (!transparencyVerified) { flaws.push('missing transparency log enrollment'); flawsAr.push('الشهادة غير مدرجة في سجل الشفافية'); }
    if (!slsaLevelSufficient) { flaws.push('insufficient SLSA safety level'); flawsAr.push('مستوى أمان شهادة SLSA ضعيف'); }

    reasonEn = `SLSA Provenance Audit Failed: ${flaws.join(', ')}.`;
    reasonAr = `فشل تدقيق شهادة المنشأ: ${flawsAr.join('، ')}.`;
  }

  return {
    verified,
    builderTrusted,
    repositoryMatched,
    commitMatched,
    workflowMatched,
    digestMatched,
    signatureValid,
    transparencyVerified,
    slsaLevelSufficient,
    reasonEn,
    reasonAr
  };
}

// ==================================================
// 7. DEVSECOPS MASTER CHALLENGE VALIDATOR
// ==================================================

export interface DevSecOpsChallengeValidation {
  isPassed: boolean;
  failedChecks: string[];
  antiCheatViolations: string[];
  pipelineAllowed: boolean;
  businessContinuityPassed: boolean;
  score: number;
}

export function validateDevSecOpsMasterChallenge(state: DevSecOpsMasterState): DevSecOpsChallengeValidation {
  const failedChecks: string[] = [];
  const antiCheatViolations: string[] = [];

  // Enforce zero-bypass policy and enabled gates
  const config = state.pipelineConfig;
  const pipelineScoreCheck = evaluateDevSecOpsPipeline(state);

  // 1. SAST Remediation Check
  // All critical & high vulnerabilities must be remediated
  const activeSast = state.sastFindings.filter(f => !f.remediated && (f.severity === 'CRITICAL' || f.severity === 'HIGH'));
  const sastRemediated = activeSast.length === 0;
  if (!sastRemediated) {
    failedChecks.push('Remediate all CRITICAL and HIGH SAST code flaws (SQL Injection & XSS)');
  }

  // 2. SCA Remediation Check
  // axios CVE-2023-45857 remediated, expresss-js typosquat remediated, copyleft AGPL library patched
  const activeSca = state.dependencies.filter(d => !d.remediated && (d.severity === 'CRITICAL' || d.severity === 'HIGH' || d.isTyposquatting || !d.licenseCompliant));
  const scaRemediated = activeSca.length === 0;
  if (!scaRemediated) {
    failedChecks.push('Resolve vulnerable packages, eliminate typosquatting malware, and fix AGPL copyleft license violations');
  }

  // 3. Secrets Scanner Remediation Check
  // Leaked secrets rotated (remediated = true) and inCommitHistory = false or remediated
  const activeSecrets = state.secretMatches.filter(s => !s.remediated);
  const secretsRemediated = activeSecrets.length === 0;
  if (!secretsRemediated) {
    failedChecks.push('Scrub leaked AWS and Stripe credentials from working tree, rotate tokens, and clean Git history');
  }

  // 4. Terraform Hardening Check
  // SG closed, S3 bucket encryption added
  const activeTf = state.terraformResources.filter(r => !r.remediated && r.hasMisconfiguration);
  const tfRemediated = activeTf.length === 0;
  if (!tfRemediated) {
    failedChecks.push('Harden Terraform IaC: Restrict administrative SSH ports and enable S3 Server-Side Encryption');
  }

  // 5. Container Image Check
  // Container must have pinned digest, pinned non-latest tags, zero vulnerabilities, signed, trusted registry, zero secrets, verified SBOM
  const container = state.containerImages[0];
  const containerValid = container &&
    container.vulnerabilitiesCount === 0 &&
    container.signed &&
    container.trustedRegistry &&
    container.embeddedSecretsCount === 0 &&
    container.tag !== 'latest' &&
    container.digest !== '' &&
    container.sbomVerified;
  if (!containerValid) {
    failedChecks.push('Secure and sign container image: remove critical vulnerabilities, pin registry digest, and remove embedded secrets');
  }

  // 6. SBOM Complete
  const sbomResult = validateSbom(state.sbomComponents, state.artifactState);
  if (!sbomResult.valid) {
    failedChecks.push('Generate complete and valid CycloneDX SBOM containing all production dependencies');
  }

  // 7. SLSA Provenance Verified
  const provenanceResult = validateBuildProvenance(state.slsaAttestation, state.artifactState);
  if (!provenanceResult.verified) {
    failedChecks.push('Validate SLSA Level 3 Provenance attestation with a verified builder signature');
  }

  // 8. Artifact Cryptographic Signing & Rekor Verification
  const signatureState = state.signatures[0];
  const integrityResult = verifyArtifactIntegrity(state.artifactState, signatureState, state.slsaAttestation);
  if (!integrityResult.verified) {
    failedChecks.push('Verify artifact cryptographic integrity, Cosign digital signature, and Rekor ledger proof');
  }

  // 9. Infrastructure Drift remediated
  const activeDrift = state.driftFindings.filter(d => !d.autoRemediated);
  const driftRemediated = activeDrift.length === 0;
  if (!driftRemediated) {
    failedChecks.push('Auto-remediate and align cloud live infrastructure configuration drift back to Terraform baseline');
  }

  // 10. Compliance State passed
  const compliancePassed = state.complianceState.failedControls.length === 0 &&
    state.complianceState.pciDssCompliant &&
    state.complianceState.soc2Compliant;
  if (!compliancePassed) {
    failedChecks.push('Audit and verify PCI-DSS v4.0 and SOC2 regulatory compliance metrics');
  }

  // 11. Strict CI Gate Enforcement
  const gatesConfiguredCorrectly =
    config.requireSastGate &&
    config.requireScaGate &&
    config.requireSecretScanGate &&
    config.requireIacScanGate &&
    config.requireContainerScanGate &&
    config.requireCosignSignatureGate &&
    !config.allowBypassOnFailure;
  if (!gatesConfiguredCorrectly) {
    failedChecks.push('Enforce all mandatory CI/CD security quality gates with zero bypass permissions');
  }

  // 12. Explicit Anti-Cheat Violations
  // Violation A: Deleting/clearing findings to bypass
  if (state.sastFindings.length < 3) {
    antiCheatViolations.push('SAST findings array tampered or deleted. Vulnerabilities must be preserved and fully remediated.');
  }
  if (state.dependencies.length < 3) {
    antiCheatViolations.push('SCA dependencies array tampered or deleted. Package records must be preserved and fully updated.');
  }
  if (state.secretMatches.length < 2) {
    antiCheatViolations.push('Git secrets matches array tampered or cleared. Secret scan history must be preserved and fully scrubbed.');
  }
  if (state.terraformResources.length < 2) {
    antiCheatViolations.push('Terraform templates array tampered or deleted. Cloud resource definitions must be preserved and fully hardened.');
  }
  if (state.containerImages.length === 0) {
    antiCheatViolations.push('Container image registry reference deleted or emptied. Secure target image validation is mandatory.');
  }
  if (state.sbomComponents.length < 3) {
    antiCheatViolations.push('SBOM components cannot be cleared to bypass composition analysis.');
  }

  // Violation B: Pipeline bypass configuration active
  if (config.allowBypassOnFailure) {
    antiCheatViolations.push('CI/CD Pipeline configuration bypass is active. Security quality gates must be non-bypassable (allowBypassOnFailure must be false) to achieve OMEGA status.');
  }
  
  // Violation C: Disabled mandatory quality gates
  const mandatoryGatesEnabled =
    config.requireSastGate &&
    config.requireScaGate &&
    config.requireSecretScanGate &&
    config.requireIacScanGate &&
    config.requireContainerScanGate &&
    config.requireCosignSignatureGate;
  if (!mandatoryGatesEnabled) {
    antiCheatViolations.push('Mandatory CI/CD verification gates must remain enabled and configured correctly.');
  }

  // Violation D: Digital signatures or SLSA attestation integrity forged
  if (state.signatures[0]) {
    const signature = state.signatures[0];
    if (signature.signed && (!signature.signature || !signature.signature.startsWith('sig-prod-'))) {
      antiCheatViolations.push('Cosign software signature format is invalid or forged.');
    }
    if (signature.verified && signature.digest !== state.artifactState.digest) {
      antiCheatViolations.push('Artifact signature verified status is forged. Digital signature digest must match the release artifact digest.');
    }
  }
  if (state.slsaAttestation) {
    if (state.slsaAttestation.verified && state.slsaAttestation.builderId !== 'https://github.com/actions/runner') {
      antiCheatViolations.push('SLSA Provenance builder is forged or untrusted.');
    }
  }

  // Enforce Anti-Cheat: User must not bypass gate check requirements or manually force passing variables
  if (state.antiCheatFlags && antiCheatViolations.length === 0) {
    state.antiCheatFlags.sastVulnerabilitiesFixed = sastRemediated;
    state.antiCheatFlags.scaPackagesUpdatedAndLicensesVerified = scaRemediated;
    state.antiCheatFlags.hardcodedSecretsScrubbedFromGitHistory = secretsRemediated;
    state.antiCheatFlags.terraformTemplatesHardenedAndOpenPortsClosed = tfRemediated;
    state.antiCheatFlags.ciSecurityGatesEnforcedWithZeroBypass = gatesConfiguredCorrectly;
    state.antiCheatFlags.sbomGeneratedAndSlsaAttested = sbomResult.valid && provenanceResult.verified;
    state.antiCheatFlags.infrastructureDriftRemediated = driftRemediated;
  }

  // Business Continuity check: If everything is hardened and remediated, pipeline allows the build and releases!
  // Secure release -> ALLOW, Vulnerable release -> BLOCK
  const pipelineAllowed = pipelineScoreCheck.allowed && antiCheatViolations.length === 0;
  const businessContinuityPassed = pipelineAllowed && failedChecks.length === 0;

  // If there are any anti-cheat violations, override everything
  if (antiCheatViolations.length > 0) {
    return {
      isPassed: false,
      failedChecks,
      antiCheatViolations,
      pipelineAllowed: false,
      businessContinuityPassed: false,
      score: 0
    };
  }

  const totalCriteria = 11;
  const completedCriteria = totalCriteria - failedChecks.length;
  const score = Math.round((completedCriteria / totalCriteria) * 100);
  const isPassed = completedCriteria === totalCriteria;

  return {
    isPassed,
    failedChecks,
    antiCheatViolations,
    pipelineAllowed,
    businessContinuityPassed,
    score
  };
}
