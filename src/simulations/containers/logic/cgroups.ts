/**
 * OMEGA V14 — Linux Cgroups v1/v2 Engine
 * Simulates resource constraints, CPU throttling, Memory OOM Killer, and PIDs Fork-Bomb protection.
 */

import { CgroupsLimits } from './types';

export function getInitialCgroupsLimits(): CgroupsLimits {
  return {
    cpuLimitCores: 0, // 0 = unlimited (vulnerable to noisy neighbor & CPU starvation)
    memoryLimitMb: 0, // 0 = unlimited (vulnerable to OOM Host Crash)
    pidsMax: 0, // 0 = unlimited (vulnerable to fork-bomb)
    enforceOomKiller: true,
    throttleCpu: true,
  };
}

export function simulateResourceStress(
  limits: CgroupsLimits,
  stressType: 'fork_bomb' | 'memory_exhaustion' | 'cpu_spike'
): {
  outcome: 'CONTAINED' | 'HOST_CRASH' | 'PROCESS_KILLED' | 'THROTTLED';
  messageAr: string;
  messageEn: string;
  cpuUsagePct: number;
  memoryUsageMb: number;
  processCount: number;
  mitigated: boolean;
} {
  switch (stressType) {
    case 'fork_bomb': {
      if (limits.pidsMax > 0 && limits.pidsMax <= 128) {
        return {
          outcome: 'CONTAINED',
          messageAr: `تم إحباط قنبلة التفريع (Fork-Bomb): وصل عدد العمليات إلى الحد الأقصى (${limits.pidsMax}) ورفضت النواة إنشاء عمليات جديدة (EAGAIN). تم حماية خادم المضيف!`,
          messageEn: `Fork-Bomb Contained: Process count reached limit (${limits.pidsMax}). Kernel returned EAGAIN. Host system protected!`,
          cpuUsagePct: 15,
          memoryUsageMb: 45,
          processCount: limits.pidsMax,
          mitigated: true,
        };
      } else {
        return {
          outcome: 'HOST_CRASH',
          messageAr: 'كارثة أمنية: تسببت قنبلة التفريع (:(){ :|:& };:) في استنزاف جدول العمليات (PID Table) لخادم المضيف بالكامل، مما أدى لتوقف جميع الخدمات!',
          messageEn: 'Host Starvation Disaster: Unlimited PIDs allowed fork-bomb to exhaust host PID table, causing complete node kernel freeze!',
          cpuUsagePct: 100,
          memoryUsageMb: 1800,
          processCount: 32768,
          mitigated: false,
        };
      }
    }

    case 'memory_exhaustion': {
      if (limits.memoryLimitMb > 0) {
        return {
          outcome: 'PROCESS_KILLED',
          messageAr: `تدخل الـ OOM Killer المعزول: تجاوزت الحاوية حد الذاكرة المخصص (${limits.memoryLimitMb}MB) وتم إنهاء العملية المعيبة فوراً دون التأثير على ذاكرة المضيف.`,
          messageEn: `Scoped OOM-Killer Triggered: Container exceeded memory limit (${limits.memoryLimitMb}MB) and was terminated cleanly without impacting host node RAM.`,
          cpuUsagePct: 10,
          memoryUsageMb: limits.memoryLimitMb,
          processCount: 1,
          mitigated: true,
        };
      } else {
        return {
          outcome: 'HOST_CRASH',
          messageAr: 'تسريب الذاكرة غير المقيد: استنزفت الحاوية كامل ذاكرة RAM للمضيف، مما اضطر الـ OOM Killer للنواة لإنهاء عمليات أساسية مثل kubelet و sshd!',
          messageEn: 'Host OOM Collapse: Unconstrained container consumed all host RAM, forcing host kernel OOM-killer to kill critical system daemons (kubelet, sshd)!',
          cpuUsagePct: 80,
          memoryUsageMb: 16384,
          processCount: 12,
          mitigated: false,
        };
      }
    }

    case 'cpu_spike': {
      if (limits.cpuLimitCores > 0) {
        return {
          outcome: 'THROTTLED',
          messageAr: `تم تفعيل الكبح التناسبي (CFS Bandwidth Quota): تم كبح استهلاك المعالج عند (${limits.cpuLimitCores} Cores)، ومنع الحاوية من التهام دورات معالج المضيف.`,
          messageEn: `CFS Quota Throttled: CPU consumption strictly capped at (${limits.cpuLimitCores} Cores), safeguarding neighboring microservices from starvation.`,
          cpuUsagePct: limits.cpuLimitCores * 50,
          memoryUsageMb: 60,
          processCount: 4,
          mitigated: true,
        };
      } else {
        return {
          outcome: 'HOST_CRASH',
          messageAr: 'استنزاف المعالج (Noisy Neighbor): استهلكت الحاوية 100% من قدرة المعالج لجميع الأنوية، مما أدى لارتفاع زمن استجابة التطبيقات الأخرى.',
          messageEn: 'Noisy Neighbor Starvation: Container monopolized 100% of host CPU cores, causing extreme latency spikes for all cluster workloads.',
          cpuUsagePct: 100,
          memoryUsageMb: 120,
          processCount: 16,
          mitigated: false,
        };
      }
    }
  }
}
