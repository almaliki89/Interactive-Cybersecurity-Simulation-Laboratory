import { describe, it, expect } from 'vitest';
import {
  buildPcapBinary,
  parseIpv4,
  parseMac,
  calculateChecksum,
  convertPacketsToPcap,
  PcapPacketInput,
} from '../pcapExporter';
import { Packet } from '../../../types/simulation';

describe('Standard Binary PCAP Exporter (Wireshark compatible)', () => {
  it('parses IPv4 addresses and handles fallbacks gracefully', () => {
    expect(parseIpv4('192.168.1.1')).toEqual([192, 168, 1, 1]);
    expect(parseIpv4('10.200.0.254')).toEqual([10, 200, 0, 254]);
    expect(parseIpv4('invalid.ip')).toEqual([10, 0, 0, 1]);
  });

  it('parses MAC addresses correctly with colon or dash separators', () => {
    expect(parseMac('00:0c:29:ab:cd:ef')).toEqual([0x00, 0x0c, 0x29, 0xab, 0xcd, 0xef]);
    expect(parseMac('00-0c-29-11-22-33')).toEqual([0x00, 0x0c, 0x29, 0x11, 0x22, 0x33]);
    expect(parseMac(undefined)).toEqual([0x00, 0x0c, 0x29, 0xaa, 0xbb, 0xcc]);
  });

  it('generates a valid 24-byte PCAP Global Header with standard magic number', () => {
    const pcapBytes = buildPcapBinary([]);

    expect(pcapBytes.length).toBe(24);
    const view = new DataView(pcapBytes.buffer);

    // Magic number 0xa1b2c3d4 in little endian
    expect(view.getUint32(0, true)).toBe(0xa1b2c3d4);
    // Version 2.4
    expect(view.getUint16(4, true)).toBe(2);
    expect(view.getUint16(6, true)).toBe(4);
    // Snaplen 65535
    expect(view.getUint32(16, true)).toBe(65535);
    // LinkType 1 (LINKTYPE_ETHERNET)
    expect(view.getUint32(20, true)).toBe(1);
  });

  it('encodes TCP packets with Ethernet II, IPv4 header, and TCP flags', () => {
    const tcpFrame: PcapPacketInput = {
      sourceIp: '192.168.1.50',
      destinationIp: '192.168.1.1',
      sourceMac: '00:0c:29:11:22:33',
      destinationMac: '00:0c:29:44:55:66',
      protocol: 'TCP',
      sourcePort: 49152,
      destinationPort: 443,
      flags: ['SYN'],
      seq: 1000,
      ack: 0,
    };

    const pcapBytes = buildPcapBinary([tcpFrame]);
    // 24 (global) + 16 (pkt header) + 14 (eth) + 20 (ip) + 20 (tcp) = 94 bytes
    expect(pcapBytes.length).toBe(94);

    const view = new DataView(pcapBytes.buffer);
    // Packet Header
    const capturedLen = view.getUint32(32, true); // 24 + 8
    expect(capturedLen).toBe(54); // 14 + 20 + 20

    // Check EtherType (IPv4 = 0x0800) at offset 24 + 16 + 12 = 52
    expect(view.getUint16(52, false)).toBe(0x0800);

    // Check IP Version and IHL (0x45) at offset 54
    expect(pcapBytes[54]).toBe(0x45);
    // Check IP Protocol (6 for TCP) at offset 54 + 9 = 63
    expect(pcapBytes[63]).toBe(6);

    // Check TCP Ports at offset 54 + 20 = 74
    expect(view.getUint16(74, false)).toBe(49152); // Source Port
    expect(view.getUint16(76, false)).toBe(443);   // Destination Port
    // Check SYN flag (0x02) at offset 74 + 13 = 87
    expect(pcapBytes[87]).toBe(0x02);
  });

  it('converts simulation Packet list into Wireshark binary captures', () => {
    const packets: Packet[] = [
      {
        id: 'pkt-1',
        source: 'client',
        destination: 'server',
        protocol: 'TCP',
        sourcePort: 55432,
        destinationPort: 80,
        flags: ['SYN'],
        state: 'moving',
        progress: 0.5,
        timestamp: 1700000000000,
      },
      {
        id: 'pkt-2',
        source: 'server',
        destination: 'client',
        protocol: 'TCP',
        sourcePort: 80,
        destinationPort: 55432,
        flags: ['SYN', 'ACK'],
        state: 'moving',
        progress: 0.5,
        timestamp: 1700000000100,
      },
      {
        id: 'pkt-3',
        source: 'client',
        destination: 'server',
        protocol: 'TCP',
        sourcePort: 55432,
        destinationPort: 80,
        flags: ['ACK'],
        state: 'delivered',
        progress: 1.0,
        timestamp: 1700000000200,
      },
    ];

    const pcapBytes = convertPacketsToPcap(packets);
    // 24 + 3 * (16 + 54) = 24 + 210 = 234 bytes
    expect(pcapBytes.length).toBe(234);
    expect(pcapBytes[0]).toBe(0xd4);
    expect(pcapBytes[1]).toBe(0xc3);
    expect(pcapBytes[2]).toBe(0xb2);
    expect(pcapBytes[3]).toBe(0xa1);
  });
});
