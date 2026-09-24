export interface ArpEntry {
  ip: string;
  mac: string;
  type: 'dynamic' | 'static';
  ttl: number;
}

export function checkArpCache(cache: ArpEntry[], targetIp: string): ArpEntry | undefined {
  return cache.find((e) => e.ip === targetIp);
}

export function updateArpCache(
  cache: ArpEntry[],
  ip: string,
  mac: string,
  type: 'dynamic' | 'static' = 'dynamic',
  ttl = 300
): ArpEntry[] {
  const filtered = cache.filter((e) => e.ip !== ip);
  return [...filtered, { ip, mac, type, ttl }];
}

export function flushArpCache(): ArpEntry[] {
  return [];
}
