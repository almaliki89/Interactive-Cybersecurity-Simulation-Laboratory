export function ipToInt(ip: string): number {
  return ip
    .split('.')
    .reduce((acc, octet) => ((acc << 8) + (parseInt(octet, 10) & 255)) >>> 0, 0);
}

export function intToIp(intVal: number): string {
  return [
    (intVal >>> 24) & 255,
    (intVal >>> 16) & 255,
    (intVal >>> 8) & 255,
    intVal & 255,
  ].join('.');
}

export function prefixToMask(prefix: number): number {
  if (prefix <= 0) return 0;
  if (prefix >= 32) return 0xffffffff >>> 0;
  return ((0xffffffff << (32 - prefix)) >>> 0);
}

export function getMaskString(prefix: number): string {
  return intToIp(prefixToMask(prefix));
}

export interface RouteEntry {
  id: string;
  destPrefix: string;
  nextHop: string;
  interfaceName: string;
  metric: number;
  disabled?: boolean;
}

export function findBestRoute(destIp: string, routingTable: RouteEntry[]): RouteEntry | null {
  let destInt = 0;
  try {
    destInt = ipToInt(destIp);
  } catch {
    return null;
  }

  let bestRoute: RouteEntry | null = null;
  let maxPrefixLength = -1;

  for (const route of routingTable) {
    if (route.disabled) continue;

    const [prefixIp, prefixLengthStr] = route.destPrefix.split('/');
    const prefixLength = parseInt(prefixLengthStr || '0', 10);
    const mask = prefixToMask(prefixLength);
    const routeInt = ipToInt(prefixIp);

    if ((destInt & mask) === (routeInt & mask)) {
      if (prefixLength > maxPrefixLength) {
        maxPrefixLength = prefixLength;
        bestRoute = route;
      } else if (prefixLength === maxPrefixLength && bestRoute) {
        if (route.metric < bestRoute.metric) {
          bestRoute = route;
        }
      }
    }
  }

  return bestRoute;
}
