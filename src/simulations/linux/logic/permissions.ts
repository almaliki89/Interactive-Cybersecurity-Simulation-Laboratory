export interface PermissionBits {
  r: boolean;
  w: boolean;
  x: boolean;
}

export interface PosixPermissions {
  owner: PermissionBits;
  group: PermissionBits;
  other: PermissionBits;
}

export function parseOctalMode(octalStr: string): PosixPermissions {
  const normalized = octalStr.replace(/[^0-7]/g, '').padStart(3, '0').slice(-3);
  const parseDigit = (digitChar: string): PermissionBits => {
    const digit = parseInt(digitChar, 10);
    return {
      r: (digit & 4) !== 0,
      w: (digit & 2) !== 0,
      x: (digit & 1) !== 0,
    };
  };

  return {
    owner: parseDigit(normalized[0]),
    group: parseDigit(normalized[1]),
    other: parseDigit(normalized[2]),
  };
}

export function calcOctalDigit(bits: PermissionBits): number {
  return (bits.r ? 4 : 0) + (bits.w ? 2 : 0) + (bits.x ? 1 : 0);
}

export function getOctalString(perms: PosixPermissions): string {
  return `${calcOctalDigit(perms.owner)}${calcOctalDigit(perms.group)}${calcOctalDigit(perms.other)}`;
}

export function formatSymbolicMode(perms: PosixPermissions, isDirectory = false): string {
  const formatClass = (bits: PermissionBits) => {
    return `${bits.r ? 'r' : '-'}${bits.w ? 'w' : '-'}${bits.x ? 'x' : '-'}`;
  };
  const prefix = isDirectory ? 'd' : '-';
  return `${prefix}${formatClass(perms.owner)}${formatClass(perms.group)}${formatClass(perms.other)}`;
}

export function evaluatePosixPermission(
  user: { username: string; primaryGroup: string; supplementaryGroups: string[] },
  file: { owner: string; group: string; permissions: PosixPermissions },
  action: 'r' | 'w' | 'x'
): boolean {
  if (user.username === 'root') return true;

  const isOwner = user.username === file.owner;
  if (isOwner) {
    return file.permissions.owner[action];
  }

  const isGroup = user.primaryGroup === file.group || user.supplementaryGroups.includes(file.group);
  if (isGroup) {
    return file.permissions.group[action];
  }

  return file.permissions.other[action];
}

export function applyChmodSymbolic(
  current: PosixPermissions,
  targetClass: 'u' | 'g' | 'o' | 'a',
  operation: '+' | '-' | '=',
  bits: ('r' | 'w' | 'x')[]
): PosixPermissions {
  const next: PosixPermissions = JSON.parse(JSON.stringify(current));
  const classesToModify: ('owner' | 'group' | 'other')[] =
    targetClass === 'a'
      ? ['owner', 'group', 'other']
      : targetClass === 'u'
      ? ['owner']
      : targetClass === 'g'
      ? ['group']
      : ['other'];

  for (const c of classesToModify) {
    if (operation === '=') {
      next[c] = {
        r: bits.includes('r'),
        w: bits.includes('w'),
        x: bits.includes('x'),
      };
    } else {
      for (const b of bits) {
        next[c][b] = operation === '+';
      }
    }
  }

  return next;
}

