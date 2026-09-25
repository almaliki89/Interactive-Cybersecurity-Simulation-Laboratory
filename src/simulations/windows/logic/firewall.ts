export type FirewallProfile = 'Domain' | 'Private' | 'Public';
export type FirewallDirection = 'Inbound' | 'Outbound';
export type FirewallAction = 'Allow' | 'Block';

export interface WindowsFirewallRule {
  id: string;
  name: string;
  direction: FirewallDirection;
  action: FirewallAction;
  enabled: boolean;
  protocol: 'TCP' | 'UDP' | 'Any';
  localPort: number | 'Any';
  remoteAddress: string | 'Any';
  profiles: FirewallProfile[];
  serviceName?: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface WindowsFirewallState {
  profilesEnabled: Record<FirewallProfile, boolean>;
  currentActiveProfile: FirewallProfile;
  rules: WindowsFirewallRule[];
}

export const INITIAL_FIREWALL_RULES: WindowsFirewallRule[] = [
  {
    id: 'fw-smb-in',
    name: 'File and Printer Sharing (SMB-In)',
    direction: 'Inbound',
    action: 'Allow',
    enabled: true,
    protocol: 'TCP',
    localPort: 445,
    remoteAddress: 'Any', // Vulnerable if enabled on Public profile!
    profiles: ['Domain', 'Private', 'Public'],
    serviceName: 'LanmanServer',
    descriptionEn: 'Allows inbound SMB file sharing connections (Port 445). High risk on Public networks.',
    descriptionAr: 'يسمح باتصالات مشاركة الملفات عبر SMB (المنفذ 445). خطر مرتفع على الشبكات العامة.',
  },
  {
    id: 'fw-rdp-in',
    name: 'Remote Desktop - User Mode (TCP-In)',
    direction: 'Inbound',
    action: 'Allow',
    enabled: true,
    protocol: 'TCP',
    localPort: 3389,
    remoteAddress: '10.0.0.0/8',
    profiles: ['Domain', 'Private'],
    serviceName: 'TermService',
    descriptionEn: 'Allows remote management via Remote Desktop Protocol (Port 3389) from internal LAN.',
    descriptionAr: 'يسمح بالإدارة عن بعد عبر سطح المكتب البعيد RDP (المنفذ 3389) من الشبكة الداخلية.',
  },
  {
    id: 'fw-telnet-in',
    name: 'Insecure Telnet Server (Inbound)',
    direction: 'Inbound',
    action: 'Allow',
    enabled: true, // Vulnerable: Telnet open!
    protocol: 'TCP',
    localPort: 23,
    remoteAddress: 'Any',
    profiles: ['Domain', 'Private', 'Public'],
    serviceName: 'TlntSvr',
    descriptionEn: 'Legacy inbound Telnet traffic. Transmits plaintext credentials across the wire.',
    descriptionAr: 'حركة مرور Telnet غير الآمنة الواردة. تنقل كلمات المرور بنص صريح عبر الشبكة.',
  },
  {
    id: 'fw-http-out',
    name: 'Core Networking - HTTP Egress (TCP-Out)',
    direction: 'Outbound',
    action: 'Allow',
    enabled: true,
    protocol: 'TCP',
    localPort: 'Any',
    remoteAddress: 'Any',
    profiles: ['Domain', 'Private', 'Public'],
    descriptionEn: 'Allows outbound HTTP browser and update requests on port 80.',
    descriptionAr: 'يسمح بالطلبات الصادرة لمتصفح الويب والتحديثات عبر المنفذ 80.',
  },
  {
    id: 'fw-https-out',
    name: 'Core Networking - HTTPS Secure Egress (TCP-Out)',
    direction: 'Outbound',
    action: 'Allow',
    enabled: true,
    protocol: 'TCP',
    localPort: 'Any',
    remoteAddress: 'Any',
    profiles: ['Domain', 'Private', 'Public'],
    descriptionEn: 'Allows outbound TLS encrypted web traffic on port 443.',
    descriptionAr: 'يسمح بحركة مرور الويب المشفرة الصادرة عبر المنفذ 443.',
  },
  {
    id: 'fw-dns-out',
    name: 'Core Networking - DNS Resolution (UDP-Out)',
    direction: 'Outbound',
    action: 'Allow',
    enabled: true,
    protocol: 'UDP',
    localPort: 'Any',
    remoteAddress: 'Any',
    profiles: ['Domain', 'Private', 'Public'],
    descriptionEn: 'Allows outbound domain name lookups on port 53.',
    descriptionAr: 'يسمح باستعلامات أسماء النطاقات الصادرة عبر المنفذ 53.',
  },
  {
    id: 'fw-block-suspicious',
    name: 'Block Suspicious Mining/C2 Port 4444',
    direction: 'Inbound',
    action: 'Block',
    enabled: true,
    protocol: 'TCP',
    localPort: 4444,
    remoteAddress: 'Any',
    profiles: ['Domain', 'Private', 'Public'],
    descriptionEn: 'Explicitly drops common Metasploit and reverse shell handler port 4444.',
    descriptionAr: 'يسقط صراحة حزم منافذ أدوات الاختراق وقنوات C2 الشائعة (المنفذ 4444).',
  },
];

export const INITIAL_FIREWALL_STATE: WindowsFirewallState = {
  profilesEnabled: {
    Domain: true,
    Private: true,
    Public: true,
  },
  currentActiveProfile: 'Public', // Can test Public profile exposure
  rules: INITIAL_FIREWALL_RULES,
};

export interface PacketInspectionQuery {
  direction: FirewallDirection;
  protocol: 'TCP' | 'UDP';
  port: number;
  remoteIp: string;
  profile?: FirewallProfile;
}

export interface FirewallDecision {
  allowed: boolean;
  matchedRule?: WindowsFirewallRule;
  reasonEn: string;
  reasonAr: string;
  profileActive: boolean;
}

/**
 * Evaluates whether a network packet is permitted by Windows Defender Firewall.
 *
 * Windows Firewall Rule Engine Precedence:
 * 1. If firewall profile is DISABLED -> Traffic is ALLOWED unconditionally.
 * 2. Explicit BLOCK rules matching profile, direction, protocol, and port take absolute precedence.
 * 3. Explicit ALLOW rules matching packet grant access.
 * 4. Default policy for Inbound is BLOCK; default policy for Outbound is ALLOW.
 */
export function evaluateFirewallPacket(
  state: WindowsFirewallState,
  packet: PacketInspectionQuery
): FirewallDecision {
  const profile = packet.profile || state.currentActiveProfile;
  const isProfileEnabled = state.profilesEnabled[profile];

  if (!isProfileEnabled) {
    return {
      allowed: true,
      profileActive: false,
      reasonEn: `Windows Firewall is DISABLED on ${profile} profile: all traffic allowed!`,
      reasonAr: `جدار حماية ويندوز معطل على نمط ${profile}: كل حركة المرور مسموحة دون ترشيح!`,
    };
  }

  // Filter rules active for this profile and direction
  const candidateRules = state.rules.filter(
    (r) => r.enabled && r.direction === packet.direction && r.profiles.includes(profile)
  );

  // Check protocol and port match
  const matches = (r: WindowsFirewallRule): boolean => {
    if (r.protocol !== 'Any' && r.protocol !== packet.protocol) return false;
    if (r.localPort !== 'Any' && r.localPort !== packet.port) return false;
    return true;
  };

  // 1. Check matching BLOCK rules (Windows Firewall prioritizes Block over Allow)
  const blockRule = candidateRules.find((r) => r.action === 'Block' && matches(r));
  if (blockRule) {
    return {
      allowed: false,
      matchedRule: blockRule,
      profileActive: true,
      reasonEn: `BLOCKED by rule "${blockRule.name}" on ${profile} profile`,
      reasonAr: `تم الحظر بواسطة القاعدة "${blockRule.name}" على نمط ${profile}`,
    };
  }

  // 2. Check matching ALLOW rules
  const allowRule = candidateRules.find((r) => r.action === 'Allow' && matches(r));
  if (allowRule) {
    return {
      allowed: true,
      matchedRule: allowRule,
      profileActive: true,
      reasonEn: `ALLOWED by rule "${allowRule.name}" on ${profile} profile`,
      reasonAr: `تم السماح بواسطة القاعدة "${allowRule.name}" على نمط ${profile}`,
    };
  }

  // 3. Default Policy: Inbound defaults to Block, Outbound defaults to Allow
  if (packet.direction === 'Inbound') {
    return {
      allowed: false,
      profileActive: true,
      reasonEn: `BLOCKED by Default Inbound Policy on ${profile} profile (No allow rule matched)`,
      reasonAr: `تم الحظر بالسياسة الافتراضية للوارد على نمط ${profile} (لا توجد قاعدة سماح مطابقة)`,
    };
  } else {
    return {
      allowed: true,
      profileActive: true,
      reasonEn: `ALLOWED by Default Outbound Policy on ${profile} profile`,
      reasonAr: `تم السماح بالسياسة الافتراضية للصادر على نمط ${profile}`,
    };
  }
}

/**
 * Toggles a firewall profile (Domain, Private, Public).
 */
export function setFirewallProfileState(
  state: WindowsFirewallState,
  profile: FirewallProfile,
  enabled: boolean
): WindowsFirewallState {
  return {
    ...state,
    profilesEnabled: {
      ...state.profilesEnabled,
      [profile]: enabled,
    },
  };
}

/**
 * Toggles a firewall rule's enabled state.
 */
export function toggleFirewallRule(
  state: WindowsFirewallState,
  ruleId: string
): WindowsFirewallState {
  return {
    ...state,
    rules: state.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
  };
}
