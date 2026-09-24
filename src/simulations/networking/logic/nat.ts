export interface NatSession {
  id: string;
  privateIp: string;
  privatePort: number;
  publicIp: string;
  publicPort: number;
  destIp: string;
  destPort: number;
  protocol: 'TCP' | 'UDP';
}

export function createNatTranslation(
  sessions: NatSession[],
  privateIp: string,
  privatePort: number,
  destIp = '93.184.216.34',
  destPort = 443,
  protocol: 'TCP' | 'UDP' = 'TCP',
  publicIp = '203.0.113.1'
): { updatedSessions: NatSession[]; session: NatSession } {
  // Reuse existing mapping if exact flow matches
  const existing = sessions.find(
    (s) =>
      s.privateIp === privateIp &&
      s.privatePort === privatePort &&
      s.destIp === destIp &&
      s.destPort === destPort &&
      s.protocol === protocol
  );

  if (existing) {
    return { updatedSessions: sessions, session: existing };
  }

  const nextIndex = sessions.length + 1;
  const newPublicPort = 50000 + nextIndex;

  const session: NatSession = {
    id: `nat-session-${nextIndex}`,
    privateIp,
    privatePort,
    publicIp,
    publicPort: newPublicPort,
    destIp,
    destPort,
    protocol,
  };

  return {
    updatedSessions: [...sessions, session],
    session,
  };
}
