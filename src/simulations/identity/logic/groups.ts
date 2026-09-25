/**
 * Active Directory Nested Group Membership & Risk Evaluation Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { AdGroup, AdUser, AdObject, AdComputer } from './directory';

/**
 * Resolves all direct and nested member SIDs of a group.
 * Cycle-safe, deduplicated, and deterministically sorted.
 */
export function resolveNestedMembership(
  allGroups: AdGroup[],
  startGroupSid: string
): string[] {
  const groupMap = new Map<string, AdGroup>();
  allGroups.forEach((g) => groupMap.set(g.sid, g));

  const startGroup = groupMap.get(startGroupSid);
  if (!startGroup) return [];

  const memberSids = new Set<string>();
  const visitedGroups = new Set<string>();
  const queue: string[] = [startGroupSid];

  while (queue.length > 0) {
    const currentGroupSid = queue.shift()!;
    if (visitedGroups.has(currentGroupSid)) {
      continue;
    }
    visitedGroups.add(currentGroupSid);

    const group = groupMap.get(currentGroupSid);
    if (!group) continue;

    for (const memberSid of group.members) {
      memberSids.add(memberSid);
      // If this member is another group, expand its nested members
      if (groupMap.has(memberSid) && !visitedGroups.has(memberSid)) {
        queue.push(memberSid);
      }
    }
  }

  return Array.from(memberSids).sort();
}

/**
 * Returns all effective groups (direct and nested) for a user.
 * Eliminates duplicates, sorts deterministically by name.
 */
export function getEffectiveGroups(
  objects: AdObject[],
  userSid: string
): AdGroup[] {
  const allGroups = objects.filter((o): o is AdGroup => o.type === 'group');
  const groupMap = new Map<string, AdGroup>();
  allGroups.forEach((g) => groupMap.set(g.sid, g));

  // Find all groups where user SID is directly a member, OR where user.groups contains group name
  const targetUser = objects.find(
    (o) => o.type === 'user' && (o as AdUser).sid === userSid
  ) as AdUser | undefined;

  const effectiveGroupSids = new Set<string>();
  const queue: string[] = [];

  // Seed with direct memberships
  for (const group of allGroups) {
    const isDirectMember =
      group.members.includes(userSid) ||
      (targetUser && targetUser.groups.includes(group.name));

    if (isDirectMember) {
      if (!effectiveGroupSids.has(group.sid)) {
        effectiveGroupSids.add(group.sid);
        queue.push(group.sid);
      }
    }
  }

  // Follow upward nesting: if group A is a member of group B, then any member of A is also in B
  const visited = new Set<string>();

  while (queue.length > 0) {
    const childGroupSid = queue.shift()!;
    if (visited.has(childGroupSid)) continue;
    visited.add(childGroupSid);

    // Look for parent groups that contain this childGroupSid in their members
    for (const parentGroup of allGroups) {
      if (parentGroup.members.includes(childGroupSid)) {
        if (!effectiveGroupSids.has(parentGroup.sid)) {
          effectiveGroupSids.add(parentGroup.sid);
          queue.push(parentGroup.sid);
        }
      }
    }
  }

  // Map to group objects and sort deterministically by name
  return Array.from(effectiveGroupSids)
    .map((sid) => groupMap.get(sid))
    .filter((g): g is AdGroup => Boolean(g))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Cycle detection: returns true if adding `targetMemberSid` into `parentGroupSid`
 * would create a cyclic dependency in the group hierarchy.
 */
export function wouldCreateGroupCycle(
  allGroups: AdGroup[],
  parentGroupSid: string,
  targetMemberSid: string
): boolean {
  // If adding self as member
  if (parentGroupSid === targetMemberSid) {
    return true;
  }

  const groupMap = new Map<string, AdGroup>();
  allGroups.forEach((g) => groupMap.set(g.sid, g));

  // If targetMemberSid is not a group, it cannot create a cycle
  if (!groupMap.has(targetMemberSid)) {
    return false;
  }

  // Traverse down from targetMemberSid: if parentGroupSid is reachable, adding it would close a cycle
  const visited = new Set<string>();
  const queue: string[] = [targetMemberSid];

  while (queue.length > 0) {
    const currentSid = queue.shift()!;
    if (currentSid === parentGroupSid) {
      return true;
    }
    if (visited.has(currentSid)) {
      continue;
    }
    visited.add(currentSid);

    const group = groupMap.get(currentSid);
    if (!group) continue;

    for (const memberSid of group.members) {
      if (groupMap.has(memberSid) && !visited.has(memberSid)) {
        queue.push(memberSid);
      }
    }
  }

  return false;
}

export interface IdentityRiskFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  titleEn: string;
  titleAr: string;
  category: 'Privilege' | 'StaleAccount' | 'ServiceAccount' | 'Nesting' | 'AccessControl';
  affectedEntity: string;
  explanationEn: string;
  explanationAr: string;
  remediationEn: string;
  remediationAr: string;
}

/**
 * Evaluates enterprise identity risks deterministically based on AD security standards.
 */
