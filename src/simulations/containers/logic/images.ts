/**
 * OMEGA V14 — Container Image Security & Supply Chain Engine
 * Evaluates Dockerfile hardening, multi-stage builds, CVE vulnerability databases, and Cosign digital signatures.
 */

import { ContainerImage, ContainerImageLayer, ImageVulnerability } from './types';

export const VULNERABILITY_DATABASE: ImageVulnerability[] = [
  {
    cveId: 'CVE-2023-4911',
    package: 'glibc',
    installedVersion: '2.35-0ubuntu3.1',
    fixedVersion: '2.35-0ubuntu3.4',
    severity: 'CRITICAL',
    cvss: 9.8,
    descriptionAr: 'ثغرة Looney Tunables في مكتبة glibc تتيح الترقية لصلاحيات Root عبر متغير بيئة GLIBC_TUNABLES.',
    descriptionEn: 'Looney Tunables buffer overflow in ld.so glibc processing allowing local privilege escalation to root.',
    exploitableInContainer: true,
  },
  {
    cveId: 'CVE-2024-21626',
    package: 'runc',
    installedVersion: '1.1.11',
    fixedVersion: '1.1.12',
    severity: 'CRITICAL',
    cvss: 8.6,
    descriptionAr: 'ثغرة Leaky Vessels في runc تتيح تسريب واصف الملفات (File Descriptor) وكسر عزل الحاوية للوصول للمضيف.',
    descriptionEn: 'Leaky Vessels container breakout via leaked file descriptor in runc during process execution.',
    exploitableInContainer: true,
  },
  {
    cveId: 'CVE-2023-44487',
    package: 'libnghttp2',
    installedVersion: '1.43.0',
    fixedVersion: '1.43.0-r3',
    severity: 'HIGH',
    cvss: 7.5,
    descriptionAr: 'ثغرة HTTP/2 Rapid Reset تتيح شن هجمات حجب الخدمة عبر إرسال تدفقات RST_STREAM متكررة.',
    descriptionEn: 'HTTP/2 Rapid Reset distributed denial of service attack vector via multiplexed stream cancellation.',
    exploitableInContainer: true,
  },
  {
    cveId: 'CVE-2023-38545',
    package: 'curl',
    installedVersion: '7.88.1',
    fixedVersion: '8.4.0',
    severity: 'HIGH',
    cvss: 7.5,
    descriptionAr: 'تجاوز سعة المخزن المؤقت (Heap Buffer Overflow) في curl عند استخدام بروكسي SOCKS5.',
    descriptionEn: 'Heap buffer overflow in SOCKS5 proxy handshake protocol handler within libcurl.',
    exploitableInContainer: true,
  },
  {
    cveId: 'CVE-2022-37434',
    package: 'zlib',
    installedVersion: '1.2.11',
    fixedVersion: '1.2.12',
    severity: 'MEDIUM',
    cvss: 6.5,
    descriptionAr: 'تجاوز سعة الذاكرة المؤقتة في zlib أثناء فك ضغط ترويسات gzip الكبيرة.',
    descriptionEn: 'Heap-based buffer overflow in inflate.c via a large gzip header extra field.',
    exploitableInContainer: false,
  },
];

export function getSampleVulnerableImage(): ContainerImage {
  return {
    id: 'img-vulnerable-monolith',
    repository: 'registry.nexora.internal/apps/payment-gateway',
    tag: 'v1.0.0-dirty',
    digest: 'sha256:7f9a28b6c5d1e434f09823aa3241bc19e564d2e147b309f7a93290b3b44b8291',
    baseImage: 'ubuntu:latest',
    isSignedCosign: false,
    runsAsUser: 'root (UID 0)',
    hasMultiStageBuild: false,
    layers: [
      {
        id: 'layer-1-base',
        instruction: 'FROM ubuntu:latest (78MB)',
        sizeMb: 78,
        hasSecretLeak: false,
        vulnerabilities: [VULNERABILITY_DATABASE[0], VULNERABILITY_DATABASE[3], VULNERABILITY_DATABASE[4]],
      },
      {
        id: 'layer-2-packages',
        instruction: 'RUN apt-get update && apt-get install -y gcc git curl python3-pip (145MB)',
        sizeMb: 145,
        hasSecretLeak: false,
        vulnerabilities: [VULNERABILITY_DATABASE[1]],
      },
      {
        id: 'layer-3-secrets',
        instruction: 'COPY config.json /app/config.json (ENV STRIPE_SECRET_KEY="sk_live_99481a...")',
        sizeMb: 0.1,
        hasSecretLeak: true,
        leakedSecretType: 'Hardcoded Production Payment API Secret Key',
        vulnerabilities: [],
      },
      {
        id: 'layer-4-app',
        instruction: 'COPY . /app && pip install -r requirements.txt',
        sizeMb: 35,
        hasSecretLeak: false,
        vulnerabilities: [VULNERABILITY_DATABASE[2]],
      },
      {
        id: 'layer-5-cmd',
        instruction: 'CMD ["python3", "/app/server.py"] (Runs as default Root)',
        sizeMb: 0,
        hasSecretLeak: false,
        vulnerabilities: [],
      },
    ],
  };
}

