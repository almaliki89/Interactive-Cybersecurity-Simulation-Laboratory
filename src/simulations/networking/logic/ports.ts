export interface ServiceDaemon {
  id: string;
  name: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  running: boolean;
  descAr: string;
  descEn: string;
}

export interface SocketEvaluationResult {
  status: 'OPEN' | 'CLOSED';
  daemon?: ServiceDaemon;
  messageEn: string;
  messageAr: string;
}

export function evaluatePortAccess(
  services: ServiceDaemon[],
  targetPort: number,
  protocol: 'TCP' | 'UDP' = 'TCP'
): SocketEvaluationResult {
  const daemon = services.find((s) => s.port === targetPort && s.protocol === protocol);

  if (daemon && daemon.running) {
    return {
      status: 'OPEN',
      daemon,
      messageEn: `PORT ${targetPort} OPEN: Connected to ${daemon.name} (${daemon.protocol}). Socket established successfully!`,
      messageAr: `المنفذ ${targetPort} مفتوح: تم الاتصال بنجاح بالخدمة ${daemon.name} (${daemon.protocol})!`,
    };
  }

  return {
    status: 'CLOSED',
    daemon,
    messageEn: `PORT ${targetPort} CLOSED: Server rejected connection with TCP RST frame (Connection Refused).`,
    messageAr: `المنفذ ${targetPort} مغلق: رفض السيرفر الاتصال بإرجاع إطار TCP RST (تم رفض الاتصال).`,
  };
}