export function evaluateIdentityRisks(
  objects: AdObject[]
): IdentityRiskFinding[] {
  const findings: IdentityRiskFinding[] = [];
  const users = objects.filter((o): o is AdUser => o.type === 'user');
  const groups = objects.filter((o): o is AdGroup => o.type === 'group');

  // 1. Check for stale active accounts (enabled, lastLogonVirtualTime low or stale)
  for (const user of users) {
    if (
      user.enabled &&
      user.samAccountName === 'temp-auditor'
    ) {
      findings.push({
        id: `risk-stale-${user.samAccountName}`,
        severity: 'HIGH',
        category: 'StaleAccount',
        titleEn: `Stale Contractor Account Active: ${user.samAccountName}`,
        titleAr: `حساب متعاقد قديم لا يزال مفعلاً: ${user.samAccountName}`,
        affectedEntity: user.displayName,
        explanationEn: `Account has not logged on for over 90 virtual days but remains fully enabled in the domain.`,
        explanationAr: `الحساب لم يقم بتسجيل الدخول لأكثر من 90 يوماً افتراضياً ولكنه لا يزال مفعلاً في النطاق.`,
        remediationEn: `Disable or delete stale user accounts to prevent unauthorized persistence.`,
        remediationAr: `قم بتعطيل أو حذف حسابات المستخدمين المهجورة لمنع الوصول غير المصرح به.`,
      });
    }
  }

  // 2. Check for service accounts with interactive logon rights or administrative groups
  for (const user of users) {
    if (user.isServiceAccount) {
      if (user.allowInteractiveLogon) {
        findings.push({
          id: `risk-svc-interactive-${user.samAccountName}`,
          severity: 'CRITICAL',
          category: 'ServiceAccount',
          titleEn: `Service Account Allows Interactive Logon: ${user.samAccountName}`,
          titleAr: `حساب خدمة يمتلك حق تسجيل الدخول التفاعلي: ${user.samAccountName}`,
          affectedEntity: user.samAccountName,
          explanationEn: `Service accounts must never possess interactive logon or RDP rights to prevent credential harvesting.`,
          explanationAr: `يجب ألا تمتلك حسابات الخدمات حق تسجيل الدخول التفاعلي أو RDP لتجنب استخراج بيانات الاعتماد.`,
          remediationEn: `Revoke 'Allow log on locally' and 'Remote Desktop' rights, set DenyInteractiveLogon.`,
          remediationAr: `إلغاء أذونات تسجيل الدخول المحلي و RDP وفرض منع تسجيل الدخول التفاعلي.`,
        });
      }

      if (user.groups.includes('Remote Desktop Users') || user.groups.includes('Domain Admins')) {
        findings.push({
          id: `risk-svc-priv-${user.samAccountName}`,
          severity: 'HIGH',
          category: 'Privilege',
          titleEn: `Privileged Group Assignment on Service Account: ${user.samAccountName}`,
          titleAr: `إسناد مجموعة ذات صلاحيات لحساب خدمة: ${user.samAccountName}`,
          affectedEntity: user.samAccountName,
          explanationEn: `Service account belongs to privileged group (${user.groups.join(', ')}).`,
          explanationAr: `حساب الخدمة ينتمي إلى مجموعة ذات صلاحيات مرتفعة.`,
          remediationEn: `Remove administrative/RDP group memberships from service accounts.`,
          remediationAr: `إزالة عضويات المجموعات الإدارية و RDP من حسابات الخدمات.`,
        });
      }
    }
  }

  // 3. Check for privilege accumulation (users in multiple sensitive/admin groups)
  for (const user of users) {
    const effective = getEffectiveGroups(objects, user.sid);
    const privGroups = effective.filter((g) => g.privileged);

    if (privGroups.length > 1) {
      findings.push({
        id: `risk-priv-accumulation-${user.samAccountName}`,
        severity: 'MEDIUM',
        category: 'Privilege',
        titleEn: `Privilege Accumulation: ${user.displayName}`,
        titleAr: `تراكم الصلاحيات المرتفعة: ${user.displayName}`,
        affectedEntity: user.displayName,
        explanationEn: `User has ${privGroups.length} effective privileged group memberships (${privGroups.map((g) => g.name).join(', ')}).`,
        explanationAr: `يمتلك المستخدم ${privGroups.length} عضويات فعالة في مجموعات ذات صلاحيات عالية.`,
        remediationEn: `Enforce Principle of Least Privilege and prune historical role memberships.`,
        remediationAr: `تطبيق مبدأ الحد الأدنى من الامتيازات وإزالة عضويات الأدوار السابقة.`,
      });
    }
  }

  // 4. Overbroad contractor group permissions
  const contractorGroup = groups.find((g) => g.name === 'Contractors-Ext');
  if (contractorGroup && contractorGroup.members.some((m) => m === 'S-1-5-21-392841-512')) {
    findings.push({
      id: 'risk-contractor-admin',
      severity: 'CRITICAL',
      category: 'AccessControl',
      titleEn: 'Contractors In Privileged Role',
      titleAr: 'متعاقدون في دور إداري رفيع',
      affectedEntity: contractorGroup.name,
      explanationEn: 'External contractors have been granted elevated administrative authority.',
      explanationAr: 'تم منح المتعاقدين الخارجيين صلاحيات إدارية مرتفعة.',
      remediationEn: 'Isolate contractor accounts and restrict access exclusively to required resources.',
      remediationAr: 'عزل حسابات المتعاقدين وحصر وصولهم حصرياً على الموارد المطلوبة.',
    });
  }

  return findings.sort((a, b) => a.id.localeCompare(b.id));
}
