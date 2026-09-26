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
      <header className="h-12 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans">
        {/* Compact Navigation Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSimulation('explorer')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180 text-cyan-400" />
            <span className="hidden sm:inline">{language === 'ar' ? 'الكون السيبراني' : 'Universe'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Active Lab Badge & Icon */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center shrink-0">
              <IconComponent className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">
                {language === 'ar' ? activeLab.nameAr : activeLab.nameEn}
              </span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block leading-none">
                {activeLab.category}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Runtime Clock / Simulation Status Deck */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              clockStatus === 'running' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
              {clockStatus === 'running' 
                ? (language === 'ar' ? 'قيد التشغيل' : 'RUNNING') 
                : (language === 'ar' ? 'موقوف مؤقتاً' : 'PAUSED')}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="text-[10px] font-mono text-slate-400">
            {language === 'ar' ? 'الوقت الافتراضي:' : 'Virtual Time:'}{' '}
            <span className="text-cyan-400 font-bold">T+{virtualTime}ms</span>
          </div>
          <div className="h-3 w-px bg-slate-800" />
          <div className="text-[10px] font-mono text-slate-400">
            {language === 'ar' ? 'السرعة:' : 'Speed:'}{' '}
            <span className="text-purple-400 font-bold">{clockSpeed}x</span>
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2">
          {/* Quick Search palette trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
            title="Search Palette (Cmd+K)"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline text-[11px] font-mono">⌘K</span>
          </button>

          {/* Quick Labs Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLabsOpen((prev) => !prev)}
              className="p-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'المختبرات' : 'Labs'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {labsOpen && (
              <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-72 max-h-[60vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 border-b border-slate-900 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    {language === 'ar' ? 'انتقال سريع لمختبر آخر' : 'Quick Lab Switcher'}
                  </span>
                </div>
                <div className="space-y-0.5">
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
                        className={`w-full p-2 rounded-lg flex items-center gap-2 text-left rtl:text-right transition-colors ${
                          isSelected ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <LabIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="text-xs truncate">{language === 'ar' ? lab.nameAr : lab.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Bilingual Language Selector */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-1.5 px-2.5 rounded-lg border border-slate-800 bg-slate-900 text-cyan-300 hover:text-white transition-colors text-xs font-bold"
          >
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>
      </header>
    );
  }

  // Standard Universal Header (Landing / Map Explorer views)
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveSimulation('landing')}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-500/10" />
          <span className="font-mono">OMEGA</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-850">
            RANGE
          </span>
        </button>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'البحث الذكي والأوامر...' : 'Search & trigger commands...'}</span>
          <kbd className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
        {universeNav.map((item) => {
          const isActive = activeSimulationId === item.id;
          const NavIcon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSimulation(item.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <NavIcon className="w-3.5 h-3.5 text-cyan-400/80" />
              <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-cyan-300 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode('guided')}
            className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors ${
              mode === 'guided'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.modes.guided}
          </button>
          <button
            onClick={() => setMode('sandbox')}
            className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors ${
              mode === 'sandbox'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.modes.sandbox}
          </button>
        </div>
      </div>
    </header>
  );
};