export function getHardenedDistrolessImage(): ContainerImage {
  return {
    id: 'img-distroless-hardened',
    repository: 'registry.nexora.internal/apps/payment-gateway',
    tag: 'v1.0.0-hardened',
    digest: 'sha256:9c1a5d20f92b7405e3f2894101e4a77db938b8ca8137281bc88523a19b8893cd',
    baseImage: 'gcr.io/distroless/static',
    isSignedCosign: true,
    signerIdentity: 'cosign:pipeline-builder@nexora.internal (OIDC Sigstore verified)',
    runsAsUser: 'appuser (UID 10001:10001 non-root)',
    hasMultiStageBuild: true,
    layers: [
      {
        id: 'layer-1-build-stage',
        instruction: 'STAGE 1: Builder (golang:1.22-alpine) -> Compiled static binary',
        sizeMb: 0, // discarded in multi-stage
        hasSecretLeak: false,
        vulnerabilities: [],
      },
      {
        id: 'layer-2-distroless',
        instruction: 'STAGE 2: FROM gcr.io/distroless/static:nonroot (No shell, no package manager, 2.5MB)',
        sizeMb: 2.5,
        hasSecretLeak: false,
        vulnerabilities: [],
      },
      {
        id: 'layer-3-binary',
        instruction: 'COPY --from=builder /bin/payment-gateway /bin/payment-gateway',
        sizeMb: 12.0,
        hasSecretLeak: false,
        vulnerabilities: [],
      },
      {
        id: 'layer-4-user',
        instruction: 'USER 10001:10001 (Enforced non-root user)',
        sizeMb: 0,
        hasSecretLeak: false,
        vulnerabilities: [],
      },
      {
        id: 'layer-5-cmd',
        instruction: 'ENTRYPOINT ["/bin/payment-gateway"]',
        sizeMb: 0,
        hasSecretLeak: false,
        vulnerabilities: [],
      },
    ],
  };
}

export function scanImageSecurity(image: ContainerImage): {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  secretLeaksCount: number;
  hasShellAttackSurface: boolean;
  isCosignVerified: boolean;
  securityScore: number;
  verdictAr: string;
  verdictEn: string;
} {
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let secretLeaksCount = 0;

  for (const layer of image.layers) {
    if (layer.hasSecretLeak) secretLeaksCount++;
    for (const v of layer.vulnerabilities) {
      if (v.severity === 'CRITICAL') criticalCount++;
      else if (v.severity === 'HIGH') highCount++;
      else if (v.severity === 'MEDIUM') mediumCount++;
    }
  }

  const totalVulnerabilities = criticalCount + highCount + mediumCount;
  const hasShellAttackSurface = image.baseImage === 'ubuntu:latest' || image.baseImage === 'debian:slim';

  let securityScore = 100;
  securityScore -= criticalCount * 25;
  securityScore -= highCount * 12;
  securityScore -= mediumCount * 5;
  securityScore -= secretLeaksCount * 30;
  if (!image.isSignedCosign) securityScore -= 15;
  if (!image.hasMultiStageBuild) securityScore -= 10;
  if (image.runsAsUser.startsWith('root') || image.runsAsUser.includes('UID 0')) securityScore -= 15;

  securityScore = Math.max(0, Math.min(100, securityScore));

  let verdictAr = 'صورة محصنة وفق أفضل ممارسات DevSecOps وسلاسل التوريد';
  let verdictEn = 'Hardened Image passing DevSecOps and supply chain gates';

  if (securityScore < 40) {
    verdictAr = 'صورة خطرة جداً تحتوي ثغرات حرجة وأسرار مكشوفة ويجب منع نشرها!';
    verdictEn = 'Critical Risk: Image contains high-severity CVEs & leaked secrets. Deployment rejected.';
  } else if (securityScore < 75) {
    verdictAr = 'صورة مقبولة لكنها تحتاج لإزالة الحزم الزائدة والتوقيع الرقمي';
    verdictEn = 'Medium Risk: Needs bloat reduction, non-root user enforcement, and signing.';
  }

  return {
    totalVulnerabilities,
    criticalCount,
    highCount,
    mediumCount,
    secretLeaksCount,
    hasShellAttackSurface,
    isCosignVerified: image.isSignedCosign,
    securityScore,
    verdictAr,
    verdictEn,
  };
}
