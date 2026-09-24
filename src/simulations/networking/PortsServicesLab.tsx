import React, { useState } from 'react';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { useSimulationStore } from '../../stores/simulationStore';
import { Server, ShieldCheck, ShieldAlert, Cpu, ToggleLeft, ToggleRight, Send } from 'lucide-react';
import { evaluatePortAccess, ServiceDaemon } from './logic/ports';

export const PortsServicesLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [services, setServices] = useState<ServiceDaemon[]>([
    { id: 'ssh', name: 'SSH Daemon', port: 22, protocol: 'TCP', running: true, descAr: 'إدارة السيرفر المشفرة', descEn: 'Secure Shell Remote Admin' },
    { id: 'dns', name: 'BIND DNS', port: 53, protocol: 'UDP', running: true, descAr: 'حل أسماء النطاقات', descEn: 'Domain Name Resolution' },
    { id: 'http', name: 'Nginx HTTP', port: 80, protocol: 'TCP', running: false, descAr: 'خادم الويب غير المشفر', descEn: 'Cleartext Web Server' },
    { id: 'https', name: 'Nginx HTTPS', port: 443, protocol: 'TCP', running: true, descAr: 'خادم الويب المشفر', descEn: 'Secure Encrypted Web' },
    { id: 'postgres', name: 'PostgreSQL', port: 5432, protocol: 'TCP', running: false, descAr: 'قاعدة البيانات الحساسة', descEn: 'Database Engine' },
  ]);

  const [targetPort, setTargetPort] = useState<number>(443);
  const [testResult, setTestResult] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, running: !s.running } : s))
    );
  };

  const handleTestPortConnection = () => {
    const proto = targetPort === 53 ? 'UDP' : 'TCP';
    const evalRes = evaluatePortAccess(services, targetPort, proto);

    if (evalRes.status === 'OPEN') {
      setTestResult(isAr ? evalRes.messageAr : evalRes.messageEn);
      globalSimulationRuntime.dispatch({
        type: 'CONNECTION_OPENED',
        source: 'Client_PC (10.0.0.5:49200)',
        target: `Server (10.0.0.100:${targetPort})`,
        description: evalRes.messageEn,
      });
    } else {
      setTestResult(isAr ? evalRes.messageAr : evalRes.messageEn);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_BLOCKED',
        source: `Server (10.0.0.100:${targetPort})`,
        description: evalRes.messageEn,
      });
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen rounded-xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-1">
          <Server className="w-4 h-4" />
          <span>{isAr ? 'المنافذ والخدمات والسيبلات (Ports & Sockets)' : 'Network Ports, Sockets & Daemon Services'}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAr ? 'مختبر المنافذ المفتوحة والخدمات (Ports & Services Binding Lab)' : 'Interactive Server Port Binding & Socket Explorer'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAr
            ? 'شغل وأوقف خدمات الخادم (Daemons) واختبر سلوك الاتصال بالمنافذ المفتوحة مقابل المغلقة والترابط عبر Sockets.'
            : 'Bind daemon services to IP sockets. Test open vs closed port connection behavior (SYN-ACK vs TCP RST refusal).'}
        </p>
      </div>

      {/* Services List & Binding Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm text-slate-100">{s.name}</div>
                <div className="text-xs font-mono text-cyan-300">
                  Port {s.port} / {s.protocol}
                </div>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  s.running
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {s.running ? (isAr ? 'يعمل RUNNING' : 'RUNNING') : (isAr ? 'متوقف STOPPED' : 'STOPPED')}
              </span>
            </div>

            <p className="text-xs text-slate-400">{isAr ? s.descAr : s.descEn}</p>

            <button
              onClick={() => toggleService(s.id)}
              className={`w-full flex items-center justify-center gap-2 py-1.5 rounded text-xs font-bold transition border ${
                s.running
                  ? 'bg-rose-950/80 text-rose-300 border-rose-700 hover:bg-rose-900'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
              }`}
            >
              {s.running ? <ToggleRight className="w-4 h-4 text-rose-400" /> : <ToggleLeft className="w-4 h-4 text-emerald-400" />}
              <span>{s.running ? (isAr ? 'إيقاف الخدمة' : 'Stop Service') : (isAr ? 'تشغيل الخدمة' : 'Start Service')}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Port Scanner / Connection Tester */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">{isAr ? 'اختبار الاتصال بالمنافذ' : 'Socket Connection Test'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={targetPort}
            onChange={(e) => setTargetPort(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-2 text-xs text-cyan-300 font-bold"
          >
            {services.map((s) => (
              <option key={s.id} value={s.port}>
                Test Port {s.port} ({s.name})
              </option>
            ))}
            <option value={8080}>Test Port 8080 (Unbound Port)</option>
          </select>

          <button
            onClick={handleTestPortConnection}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-900/30 transition md:col-span-2"
          >
            <Send className="w-4 h-4" />
            <span>{isAr ? 'اختبار الاتصال بالمقبس (Connect Socket)' : 'Attempt Socket Connection'}</span>
          </button>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
              testResult.includes('OPEN')
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                : 'bg-rose-950/80 border-rose-700 text-rose-300'
            }`}
          >
            {testResult.includes('OPEN') ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{testResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
