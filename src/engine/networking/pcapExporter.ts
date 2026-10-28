/**
 * Standard Binary PCAP Exporter (libpcap format)
 * Generates 100% valid, Wireshark-compatible PCAP binary captures from simulation packets.
 * Format Specification: libpcap 2.4, LinkType 1 (LINKTYPE_ETHERNET)
 */

import { Packet, SimulationNode } from '../../types/simulation';

export interface PcapPacketInput {
  timestampSeconds?: number;
  timestampMicroseconds?: number;
  sourceIp?: string;
  destinationIp?: string;
  sourceMac?: string;
  destinationMac?: string;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'DNS' | 'HTTP' | 'HTTPS' | 'TLS' | string;
  sourcePort: number;
  destinationPort: number;
  flags?: string[];
  seq?: number;
  ack?: number;
  payload?: Uint8Array | string;
}

/**
 * Parses IPv4 string into 4 bytes
 */
export function parseIpv4(ip: string): [number, number, number, number] {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return [10, 0, 0, 1]; // Default fallback IP
  }
  return [parts[0], parts[1], parts[2], parts[3]];
}

/**
 * Parses MAC address string into 6 bytes
 */
export function parseMac(mac?: string): [number, number, number, number, number, number] {
  if (!mac) return [0x00, 0x0c, 0x29, 0xaa, 0xbb, 0xcc];
  const parts = mac.split(/[:-]/).map((p) => parseInt(p, 16));
  if (parts.length !== 6 || parts.some((p) => isNaN(p))) {
    return [0x00, 0x0c, 0x29, 0xaa, 0xbb, 0xcc];
  }
  return [parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]];
}

/**
 * Calculates standard 16-bit Internet Checksum (RFC 1071)
 */
export function calculateChecksum(buffer: Uint8Array, offset: number, length: number): number {
  let sum = 0;
  for (let i = 0; i < length - 1; i += 2) {
    const word = (buffer[offset + i] << 8) + buffer[offset + i + 1];
    sum += word;
  }
  if (length % 2 === 1) {
    sum += buffer[offset + length - 1] << 8;
  }
  while (sum >> 16) {
    sum = (sum & 0xffff) + (sum >> 16);
  }
  return ~sum & 0xffff;
}

/**
 * Builds binary PCAP bytes from a list of packet frames
 */
