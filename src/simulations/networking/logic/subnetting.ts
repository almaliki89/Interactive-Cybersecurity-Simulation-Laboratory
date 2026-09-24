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
