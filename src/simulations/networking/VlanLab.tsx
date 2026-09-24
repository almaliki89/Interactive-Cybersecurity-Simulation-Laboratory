import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Layers, ShieldCheck, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { canCommunicateAcrossVlans, VlanDevice } from './logic/vlan';

export const VlanLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [interVlanRoutingEnabled, setInterVlanRoutingEnabled] = useState<boolean>(false);
  const [srcDeviceId, setSrcDeviceId] = useState<string>('d1');
  const [dstDeviceId, setDstDeviceId] = useState<string>('d3');
  const [testResult, setTestResult] = useState<string | null>(null);

  const [devices, setDevices] = useState<VlanDevice[]>([
    { id: 'd1', name: 'Finance PC 1', ip: '10.10.0.10', vlanId: 10 },
    { id: 'd2', name: 'Finance PC 2', ip: '10.10.0.11', vlanId: 10 },
    { id: 'd3', name: 'HR PC 1', ip: '10.20.0.10', vlanId: 20 },
    { id: 'd4', name: 'Guest Laptop', ip: '10.30.0.10', vlanId: 30, isGuest: true },
  ]);

  const handleVlanChange = (id: string, newVlan: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, vlanId: newVlan } : d))
    );
  };

  const handleTestPing = () => {
    const src = devices.find((d) => d.id === srcDeviceId)!;
    const dst = devices.find((d) => d.id === dstDeviceId)!;

    const evalRes = canCommunicateAcrossVlans(src, dst, {
      interVlanRoutingEnabled,
      guestIsolationEnabled: true,
      guestVlanId: 30,
    });

    if (evalRes.allowed) {
      setTestResult(`SUCCESS: ${isAr ? evalRes.reasonAr : evalRes.reasonEn}`);
      globalSimulationRuntime.dispatch({
        type: 'VLAN_FRAME_ALLOWED',
        source: src.name,
        target: dst.name,
        description: evalRes.reasonEn,
      });
    } else {
      setTestResult(`BLOCKED: ${isAr ? evalRes.reasonAr : evalRes.reasonEn}`);
      globalSimulationRuntime.dispatch({
        type: 'VLAN_FRAME_BLOCKED',
        source: src.name,
        target: dst.name,
        description: evalRes.reasonEn,
      });
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Layers className="w-4 h-4" />
          <span>{isAr ? 'الشبكات التخيلية (VLANs & 802.1Q)' : 'Virtual LANs (VLANs) & 802.1Q Trunk Tagging'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'مختبر عزل شبكات VLAN والتوجيه بين الشبكات (Inter-VLAN Routing)' : 'Interactive VLAN Segmentation & Inter-VLAN Routing Lab'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'فصل الأجهزة في شبكات تخيلية لمنع البث المباشر وتقليل سطح الهجوم، واختبر تفعيل التوجيه بين الشبكات.'
            : 'Isolate departments into logical broadcast domains. Observe 802.1Q VLAN tagging and Router-on-a-Stick inter-VLAN forwarding.'}
        </p>
      </div>

      {/* Inter-VLAN Routing Toggle */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-indigo-400" />
          <div>
            <span className="font-bold text-slate-200 text-sm block">
              {isAr ? 'التوجيه بين شبكات VLAN (Inter-VLAN L3 Router-on-a-Stick)' : 'Inter-VLAN L3 Router-on-a-Stick'}
            </span>
            <span className="text-xs text-slate-400">
              {interVlanRoutingEnabled
                ? (isAr ? 'مفعل: يسمح بمرور البيانات بين شبكات VLAN المختلفة عبر الموجه.' : 'ENABLED: Router forwards frames between distinct VLAN subnets')
                : (isAr ? 'معطل: حظر كامل لحركة البيانات بين شبكات VLAN المختلفة.' : 'DISABLED: Strict Layer 2 isolation between distinct VLANs')}
            </span>
          </div>
        </div>

        <button
          onClick={() => setInterVlanRoutingEnabled(!interVlanRoutingEnabled)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition border ${
            interVlanRoutingEnabled
              ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {interVlanRoutingEnabled ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
          <span>{interVlanRoutingEnabled ? (isAr ? 'التوجيه مفعل' : 'Routing ON') : (isAr ? 'التوجيه معطل' : 'Routing OFF')}</span>
        </button>
      </div>

      {/* Device VLAN Assignment Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {devices.map((d) => (
          <div key={d.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-bold text-sm text-slate-100">{d.name}</div>
                <div className="text-xs font-mono text-cyan-300">{d.ip}</div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{isAr ? 'تعيين VLAN' : 'Assigned VLAN'}</label>
              <select
                value={d.vlanId}
                onChange={(e) => handleVlanChange(d.id, Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
              >
                <option value={10}>VLAN 10 (Finance)</option>
                <option value={20}>VLAN 20 (HR)</option>
                <option value={30}>VLAN 30 (Guest)</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Traffic Test & Policy Verification */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'اختبار التواصل بين الأجهزة' : 'VLAN Isolation Traffic Verification'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={srcDeviceId}
            onChange={(e) => setSrcDeviceId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-cyan-300 font-bold"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                From: {d.name} (VLAN {d.vlanId})
              </option>
            ))}
          </select>

          <select
            value={dstDeviceId}
            onChange={(e) => setDstDeviceId(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-emerald-300 font-bold"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                To: {d.name} (VLAN {d.vlanId})
              </option>
            ))}
          </select>

          <button
            onClick={handleTestPing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-900/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'اختبار الإرسال (Ping Test)' : 'Test Connectivity'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
              testResult.includes('SUCCESS')
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/80 border-rose-700 text-rose-300'
            }`}
          >
            {testResult.includes('SUCCESS') ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
