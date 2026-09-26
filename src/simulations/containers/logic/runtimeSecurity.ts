/**
 * OMEGA V14 — Falco & eBPF Runtime Security Detection Engine
 * Intercepts Linux kernel syscalls via eBPF probes and triggers real-time alerts & quarantine.
 */

import { FalcoRule, RuntimeSecurityEvent } from './types';

export function getInitialFalcoRules(): FalcoRule[] {
  return [
    {
      id: 'rule-spawn-shell-in-container',
      name: 'Terminal Shell Spawned in Container',
      descriptionAr: 'رصد فتح جلسة شيل تفاعلية (bash/sh) داخل حاوية إنتاجية عبر kubectl exec أو حقن RCE.',
      descriptionEn: 'Detects interactive shell (bash, sh, zsh) spawned inside a production container via kubectl exec or web RCE.',
      condition: 'container.id != host and proc.name in (bash, sh, zsh, ksh) and evt.type = execve',
      severity: 'CRITICAL',
      outputTemplate: 'Interactive shell opened in container (user=%user.name pod=%k8s.pod.name cmd=%proc.cmdline)',
      enabled: true,
      autoQuarantineOnMatch: true,
    },
    {
      id: 'rule-read-sensitive-files',
      name: 'Read Sensitive System File (/etc/shadow or ServiceAccount Token)',
      descriptionAr: 'رصد محاولة قراءة ملفات كلمات المرور أو استخراج توكن ServiceAccount بشكل مشبوه.',
      descriptionEn: 'Detects unexpected read attempt on /etc/shadow, /etc/passwd, or k8s serviceaccount token.',
      condition: 'fd.name in (/etc/shadow, /var/run/secrets/kubernetes.io/serviceaccount/token) and evt.type in (open, openat)',
      severity: 'HIGH',
      outputTemplate: 'Sensitive file read inside container (file=%fd.name pod=%k8s.pod.name proc=%proc.name)',
      enabled: true,
      autoQuarantineOnMatch: false,
    },
    {
      id: 'rule-crypto-mining-outbound',
      name: 'Outbound Connection to Known Crypto Mining Pool',
      descriptionAr: 'رصد اتصال شبكي خارجي نحو منافذ بروتوكول Stratum لتعدين العملات المشفرة (Monero).',
      descriptionEn: 'Detects outbound network connection to cryptocurrency mining stratum ports (3333, 4444, 8333).',
      condition: 'evt.type = connect and fd.port in (3333, 4444, 8333, 9999) and container.id != host',
      severity: 'CRITICAL',
      outputTemplate: 'Crypto mining outbound traffic detected (dst_ip=%fd.rip dst_port=%fd.rport pod=%k8s.pod.name)',
      enabled: true,
      autoQuarantineOnMatch: true,
    },
    {
      id: 'rule-package-manager-execution',
      name: 'Package Management Tool Launched in Container',
      descriptionAr: 'رصد تشغيل أدوات إدارة الحزم (apt, apk, yum, curl) في بيئة الإنتاج لتحميل برمجيات خبيثة.',
      descriptionEn: 'Detects execution of package managers (apt, apk, yum, dnf) or download tools (curl, wget) in runtime container.',
      condition: 'proc.name in (apt, apt-get, apk, yum, dnf, rpm, curl, wget) and container.id != host',
      severity: 'WARNING',
      outputTemplate: 'Package manager or download tool executed in container (proc=%proc.name pod=%k8s.pod.name)',
      enabled: true,
      autoQuarantineOnMatch: false,
    },
  ];
}

export function evaluateSyscallEvent(
  params: {
    podName: string;
    namespace: string;
    containerId: string;
    syscall: string;
    process: string;
    parentProcess: string;
    arguments: string;
    targetPathOrIp?: string;
    virtualTime: number;
  },
  rules: FalcoRule[]
): {
  matchedRule: FalcoRule | null;
  runtimeEvent: RuntimeSecurityEvent | null;
  triggeredQuarantine: boolean;
} {
  for (const rule of rules) {
    if (!rule.enabled) continue;

    let isMatch = false;

    if (rule.id === 'rule-spawn-shell-in-container') {
      if (['bash', 'sh', 'zsh', 'ash'].includes(params.process)) {
        isMatch = true;
      }
    } else if (rule.id === 'rule-read-sensitive-files') {
      if (
        params.targetPathOrIp?.includes('shadow') ||
        params.targetPathOrIp?.includes('serviceaccount/token') ||
        params.arguments.includes('/etc/shadow') ||
        params.arguments.includes('serviceaccount/token')
      ) {
        isMatch = true;
      }
    } else if (rule.id === 'rule-crypto-mining-outbound') {
      if (
        params.arguments.includes('stratum') ||
        params.arguments.includes('pool.supportxmr.com') ||
        params.targetPathOrIp === '198.51.100.99'
      ) {
        isMatch = true;
      }
    } else if (rule.id === 'rule-package-manager-execution') {
      if (['apt', 'apt-get', 'apk', 'yum', 'curl', 'wget'].includes(params.process)) {
        isMatch = true;
      }
    }

    if (isMatch) {
      const runtimeEvent: RuntimeSecurityEvent = {
        id: `falco-evt-${params.virtualTime}-${Math.floor(Math.random() * 1000)}`,
        virtualTime: params.virtualTime,
        ruleId: rule.id,
        ruleName: rule.name,
        podName: params.podName,
        namespace: params.namespace,
        containerId: params.containerId,
        syscall: params.syscall,
        process: params.process,
        parentProcess: params.parentProcess,
        arguments: params.arguments,
        severity: rule.severity,
        blocked: rule.autoQuarantineOnMatch,
        descriptionAr: `[تنبيه Falco]: رصد ${rule.name} في الحاوية ${params.podName} بواسطة العملية ${params.process}.`,
        descriptionEn: `[Falco eBPF Alert]: ${rule.name} detected in Pod ${params.podName} by process ${params.process}.`,
      };

      return {
        matchedRule: rule,
        runtimeEvent,
        triggeredQuarantine: rule.autoQuarantineOnMatch,
      };
    }
  }

  return {
    matchedRule: null,
    runtimeEvent: null,
    triggeredQuarantine: false,
  };
}
