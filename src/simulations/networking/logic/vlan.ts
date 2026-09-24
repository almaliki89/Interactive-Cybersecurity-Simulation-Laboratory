export interface VlanDevice {
  id: string;
  name: string;
  ip: string;
  vlanId: number;
  isGuest?: boolean;
}

export interface VlanPolicyConfig {
  interVlanRoutingEnabled: boolean;
  guestIsolationEnabled?: boolean;
  guestVlanId?: number;
}

export interface VlanCommunicationResult {
  allowed: boolean;
  reasonEn: string;
  reasonAr: string;
  mode: 'L2_SAME_VLAN' | 'L3_INTER_VLAN' | 'BLOCKED';
}

export function canCommunicateAcrossVlans(
  source: VlanDevice,
  destination: VlanDevice,
  config: VlanPolicyConfig
): VlanCommunicationResult {
  // 1. Same VLAN
  if (source.vlanId === destination.vlanId) {
    return {
      allowed: true,
      reasonEn: `Intra-VLAN ${source.vlanId} L2 switching allowed`,
      reasonAr: `الاتصال المباشر مسموح ضمن نفس شبكة VLAN ${source.vlanId}`,
      mode: 'L2_SAME_VLAN',
    };
  }

  // 2. Guest isolation policy check
  const guestVlan = config.guestVlanId ?? 30;
  const isGuestInvolved = source.vlanId === guestVlan || destination.vlanId === guestVlan || source.isGuest || destination.isGuest;

  if (config.guestIsolationEnabled && isGuestInvolved) {
    return {
      allowed: false,
      reasonEn: `Blocked by Guest Isolation Policy (VLAN ${guestVlan})`,
      reasonAr: `محظور بواسطة سياسة عزل شبكة الضيوف (VLAN ${guestVlan})`,
      mode: 'BLOCKED',
    };
  }

  // 3. Inter-VLAN routing toggle check
  if (!config.interVlanRoutingEnabled) {
    return {
      allowed: false,
      reasonEn: `Blocked: Inter-VLAN L3 Routing is disabled on router`,
      reasonAr: `محظور: التوجيه بين شبكات VLAN معطل على الموجه`,
      mode: 'BLOCKED',
    };
  }

  return {
    allowed: true,
    reasonEn: `Inter-VLAN L3 routed between VLAN ${source.vlanId} and VLAN ${destination.vlanId}`,
    reasonAr: `مسموح عبر التوجيه بين شبكة VLAN ${source.vlanId} وشبكة VLAN ${destination.vlanId}`,
    mode: 'L3_INTER_VLAN',
  };
}
