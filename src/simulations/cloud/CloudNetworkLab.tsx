/**
 * OMEGA V13 — Cloud Security World
 * CloudNetworkLab.tsx
 *
 * Interactive Cloud Virtual Network (VPC) Architecture Lab.
 * Demonstrates Public DMZ, Private Workload, and Isolated Database Subnets,
 * Route Tables, Internet Gateways (IGW), NAT Gateways, and VPC Endpoints.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { createDefaultProductionVpc, evaluateSubnetEgressRoute, NexoraSubnet } from './logic/network';
import { Network, Globe, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Lock } from 'lucide-react';

export const CloudNetworkLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [networkData] = useState(createDefaultProductionVpc());
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>(networkData.vpc.subnets[0].id);
  const [testDestinationIp, setTestDestinationIp] = useState<string>('93.184.216.34'); // example.com

  const selectedSubnet = networkData.vpc.subnets.find((s) => s.id === selectedSubnetId) || networkData.vpc.subnets[0];
  const associatedRouteTable = networkData.vpc.routeTables.find((r) => r.id === selectedSubnet.routeTableId);

  const routeEvaluation = evaluateSubnetEgressRoute(selectedSubnet, testDestinationIp, networkData.vpc.routeTables);

  return (
    <div className="flex-1 flex flex-col p-6 bg-slate-950 text-slate-100 overflow-y-auto select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-mono mb-1">
            <Network className="w-4 h-4" />
            <span>NEXORA PRODUCTION VPC (10.100.0.0/16)</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'مختبر الشبكات السحابية وتقسيم الطبقات (VPC & Subnets)' : 'VPC Architecture & Multi-Tier Subnetting Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {isAr
              ? 'بناء عزل شبكي متعدد الطبقات: شبكة فرعية عامة (DMZ)، وشبكة خاصة للتطبيقات، وشبكة معزولة تمامًا لقواعد البيانات.'
              : 'Architect a 3-tier defense-in-depth network: Public DMZ with Internet Gateway, Private App tier with NAT, and Isolated Database tier.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left: Subnets Directory */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{isAr ? 'الشبكات الفرعية في VPC' : 'VPC Subnets'}</span>
            <span className="text-[10px] text-teal-400 font-mono">{networkData.vpc.subnets.length} SUBNETS</span>
          </div>

          <div className="flex flex-col gap-2">
            {networkData.vpc.subnets.map((sub) => {
              const isSelected = sub.id === selectedSubnetId;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubnetId(sub.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-950/40 border-teal-500 shadow-md shadow-teal-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{sub.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        sub.type === 'PUBLIC'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800'
                          : sub.type === 'PRIVATE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {sub.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>CIDR: {sub.cidrBlock}</span>
                    <span>Zone: {sub.availabilityZone}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* VPC Endpoints Badge */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 block text-[10px] mb-1 font-bold">VPC ENDPOINTS (PRIVATELINK)</span>
            <div className="flex flex-col gap-1 text-[11px] text-teal-300">
              {networkData.endpoints.map((ep) => (
                <div key={ep.id} className="flex items-center justify-between">
                  <span className="truncate">{ep.serviceName}</span>
                  <span className="text-slate-500">[{ep.endpointType}]</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right: Route Table & Egress Simulator */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Route Table Inspector */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>
                  {isAr ? 'جدول التوجيه المرتبط:' : 'Associated Route Table:'} {associatedRouteTable?.name}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-2">DESTINATION CIDR</th>
                    <th className="pb-2">TARGET TYPE</th>
                    <th className="pb-2">TARGET ID</th>
                    <th className="pb-2">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {associatedRouteTable?.routes.map((r, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="py-2 text-white font-bold">{r.destinationCidr}</td>
                      <td className="py-2 text-teal-400">{r.targetType}</td>
                      <td className="py-2 text-slate-400">{r.targetId}</td>
                      <td className="py-2 text-emerald-400">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Routing Evaluation Test */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-sky-400">
                <Globe className="w-4 h-4" />
                <span>{isAr ? 'محاكاة اختبار توجيه الحزم (Packet Egress Evaluation)' : 'Test Packet Egress Route'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    {isAr ? 'الشبكة الفرعية المصدر:' : 'Source Subnet:'}
                  </span>
                  <span className="text-xs font-bold text-white">{selectedSubnet.name}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    {isAr ? 'عنوان IP الوجهة:' : 'Destination IP:'}
                  </span>
                  <input
                    type="text"
                    value={testDestinationIp}
                    onChange={(e) => setTestDestinationIp(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-teal-400 focus:outline-none"
                    placeholder="e.g. 8.8.8.8 or 10.100.10.45"
                  />
                </div>
              </div>

              {/* Evaluation Output */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  routeEvaluation.canRoute
                    ? 'bg-teal-950/30 border-teal-800/80 text-teal-200'
                    : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
                }`}
              >
                {routeEvaluation.canRoute ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold mb-1">
                    {routeEvaluation.canRoute
                      ? isAr
                        ? `مسار الخروج متاح عبر (${routeEvaluation.routeTarget})`
                        : `Egress Routed Successfully via (${routeEvaluation.routeTarget})`
                      : isAr
                      ? 'الحركة محظورة: عزل تام!'
                      : 'Egress Blocked: Isolated Subnet!'}
                  </div>
                  <div className="text-[11px] leading-relaxed opacity-90">
                    {isAr ? routeEvaluation.explanationAr : routeEvaluation.explanationEn}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              {isAr
                ? 'قاعدة أمنية: قواعد البيانات الحساسة يجب أن توضع دائمًا في شبكات معزولة (Isolated) دون أي مسار افتراضي 0.0.0.0/0.'
                : 'Security Rule: Critical databases must always be hosted in Isolated subnets with zero default 0.0.0.0/0 internet routes.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
