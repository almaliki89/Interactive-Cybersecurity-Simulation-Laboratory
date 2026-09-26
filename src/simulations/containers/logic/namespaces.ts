/**
 * OMEGA V14 — Linux Namespaces Simulation Engine
 * Simulates namespace boundary separation between Host OS and Container.
 */

import { LinuxNamespaceConfig, LinuxNamespaceType } from './types';

export function getInitialNamespaceConfigs(): LinuxNamespaceConfig[] {
  return [
    {
      type: 'pid',
      isolated: true,
      hostValue: 'PID 1: /sbin/init, PID 1420: containerd, PID 4892: nginx-worker',
      containerValue: 'PID 1: nginx (isolated root process)',
      riskDescriptionAr: 'مشاركة مساحة PID مع المضيف تسمح للحاوية برؤية عمليات الخادم وإرسال إشارات kill لها أو فحص ذاكرتها عبر /proc.',
      riskDescriptionEn: 'Sharing host PID namespace allows the container to inspect host processes, read memory via /proc, or send termination signals.',
    },
    {
      type: 'net',
      isolated: true,
      hostValue: 'eth0: 192.168.1.100/24, lo: 127.0.0.1, docker0: 172.17.0.1/16',
      containerValue: 'eth0: 172.17.0.5/16 (veth pair bridge), lo: 127.0.0.1',
      riskDescriptionAr: 'استخدام hostNetwork: true يسمح للحاوية بالاستماع على أي منفذ للمضيف والتنصت على حزم الشبكة وإلغاء عزل K8s NetworkPolicies.',
      riskDescriptionEn: 'Using hostNetwork: true allows the container to bind to host ports, sniff network interface traffic, and bypass NetworkPolicies.',
    },
    {
      type: 'mnt',
      isolated: true,
      hostValue: '/ (ext4 rootfs), /var/log, /etc, /root',
      containerValue: '/ (overlayfs /merged overlay container layer)',
      riskDescriptionAr: 'عدم عزل Mount Namespace أو تركيب مجلدات حساسة مثل / أو /etc/shadow يمنح الحاوية وصولاً كاملاً لنظام ملفات المضيف.',
      riskDescriptionEn: 'Mounting sensitive host directories like / or /etc/shadow grants the container write access to critical host files.',
    },
    {
      type: 'ipc',
      isolated: true,
      hostValue: 'Host IPC shared memory segments (POSIX / SysV IPC shm)',
      containerValue: 'Isolated container IPC namespace & semaphores',
      riskDescriptionAr: 'مشاركة مساحة IPC تسمح بالوصول إلى الذاكرة المشتركة لعمليات خوادم قواعد البيانات العاملة على المضيف.',
      riskDescriptionEn: 'Sharing IPC allows rogue containers to read shared memory segments of host processes (e.g. databases).',
    },
    {
      type: 'uts',
      isolated: true,
      hostValue: 'hostname: k8s-worker-node-01.nexora.internal',
      containerValue: 'hostname: pod-frontend-7c94b7c6-xz891',
      riskDescriptionAr: 'مشاركة UTS تسمح للحاوية بتغيير اسم المضيف ونطاق NIS للأنظمة المضيفة.',
      riskDescriptionEn: 'Sharing UTS allows a compromised container to alter the host node system hostname and NIS domain.',
    },
    {
      type: 'user',
      isolated: false,
      hostValue: 'UID 0: root, GID 0: root',
      containerValue: 'UID 0: root (Identical to Host Root without UserNS remap)',
      riskDescriptionAr: 'بدون User Namespaces، المستخدم root داخل الحاوية هو root حقيقي على نواة المضيف، مما يسهل كسر عزل الحاوية (Container Breakout).',
      riskDescriptionEn: 'Without User Namespaces, root in the container is root on the host kernel, drastically amplifying container escape vectors.',
    },
    {
      type: 'cgroup',
      isolated: true,
      hostValue: '/sys/fs/cgroup/ (full host cgroup tree view)',
      containerValue: '/sys/fs/cgroup/docker/<container-id>/ (scoped cgroup subtree)',
      riskDescriptionAr: 'عدم عزل cgroup namespace يسرب معلومات حول البنية التحتية للمضيف ويسمح بالتلاعب بالحدود المجاورة.',
      riskDescriptionEn: 'Unconfined cgroup view leaks host infrastructure hierarchy and may allow cross-container resource manipulation.',
    },
  ];
}

export function evaluateNamespaceSecurity(namespaces: LinuxNamespaceConfig[]): {
  securityScore: number;
  unisolatedCount: number;
  userNamespaceActive: boolean;
  verdictAr: string;
  verdictEn: string;
} {
  let unisolatedCount = 0;
  let userNamespaceActive = false;

  for (const ns of namespaces) {
    if (!ns.isolated) {
      unisolatedCount++;
    }
    if (ns.type === 'user' && ns.isolated) {
      userNamespaceActive = true;
    }
  }

  // Base score calculation
  const total = namespaces.length;
  const isolatedCount = total - unisolatedCount;
  let securityScore = Math.round((isolatedCount / total) * 100);

  // Bonus for user namespace isolation
  if (!userNamespaceActive) {
    securityScore = Math.min(securityScore, 85); // Cap at 85 if running as root without userNS
  }

  let verdictAr = 'عزل ممتاز لمساحات الأسماء';
  let verdictEn = 'Optimal Namespace Isolation';

  if (unisolatedCount >= 3) {
    verdictAr = 'عزل حرج ومكشوف — خطر هروب عالي للحاوية!';
    verdictEn = 'Critical Exposure — High Container Breakout Risk!';
  } else if (unisolatedCount >= 1) {
    verdictAr = 'عزل متوسط — توجد مساحات غير معزولة تحتاج لتدخل';
    verdictEn = 'Moderate Isolation — Unisolated namespaces need hardening';
  }

  return {
    securityScore,
    unisolatedCount,
    userNamespaceActive,
    verdictAr,
    verdictEn,
  };
}
