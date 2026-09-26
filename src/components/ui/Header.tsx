import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Compass,
  Globe,
  BookOpen,
  Workflow,
  Search,
  Languages,
  Shield,
  Layers,
  ChevronDown,
  Terminal,
  Activity,
  Cpu,
  Key,
  Network,
  Cloud,
  FileCode,
  Laptop,
  ArrowLeft,
  Sliders,
  Menu,
  X,
  Play,
  Pause,
} from 'lucide-react';

export const Header: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setLanguage = useSimulationStore((s) => s.setLanguage);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const mode = useSimulationStore((s) => s.mode);
  const setMode = useSimulationStore((s) => s.setMode);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);
  
  // Real-time runtime subscription from store
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const [labsOpen, setLabsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLabsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const labsList: { id: SimulationId; nameAr: string; nameEn: string; icon: any; category: string }[] = [
    { id: 'cia_triad', nameAr: 'ثالوث CIA وحساب المخاطر', nameEn: 'CIA Triad & Risk Model', icon: Shield, category: 'A. Foundations' },
    { id: 'system_internals', nameAr: 'عمارة الحاسوب وحماية الذاكرة', nameEn: 'System Internals & Memory', icon: Cpu, category: 'A. Foundations' },
    { id: 'subnet_routing', nameAr: 'تقسيم الشبكات والتوجيه وNAT', nameEn: 'Subnetting & Routing Table', icon: Network, category: 'B. Networking' },
    { id: 'tcp', nameAr: 'المصافحة الثلاثية TCP Handshake', nameEn: 'TCP 3-Way Handshake', icon: Network, category: 'B. Networking' },
    { id: 'dns', nameAr: 'خوادم وحل أسماء النطاقات DNS', nameEn: 'DNS Recursive Resolution', icon: Globe, category: 'B. Networking' },
    { id: 'firewall', nameAr: 'جدار الحماية وقواعد ACL وDMZ', nameEn: 'Firewall ACL & DMZ Ingress', icon: Shield, category: 'B. Networking' },
    { id: 'linux', nameAr: 'صلاحيات لينكس الثمانية وDAC', nameEn: 'Linux OS DAC Permissions', icon: Terminal, category: 'B. OS Systems' },
    { id: 'windows', nameAr: 'أمن أنظمة ويندوز وهيكل الصلاحيات', nameEn: 'Windows Security & Tokens', icon: Laptop, category: 'B. OS Systems' },
    { id: 'active_directory', nameAr: 'Active Directory ومصادقة Kerberos', nameEn: 'Active Directory & Kerberos', icon: Key, category: 'B. OS Systems' },
    { id: 'http', nameAr: 'دورة طلب واستجابة HTTP', nameEn: 'HTTP Full Request Lifecycle', icon: Globe, category: 'C. Applications' },
    { id: 'appsec_api', nameAr: 'أمن الويب وتحديد معدل API', nameEn: 'Web AppSec & API Rate Limiting', icon: FileCode, category: 'C. Applications' },
    { id: 'crypto', nameAr: 'دوال التجزئة والانهيار الجليدي', nameEn: 'SHA-256 Hashing & Avalanche', icon: Key, category: 'D. Cryptography' },
    { id: 'tls', nameAr: 'تأسيس قناة TLS 1.3 وسلسلة الثقة', nameEn: 'TLS 1.3 Handshake & PKI', icon: Key, category: 'D. Cryptography' },
    { id: 'cloud_containers', nameAr: 'أمن الحاويات وسحابة AWS/K8s', nameEn: 'Container & Cloud Security', icon: Cloud, category: 'E. Cloud Systems' },
    { id: 'siem', nameAr: 'مركز العمليات SOC وربط SIEM', nameEn: 'SOC Operations & SIEM Rules', icon: Activity, category: 'F. Observability' },
    { id: 'threat_hunting', nameAr: 'شجرة EDR والتحقيق الجنائي', nameEn: 'EDR Telemetry & Forensics', icon: Laptop, category: 'G. Investigation' },
    { id: 'zero_trust', nameAr: 'محرك قرارات انعدام الثقة ZTA', nameEn: 'Zero Trust Decision Engine', icon: Shield, category: 'H. Architecture' },
  ];

  const universeNav = [
    { id: 'range' as SimulationId, labelAr: 'الميدان الشامل', labelEn: 'Cyber Range', icon: Compass },
    { id: 'explorer' as SimulationId, labelAr: 'العوالم الـ 60', labelEn: '60 Worlds', icon: Globe },
    { id: 'knowledge' as SimulationId, labelAr: 'خارطة المعرفة', labelEn: 'Knowledge Graph', icon: Compass },
    { id: 'paths' as SimulationId, labelAr: 'المسارات المهنية', labelEn: 'Learning Paths', icon: Workflow },
    { id: 'glossary' as SimulationId, labelAr: 'المعجم التقني', labelEn: 'Glossary', icon: BookOpen },
  ];

  const isLabActive = labsList.some((l) => l.id === activeSimulationId) || activeSimulationId === 'devsecops';
  const activeLab = labsList.find((l) => l.id === activeSimulationId) || 
    (activeSimulationId === 'devsecops' ? { nameAr: 'أمن سلاسل التوريد والـ DevSecOps', nameEn: 'Software Supply Chain & DevSecOps', icon: Workflow, category: 'E. Cloud Systems' } : null);

  // Compact Contextual Header inside simulation / labs
  if (isLabActive && activeLab) {
    const IconComponent = activeLab.icon;
    return (
      <header className="h-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none">
        {/* Zone 1: Contextual Lab Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setActiveSimulation('explorer')}
            className="group flex items-center gap-1.5 transition-all"
            title={language === 'ar' ? 'العودة للكون' : 'Back to Universe'}
          >
            <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 text-cyan-400" />
            </div>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex flex-col">
              <h1 className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-tight">
                {language === 'ar' ? activeLab.nameAr : activeLab.nameEn}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-cyan-500/70 uppercase tracking-widest leading-none">
                  {activeLab.category}
                </span>
                <span className="text-[9px] text-slate-600 font-mono">/</span>
                <span className="text-[9px] text-slate-500 font-mono truncate max-w-[100px]">
                  ID: {activeSimulationId.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zone 2: Runtime Telemetry (Only Visible when relevant) */}
        <div className="hidden md:flex items-center gap-4 px-3 py-1 rounded-full bg-slate-900/40 border border-slate-800/60 mx-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              clockStatus === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-amber-500'
            }`} />
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {clockStatus === 'running' ? 'LIVE' : 'HALTED'}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-slate-500">T+</span>
            <span className="text-cyan-400 font-bold">{virtualTime}ms</span>
          </div>
          <div className="w-px h-3 bg-slate-800" />
          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="text-slate-500">SPD</span>
            <span className="text-purple-400 font-bold">{clockSpeed}x</span>
          </div>
        </div>

        {/* Zone 3: Actions & Quick Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 transition-all hover:text-white"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-[10px] font-mono opacity-50 uppercase tracking-tighter">Command</span>
            <kbd className="hidden lg:flex h-4 px-1 items-center rounded bg-slate-800 border border-slate-700 text-[9px] font-mono">⌘K</kbd>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLabsOpen((prev) => !prev)}
              className={`h-7 px-2.5 rounded-lg border transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide ${
                labsOpen ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'ar' ? 'التحويل' : 'Switch'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${labsOpen ? 'rotate-180' : ''}`} />
            </button>

            {labsOpen && (
              <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-72 max-h-[70vh] overflow-hidden cyber-panel rounded-xl flex flex-col z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-900 bg-slate-900/30">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    {language === 'ar' ? 'مركز محاكاة المختبرات' : 'Lab Control Center'}
                  </span>
                </div>
                <div className="overflow-y-auto p-1 space-y-0.5">
                  {labsList.map((lab) => {
                    const isSelected = activeSimulationId === lab.id;
                    const LabIcon = lab.icon;
                    return (
                      <button
                        key={lab.id}
                        onClick={() => {
                          setActiveSimulation(lab.id);
                          setLabsOpen(false);
                        }}
                        className={`w-full p-2 rounded-lg flex items-center gap-3 text-left rtl:text-right transition-all group ${
                          isSelected ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                          <LabIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] truncate uppercase tracking-tight">
                            {language === 'ar' ? lab.nameAr : lab.nameEn}
                          </div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">{lab.category}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="h-7 w-7 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition-all text-[10px] font-bold flex items-center justify-center uppercase"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </header>
    );
  }

  // Standard Universal Header (Landing / Map Explorer views)
  return (
    <header className="h-14 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveSimulation('landing')}
          className="group flex items-center gap-2 transition-all"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-900/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tighter text-white leading-none">OMEGA</span>
            <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-[0.3em] leading-none mt-1">Cyber Range</span>
          </div>
        </button>

        <div className="hidden lg:flex items-center h-8 px-3 rounded-full bg-slate-900/50 border border-slate-800/80">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium tracking-tight">
              {language === 'ar' ? 'البحث الذكي والأوامر...' : 'Search intelligence...'}
            </span>
            <kbd className="flex h-4 px-1.5 items-center rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-slate-400">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-900/40 rounded-xl border border-slate-900/60">
        {universeNav.map((item) => {
          const isActive = activeSimulationId === item.id;
          const NavIcon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSimulation(item.id)}
              className={`px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-inner'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
              }`}
            >
              <NavIcon className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Global Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
          <button
            onClick={() => setMode('guided')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'guided'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.modes.guided}
          </button>
          <button
            onClick={() => setMode('sandbox')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
              mode === 'sandbox'
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.modes.sandbox}
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1" />

        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 h-9 px-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white transition-all text-xs font-bold"
        >
          <Languages className="w-4 h-4 text-cyan-400" />
          <span className="uppercase tracking-widest">{language === 'ar' ? 'EN' : 'عربي'}</span>
        </button>
      </div>
    </header>
  );
};
