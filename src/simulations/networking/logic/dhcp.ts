import { ipToInt, intToIp } from './routing';

export interface DhcpLeaseResult {
  success: boolean;
  assignedIp?: string;
  gateway: string;
  dns: string;
  activeLeases: number;
  errorEn?: string;
  errorAr?: string;
}

export function allocateLease(
  activeLeases: number,
  poolSize: number,
  gateway = '192.168.1.1',
  dns = '192.168.1.2',
  poolStartIp = '192.168.1.10'
): DhcpLeaseResult {
  if (activeLeases >= poolSize) {
    return {
      success: false,
      gateway,
      dns,
      activeLeases,
      errorEn: 'DHCP IP Address Pool Exhausted! Cannot allocate lease.',
      errorAr: 'نفذت العناوين في نطاق DHCP! تعذر تخصيص عنوان.',
    };
  }

  const startInt = ipToInt(poolStartIp);
  const nextIpInt = startInt + activeLeases;
  const assignedIp = intToIp(nextIpInt);

  return {
    success: true,
    assignedIp,
    gateway,
    dns,
    activeLeases: activeLeases + 1,
  };
}
