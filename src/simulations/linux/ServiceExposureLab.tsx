import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Globe,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Power,
  Layers,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import {
  LinuxService,
  initLinuxServices,
  startService,
  stopService,
  restartService,
  evaluateServiceExposure,
  NetworkExposureResult,
} from './logic/services';

interface FirewallRule {
  port: number;
  protocol: 'TCP' | 'UDP';
  action: 'ALLOW' | 'DROP' | 'REJECT';
  descriptionEn: string;
  descriptionAr: string;
}

interface ServiceExposureLabProps {
  onBackToMap?: () => void;
}

export const ServiceExposureLab: React.FC<ServiceExposureLabProps> = ({ onBackToMap }) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);

  const [services, setServices] = useState<LinuxService[]>(initLinuxServices());

  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([
    { port: 22, protocol: 'TCP', action: 'ALLOW', descriptionEn: 'Allow Remote SSH Management', descriptionAr: 'السماح بالإدارة عن بعد عبر SSH' },
    { port: 443, protocol: 'TCP', action: 'ALLOW', descriptionEn: 'Allow Encrypted HTTPS Web', descriptionAr: 'السماح بحركة مرور الويب المشفرة HTTPS' },
    { port: 5432, protocol: 'TCP', action: 'DROP', descriptionEn: 'Drop External DB Ingress', descriptionAr: 'حظر الاتصالات الخارجية بقاعدة البيانات' },
    { port: 23, protocol: 'TCP', action: 'DROP', descriptionEn: 'Drop Insecure Telnet', descriptionAr: 'حظر بروتوكول Telnet غير الآمن' },
  ]);

  const exposureResults = evaluateServiceExposure(services, firewallRules);

  const handleToggleService = (svcId: string) => {
    const target = services.find((s) => s.id === svcId);
    if (!target) return;

    const updated = target.running ? stopService(services, svcId) : startService(services, svcId);
    setServices(updated);

    addLog({
      level: target.running ? 'WARN' : 'INFO',
      source: 'SYSTEMD',
      message: `systemctl ${target.running ? 'stop' : 'start'} ${target.name}.service at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: target.running ? 'SERVICE_STOPPED' : 'SERVICE_STARTED',
      description: `Service '${target.name}' ${target.running ? 'stopped' : 'started'}`,
    });
  };

  const handleToggleFirewallRule = (port: number) => {
    setFirewallRules((prev) =>
      prev.map((r) =>
        r.port === port
          ? { ...r, action: r.action === 'ALLOW' ? 'DROP' : 'ALLOW' }
          : r
      )
    );

    const rule = firewallRules.find((r) => r.port === port);
    const nextAction = rule?.action === 'ALLOW' ? 'DROP' : 'ALLOW';

    addLog({
      level: 'WARN',
      source: 'IPTABLES',
      message: `Updated firewall rule for Port ${port}/TCP to ${nextAction} at t=${virtualTime}ms`,
      category: 'SYSTEM',
    });
    addEvent({
      type: 'SECURITY_LOG_CREATED',
      description: `Firewall policy for port ${port} set to ${nextAction}`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 font-mono uppercase">
            <Server className="w-4 h-4" />
            <span>{isAr ? 'مختبر كشف الخدمات ومحيط الشبكة (Service Exposure Lab)' : 'Service Exposure, Port Binding & Ingress Firewall Lab'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {isAr ? 'سلسلة الاتصال: الخدمة -> العملية -> المنفذ -> جدار الحماية' : 'Causal Attack Surface Chain: Service -> Process -> Port -> Firewall'}
          </h2>
        </div>

        {onBackToMap && (
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <BackArrow className="w-3.5 h-3.5" />
            <span>{isAr ? 'العودة للخارطة' : 'Back to World Map'}</span>
          </button>
        )}
      </div>

      {/* Main Exposure Pipeline Visualizer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>{isAr ? 'سلاسل الخدمات النشطة والمنافذ المقابلة' : 'Active Service Exposure Pipeline Matrix'}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {services.filter((s) => s.running).length} Running Daemons
          </span>
        </div>

        <div className="space-y-3">
          {services.map((svc) => {
            const exp = exposureResults.find((e) => e.serviceId === svc.id);
            const port = svc.port;
            const fwRule = port ? firewallRules.find((r) => r.port === port) : null;
            const isReachable = exp?.reachableExternally || false;

            return (
              <div
                key={svc.id}
                className={`p-4 rounded-xl border font-mono text-xs transition-all ${
                  isReachable && port === 23
                    ? 'bg-rose-950/40 border-rose-600/80'
                    : isReachable && port === 5432
                    ? 'bg-amber-950/40 border-amber-600/80'
                    : svc.running
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Service Node */}
                  <div className="flex items-center gap-3 w-64 shrink-0">
                    <button
                      onClick={() => handleToggleService(svc.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        svc.running
                          ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                      title={svc.running ? 'Stop Daemon' : 'Start Daemon'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <div>
                      <span className="font-bold text-slate-200 block text-sm">{svc.name}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Proc: <span className="text-cyan-400">{svc.processName}</span> ({svc.user})
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden lg:flex items-center text-slate-600">
                    <ArrowIcon className="w-4 h-4" />
                  </div>

                  {/* Socket Port Binding */}
                  <div className="flex items-center gap-2 w-40 shrink-0">
                    {port ? (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 w-full text-center">
                        <span className="text-[10px] text-slate-500 block uppercase">SOCKET BIND</span>
                        <span className="font-bold text-amber-400">
                          {svc.protocol || 'TCP'} :{port}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 w-full text-center text-slate-600 text-[10px]">
                        NO PORT (LOCAL)
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden lg:flex items-center text-slate-600">
                    <ArrowIcon className="w-4 h-4" />
                  </div>

                  {/* Firewall Filter */}
                  <div className="flex items-center gap-2 w-48 shrink-0">
                    {port && fwRule ? (
                      <button
                        onClick={() => handleToggleFirewallRule(port)}
                        className={`p-2 rounded-xl border w-full text-center transition-colors cursor-pointer ${
                          fwRule.action === 'ALLOW'
                            ? 'bg-blue-950/60 border-blue-600 text-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] opacity-75 block uppercase">FIREWALL RULE</span>
                        <span className="font-bold">
                          {fwRule.action === 'ALLOW' ? 'ALLOW INGRESS' : 'DROP INGRESS'}
                        </span>
                      </button>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 w-full text-center text-slate-600 text-[10px]">
                        NO FILTER
                      </div>
                    )}
                  </div>

                  {/* Flow Arrow */}
                  <div className="hidden lg:flex items-center text-slate-600">
                    <ArrowIcon className="w-4 h-4" />
                  </div>

                  {/* Reachability Outcome */}
                  <div className="w-48 shrink-0">
                    {isReachable ? (
                      <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-700/80 text-rose-300 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-rose-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-[11px] uppercase">{isAr ? 'مكشوف للشبكة' : 'EXPOSED WAN'}</span>
                          <span className="text-[9px] opacity-80">{isAr ? 'متاح خارجياً' : 'Reachable'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-700/80 text-emerald-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-[11px] uppercase">{isAr ? 'محمي / محجوب' : 'PROTECTED'}</span>
                          <span className="text-[9px] opacity-80">{svc.running ? (isAr ? 'محجوب بجدار الحماية' : 'Blocked by ACL') : (isAr ? 'الخدمة متوقفة' : 'Service Stopped')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Assessment Description */}
                {exp && (
                  <div className="mt-3 pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center gap-2">
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isReachable && (port === 23 || port === 5432) ? 'text-rose-400' : 'text-slate-500'}`} />
                    <span>{isAr ? exp.securityAssessmentAr : exp.securityAssessmentEn}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
