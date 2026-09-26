/**
 * OMEGA V13 — Cloud Security World
 * SecurityGroupLab.tsx
 *
 * Interactive Cloud Network Security Layer:
 * Stateful Security Groups (ENI) vs Stateless Network ACLs (Subnet).
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  createDefaultSecurityGroups,
  createDefaultNacl,
  evaluateSecurityGroup,
  evaluateNetworkAcl,
  TrafficPacket,
  ProtocolType,
  TrafficDirection,
} from './logic/securityGroups';
import { Layers, Shield, CheckCircle2, AlertTriangle, Play, ArrowRight, RefreshCw } from 'lucide-react';

export const SecurityGroupLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [sgs] = useState(createDefaultSecurityGroups());
  const [nacl] = useState(createDefaultNacl());

  const [selectedSgKey, setSelectedSgKey] = useState<keyof typeof sgs>('webAlbSg');
  const [packetDirection, setPacketDirection] = useState<TrafficDirection>('INGRESS');
  const [packetProtocol, setPacketProtocol] = useState<ProtocolType>('TCP');
  const [destinationPort, setDestinationPort] = useState<number>(443);
  const [sourceIp, setSourceIp] = useState<string>('203.0.113.15');
  const [isExistingConnection, setIsExistingConnection] = useState<boolean>(false);

  const currentSg = sgs[selectedSgKey];

  const packet: TrafficPacket = {
    direction: packetDirection,
    protocol: packetProtocol,
    sourceIp,
    sourcePort: 54120,
    destinationIp: '10.100.1.100',
    destinationPort,
    isExistingConnection,
  };

  const sgResult = evaluateSecurityGroup(currentSg, packet);
  const naclResult = evaluateNetworkAcl(nacl, packet);

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-1">
            <Layers className="w-4 h-4" />
            <span>CLOUD FIREWALL & FILTERING ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر مجموعات الأمان وقوائم تحكم الشبكة (Stateful SGs vs Stateless NACLs)' : 'Security Groups vs Network ACLs Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'مجموعات الأمان (SGs) حالة (Stateful) وتعمل على مستوى واجهة الشبكة، بينما قوائم NACLs غير حالة (Stateless) وتعمل عند حدود الشبكة الفرعية.'
              : 'Security Groups are stateful firewalls at the ENI level (auto-allowing return traffic). NACLs are stateless subnet gatekeepers requiring return ephemeral port rules.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Security Groups Picker */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'مجموعات الأمان (SGs)' : 'Security Groups'}</span>
            <span className="text-[10px] text-emerald-400 font-mono">4 GROUPS</span>
          </div>

          <div className="flex flex-col gap-2">
            {(Object.keys(sgs) as (keyof typeof sgs)[]).map((key) => {
              const sg = sgs[key];
              const isSelected = key === selectedSgKey;
              return (
                <div
                  key={sg.id}
                  onClick={() => setSelectedSgKey(key)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sg.name}</span>
                    {key === 'vulnerableOpenSshSg' && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Vulnerable
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {isAr ? sg.descriptionAr : sg.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Subnet NACL Info Box */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-bold">{nacl.name}</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                STATELESS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              {isAr
                ? 'قوائم تحكم الشبكة تفحص كل حزمة بشكل مستقل دون تذكر حالة الجلسة.'
                : 'Evaluates each packet independently by rule number; return traffic requires open ephemeral ports.'}
            </p>
          </div>
        </div>

        {/* Center & Right: Rule Inspector & Interactive Packet Evaluator */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Active Security Group Rules */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAr ? 'قواعد مجموعة الأمان:' : 'Active Rules in SG:'} {currentSg.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                STATEFUL (Auto Return Egress)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-2">DIRECTION</th>
                    <th className="pb-2">PROTOCOL</th>
                    <th className="pb-2">PORT RANGE</th>
                    <th className="pb-2">SOURCE / DEST</th>
                    <th className="pb-2">DESCRIPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentSg.ingressRules.concat(currentSg.egressRules).map((r) => (
                    <tr key={r.id} className="text-slate-300">
                      <td className="py-2 font-bold text-white">{r.direction}</td>
                      <td className="py-2 text-cyan-400">{r.protocol}</td>
                      <td className="py-2 text-amber-300">
                        {r.portRange === 'ALL' ? 'ALL' : `${r.portRange[0]}-${r.portRange[1]}`}
                      </td>
                      <td className="py-2 text-emerald-400 font-bold">{r.sourceOrDestination}</td>
                      <td className="py-2 text-slate-400 text-[10px] truncate max-w-[150px]">
                        {isAr ? r.descriptionAr : r.descriptionEn}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Packet Tester */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  <span>{isAr ? 'اختبار حركة الحزم المباشر' : 'Live Packet Filter Simulator'}</span>
                </span>

                {/* Stateful Toggle */}
                <button
                  onClick={() => setIsExistingConnection(!isExistingConnection)}
                  className={`text-[10px] font-mono px-3 py-1 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                    isExistingConnection
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isExistingConnection ? 'Simulating Established Return Flow' : 'Simulating New Connection'}</span>
                </button>
              </div>

              {/* Packet Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">DIRECTION</span>
                  <select
                    value={packetDirection}
                    onChange={(e) => setPacketDirection(e.target.value as TrafficDirection)}
                    className="w-full bg-transparent text-white font-bold focus:outline-none"
                  >
                    <option value="INGRESS" className="bg-slate-900">INGRESS (Inbound)</option>
                    <option value="EGRESS" className="bg-slate-900">EGRESS (Outbound)</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">PROTOCOL</span>
                  <select
                    value={packetProtocol}
                    onChange={(e) => setPacketProtocol(e.target.value as ProtocolType)}
                    className="w-full bg-transparent text-white font-bold focus:outline-none"
                  >
                    <option value="TCP" className="bg-slate-900">TCP</option>
                    <option value="UDP" className="bg-slate-900">UDP</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">DESTINATION PORT</span>
                  <input
                    type="number"
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(parseInt(e.target.value, 10) || 80)}
                    className="w-full bg-transparent text-white font-bold focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block mb-1">REMOTE SOURCE IP</span>
                  <input
                    type="text"
                    value={sourceIp}
                    onChange={(e) => setSourceIp(e.target.value)}
                    className="w-full bg-transparent text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Side-by-side Decision Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SG Decision */}
                <div
                  className={`p-4 rounded-xl border ${
                    sgResult.isAllowed
                      ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    {sgResult.isAllowed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>Security Group: {sgResult.isAllowed ? 'ALLOWED' : 'DENIED'}</span>
                  </div>
                  <div className="text-[11px] opacity-90 leading-relaxed">
                    {isAr ? sgResult.explanationAr : sgResult.explanationEn}
                  </div>
                </div>

                {/* NACL Decision */}
                <div
                  className={`p-4 rounded-xl border ${
                    naclResult.isAllowed
                      ? 'bg-teal-950/30 border-teal-800/80 text-teal-200'
                      : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    {naclResult.isAllowed ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    <span>Subnet NACL: {naclResult.isAllowed ? 'ALLOWED' : 'DENIED'}</span>
                  </div>
                  <div className="text-[11px] opacity-90 leading-relaxed">
                    {isAr ? naclResult.explanationAr : naclResult.explanationEn}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                {isAr
                  ? 'يجب أن تسمح كلتا الطبقتين (SG و NACL) لكي تمر حزمة الاتصال بنجاح.'
                  : 'Traffic is only admitted if BOTH the Subnet NACL and the ENI Security Group permit it.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
