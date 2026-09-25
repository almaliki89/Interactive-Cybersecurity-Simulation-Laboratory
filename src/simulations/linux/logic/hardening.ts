import { evaluateSudoPolicy, SudoPolicyRule } from './sudo';
import { LinuxProcess } from './processes';
import { LinuxService } from './services';
import { parseOctalMode } from './permissions';

export interface HardeningFileNode {
  path: string;
  owner: string;
  group: string;
  permissions: string; // e.g. '600', '644'
}

export interface LinuxHardeningState {
  files: HardeningFileNode[];
  processes: LinuxProcess[];
  services: LinuxService[];
  sudoPolicies: SudoPolicyRule[];
}

export interface LinuxHardeningValidationResult {
  success: boolean;
  score: number;
  passedChecks: string[];
  failedChecks: string[];
  checkDetails: {
    id: string;
    nameEn: string;
    nameAr: string;
    passed: boolean;
    detailsEn: string;
    detailsAr: string;
  }[];
}

export function validateLinuxHardeningState(state: LinuxHardeningState): LinuxHardeningValidationResult {
  const checkDetails: LinuxHardeningValidationResult['checkDetails'] = [];
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  // Check 1: /etc/shadow permissions (must not be readable by group or other)
  const shadowFile = state.files.find((f) => f.path === '/etc/shadow');
  let shadowPassed = false;
  let shadowDetailsEn = '';
  let shadowDetailsAr = '';

  if (!shadowFile) {
    shadowDetailsEn = 'Missing critical system file /etc/shadow.';
    shadowDetailsAr = 'ملف النظام الحرج /etc/shadow مفقود.';
  } else {
    const shadowPerms = parseOctalMode(shadowFile.permissions);
    const hasGroupAccess = shadowPerms.group.r || shadowPerms.group.w || shadowPerms.group.x;
    const hasOtherAccess = shadowPerms.other.r || shadowPerms.other.w || shadowPerms.other.x;
    const isRootOwner = shadowFile.owner === 'root';

    if (isRootOwner && !hasGroupAccess && !hasOtherAccess) {
      shadowPassed = true;
      shadowDetailsEn = `/etc/shadow is strictly restricted to root (Mode: ${shadowFile.permissions}). Password hashes protected.`;
      shadowDetailsAr = `ملف /etc/shadow محمي ومقصور على root (الوضع: ${shadowFile.permissions}). بصمات كلمات المرور محمية.`;
    } else {
      shadowDetailsEn = `/etc/shadow has overly permissive access (Mode: ${shadowFile.permissions}, Owner: ${shadowFile.owner}). Group or World can read password hashes.`;
      shadowDetailsAr = `صلاحيات /etc/shadow متساهلة للغاية (الوضع: ${shadowFile.permissions}، المالك: ${shadowFile.owner}). يمكن للمجموعات أو المستخدمين قراءة التجزئات.`;
    }
  }

  const c1NameEn = '/etc/shadow Root-Only Access Hardening';
  const c1NameAr = 'حصر صلاحيات ملف /etc/shadow للمسؤول root فقط';
  checkDetails.push({
    id: 'shadow-hardening',
    nameEn: c1NameEn,
    nameAr: c1NameAr,
    passed: shadowPassed,
    detailsEn: shadowDetailsEn,
    detailsAr: shadowDetailsAr,
  });
  if (shadowPassed) passedChecks.push(c1NameEn); else failedChecks.push(c1NameEn);

  // Check 2: Sudo policy least privilege (Bob must NOT have unauthorized sudo access)
  const bobSudoCat = evaluateSudoPolicy(
    { username: 'bob', groups: ['developers'] },
    '/bin/cat /var/log/nginx/access.log',
    state.sudoPolicies
  );
  const bobSudoAll = evaluateSudoPolicy(
    { username: 'bob', groups: ['developers'] },
    '/usr/bin/bash',
    state.sudoPolicies
  );
  const bobHasExcessiveRights = bobSudoCat.allowed || bobSudoAll.allowed;
  const sudoPassed = !bobHasExcessiveRights;

  const c2NameEn = 'Sudoers Least-Privilege Enforcement (User: Bob)';
  const c2NameAr = 'إنفاذ مبدأ الحد الأدنى من الصلاحيات في Sudoers (المستخدم Bob)';
  const c2DetailsEn = sudoPassed
    ? 'Bob does not possess unauthorized root privilege escalation in /etc/sudoers.'
    : 'Bob holds excessive sudo privileges in /etc/sudoers allowing unauthorized root command execution.';
  const c2DetailsAr = sudoPassed
    ? 'لا يملك Bob أي صلاحيات غير مصرح بها لتصعيد الامتيازات كـ root في ملف /etc/sudoers.'
    : 'يملك Bob امتيازات sudo مفرطة في /etc/sudoers تسمح له بتنفيذ أوامر كمسؤول جذر.';
  checkDetails.push({
    id: 'sudo-least-privilege',
    nameEn: c2NameEn,
    nameAr: c2NameAr,
    passed: sudoPassed,
    detailsEn: c2DetailsEn,
    detailsAr: c2DetailsAr,
  });
  if (sudoPassed) passedChecks.push(c2NameEn); else failedChecks.push(c2NameEn);

  // Check 3: Unnecessary database process (Postgres should not be active on web server)
  const postgresRunning = state.processes.some((p) => p.name === 'postgres');
  const postgresSvcRunning = state.services.some((s) => s.id === 'postgresql' && s.running);
  const dbProcessStopped = !postgresRunning && !postgresSvcRunning;

  const c3NameEn = 'Attack Surface Reduction: Unnecessary DB Daemon Stopped';
  const c3NameAr = 'تقليص سطح الهجوم: إيقاف خادم قاعدة البيانات الزائد postgres';
  const c3DetailsEn = dbProcessStopped
    ? 'PostgreSQL database daemon is stopped, closing unneeded Port 5432 attack surface.'
    : 'PostgreSQL process or service is still running, exposing unnecessary Port 5432.';
  const c3DetailsAr = dbProcessStopped
    ? 'تم إيقاف عملية قاعدة بيانات PostgreSQL وإغلاق منفذ 5432 لتقليص سطح الهجوم.'
    : 'خادم قاعدة البيانات PostgreSQL ما زال قيد التشغيل ويكشف المنفذ 5432 دون حاجة تشغيلية.';
  checkDetails.push({
    id: 'db-stopped',
    nameEn: c3NameEn,
    nameAr: c3NameAr,
    passed: dbProcessStopped,
    detailsEn: c3DetailsEn,
    detailsAr: c3DetailsAr,
  });
  if (dbProcessStopped) passedChecks.push(c3NameEn); else failedChecks.push(c3NameEn);

  // Check 4: Home directory privacy (/home/alice must not be world-readable)
  const aliceHome = state.files.find((f) => f.path === '/home/alice');
  let homePassed = false;
  let homeDetailsEn = '';
  let homeDetailsAr = '';

  if (!aliceHome) {
    homeDetailsEn = 'Missing user home directory /home/alice.';
    homeDetailsAr = 'المجلد الشخصي للمستخدم /home/alice غير موجود.';
  } else {
    const homePerms = parseOctalMode(aliceHome.permissions);
    const worldReadableOrTraversable = homePerms.other.r || homePerms.other.w || homePerms.other.x;
    if (!worldReadableOrTraversable) {
      homePassed = true;
      homeDetailsEn = `/home/alice is isolated from other users (Mode: ${aliceHome.permissions}).`;
      homeDetailsAr = `المجلد /home/alice معزول عن بقية مستخدمي النظام (الوضع: ${aliceHome.permissions}).`;
    } else {
      homeDetailsEn = `/home/alice has world permissions set (Mode: ${aliceHome.permissions}), allowing unauthorized browsing.`;
      homeDetailsAr = `المجلد /home/alice يمنح صلاحيات للآخرين (الوضع: ${aliceHome.permissions}) مما يتيح التطفل على ملفات المستخدم.`;
    }
  }

  const c4NameEn = 'User Home Directory Isolation (/home/alice)';
  const c4NameAr = 'عزل مجلد المستخدم الشخصي (/home/alice)';
  checkDetails.push({
    id: 'home-isolation',
    nameEn: c4NameEn,
    nameAr: c4NameAr,
    passed: homePassed,
    detailsEn: homeDetailsEn,
    detailsAr: homeDetailsAr,
  });
  if (homePassed) passedChecks.push(c4NameEn); else failedChecks.push(c4NameEn);

  // Check 5: Insecure service disabled (Telnet daemon must be disabled and stopped)
  const telnetSvc = state.services.find((s) => s.id === 'telnet');
  const telnetProc = state.processes.some((p) => p.name === 'in.telnetd');
  const telnetSafe = (!telnetSvc || (!telnetSvc.running && !telnetSvc.enabled)) && !telnetProc;

  const c5NameEn = 'Insecure Legacy Services Disabled (Telnet Port 23)';
  const c5NameAr = 'تعطيل الخدمات القديمة غير الآمنة (Telnet المنفذ 23)';
  const c5DetailsEn = telnetSafe
    ? 'Telnet service is disabled and not running. Unencrypted cleartext login is blocked.'
    : 'Insecure Telnet daemon is enabled or running, exposing unencrypted credentials on port 23.';
  const c5DetailsAr = telnetSafe
    ? 'خدمة Telnet معطلة ومتوقفة تماماً؛ تم حظر إرسال بيانات الدخول عبر نصوص صريحة.'
    : 'خدمة Telnet غير الآمنة مفعلة أو قيد التشغيل، مما يعرض بيانات الدخول للخطر عبر المنفذ 23.';
  checkDetails.push({
    id: 'telnet-disabled',
    nameEn: c5NameEn,
    nameAr: c5NameAr,
    passed: telnetSafe,
    detailsEn: c5DetailsEn,
    detailsAr: c5DetailsAr,
  });
  if (telnetSafe) passedChecks.push(c5NameEn); else failedChecks.push(c5NameEn);

  // Check 6: System logging daemon active (rsyslogd running)
  const loggingProc = state.processes.some((p) => p.name === 'rsyslogd' && p.state !== 'stopped');
  const loggingSvc = state.services.find((s) => s.id === 'rsyslog');
  const loggingActive = loggingProc && (!loggingSvc || (loggingSvc.running && loggingSvc.enabled));

  const c6NameEn = 'Security Audit & Logging Subsystem Active (rsyslog)';
  const c6NameAr = 'تفعيل واستمرارية نظام المراقبة وتسجيل الأحداث (rsyslog)';
  const c6DetailsEn = loggingActive
    ? 'System logging daemon rsyslogd is operational and recording security audit trails.'
    : 'Security logging service rsyslogd is stopped or disabled; audit trails are not being captured.';
  const c6DetailsAr = loggingActive
    ? 'خدمة تسجيل الأحداث الأمنية rsyslogd تعمل بفعالية وتلتقط كافة سجلات المراقبة.'
    : 'خدمة تسجيل الأحداث rsyslogd متوقفة أو معطلة؛ لا يتم تسجيل أحداث الأمان في النظام.';
  checkDetails.push({
    id: 'logging-active',
    nameEn: c6NameEn,
    nameAr: c6NameAr,
    passed: loggingActive,
    detailsEn: c6DetailsEn,
    detailsAr: c6DetailsAr,
  });
  if (loggingActive) passedChecks.push(c6NameEn); else failedChecks.push(c6NameEn);

  const passedCount = checkDetails.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checkDetails.length) * 100);

  return {
    success: score === 100,
    score,
    passedChecks,
    failedChecks,
    checkDetails,
  };
}
