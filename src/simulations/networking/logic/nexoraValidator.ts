import { cidrsOverlap, parseCidrRange } from './subnetting';

export interface NexoraConfig {
  financeSubnet: string;
  hrSubnet: string;
  guestSubnet: string;
  guestIsolation: boolean;
  sshMgmtOnly: boolean;
  httpsServerPermitted: boolean;
}

export interface NexoraValidationResult {
  success: boolean;
  score: number;
  failedChecks: string[];
  passedChecks: string[];
  checkDetails: { id: string; nameEn: string; nameAr: string; passed: boolean; detailsEn: string; detailsAr: string }[];
}

export function validateNexoraBranchConfiguration(config: NexoraConfig): NexoraValidationResult {
  const checkDetails: NexoraValidationResult['checkDetails'] = [];
  const failedChecks: string[] = [];
  const passedChecks: string[] = [];

  // Check 1: Guest Network Isolation
  const c1Passed = config.guestIsolation;
  const c1Name = 'Guest Network Isolation Enforcement';
  const c1NameAr = 'تأمين وعزل شبكة الضيوف (Guest Network Isolation)';
  const c1Desc = 'Guest VLAN 30 is strictly isolated from internal Finance, HR, and Server subnets.';
  const c1DescAr = 'شبكة الضيوف تملك وصولاً للإنترنت فقط وممنوعة تماماً من شبكات المالية والرواتب والسيرفرات.';
  checkDetails.push({ id: 'r1', nameEn: c1Name, nameAr: c1NameAr, passed: c1Passed, detailsEn: c1Desc, detailsAr: c1DescAr });
  if (c1Passed) passedChecks.push(c1Name); else failedChecks.push(c1Name);

  // Check 2: Management SSH Restriction
  const c2Passed = config.sshMgmtOnly;
  const c2Name = 'Management SSH Port 22 Restriction';
  const c2NameAr = 'تقييد إدارة SSH على شبكة الإدارة فقط (Admin SSH Hardening)';
  const c2Desc = 'SSH Port 22 is permitted exclusively from Management Subnet (VLAN 50).';
  const c2DescAr = 'منفذ SSH 22 مسموح به فقط من شبكة الإدارة (10.50.50.0/24) ومحظور عن بقية الموظفين والضيوف.';
  checkDetails.push({ id: 'r2', nameEn: c2Name, nameAr: c2NameAr, passed: c2Passed, detailsEn: c2Desc, detailsAr: c2DescAr });
  if (c2Passed) passedChecks.push(c2Name); else failedChecks.push(c2Name);

  // Check 3: HTTPS & DNS Availability
  const c3Passed = config.httpsServerPermitted;
  const c3Name = 'Web Server HTTPS & DNS Availability';
  const c3NameAr = 'السماح بخدمات الويب HTTPS و DNS للخوادم المركزية';
  const c3Desc = 'Web Server (10.50.40.10) is reachable on HTTPS 443 from all corporate subnets.';
  const c3DescAr = 'خادم الويب (10.50.40.10) يستقبل طلبات HTTPS 443 من كافة موظفي المؤسسة بنجاح.';
  checkDetails.push({ id: 'r3', nameEn: c3Name, nameAr: c3NameAr, passed: c3Passed, detailsEn: c3Desc, detailsAr: c3DescAr });
  if (c3Passed) passedChecks.push(c3Name); else failedChecks.push(c3Name);

  // Check 4: Subnet Boundary Integrity
  const conflictsEn: string[] = [];
  const conflictsAr: string[] = [];

  if (config.financeSubnet && config.hrSubnet && cidrsOverlap(config.financeSubnet, config.hrSubnet)) {
    conflictsEn.push(`Finance (${config.financeSubnet}) overlaps with HR (${config.hrSubnet})`);
    conflictsAr.push(`شبكة المالية (${config.financeSubnet}) تتداخل مع شبكة الموارد البشرية (${config.hrSubnet})`);
  }
  if (config.financeSubnet && config.guestSubnet && cidrsOverlap(config.financeSubnet, config.guestSubnet)) {
    conflictsEn.push(`Finance (${config.financeSubnet}) overlaps with Guest (${config.guestSubnet})`);
    conflictsAr.push(`شبكة المالية (${config.financeSubnet}) تتداخل مع شبكة الضيوف (${config.guestSubnet})`);
  }
  if (config.hrSubnet && config.guestSubnet && cidrsOverlap(config.hrSubnet, config.guestSubnet)) {
    conflictsEn.push(`HR (${config.hrSubnet}) overlaps with Guest (${config.guestSubnet})`);
    conflictsAr.push(`شبكة الموارد البشرية (${config.hrSubnet}) تتداخل مع شبكة الضيوف (${config.guestSubnet})`);
  }

  const subnetsValid = Boolean(
    config.financeSubnet &&
    config.hrSubnet &&
    config.guestSubnet &&
    parseCidrRange(config.financeSubnet).valid &&
    parseCidrRange(config.hrSubnet).valid &&
    parseCidrRange(config.guestSubnet).valid
  );

  const c4Passed = subnetsValid && conflictsEn.length === 0;
  const c4Name = 'Subnet Boundary Integrity';
  const c4NameAr = 'تقسيم وصحة العناوين الفرعية (Valid CIDR Subnetting)';

  let c4Desc = 'Non-overlapping CIDR boundaries assigned to Finance, HR, and Guest VLANs.';
  let c4DescAr = 'تخصيص شبكات فرعية غير متداخلة لكل من الموظفين والإدارة والسيرفرات.';

  if (conflictsEn.length > 0) {
    c4Desc = `Subnet overlap detected: ${conflictsEn.join('; ')}`;
    c4DescAr = `تم اكتشاف تداخل بين الشبكات الفرعية: ${conflictsAr.join('؛ ')}`;
  } else if (!subnetsValid) {
    c4Desc = 'One or more required subnets are missing or invalid CIDR addresses.';
    c4DescAr = 'إحدى الشبكات الفرعية غير محددة أو تحتوي على صيغة CIDR غير صحيحة.';
  }

  checkDetails.push({ id: 'r4', nameEn: c4Name, nameAr: c4NameAr, passed: c4Passed, detailsEn: c4Desc, detailsAr: c4DescAr });
  if (c4Passed) passedChecks.push(c4Name); else failedChecks.push(c4Name);

  const passedCount = checkDetails.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checkDetails.length) * 100);

  return {
    success: score === 100,
    score,
    failedChecks,
    passedChecks,
    checkDetails,
  };
}
