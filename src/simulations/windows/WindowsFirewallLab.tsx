import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  WindowsFirewallState,
  WindowsFirewallRule,
  FirewallProfile,
  INITIAL_FIREWALL_STATE,
  evaluateFirewallPacket,
  setFirewallProfileState,
  toggleFirewallRule,
  FirewallDecision,
} from './logic/firewall';
import {
  Flame,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  Radio,
} from 'lucide-react';

interface WindowsFirewallLabProps {
  onBackToMap?: () => void;
}

export const WindowsFirewallLab: React.FC<WindowsFirewallLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [firewallState, setFirewallState] = useState<WindowsFirewallState>(INITIAL_FIREWALL_STATE);

  // Packet Simulator query state
  const [testDirection, setTestDirection] = useState<'Inbound' | 'Outbound'>('Inbound');
  const [testProtocol, setTestProtocol] = useState<'TCP' | 'UDP'>('TCP');
  const [testPort, setTestPort] = useState<number>(445);
  const [testRemoteIp, setTestRemoteIp] = useState<string>('192.168.1.100');
  const [testProfile, setTestProfile] = useState<FirewallProfile>('Public');

  // Evaluate packet with production logic
  const decision: FirewallDecision = evaluateFirewallPacket(firewallState, {
    direction: testDirection,
    protocol: testProtocol,
    port: testPort,
    remoteIp: testRemoteIp,
    profile: testProfile,
  });

  const handleToggleProfile = (profile: FirewallProfile) => {
    const nextState = !firewallState.profilesEnabled[profile];
    const updated = setFirewallProfileState(firewallState, profile, nextState);
    setFirewallState(updated);

    addLog({
      level: nextState ? 'INFO' : 'WARN',
      source: 'FIREWALL',
      category: 'FIREWALL',
      message: `Windows Firewall on ${profile} profile turned ${nextState ? 'ON' : 'OFF'}`,
      timestamp: virtualTime,
    });
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = toggleFirewallRule(firewallState, ruleId);
    setFirewallState(updated);
    const rule = firewallState.rules.find((r) => r.id === ruleId);

    addLog({
      level: 'INFO',
      source: 'FIREWALL',
      category: 'FIREWALL',
      message: `Rule "${rule?.name}" toggled to ${!rule?.enabled ? 'ENABLED' : 'DISABLED'}`,
      timestamp: virtualTime,
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 select-none space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isAr ? 'العودة للخارطة' : 'Back to Map'}
            >
              <BackArrow className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400" />
              <span>{isAr ? 'جدار حماية ويندوز المتقدم (Windows Defender Firewall)' : 'Windows Defender Firewall Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'فهم ملفات تعريف الجدار الناري (Domain, Private, Public) وتأمين منافذ SMB و Telnet من التعرض الخارجي'
                : 'Configure Domain/Private/Public profiles, rule evaluation order, and block high-risk ports.'}
            </p>
          </div>
        </div>
      </div>

      {/* Profiles Status Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(['Domain', 'Private', 'Public'] as FirewallProfile[]).map((prof) => {
          const isEnabled = firewallState.profilesEnabled[prof];
          return (
            <div
              key={prof}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isEnabled
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-rose-950/30 border-rose-800/80'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">{prof} Profile</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {isEnabled ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> {isAr ? 'نشط ومحمي' : 'Active & Protected'}
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> {isAr ? 'معطل (مكشوف)' : 'Disabled (Exposed)'}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleToggleProfile(prof)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                  isEnabled
                    ? 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                    : 'bg-emerald-600 border-emerald-500 text-white'
                }`}
              >
                {isEnabled ? (isAr ? 'تعطيل' : 'Turn Off') : (isAr ? 'تفعيل' : 'Turn On')}
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Rules Table + Packet Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'جدول قواعد جدار الحماية (Firewall Rules)' : 'Windows Firewall Rules'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                {firewallState.rules.length} rules
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {firewallState.rules.map((rule) => {
                const isBlock = rule.action === 'Block';
                return (
                  <div
                    key={rule.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      !rule.enabled
                        ? 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                        : isBlock
                        ? 'bg-rose-950/20 border-rose-900/40 text-slate-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                            isBlock ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                          }`}
                        >
                          {rule.action}
                        </span>
                        <span className="font-mono font-bold text-white text-xs truncate">{rule.name}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
                        <span>{rule.direction}</span>
                        <span>•</span>
                        <span>{rule.protocol} {rule.localPort}</span>
                        <span>•</span>
                        <span>Profiles: {rule.profiles.join(', ')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-colors ${
                        rule.enabled
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {rule.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Packet Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block">
                {isAr ? 'محاكي فحص الحزم الشبكية' : 'Firewall Packet Inspection Engine'}
              </span>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                {isAr ? 'اختبار نفاذية الحزمة عبر القواعد' : 'Test Packet Reachability'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Direction:</label>
                  <select
                    value={testDirection}
                    onChange={(e) => setTestDirection(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="Inbound">Inbound (وارد)</option>
                    <option value="Outbound">Outbound (صادر)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Active Profile:</label>
                  <select
                    value={testProfile}
                    onChange={(e) => setTestProfile(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="Public">Public Profile</option>
                    <option value="Private">Private Profile</option>
                    <option value="Domain">Domain Profile</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Port:</label>
                  <input
                    type="number"
                    value={testPort}
                    onChange={(e) => setTestPort(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Protocol:</label>
                  <select
                    value={testProtocol}
                    onChange={(e) => setTestProtocol(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                </div>
              </div>

              {/* Quick Port Presets */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">Quick Port Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'SMB (445)', port: 445 },
                    { label: 'RDP (3389)', port: 3389 },
                    { label: 'Telnet (23)', port: 23 },
                    { label: 'HTTP (80)', port: 80 },
                    { label: 'C2 (4444)', port: 4444 },
                  ].map((preset) => (
                    <button
                      key={preset.port}
                      type="button"
                      onClick={() => setTestPort(preset.port)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                        testPort === preset.port
                          ? 'bg-rose-600 border-rose-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decision Box */}
              <div
                className={`p-4 rounded-xl border space-y-1.5 ${
                  decision.allowed
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-600 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase">
                  {decision.allowed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{decision.allowed ? (isAr ? 'الحزمة مسموحة (ALLOWED)' : 'PACKET ALLOWED') : (isAr ? 'الحزمة محظورة (BLOCKED)' : 'PACKET BLOCKED')}</span>
                </div>
                <p className="text-xs leading-relaxed">
                  {isAr ? decision.reasonAr : decision.reasonEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
