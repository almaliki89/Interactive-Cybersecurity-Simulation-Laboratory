export interface CamEntry {
  port: number;
  mac: string;
  vlan: number;
  type: 'dynamic' | 'static';
}

export interface ForwardingResult {
  action: 'UNICAST' | 'FLOOD';
  targetPort: number | null; // null means flood all ports except source
  matchedEntry?: CamEntry;
}

export function learnMac(
  camTable: CamEntry[],
  port: number,
  mac: string,
  vlan = 1,
  type: 'dynamic' | 'static' = 'dynamic'
): CamEntry[] {
  const normalizedMac = mac.toUpperCase();
  const filtered = camTable.filter((e) => e.mac.toUpperCase() !== normalizedMac);
  return [...filtered, { port, mac: normalizedMac, vlan, type }];
}

export function forwardFrame(
  camTable: CamEntry[],
  destMac: string,
  sourcePort?: number
): ForwardingResult {
  const normalizedDest = destMac.toUpperCase();

  if (normalizedDest === 'FF:FF:FF:FF:FF:FF' || normalizedDest === 'BROADCAST') {
    return { action: 'FLOOD', targetPort: null };
  }

  const match = camTable.find((e) => e.mac.toUpperCase() === normalizedDest);

  if (match) {
    if (sourcePort !== undefined && match.port === sourcePort) {
      // Frame addressed to same ingress port - drop or no-op
      return { action: 'UNICAST', targetPort: match.port, matchedEntry: match };
    }
    return { action: 'UNICAST', targetPort: match.port, matchedEntry: match };
  }

  return { action: 'FLOOD', targetPort: null };
}
