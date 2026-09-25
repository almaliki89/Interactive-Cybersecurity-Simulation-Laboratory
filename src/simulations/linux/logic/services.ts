export interface LinuxService {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionAr: string;
  processName: string;
  user: string;
  port?: number;
  protocol?: 'TCP' | 'UDP';
  enabled: boolean;
  running: boolean;
  securityCritical: boolean;
}

export function initLinuxServices(): LinuxService[] {
  return [
    {
      id: 'sshd',
      name: 'OpenSSH Server',
      descriptionEn: 'Secure remote management shell listening on port 22',
      descriptionAr: 'خادم الإدارة عن بعد الآمن يستمع على المنفذ 22',
      processName: 'sshd',
      user: 'root',
      port: 22,
      protocol: 'TCP',
      enabled: true,
      running: true,
      securityCritical: true,
    },
    {
      id: 'nginx',
      name: 'Nginx Web Server',
      descriptionEn: 'Reverse proxy and HTTPS web engine on ports 80 and 443',
      descriptionAr: 'محرك الويب وخادم الوكيل العكسي على المنفذين 80 و 443',
      processName: 'nginx-master',
      user: 'www-data',
      port: 443,
      protocol: 'TCP',
      enabled: true,
      running: true,
      securityCritical: false,
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL Database',
      descriptionEn: 'Relational database engine listening on port 5432 (Internal only)',
      descriptionAr: 'قاعدة بيانات علائقية تستمع على المنفذ 5432 (داخلي فقط)',
      processName: 'postgres',
      user: 'postgres',
      port: 5432,
      protocol: 'TCP',
      enabled: true,
      running: true,
      securityCritical: false,
    },
    {
      id: 'rsyslog',
      name: 'System Logging Daemon',
      descriptionEn: 'Kernel and audit security log collector',
      descriptionAr: 'جامع سجلات أمان النواة والمراقبة',
      processName: 'rsyslogd',
      user: 'root',
      enabled: true,
      running: true,
      securityCritical: true,
    },
    {
      id: 'telnet',
      name: 'Legacy Telnet Daemon',
      descriptionEn: 'Insecure unencrypted remote access on port 23 (Vulnerable)',
      descriptionAr: 'خدمة نفاذ قديمة غير مشفرة على المنفذ 23 (غير آمنة)',
      processName: 'in.telnetd',
      user: 'root',
      port: 23,
      protocol: 'TCP',
      enabled: false,
      running: false,
      securityCritical: false,
    },
  ];
}

export function startService(services: LinuxService[], serviceId: string): LinuxService[] {
  return services.map((svc) =>
    svc.id === serviceId ? { ...svc, running: true } : svc
  );
}

export function stopService(services: LinuxService[], serviceId: string): LinuxService[] {
  return services.map((svc) =>
    svc.id === serviceId ? { ...svc, running: false } : svc
  );
}

export function restartService(services: LinuxService[], serviceId: string): LinuxService[] {
  return services.map((svc) =>
    svc.id === serviceId ? { ...svc, running: true } : svc
  );
}

export function toggleServiceEnabled(services: LinuxService[], serviceId: string): LinuxService[] {
  return services.map((svc) =>
    svc.id === serviceId ? { ...svc, enabled: !svc.enabled } : svc
  );
}

export function getExposedServices(services: LinuxService[]): LinuxService[] {
  return services.filter((svc) => svc.running && svc.port !== undefined);
}

export interface NetworkExposureResult {
  serviceId: string;
  serviceName: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  firewallPermitted: boolean;
  reachableExternally: boolean;
  securityAssessmentEn: string;
  securityAssessmentAr: string;
}

export function evaluateServiceExposure(
  services: LinuxService[],
  firewallRules: { port: number; protocol: 'TCP' | 'UDP'; action: 'ALLOW' | 'DROP' | 'REJECT' }[]
): NetworkExposureResult[] {
  const exposed = getExposedServices(services);

  return exposed.map((svc) => {
    const port = svc.port!;
    const protocol = svc.protocol || 'TCP';
    const matchingRule = firewallRules.find(
      (r) => r.port === port && r.protocol === protocol
    );

    const firewallPermitted = matchingRule ? matchingRule.action === 'ALLOW' : false;
    const reachableExternally = svc.running && firewallPermitted;

    let securityAssessmentEn = '';
    let securityAssessmentAr = '';

    if (port === 23 && reachableExternally) {
      securityAssessmentEn = 'CRITICAL: Insecure unencrypted Telnet is exposed to external networks!';
      securityAssessmentAr = 'خطورة حرجة: بروتوكول Telnet غير المشفر مكشوف للشبكات الخارجية!';
    } else if (port === 5432 && reachableExternally) {
      securityAssessmentEn = 'HIGH RISK: Database port 5432 should not be directly exposed to the Internet.';
      securityAssessmentAr = 'خطر عالي: لا ينبغي كشف منفذ قاعدة البيانات 5432 للإنترنت العام مباشرة.';
    } else if (port === 443 && reachableExternally) {
      securityAssessmentEn = 'NORMAL: HTTPS web traffic safely permitted through edge firewall.';
      securityAssessmentAr = 'طبيعي: مرور حركة HTTPS المشفرة مسموح بها بأمان عبر جدار الحماية.';
    } else if (port === 22 && reachableExternally) {
      securityAssessmentEn = 'CAUTION: SSH Port 22 exposed; enforce key-based auth and IP filtering.';
      securityAssessmentAr = 'تحذير: منفذ SSH 22 متاح؛ يجب قصر الوصول وفرض المفاتيح الرقمية.';
    } else if (!reachableExternally) {
      securityAssessmentEn = 'PROTECTED: Service running but ingress blocked by firewall.';
      securityAssessmentAr = 'محمي: الخدمة قيد التشغيل ولكن المنافذ محجوبة بواسطة جدار الحماية.';
    }

    return {
      serviceId: svc.id,
      serviceName: svc.name,
      port,
      protocol,
      firewallPermitted,
      reachableExternally,
      securityAssessmentEn,
      securityAssessmentAr,
    };
  });
}
