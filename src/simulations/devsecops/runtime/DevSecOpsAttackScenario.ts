/**
 * OMEGA V15.1 — Deterministic DevSecOps & Supply Chain Attack Scenario
 * Integrates directly with SimulationRuntime and EventEngine to model high-fidelity attacks.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';

export interface DevSecOpsScenarioEvent {
  virtualTime: number;
  type: string;
  source: string;
  target: string;
  descriptionAr: string;
  descriptionEn: string;
  severity: 'info' | 'warn' | 'threat' | 'critical';
  payload: Record<string, any>;
}

export const CANONICAL_DEVSECOPS_TIMELINE: DevSecOpsScenarioEvent[] = [
  {
    virtualTime: 100,
    type: 'DEVSECOPS_SECRET_DETECTED',
    source: 'github.com/nexora/enterprise-platform',
    target: 'config/payment.json',
    descriptionAr: 'تم رصد تسريب لمفتاح Stripe السري المشفر داخل مستودع الأكواد.',
    descriptionEn: 'Hardcoded high-entropy Stripe API credentials leaked in config/payment.json.',
    severity: 'threat',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'fa43bc92e10c',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:d57e1234567890abcdef',
      actor: 'dev-malicious',
      outcome: 'FAILURE',
      filePath: 'config/payment.json',
      secretType: 'STRIPE_SECRET_KEY'
    }
  },
  {
    virtualTime: 250,
    type: 'DEVSECOPS_TYPOSQUAT_DETECTED',
    source: 'github.com/nexora/enterprise-platform',
    target: 'package.json',
    descriptionAr: 'رصد تبعية خبيثة انتحالية باسم (expresss-js) تحاول سرقة أسرار البيئة.',
    descriptionEn: 'Malicious dependency expresss-js detected in package.json. Harvesting active env variables.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'fa43bc92e10c',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:d57e1234567890abcdef',
      actor: 'dev-malicious',
      outcome: 'FAILURE',
      packageName: 'expresss-js',
      isTyposquatting: true
    }
  },
  {
    virtualTime: 400,
    type: 'DEVSECOPS_SAST_FINDING',
    source: 'github.com/nexora/enterprise-platform',
    target: 'src/api/users.ts',
    descriptionAr: 'ثغرة حقن استعلامات SQL غير منقحة تم اكتشافها بواسطة Semgrep SAST.',
    descriptionEn: 'Critical SQL Injection vulnerability scanned in src/api/users.ts line 42.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'fa43bc92e10c',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:d57e1234567890abcdef',
      actor: 'dev-malicious',
      outcome: 'FAILURE',
      filePath: 'src/api/users.ts',
      ruleId: 'JS-SQL-INJECTION'
    }
  },
  {
    virtualTime: 600,
    type: 'DEVSECOPS_IAC_MISCONFIGURATION',
    source: 'github.com/nexora/enterprise-platform',
    target: 'main.tf',
    descriptionAr: 'خطأ إعداد Terraform: منفذ إدارة SSH مفتوح للإنترنت بالكامل (0.0.0.0/0).',
    descriptionEn: 'CKV_AWS_24: Exposing administrative SSH port 22 to public internet in SG allow_public_management.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'fa43bc92e10c',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:d57e1234567890abcdef',
      actor: 'dev-malicious',
      outcome: 'FAILURE',
      ruleId: 'CKV_AWS_24',
      cidrBlocks: ['0.0.0.0/0']
    }
  },
  {
    virtualTime: 800,
    type: 'DEVSECOPS_PIPELINE_BYPASS_ATTEMPT',
    source: 'github.com/nexora/enterprise-platform',
    target: 'ci-cd-pipeline.yml',
    descriptionAr: 'تحذير: محاولة لتجاوز بوابات الحماية المعتمدة في خط التجميع الرقمي.',
    descriptionEn: 'Warning: Developer attempted to bypass CI/CD security quality gates using override flag.',
    severity: 'threat',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'bc83fd21a00e',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:d57e1234567890abcdef',
      actor: 'dev-malicious',
      outcome: 'DENIED',
      bypassGateAttempted: 'SAST_SCA_GATES'
    }
  },
  {
    virtualTime: 1000,
    type: 'DEVSECOPS_ARTIFACT_TAMPERED',
    source: 'github.com/nexora/enterprise-platform',
    target: 'nexora-enterprise-service',
    descriptionAr: 'خطر هجوم سلسلة توريد: تم كشف تلاعب بالبصمة الرقمية للحزمة المنتجة بعد البناء.',
    descriptionEn: 'Critical: Released container binary digest does not match compiled source digest! Unauthorized binary replacement suspected.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'bc83fd21a00e',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:tampered8899aabbccddeeff',
      actor: 'attacker-supply-chain',
      outcome: 'ANOMALY',
      tamperDetected: true
    }
  },
  {
    virtualTime: 1200,
    type: 'DEVSECOPS_SIGNATURE_FAILED',
    source: 'github.com/nexora/enterprise-platform',
    target: 'nexora-enterprise-service',
    descriptionAr: 'فشل تفعيل توقيع Cosign: المنتج البرمجي يفتقد لتوقيع تشفيري صالح.',
    descriptionEn: 'Build artifact failed signature check: missing valid cryptographic signature for trust validation.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'bc83fd21a00e',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:tampered8899aabbccddeeff',
      actor: 'attacker-supply-chain',
      outcome: 'FAILURE',
      error: 'SIGNATURE_NOT_FOUND'
    }
  },
  {
    virtualTime: 1400,
    type: 'DEVSECOPS_PROVENANCE_MISMATCH',
    source: 'github.com/nexora/enterprise-platform',
    target: 'slsa-attestation.json',
    descriptionAr: 'فشل شهادة المنشأ: باني برمجيات غير معتمد أو مستودع الكود المصدر غير مطابق.',
    descriptionEn: 'Supply Chain Threat: SLSA Provenance builder ID is unauthorized. Commit SHA does not match repo origin.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'bc83fd21a00e',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:tampered8899aabbccddeeff',
      actor: 'attacker-supply-chain',
      outcome: 'FAILURE',
      builderId: 'https://github.com/untrusted/builder'
    }
  },
  {
    virtualTime: 1600,
    type: 'DEVSECOPS_PIPELINE_BLOCKED',
    source: 'github.com/nexora/enterprise-platform',
    target: 'ci-cd-pipeline.yml',
    descriptionAr: 'فشل خط التجميع: البوابات الأمنية حظرت عملية بناء المنتج رقم ٢٤ لعدم توفر متطلبات النزاهة.',
    descriptionEn: 'DevSecOps Enforcement: Automatic blocker triggered. Build #24 rejected due to failed security quality gates.',
    severity: 'critical',
    payload: {
      repository: 'github.com/nexora/enterprise-platform',
      commitSha: 'bc83fd21a00e',
      workflow: 'ci-cd-pipeline.yml',
      artifact: 'nexora-enterprise-service',
      artifactDigest: 'sha256:tampered8899aabbccddeeff',
      actor: 'ci-cd-runner',
      outcome: 'DENIED',
      blockedGates: ['SAST', 'SCA', 'SECRET_SCAN', 'CONTAINER_SCAN', 'SIGNATURE', 'PROVENANCE']
    }
  }
];

export function loadDevSecOpsAttackScenario(runtime: SimulationRuntime): void {
  // Clear any current events on the event engine queue
  runtime.events.clear();

  // Schedule all canonical timeline events into the SimulationRuntime
  for (const evt of CANONICAL_DEVSECOPS_TIMELINE) {
    runtime.schedule({
      id: `devsec-evt-${evt.virtualTime}`,
      at: evt.virtualTime,
      type: evt.type,
      source: evt.source,
      target: evt.target,
      category: 'DEVSECOPS', // Sets correct routing in SOC normalization
      severity: evt.severity === 'critical' || evt.severity === 'threat' ? 'threat' : 'warn',
      description: evt.descriptionEn,
      payload: {
        ...evt.payload,
        descriptionAr: evt.descriptionAr,
        descriptionEn: evt.descriptionEn
      }
    } as any);
  }

  // Record a fresh snapshot at virtualTime 0
  runtime.replay.recordSnapshot(0, runtime.getState());
}

export interface SupplyChainAttackStage {
  stageId: number;
  nameAr: string;
  nameEn: string;
  technique: string;
  attackerAction: string;
  targetComponent: string;
  observedImpactAr: string;
  observedImpactEn: string;
  mitigationRequiredAr: string;
  mitigationRequiredEn: string;
}

export const SUPPLY_CHAIN_ATTACK_SCENARIO: SupplyChainAttackStage[] = [
  {
    stageId: 1,
    nameAr: 'المرحلة الأولى: دمج حزمة خبيثة انتحالية (Typosquatting Package)',
    nameEn: 'Stage 1: Typosquatting NPM Package Injection',
    technique: 'T1195.001 - Supply Chain Compromise: Compromise Software Dependencies',
    attackerAction: 'npm install expresss-js --save (Malicious package harvesting process.env)',
    targetComponent: 'package.json',
    observedImpactAr: 'المهاجم ينشر حزمة زنيخة انتحالية تسرق مفاتيح التشفير وأسرار البيئة أثناء البناء.',
    observedImpactEn: 'Attacker tricks developer into installing typosquatted NPM package harvesting runtime secrets.',
    mitigationRequiredAr: 'تفعيل فحص SCA التلقائي وحظر الحزم غير المعتمدة والتحقق من ترخيص الحزمة.',
    mitigationRequiredEn: 'Enforce automated SCA dependency auditing and block unverified typosquatted packages.',
  },
  {
    stageId: 2,
    nameAr: 'المرحلة الثانية: رفع مفاتيح API حية في التزام Git (Git Hardcoded Secret)',
    nameEn: 'Stage 2: Hardcoded Production Key Leaked in Git Commit',
    technique: 'T1552.001 - Unsecured Credentials: Credentials In Files',
    attackerAction: 'git commit -m "feat: add payment integration" (Leaking Stripe SK_LIVE Key)',
    targetComponent: '.env.production & git history',
    observedImpactAr: 'المهاجم يستخرج المفاتيح المسربة من مستودع Git العام ويسيطر على حساب الشركة المالي.',
    observedImpactEn: 'Bot scrapes exposed Stripe API secret key from public GitHub commit history.',
    mitigationRequiredAr: 'تفعيل خطاف Pre-Commit وفحص git-filter-repo لتطهير السجل التاريخي وتدوير المفتاح.',
    mitigationRequiredEn: 'Deploy Git pre-commit hooks, scrub commit history, and rotate leaked credentials.',
  },
  {
    stageId: 3,
    nameAr: 'المرحلة الثالثة: دمج قالب Terraform بإنشاء جدار حماية مفتوح كلياً',
    nameEn: 'Stage 3: Insecure Terraform Ingress Gate (0.0.0.0/0 SSH Open)',
    technique: 'T1578 - Modify Cloud Compute Infrastructure',
    attackerAction: 'terraform apply (Deploying SG ingress 0.0.0.0/0 port 22 & public S3 bucket)',
    targetComponent: 'main.tf & aws_security_group',
    observedImpactAr: 'إنشاء بنية تحتية سحابية غير محمية تعرض منافذ SSH وقواعد البيانات للهجوم المباشر.',
    observedImpactEn: 'Provisioned cloud infrastructure exposes SSH port 22 and unencrypted S3 bucket publicly.',
    mitigationRequiredAr: 'تطبيق فحص Checkov / OPA في خط CI/CD لمنع تطبيق أي قالب Terraform يحتوي أخطاء عالية الخطورة.',
    mitigationRequiredEn: 'Enforce Checkov / tfsec Policy-as-Code gates to reject insecure Terraform templates.',
  },
];
