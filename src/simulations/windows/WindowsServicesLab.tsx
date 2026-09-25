import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  WindowsService,
  INITIAL_WINDOWS_SERVICES,
  startWindowsService,
  stopWindowsService,
  changeStartupType,
  fixUnquotedServicePath,
} from './logic/services';
import { INITIAL_WINDOWS_PROCESSES } from './logic/processes';
import {
  Server,
  Play,
  Square,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Radio,
  Sparkles,
} from 'lucide-react';

interface WindowsServicesLabProps {
  onBackToMap?: () => void;
  onNavigateToFirewall?: () => void;
}

export const WindowsServicesLab: React.FC<WindowsServicesLabProps> = ({
  onBackToMap,
  onNavigateToFirewall,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const addLog = useSimulationStore((s) => s.addLog);

  const [services, setServices] = useState<WindowsService[]>(INITIAL_WINDOWS_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('svc-custom-backup');

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleStart = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    if (svc.startupType === 'Disabled') {
      addLog({
        level: 'WARN',
        source: 'SCM',
        category: 'SYSTEM',
        message: `Cannot start service "${svc.displayName}": Service is marked as DISABLED`,
        timestamp: virtualTime,
      });
      return;
    }

    const res = startWindowsService(svc, INITIAL_WINDOWS_PROCESSES);
    setServices((prev) => prev.map((s) => (s.id === serviceId ? res.service : s)));
    addLog({
      level: 'INFO',
      source: 'SCM',
      category: 'SYSTEM',
      message: `Event 7036: The ${svc.displayName} service entered the RUNNING state.`,
      timestamp: virtualTime,
    });
  };

  const handleStop = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    const res = stopWindowsService(svc);
    setServices((prev) => prev.map((s) => (s.id === serviceId ? res : s)));
    addLog({
      level: 'INFO',
      source: 'SCM',
      category: 'SYSTEM',
      message: `Event 7036: The ${svc.displayName} service entered the STOPPED state.`,
      timestamp: virtualTime,
    });
  };

  const handleChangeStartup = (serviceId: string, type: 'Automatic' | 'Manual' | 'Disabled') => {
    const updated = changeStartupType(selectedService, type);
    setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
    addLog({
      level: 'INFO',
      source: 'SCM',
      category: 'SYSTEM',
      message: `Startup type for service "${selectedService.serviceName}" changed to ${type}`,
      timestamp: virtualTime,
    });
  };

  const handleFixUnquotedPath = (serviceId: string) => {
    const svc = services.find((s) => s.id === serviceId);
    if (!svc) return;

    const fixed = fixUnquotedServicePath(svc);
    setServices((prev) => prev.map((s) => (s.id === serviceId ? fixed : s)));
    addLog({
      level: 'INFO',
      source: 'HARDENING',
      category: 'SECURITY',
      message: `Remediated Unquoted Service Path: Binary path for "${svc.serviceName}" quoted securely`,
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
              <Server className="w-5 h-5 text-cyan-400" />
              <span>{isAr ? 'مختبر إدارة خدمات ويندوز (Windows Services & SCM)' : 'Windows Services Manager Lab'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'إدارة حسابات الخدمات، اكتشاف ثغرات المسارات غير المقتبسة (Unquoted Paths)، والمنافذ الشبكية'
                : 'Service accounts, startup types, listening ports, and Unquoted Service Path vulnerabilities.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Services List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                {isAr ? 'الخدمات المثبتة (Installed Services)' : 'Installed Windows Services'}
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
                {services.length} services
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {services.map((svc) => {
                const isSelected = selectedService && selectedService.id === svc.id;
                const isRunning = svc.status === 'Running';

                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{svc.displayName}</span>
                        {svc.isVulnerableUnquotedPath && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 animate-pulse">
                            VULNERABLE
                          </span>
                        )}
                        {svc.serviceName === 'TlntSvr' && isRunning && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                            TELNET (23)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">Account: {svc.serviceAccount}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{svc.serviceName}</div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isRunning ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-500'
                        }`}
                      >
                        {svc.status}
                      </span>
                      <div className="text-[9px] font-mono text-slate-400 mt-1">{svc.startupType}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Service Inspector & Vulnerability Fixer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedService ? (
            <>
              {/* Service Details Card */}
              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                      {isAr ? 'خصائص الخدمة (Service Properties)' : 'Service Properties & Controls'}
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono mt-0.5">{selectedService.displayName}</h3>
                    <div className="text-xs text-slate-400 font-mono">Service Name: {selectedService.serviceName}</div>
                  </div>

                  {/* Service State Controls */}
                  <div className="flex items-center gap-2">
                    {selectedService.status === 'Running' ? (
                      <button
                        onClick={() => handleStop(selectedService.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-mono font-bold transition-colors"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'إيقاف الخدمة' : 'Stop'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStart(selectedService.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? 'تشغيل الخدمة' : 'Start'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Unquoted Service Path Vulnerability Alert & 1-Click Fix */}
                {selectedService.isVulnerableUnquotedPath && (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/60 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>{isAr ? 'ثغرة أمنية: مسار الخدمة غير مقتبس (Unquoted Service Path)' : 'Privilege Escalation: Unquoted Service Path Vulnerability'}</span>
                      </div>
                      <button
                        onClick={() => handleFixUnquotedPath(selectedService.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono transition-colors shadow-sm"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إصلاح المسار فوراً' : 'Quote Path (Fix)'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr
                        ? 'المسار يحتوي على مسافات وبدون علامات اقتباس. سيبحث نظام ويندوز بالترتيب عن: C:\\Program.exe ثم C:\\Program Files\\Enterprise.exe مما يتيح للمهاجم وضع ملف خبيث لتصعيد الصلاحيات إلى SYSTEM.'
                        : 'Windows attempts to execute C:\\Program.exe before the target binary because the path is unquoted. Any user with write rights to C:\\ can escalate to SYSTEM upon service restart.'}
                    </p>
                  </div>
                )}

                {/* Service Parameters */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Binary Path (ImagePath):</span>
                    <span className="font-mono text-cyan-300 text-[11px] break-all select-all">{selectedService.binaryPath}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">Service Log On Account:</span>
                      <span className="font-mono text-slate-200 font-semibold">{selectedService.serviceAccount}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block mb-1">Startup Type:</span>
                      <div className="flex items-center gap-1.5">
                        {(['Automatic', 'Manual', 'Disabled'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => handleChangeStartup(selectedService.id, type)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                              selectedService.startupType === type
                                ? 'bg-cyan-600 border-cyan-500 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedService.port && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-rose-400" />
                        <div>
                          <span className="font-mono font-bold text-white text-xs">
                            Exposed Port: {selectedService.protocol} {selectedService.port}
                          </span>
                          <div className="text-[10px] text-slate-400">Listening network socket bound by this service</div>
                        </div>
                      </div>

                      {onNavigateToFirewall && (
                        <button
                          onClick={onNavigateToFirewall}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono"
                        >
                          {isAr ? 'فحص جدار الحماية' : 'Inspect Firewall'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
