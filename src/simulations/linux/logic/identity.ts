export interface LinuxUser {
  username: string;
  primaryGroup: string;
  supplementaryGroups: string[];
}

export interface LinuxResource {
  path: string;
  owner: string;
  group: string;
  permissions: {
    owner: { r: boolean; w: boolean; x: boolean };
    group: { r: boolean; w: boolean; x: boolean };
    other: { r: boolean; w: boolean; x: boolean };
  };
}

export function getEffectiveGroups(user: LinuxUser): string[] {
  const groups = new Set<string>();
  if (user.primaryGroup) {
    groups.add(user.primaryGroup);
  }
  if (user.supplementaryGroups) {
    user.supplementaryGroups.forEach((g) => groups.add(g));
  }
  return Array.from(groups);
}

export function canUserAccessResource(
  user: LinuxUser,
  resource: LinuxResource,
  action: 'r' | 'w' | 'x'
): { allowed: boolean; reasonEn: string; reasonAr: string; matchedClass: 'owner' | 'group' | 'other' | 'root' } {
  if (user.username === 'root') {
    return {
      allowed: true,
      reasonEn: 'Superuser (root/UID 0) bypasses standard POSIX permissions via CAP_DAC_OVERRIDE.',
      reasonAr: 'المستخدم الجذر (root / UID 0) يتجاوز صلاحيات POSIX القياسية عبر القدرة CAP_DAC_OVERRIDE.',
      matchedClass: 'root',
    };
  }

  const isOwner = user.username === resource.owner;
  const userGroups = getEffectiveGroups(user);
  const isGroupMember = userGroups.includes(resource.group);

  if (isOwner) {
    const hasPerm = resource.permissions.owner[action];
    return {
      allowed: hasPerm,
      matchedClass: 'owner',
      reasonEn: hasPerm
        ? `Access granted. User '${user.username}' is the owner of '${resource.path}' and owner permission has '${action}' bit set.`
        : `Access denied (EACCES). User '${user.username}' is the owner of '${resource.path}', but owner permission lacks '${action}' bit.`,
      reasonAr: hasPerm
        ? `تم السماح بالوصول. المستخدم '${user.username}' هو المالك لـ '${resource.path}' ولديه صلاحية المالك لتفعيل البت '${action}'.`
        : `تم رفض الوصول (EACCES). المستخدم '${user.username}' هو المالك لـ '${resource.path}'، لكن صلاحية المالك تفتقر للبت '${action}'.`,
    };
  }

  if (isGroupMember) {
    const hasPerm = resource.permissions.group[action];
    return {
      allowed: hasPerm,
      matchedClass: 'group',
      reasonEn: hasPerm
        ? `Access granted. User '${user.username}' is in group '${resource.group}' and group permission has '${action}' bit set.`
        : `Access denied (EACCES). User '${user.username}' is in group '${resource.group}', but group permission lacks '${action}' bit.`,
      reasonAr: hasPerm
        ? `تم السماح بالوصول. المستخدم '${user.username}' عضو في المجموعة '${resource.group}' وصلاحية المجموعة تملك البت '${action}'.`
        : `تم رفض الوصول (EACCES). المستخدم '${user.username}' عضو في المجموعة '${resource.group}'، لكن صلاحية المجموعة تفتقر للبت '${action}'.`,
    };
  }

  const hasPerm = resource.permissions.other[action];
  return {
    allowed: hasPerm,
    matchedClass: 'other',
    reasonEn: hasPerm
      ? `Access granted. User '${user.username}' falls into 'other' class for '${resource.path}' and other permission has '${action}' bit set.`
      : `Access denied (EACCES). User '${user.username}' falls into 'other' class for '${resource.path}' and other permission lacks '${action}' bit.`,
    reasonAr: hasPerm
      ? `تم السماح بالوصول. يقع المستخدم '${user.username}' في فئة 'الآخرين' بالنسبة لـ '${resource.path}' ولديه بت الصلاحية '${action}'.`
      : `تم رفض الوصول (EACCES). يقع المستخدم '${user.username}' في فئة 'الآخرين' بالنسبة لـ '${resource.path}' وتفتقر صلاحياتهم للبت '${action}'.`,
  };
}

export function createUser(
  users: LinuxUser[],
  username: string,
  primaryGroup: string,
  supplementaryGroups: string[] = []
): LinuxUser[] {
  if (users.some((u) => u.username === username)) {
    return users;
  }
  return [...users, { username, primaryGroup, supplementaryGroups }];
}

export function changePrimaryGroup(
  users: LinuxUser[],
  username: string,
  newPrimaryGroup: string
): LinuxUser[] {
  return users.map((u) =>
    u.username === username ? { ...u, primaryGroup: newPrimaryGroup } : u
  );
}

export function addSupplementaryGroup(
  users: LinuxUser[],
  username: string,
  groupName: string
): LinuxUser[] {
  return users.map((u) => {
    if (u.username !== username) return u;
    if (u.supplementaryGroups.includes(groupName)) return u;
    return { ...u, supplementaryGroups: [...u.supplementaryGroups, groupName] };
  });
}

export function removeSupplementaryGroup(
  users: LinuxUser[],
  username: string,
  groupName: string
): LinuxUser[] {
  return users.map((u) => {
    if (u.username !== username) return u;
    return { ...u, supplementaryGroups: u.supplementaryGroups.filter((g) => g !== groupName) };
  });
}

