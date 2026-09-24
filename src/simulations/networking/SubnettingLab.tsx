import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Network, Split, Cpu, Layers, CheckCircle, AlertTriangle } from 'lucide-react';

interface SubnetChunk {
  subnetIndex: number;
  networkIp: string;
  firstHostIp: string;
  lastHostIp: string;
  broadcastIp: string;
  usableHosts: number;
  mask: string;
}

export const SubnettingLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [baseIp, setBaseIp] = useState<string>('192.168.10.0');
  const [basePrefix, setBasePrefix] = useState<number>(24);
  const [targetPrefix, setTargetPrefix] = useState<number>(26);

  // Parse IP to integer
  const ipToInt = (ipStr: string): number => {
    return ipStr
      .split('.')
      .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
  };

  // Convert integer to IP string
  const intToIp = (ipInt: number): string => {
    return [
      (ipInt >>> 24) & 255,
      (ipInt >>> 16) & 255,
      (ipInt >>> 8) & 255,
      ipInt & 255,
    ].join('.');
  };

  const getMaskStr = (prefix: number): string => {
    const maskBin = '1'.repeat(prefix) + '0'.repeat(32 - prefix);
    return [
      parseInt(maskBin.slice(0, 8), 2),
      parseInt(maskBin.slice(8, 16), 2),
      parseInt(maskBin.slice(16, 24), 2),
      parseInt(maskBin.slice(24, 32), 2),
    ].join('.');
  };

  // Calculate Subnet Chunks
  const calculateSubnets = (): SubnetChunk[] => {
    const effectiveTargetPrefix = Math.max(basePrefix, Math.min(30, targetPrefix));
    const numSubnets = Math.pow(2, effectiveTargetPrefix - basePrefix);
    const chunkSize = Math.pow(2, 32 - effectiveTargetPrefix);

    const baseInt = ipToInt(baseIp);
    const chunks: SubnetChunk[] = [];

    for (let i = 0; i < numSubnets; i++) {
      const netInt = baseInt + i * chunkSize;
      const bcastInt = netInt + chunkSize - 1;
      const firstInt = netInt + 1;
      const lastInt = bcastInt - 1;

      chunks.push({
        subnetIndex: i + 1,
        networkIp: intToIp(netInt),
        firstHostIp: chunkSize > 2 ? intToIp(firstInt) : intToIp(netInt),
        lastHostIp: chunkSize > 2 ? intToIp(lastInt) : intToIp(bcastInt),
        broadcastIp: intToIp(bcastInt),
        usableHosts: chunkSize > 2 ? chunkSize - 2 : chunkSize,
        mask: getMaskStr(effectiveTargetPrefix),
      });
    }

    return chunks;
  };

  const subnets = calculateSubnets();
  const numSubnets = subnets.length;

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Split className="w-4 h-4" />
          <span>{isAr ? 'تقسيم الشبكات وحسابات VLSM / CIDR' : 'Subnetting & VLSM Variable Length Masking'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'مختبر تقسيم الشبكات وحساب النطاقات الفرعية' : 'Interactive Subnetting & Address Block Splitter'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'قسم النطاق الرئيسي إلى شبكات فرعية أصغر فورياً مع حساب عناوين الشبكة والبث وأول وآخر عنوان متاح.'
            : 'Divide IP blocks into variable-length subnets. Instantly view network addresses, broadcast boundaries, and host capacities.'}
        </p>
      </div>

      {/* Input Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'عنوان الشبكة الرئيسي (Base IP)' : 'Base Network Address'}
          </label>
          <input
            type="text"
            value={baseIp}
            onChange={(e) => setBaseIp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAr ? 'البادئة الأصلية (Parent CIDR)' : 'Parent CIDR Block'}
          </label>
          <select
            value={basePrefix}
            onChange={(e) => {
              const p = Number(e.target.value);
              setBasePrefix(p);
              if (targetPrefix < p) setTargetPrefix(p + 1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
          >
            {[16, 20, 24, 25, 26, 27, 28].map((p) => (
              <option key={p} value={p}>
                /{p} ({Math.pow(2, 32 - p)} Total Addresses)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            {isAr ? 'التقسيم الفرعي الجديد (Target CIDR)' : 'Target Subnet CIDR'}
          </label>
          <select
            value={targetPrefix}
            onChange={(e) => setTargetPrefix(Number(e.target.value))}
            className="w-full bg-slate-950 border border-emerald-600 rounded-lg px-3 py-2 text-emerald-300 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
          >
            {[basePrefix, basePrefix + 1, basePrefix + 2, basePrefix + 3, basePrefix + 4, basePrefix + 5]
              .filter((p) => p <= 30)
              .map((p) => (
                <option key={p} value={p}>
                  /{p} ({Math.pow(2, p - basePrefix)} Subnets x {Math.pow(2, 32 - p) - 2} Hosts)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Visual Subnet Split Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-300">{isAr ? 'التمثيل البصري لتقسيم فضاء العناوين' : 'Visual Address Space Segmentation Bar'}</span>
          <span className="text-cyan-400 font-mono font-bold">{numSubnets} Subnet Blocks (/{targetPrefix})</span>
        </div>

        <div className="flex w-full h-8 rounded-lg overflow-hidden border border-slate-700">
          {subnets.map((sub, idx) => (
            <div
              key={idx}
              className={`h-full border-r border-slate-950 flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                idx % 2 === 0 ? 'bg-cyan-900/80 text-cyan-200' : 'bg-indigo-900/80 text-indigo-200'
              }`}
              style={{ width: `${100 / numSubnets}%` }}
              title={`Subnet #${sub.subnetIndex}: ${sub.networkIp}/${targetPrefix}`}
            >
              #{sub.subnetIndex}
            </div>
          ))}
        </div>
      </div>

      {/* Generated Subnets Table */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? 'جدول الشبكات الفرعية المحسوبة' : 'Calculated Subnets Schedule'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="p-2.5">#</th>
                <th className="p-2.5">{isAr ? 'عنوان الشبكة' : 'Network Address'}</th>
                <th className="p-2.5">{isAr ? 'القناع' : 'Subnet Mask'}</th>
                <th className="p-2.5">{isAr ? 'أول عنوان متاح' : 'First Usable IP'}</th>
                <th className="p-2.5">{isAr ? 'آخر عنوان متاح' : 'Last Usable IP'}</th>
                <th className="p-2.5">{isAr ? 'عنوان البث' : 'Broadcast Address'}</th>
                <th className="p-2.5">{isAr ? 'سعة المضيفين' : 'Usable Hosts'}</th>
              </tr>
            </thead>
            <tbody>
              {subnets.map((sub) => (
                <tr key={sub.subnetIndex} className="border-b border-slate-800/50 hover:bg-slate-800/40 transition">
                  <td className="p-2.5 font-bold text-slate-400">#{sub.subnetIndex}</td>
                  <td className="p-2.5 font-bold text-cyan-300">{sub.networkIp}/{targetPrefix}</td>
                  <td className="p-2.5 text-slate-400">{sub.mask}</td>
                  <td className="p-2.5 text-emerald-300">{sub.firstHostIp}</td>
                  <td className="p-2.5 text-emerald-300">{sub.lastHostIp}</td>
                  <td className="p-2.5 text-amber-300">{sub.broadcastIp}</td>
                  <td className="p-2.5 font-bold text-indigo-300">{sub.usableHosts} Hosts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
