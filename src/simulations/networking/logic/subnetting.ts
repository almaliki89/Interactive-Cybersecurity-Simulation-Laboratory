import { ipToInt, intToIp, prefixToMask, getMaskString } from './routing';

export interface SubnetInfo {
  subnetIndex: number;
  networkIp: string;
  firstHostIp: string;
  lastHostIp: string;
  broadcastIp: string;
  totalAddresses: number;
  usableHosts: number;
  mask: string;
  cidr: number;
}

export function calculateSubnet(ipStr: string, cidr: number, subnetIndex = 1): SubnetInfo {
  const effectiveCidr = Math.max(0, Math.min(32, cidr));
  const maskInt = prefixToMask(effectiveCidr);
  const ipInt = ipToInt(ipStr);
  const netInt = (ipInt & maskInt) >>> 0;
  const totalAddresses = Math.pow(2, 32 - effectiveCidr);
  const bcastInt = (netInt + totalAddresses - 1) >>> 0;

  let usableHosts = 0;
  let firstHostInt = netInt;
  let lastHostInt = bcastInt;

  if (effectiveCidr === 32) {
    usableHosts = 1;
    firstHostInt = netInt;
    lastHostInt = netInt;
  } else if (effectiveCidr === 31) {
    usableHosts = 2;
    firstHostInt = netInt;
    lastHostInt = bcastInt;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstHostInt = (netInt + 1) >>> 0;
    lastHostInt = (bcastInt - 1) >>> 0;
  }

  return {
    subnetIndex,
    networkIp: intToIp(netInt),
    firstHostIp: intToIp(firstHostInt),
    lastHostIp: intToIp(lastHostInt),
    broadcastIp: intToIp(bcastInt),
    totalAddresses,
    usableHosts,
    mask: getMaskString(effectiveCidr),
    cidr: effectiveCidr,
  };
}

export function splitSubnet(baseIp: string, parentCidr: number, targetCidr: number): SubnetInfo[] {
  const effectiveParent = Math.max(0, Math.min(32, parentCidr));
  const effectiveTarget = Math.max(effectiveParent, Math.min(32, targetCidr));

  const numSubnets = Math.pow(2, effectiveTarget - effectiveParent);
  const chunkSize = Math.pow(2, 32 - effectiveTarget);
  const baseInt = (ipToInt(baseIp) & prefixToMask(effectiveParent)) >>> 0;

  const chunks: SubnetInfo[] = [];

  for (let i = 0; i < numSubnets; i++) {
    const netInt = (baseInt + i * chunkSize) >>> 0;
    chunks.push(calculateSubnet(intToIp(netInt), effectiveTarget, i + 1));
  }

  return chunks;
}

export function parseCidrRange(cidrStr: string): { start: number; end: number; valid: boolean } {
  if (!cidrStr || typeof cidrStr !== 'string') {
    return { start: 0, end: 0, valid: false };
  }
  const parts = cidrStr.trim().split('/');
  const ipStr = parts[0];
  const prefixStr = parts[1];

  if (!ipStr) {
    return { start: 0, end: 0, valid: false };
  }

  let prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    return { start: 0, end: 0, valid: false };
  }

  try {
    const ipInt = ipToInt(ipStr);
    const maskInt = prefixToMask(prefix);
    const start = (ipInt & maskInt) >>> 0;
    const count = prefix === 0 ? 0x100000000 : Math.pow(2, 32 - prefix);
    const end = (start + count - 1) >>> 0;
    return { start, end, valid: true };
  } catch {
    return { start: 0, end: 0, valid: false };
  }
}

export function cidrsOverlap(cidrA: string, cidrB: string): boolean {
  const rangeA = parseCidrRange(cidrA);
  const rangeB = parseCidrRange(cidrB);
  if (!rangeA.valid || !rangeB.valid) {
    return false;
  }
  return rangeA.start <= rangeB.end && rangeB.start <= rangeA.end;
}
