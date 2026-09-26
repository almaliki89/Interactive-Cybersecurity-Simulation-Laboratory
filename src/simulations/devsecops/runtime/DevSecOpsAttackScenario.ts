/**
 * OMEGA V15 — DevSecOps Supply Chain Attack & Defense Scenarios
 */

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
