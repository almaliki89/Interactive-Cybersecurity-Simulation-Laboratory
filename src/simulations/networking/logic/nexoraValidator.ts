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
  const nonOverlapping =
    config.financeSubnet !== config.hrSubnet &&
    config.financeSubnet !== config.guestSubnet &&
    config.hrSubnet !== config.guestSubnet;
  const c4Passed = Boolean(nonOverlapping && config.financeSubnet && config.hrSubnet && config.guestSubnet);
  const c4Name = 'Subnet Boundary Integrity';
  const c4NameAr = 'تقسيم وصحة العناوين الفرعية (Valid CIDR Subnetting)';
  const c4Desc = 'Non-overlapping CIDR boundaries assigned to Finance, HR, and Guest VLANs.';
  const c4DescAr = 'تخصيص شبكات فرعية غير متداخلة لكل من الموظفين والإدارة والسيرفرات.';
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
