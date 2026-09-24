export interface SudoPolicyRule {
  userPattern: string; // e.g. "alice", "%wheel", "ALL"
  hostPattern: string; // usually "ALL"
  runAsUser: string;   // e.g. "root", "ALL"
  commands: string[];  // e.g. ["/bin/systemctl restart nginx", "ALL"]
  nopasswd: boolean;   // true if NOPASSWD is set
}

export function evaluateSudoPolicy(
  user: { username: string; groups: string[] },
  command: string,
  policies: SudoPolicyRule[]
): {
  allowed: boolean;
  passwordRequired: boolean;
  reasonEn: string;
  reasonAr: string;
} {
  // Traverse policies from bottom to top (last matching rule wins in sudoers)
  for (let i = policies.length - 1; i >= 0; i--) {
    const policy = policies[i];

    // Check user pattern matching
    let userMatches = false;
    if (policy.userPattern === 'ALL') {
      userMatches = true;
    } else if (policy.userPattern.startsWith('%')) {
      const groupName = policy.userPattern.slice(1);
      userMatches = user.groups.includes(groupName);
    } else {
      userMatches = policy.userPattern === user.username;
    }

    if (!userMatches) continue;

    // Check command pattern matching
    let commandMatches = false;
    for (const cmdPattern of policy.commands) {
      if (cmdPattern === 'ALL') {
        commandMatches = true;
        break;
      }
      if (cmdPattern === command || command.startsWith(cmdPattern + ' ')) {
        commandMatches = true;
        break;
      }
    }

    if (commandMatches) {
      return {
        allowed: true,
        passwordRequired: !policy.nopasswd,
        reasonEn: `Allowed by sudoers rule: ${policy.userPattern} ALL=(ALL) ${policy.nopasswd ? 'NOPASSWD: ' : ''}${policy.commands.join(', ')}`,
        reasonAr: `مسموح به بناءً على قاعدة sudoers: ${policy.userPattern} ALL=(ALL) ${policy.nopasswd ? 'NOPASSWD: ' : ''}${policy.commands.join(', ')}`,
      };
    }
  }

  return {
    allowed: false,
    passwordRequired: false,
    reasonEn: `Access denied. User '${user.username}' is not allowed to run '${command}' as root in /etc/sudoers.`,
    reasonAr: `تم رفض الوصول. لا يُسمح للمستخدم '${user.username}' بتشغيل الأمر '${command}' كمسؤول جذر في ملف /etc/sudoers.`,
  };
}
