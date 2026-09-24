export interface UdpDropParams {
  seed?: number;
  sequence: number;
  lossRate: number;
}

export function shouldDropDatagram(params: UdpDropParams): boolean {
  const { seed = 42, sequence, lossRate } = params;

  if (lossRate <= 0) return false;
  if (lossRate >= 100) return true;

  // Deterministic LCG / Hash pseudo-random formula combining seed and sequence
  const combined = (seed * 10007 + sequence * 9301 + 49297) % 233280;
  const pseudoRand = combined / 233280;

  return pseudoRand * 100 < lossRate;
}