export function buildPcapBinary(frames: PcapPacketInput[]): Uint8Array {
  // 1. Build Global Header (24 bytes)
  // Magic: 0xa1b2c3d4 (little-endian: 0xd4, 0xc3, 0xb2, 0xa1)
  const globalHeader = new Uint8Array(24);
  const ghView = new DataView(globalHeader.buffer);
  ghView.setUint32(0, 0xa1b2c3d4, true); // Magic Number
  ghView.setUint16(4, 2, true);          // Major Version 2
  ghView.setUint16(6, 4, true);          // Minor Version 4
  ghView.setInt32(8, 0, true);           // Timezone GMT
  ghView.setUint32(12, 0, true);         // Accuracy
  ghView.setUint32(16, 65535, true);     // Snapshot Length Max
  ghView.setUint32(20, 1, true);         // LinkType: LINKTYPE_ETHERNET (1)

  const packetBuffers: Uint8Array[] = [];
  let currentSeq = 1000;

  frames.forEach((frame, idx) => {
    // Encode Payload
    let payloadBytes = new Uint8Array(0);
    if (typeof frame.payload === 'string') {
      payloadBytes = new TextEncoder().encode(frame.payload);
    } else if (frame.payload instanceof Uint8Array) {
      payloadBytes = new Uint8Array(frame.payload);
    }

    const isUdp = frame.protocol === 'UDP' || frame.protocol === 'DNS';
    const isIcmp = frame.protocol === 'ICMP';
    const isTcp = !isUdp && !isIcmp;

    // Transport layer length
    const transportHeaderLen = isTcp ? 20 : isUdp ? 8 : 8;
    const ipTotalLen = 20 + transportHeaderLen + payloadBytes.length;
    const ethernetTotalLen = 14 + ipTotalLen;

    const frameData = new Uint8Array(ethernetTotalLen);
    const view = new DataView(frameData.buffer);

    // 1. Ethernet II Header (14 bytes)
    const dstMac = parseMac(frame.destinationMac);
    const srcMac = parseMac(frame.sourceMac);
    dstMac.forEach((b, i) => { frameData[i] = b; });
    srcMac.forEach((b, i) => { frameData[6 + i] = b; });
    view.setUint16(12, 0x0800, false); // IPv4 EtherType (big-endian)

    // 2. IPv4 Header (20 bytes at offset 14)
    const ipOffset = 14;
    frameData[ipOffset] = 0x45; // Version 4, IHL 5 (20 bytes)
    frameData[ipOffset + 1] = 0x00; // DSCP / ECN
    view.setUint16(ipOffset + 2, ipTotalLen, false);
    view.setUint16(ipOffset + 4, (1000 + idx) & 0xffff, false); // Identification
    view.setUint16(ipOffset + 6, 0x4000, false); // Don't Fragment flag
    frameData[ipOffset + 8] = 64; // TTL
    frameData[ipOffset + 9] = isTcp ? 6 : isUdp ? 17 : 1; // Protocol: 6 (TCP), 17 (UDP), 1 (ICMP)

    const [s1, s2, s3, s4] = parseIpv4(frame.sourceIp || '192.168.1.10');
    const [d1, d2, d3, d4] = parseIpv4(frame.destinationIp || '192.168.1.1');
    frameData[ipOffset + 12] = s1;
    frameData[ipOffset + 13] = s2;
    frameData[ipOffset + 14] = s3;
    frameData[ipOffset + 15] = s4;
    frameData[ipOffset + 16] = d1;
    frameData[ipOffset + 17] = d2;
    frameData[ipOffset + 18] = d3;
    frameData[ipOffset + 19] = d4;

    // IP Checksum
    const ipChecksum = calculateChecksum(frameData, ipOffset, 20);
    view.setUint16(ipOffset + 10, ipChecksum, false);

    // 3. Transport Header
    const transOffset = 34;
    if (isTcp) {
      view.setUint16(transOffset, frame.sourcePort || 49152, false);
      view.setUint16(transOffset + 2, frame.destinationPort || 80, false);
      view.setUint32(transOffset + 4, frame.seq ?? (currentSeq + idx * 100), false);
      view.setUint32(transOffset + 8, frame.ack ?? (frame.flags?.includes('ACK') ? 1001 : 0), false);
      frameData[transOffset + 12] = 0x50; // Data offset 5 (20 bytes)

      // TCP Flags: FIN(0x01), SYN(0x02), RST(0x04), PSH(0x08), ACK(0x10), URG(0x20)
      let tcpFlags = 0;
      const flags = frame.flags || [];
      if (flags.includes('FIN')) tcpFlags |= 0x01;
      if (flags.includes('SYN')) tcpFlags |= 0x02;
      if (flags.includes('RST')) tcpFlags |= 0x04;
      if (flags.includes('PSH')) tcpFlags |= 0x08;
      if (flags.includes('ACK')) tcpFlags |= 0x10;
      if (flags.includes('URG')) tcpFlags |= 0x20;
      frameData[transOffset + 13] = tcpFlags;

      view.setUint16(transOffset + 14, 64240, false); // Window Size
      view.setUint16(transOffset + 16, 0x0000, false); // Checksum (optional)
      view.setUint16(transOffset + 18, 0x0000, false); // Urgent Pointer

      if (payloadBytes.length > 0) {
        frameData.set(payloadBytes, transOffset + 20);
      }
    } else if (isUdp) {
      view.setUint16(transOffset, frame.sourcePort || 53535, false);
      view.setUint16(transOffset + 2, frame.destinationPort || 53, false);
      view.setUint16(transOffset + 4, 8 + payloadBytes.length, false);
      view.setUint16(transOffset + 6, 0x0000, false); // UDP Checksum

      if (payloadBytes.length > 0) {
        frameData.set(payloadBytes, transOffset + 8);
      }
    }

    // 4. Packet Header (16 bytes)
    const pcapPktHeader = new Uint8Array(16);
    const pktView = new DataView(pcapPktHeader.buffer);
    const tsSec = frame.timestampSeconds ?? Math.floor(Date.now() / 1000);
    const tsUsec = frame.timestampMicroseconds ?? (idx * 15000);

    pktView.setUint32(0, tsSec, true);
    pktView.setUint32(4, tsUsec, true);
    pktView.setUint32(8, ethernetTotalLen, true);  // Captured length
    pktView.setUint32(12, ethernetTotalLen, true); // Original wire length

    packetBuffers.push(pcapPktHeader);
    packetBuffers.push(frameData);
  });

  // Calculate total size and concatenate
  const totalLength = 24 + packetBuffers.reduce((acc, buf) => acc + buf.length, 0);
  const out = new Uint8Array(totalLength);
  out.set(globalHeader, 0);

  let currentOffset = 24;
  for (const buf of packetBuffers) {
    out.set(buf, currentOffset);
    currentOffset += buf.length;
  }

  return out;
}

/**
 * Converts simulation Packet objects into PCAP binary buffer
 */
export function convertPacketsToPcap(
  packets: Packet[],
  nodes?: Record<string, SimulationNode>
): Uint8Array {
  const frames: PcapPacketInput[] = packets.map((pkt, idx) => {
    const srcNode = nodes?.[pkt.source];
    const dstNode = nodes?.[pkt.destination];

    return {
      timestampSeconds: Math.floor((pkt.timestamp || Date.now()) / 1000),
      timestampMicroseconds: (idx * 10000) % 1000000,
      sourceIp: srcNode?.ip || '10.0.0.10',
      destinationIp: dstNode?.ip || '10.0.0.1',
      sourceMac: srcNode?.mac || '00:0c:29:11:22:33',
      destinationMac: dstNode?.mac || '00:0c:29:44:55:66',
      protocol: pkt.protocol || 'TCP',
      sourcePort: pkt.sourcePort || 44321,
      destinationPort: pkt.destinationPort || 80,
      flags: pkt.flags,
      payload: pkt.payload ? (typeof pkt.payload === 'string' ? pkt.payload : JSON.stringify(pkt.payload)) : undefined,
    };
  });

  return buildPcapBinary(frames);
}

/**
 * Initiates direct browser download of binary .pcap file
 */
export function downloadPcapFile(pcapBytes: Uint8Array, filename = 'capture.pcap'): void {
  const blob = new Blob([pcapBytes.buffer as unknown as ArrayBuffer], { type: 'application/vnd.tcpdump.pcap' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
