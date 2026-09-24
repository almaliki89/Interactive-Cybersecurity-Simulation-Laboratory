import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Globe, Cpu, Sliders, Hash, ShieldCheck, Binary, RefreshCw } from 'lucide-react';

export const Ipv4Visualizer: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [octet1, setOctet1] = useState<number>(192);
  const [octet2, setOctet2] = useState<number>(168);
  const [octet3, setOctet3] = useState<number>(10);
  const [octet4, setOctet4] = useState<number>(25);
  const [cidr, setCidr] = useState<number>(24);

  const octets = [octet1, octet2, octet3, octet4];

  // Helper: Convert octet number to 8-bit binary string
  const toBinary8 = (val: number) => Math.max(0, Math.min(255, val)).toString(2).padStart(8, '0');

  // Binary representations
  const binaryOctets = octets.map(toBinary8);
  const fullBinaryString = binaryOctets.join('');

  // Calculate Subnet Mask
  const getSubnetMaskBinary = (prefix: number) => {
    return '1'.repeat(prefix) + '0'.repeat(32 - prefix);
  };

  const subnetMaskBin = getSubnetMaskBinary(cidr);
  const maskOctets = [
    parseInt(subnetMaskBin.slice(0, 8), 2),
    parseInt(subnetMaskBin.slice(8, 16), 2),
    parseInt(subnetMaskBin.slice(16, 24), 2),
    parseInt(subnetMaskBin.slice(24, 32), 2),
  ];

  // Calculate Network Address
  const netOctets = octets.map((octet, idx) => octet & maskOctets[idx]);
  const netAddress = netOctets.join('.');

  // Calculate Wildcard Mask
  const wildcardOctets = maskOctets.map((m) => 255 - m);

  // Calculate Broadcast Address
  const broadcastOctets = octets.map((octet, idx) => octet | wildcardOctets[idx]);
  const broadcastAddress = broadcastOctets.join('.');

  // Total and Usable Hosts
  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : Math.max(0, totalAddresses - 2);

  // IP Class determination
  const getClass = (firstOctet: number) => {
    if (firstOctet >= 1 && firstOctet <= 126) return 'Class A';
    if (firstOctet === 127) return 'Loopback (127.0.0.0/8)';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Class B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Class C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'Class D (Multicast)';
    return 'Class E (Experimental)';
  };

  // RFC 1918 Private IP Check
  const isPrivateIp = (o1: number, o2: number) => {
    if (o1 === 10) return true;
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    if (o1 === 192 && o2 === 168) return true;
    return false;
  };

  const toggleBit = (octetIndex: number, bitIndex: number) => {
    const currentBin = binaryOctets[octetIndex].split('');
    currentBin[bitIndex] = currentBin[bitIndex] === '1' ? '0' : '1';
    const newVal = parseInt(currentBin.join(''), 2);

    if (octetIndex === 0) setOctet1(newVal);
    if (octetIndex === 1) setOctet2(newVal);
    if (octetIndex === 2) setOctet3(newVal);
    if (octetIndex === 3) setOctet4(newVal);
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Binary className="w-4 h-4" />
          <span>{isAr ? 'عناوين بروتوكول الإنترنت IPv4' : 'IPv4 Binary & Subnet Boundaries'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'المصور التفاعلي لعناوين IPv4 والتمثيل الثنائي' : 'Interactive IPv4 Binary Visualizer & Boundary Inspector'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'استكشف البنية الثنائية لعنوان IPv4، مع حدود الشبكة والمضيف، القناع، الفئات، والتراخيص الخاصة (RFC 1918).'
            : 'Manipulate 32-bit IPv4 octets in real-time. Observe network vs host bit boundaries, CIDR masks, and classful assignments.'}
        </p>
      </div>

      {/* Main Address Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        {[
          { label: 'Octet 1', val: octet1, set: setOctet1 },
          { label: 'Octet 2', val: octet2, set: setOctet2 },
          { label: 'Octet 3', val: octet3, set: setOctet3 },
          { label: 'Octet 4', val: octet4, set: setOctet4 },
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</label>
            <input
              type="number"
              min="0"
              max="255"
              value={item.val}
              onChange={(e) => item.set(Math.max(0, Math.min(255, Number(e.target.value) || 0)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-center font-bold text-lg focus:outline-none focus:border-cyan-500"
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">CIDR Prefix (/{cidr})</label>
          <input
            type="number"
            min="8"
            max="32"
            value={cidr}
            onChange={(e) => setCidr(Math.max(8, Math.min(32, Number(e.target.value) || 24)))}
            className="w-full bg-slate-950 border border-cyan-600 rounded-lg px-3 py-2 text-emerald-400 font-mono text-center font-bold text-lg focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* CIDR Prefix Slider */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
          <span>{isAr ? 'بادئة CIDR للشبكة' : 'CIDR Network Boundary Slider'}</span>
          <span className="text-cyan-400 font-mono text-sm font-bold">/{cidr} ({maskOctets.join('.')})</span>
        </div>
        <input
          type="range"
          min="8"
          max="32"
          value={cidr}
          onChange={(e) => setCidr(Number(e.target.value))}
          className="w-full accent-cyan-500 cursor-pointer"
        />
      </div>

      {/* 32-Bit Interactive Bit Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'مصفوفة البتات الـ 32 التفاعلية (انقر على أي بت لتغييره)' : '32-Bit Interactive Binary Matrix (Click any bit to flip)'}</span>
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-600/60 border border-cyan-400 rounded"></span>
              <span className="text-slate-300">{isAr ? 'بتات الشبكة (Network)' : 'Network Bits'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-800 border border-slate-600 rounded"></span>
              <span className="text-slate-400">{isAr ? 'بتات المضيف (Host)' : 'Host Bits'}</span>
            </div>
          </div>
        </div>

        {/* Octet Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {binaryOctets.map((binStr, octetIdx) => (
            <div key={octetIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-xs text-slate-400 font-mono font-semibold">
                Octet {octetIdx + 1} = <span className="text-cyan-300 font-bold text-sm">{octets[octetIdx]}</span>
              </div>
              <div className="flex justify-center gap-1">
                {binStr.split('').map((bit, bitIdx) => {
                  const globalBitPos = octetIdx * 8 + bitIdx;
                  const isNetworkBit = globalBitPos < cidr;

                  return (
                    <button
                      key={bitIdx}
                      onClick={() => toggleBit(octetIdx, bitIdx)}
                      className={`w-7 h-9 text-xs font-mono font-bold rounded flex items-center justify-center transition-all ${
                        isNetworkBit
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 hover:bg-cyan-900 shadow'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {bit}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculated Addressing Properties */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'عنوان الشبكة (Network IP)' : 'Network Address'}</span>
          <span className="text-lg font-bold font-mono text-cyan-300">{netAddress}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'عنوان البث (Broadcast IP)' : 'Broadcast Address'}</span>
          <span className="text-lg font-bold font-mono text-emerald-300">{broadcastAddress}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'عدد العناوين المتاحة' : 'Usable Host Capacity'}</span>
          <span className="text-lg font-bold font-mono text-amber-300">{usableHosts.toLocaleString()} Hosts</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 font-semibold block mb-1">{isAr ? 'تصنيف العنوان' : 'Class & Scope'}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-indigo-300">{getClass(octet1)}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${isPrivateIp(octet1, octet2) ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
              {isPrivateIp(octet1, octet2) ? (isAr ? 'خاص RFC 1918' : 'Private') : (isAr ? 'عام Public' : 'Public WAN')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
