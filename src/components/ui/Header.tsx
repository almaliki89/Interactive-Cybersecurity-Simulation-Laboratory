import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore, SimulationId } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { CURRICULUM_LESSONS } from '../../data/curriculumData';
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
  Box,
  Boxes,
  CheckCircle2,
  GitBranch,
  FileSearch,
  Lock,
  Sparkles,
  Crosshair,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';

const TelemetryDisplay: React.FC = () => {
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const clockStatus = useSimulationStore((s) => s.clockStatus);

  return (
    <div className="flex items-center gap-5 px-5 py-1 rounded-full bg-slate-900/40 border border-slate-800/60 shadow-inner">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${
          clockStatus === 'running' ? 'bg-omega-success shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-omega-warning'
        }`} />
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          {clockStatus === 'running' ? 'Active' : 'Halted'}
        </span>
      </div>
      <div className="w-px h-3 bg-slate-800" />
      <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums" dir="ltr">
        <span className="text-slate-500 font-bold tracking-tighter">TIME</span>
        <span className="text-cyan-400 font-bold" data-testid="header-virtual-time">T+{(virtualTime || 0).toFixed(0)}ms</span>
      </div>
      <div className="w-px h-3 bg-slate-800" />
      <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums" dir="ltr">
        <span className="text-slate-500 font-bold tracking-tighter">SPEED</span>
        <span className="text-purple-400 font-bold">{clockSpeed}x</span>
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setLanguage = useSimulationStore((s) => s.setLanguage);
  const theme = useSimulationStore((s) => s.theme);
  const setTheme = useSimulationStore((s) => s.setTheme);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const mode = useSimulationStore((s) => s.mode);
  const setMode = useSimulationStore((s) => s.setMode);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);
  
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const activeLessonId = useSimulationStore((s) => s.activeLessonId);
  const activeLesson = CURRICULUM_LESSONS[activeLessonId] || CURRICULUM_LESSONS['lesson-01-cia-triad'];

  // DevSecOps Sub-navigation Store
  const devSecOpsTab = useDevSecOpsStore((s) => s.activeTab);
  const setDevSecOpsTab = useDevSecOpsStore((s) => s.setActiveTab);

  const [labsOpen, setLabsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLabsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLabsOpen(false);
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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
    { id: 'soc' as SimulationId, nameAr: 'مركز العمليات SOC وهندسة الكشف', nameEn: 'SOC Operations & Detection Engineering', icon: Activity, category: 'F. Observability' },
    { id: 'cloud' as SimulationId, nameAr: 'أمن الحوسبة السحابية (Nexora Cloud)', nameEn: 'Cloud Security World', icon: Cloud, category: 'E. Cloud Systems' },
    { id: 'containers' as SimulationId, nameAr: 'أمن الحاويات وكوبرنيتيس', nameEn: 'Container & K8s Security', icon: Boxes, category: 'E. Cloud Systems' },
    { id: 'threat_hunting', nameAr: 'صيد التهديدات وهندسة الكشف والاستخبارات', nameEn: 'Threat Hunting & Detection Engineering', icon: Crosshair, category: 'G. Investigation' },
    { id: 'zero_trust', nameAr: 'محرك قرارات انعدام الثقة ZTA', nameEn: 'Zero Trust Decision Engine', icon: Shield, category: 'H. Architecture' },
  ];

  const devSecOpsSubLabs = [
    { id: 'map', nameAr: 'خريطة Hub المركزية', nameEn: 'World Map Hub', icon: Globe },
    { id: 'sast', nameAr: 'فحص الكود (SAST)', nameEn: 'SAST Scan', icon: FileCode },
    { id: 'sca', nameAr: 'فحص التبعيات (SCA)', nameEn: 'SCA Dependency', icon: Box },
    { id: 'secrets', nameAr: 'فحص الأسرار (Secrets)', nameEn: 'Git Secrets', icon: Key },
    { id: 'iac', nameAr: 'أمن البنية (IaC)', nameEn: 'IaC Terraform', icon: Workflow },
    { id: 'slsa', nameAr: 'توثيق البناء (SLSA)', nameEn: 'SLSA Provenance', icon: Shield },
    { id: 'gates', nameAr: 'بوابات الأمان', nameEn: 'Pipeline Gates', icon: CheckCircle2 },
    { id: 'drift', nameAr: 'رصد الانحراف', nameEn: 'Drift Detection', icon: GitBranch },
    { id: 'serverless', nameAr: 'أمن الدوال', nameEn: 'Serverless Security', icon: Boxes },
    { id: 'sbom', nameAr: 'جرد المكونات (SBOM)', nameEn: 'SBOM Inventory', icon: Layers },
    { id: 'containerci', nameAr: 'فحص الحاويات CI', nameEn: 'CI Container Scan', icon: Lock },
    { id: 'signing', nameAr: 'توقيع المخرجات', nameEn: 'Artifact Signing', icon: Key },
    { id: 'compliance', nameAr: 'الامتثال ككود', nameEn: 'Compliance as Code', icon: Shield },
    { id: 'incident', nameAr: 'حوادث سلاسل التوريد', nameEn: 'Supply Chain Incident', icon: Activity },
    { id: 'architecture', nameAr: 'المعمارية الآمنة', nameEn: 'Zero-Trust Architecture', icon: Workflow },
    { id: 'master', nameAr: 'التحدي الشامل الختامي', nameEn: 'Master Challenge', icon: Sparkles },
  ];

  const universeNav = [
    { id: 'lesson' as SimulationId, labelAr: 'ابدأ هنا (المبتدئون)', labelEn: 'Start Here', icon: Sparkles, isHighlight: true },
    { id: 'range' as SimulationId, labelAr: 'الميدان الشامل', labelEn: 'Cyber Range', icon: Compass, isHighlight: false },
    { id: 'explorer' as SimulationId, labelAr: 'العوالم الـ 60', labelEn: '60 Worlds', icon: Globe, isHighlight: false },
    { id: 'knowledge' as SimulationId, labelAr: 'خارطة المعرفة', labelEn: 'Knowledge Graph', icon: Compass, isHighlight: false },
    { id: 'paths' as SimulationId, labelAr: 'المسارات المهنية', labelEn: 'Learning Paths', icon: Workflow, isHighlight: false },
    { id: 'glossary' as SimulationId, labelAr: 'المعجم التقني', labelEn: 'Glossary', icon: BookOpen, isHighlight: false },
  ];

  const isLabActive = labsList.some((l) => l.id === activeSimulationId) || 
    activeSimulationId === 'devsecops' || 
    activeSimulationId === 'forensics' || 
    activeSimulationId === 'soc' || 
    activeSimulationId === 'cloud' || 
    activeSimulationId === 'containers';
  
  const activeLab = labsList.find((l) => l.id === activeSimulationId) || 
    (activeSimulationId === 'devsecops' ? { nameAr: 'أمن سلاسل التوريد والـ DevSecOps', nameEn: 'Software Supply Chain & DevSecOps', icon: Workflow, category: 'E. Cloud Systems' } : null) ||
    (activeSimulationId === 'forensics' ? { nameAr: 'التحقيق الجنائي الرقمي', nameEn: 'Digital Forensics World', icon: Shield, category: 'G. Investigation' } : null) ||
    (activeSimulationId === 'soc' ? { nameAr: 'مركز العمليات SOC وهندسة الكشف', nameEn: 'SOC Operations & Detection Engineering', icon: Activity, category: 'F. Observability' } : null) ||
    (activeSimulationId === 'cloud' ? { nameAr: 'أمن الحوسبة السحابية (Nexora Cloud)', nameEn: 'Cloud Security World', icon: Cloud, category: 'E. Cloud Systems' } : null) ||
    (activeSimulationId === 'containers' ? { nameAr: 'أمن الحاويات وكوبرنيتيس', nameEn: 'Container & K8s Security', icon: Boxes, category: 'E. Cloud Systems' } : null);

  // If in DevSecOps, override identity with sub-lab if not on map
  const displayLabName = (activeSimulationId === 'devsecops' && devSecOpsTab !== 'map')
    ? (devSecOpsSubLabs.find(l => l.id === devSecOpsTab))
    : activeLab;

  // Unified Three-Zone Header (Consolidated Phase 1D)
  return (
    <header className="h-12 border-b border-slate-900 bg-slate-950 px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 sticky top-0 font-sans select-none">
      {/* Zone 1: Identity / Context */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {isLabActive && activeLab ? (
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <button
              onClick={() => setActiveSimulation('explorer')}
              className="w-7 h-7 shrink-0 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-sm"
              title={language === 'ar' ? 'العودة للكون' : 'Back to Universe'}
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <button
              onClick={() => setActiveSimulation('lesson')}
              data-testid="return-to-lesson-btn"
              className="h-7 px-2 sm:px-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-400 text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
              title={language === 'ar' ? `العودة إلى الدرس الحالي: ${activeLesson?.titleAr || ''}` : `Return to Lesson: ${activeLesson?.titleEn || ''}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{language === 'ar' ? 'العودة للدرس' : 'Back to Lesson'}</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                {React.createElement(displayLabName?.icon || activeLab.icon, { className: 'w-4 h-4' })}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-white uppercase tracking-tight truncate max-w-[130px] sm:max-w-[220px] md:max-w-none leading-tight">
                  {language === 'ar' ? displayLabName?.nameAr || activeLab.nameAr : displayLabName?.nameEn || activeLab.nameEn}
                </span>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none truncate max-w-[120px] sm:max-w-none">
                  {activeSimulationId === 'devsecops' ? (devSecOpsTab === 'map' ? 'WORLD HUB' : 'DEVSECOPS LAB') : activeLab.category}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setActiveSimulation('landing')}
            className="flex items-center gap-3 hover:opacity-90 transition-all group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform border border-cyan-400/30">
              <Shield className="w-4 h-4 text-white drop-shadow-md" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent leading-none">ZORG</span>
              <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-[0.25em] leading-none mt-1 font-semibold">Cyber Range</span>
            </div>
          </button>
        )}
      </div>

      {/* Zone 2: Navigation / Telemetry (Center) */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        {isLabActive ? (
          <TelemetryDisplay />
        ) : (
          <nav className="flex items-center gap-1 p-0.5 bg-slate-900/30 rounded-xl border border-slate-900/50">
            {universeNav.map((item) => {
              const isActive = activeSimulationId === item.id;
              const NavIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSimulation(item.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap text-[11px] font-bold uppercase tracking-wide ${
                    isActive
                      ? item.isHighlight
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 shadow-sm'
                      : item.isHighlight
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/50 hover:text-emerald-300 animate-pulse'
                      : 'text-slate-500 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <NavIcon className={`w-3.5 h-3.5 ${item.isHighlight ? 'text-emerald-400' : ''}`} />
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Zone 3: Actions (Right) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 justify-end">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="h-8 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-2 group"
          title="Search / Commands (⌘K)"
        >
          <Search className="w-4 h-4" />
          <div className="hidden lg:flex items-center gap-1">
             <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter group-hover:text-slate-400">Command</span>
             <kbd className="h-4 px-1.5 flex items-center rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-500">⌘K</kbd>
          </div>
        </button>

        {isLabActive && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLabsOpen(!labsOpen)}
              className={`h-8 px-3 rounded-lg text-[11px] font-bold flex items-center gap-2 transition-all border ${
                labsOpen ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'المختبرات' : 'Switch Lab'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${labsOpen ? 'rotate-180' : ''}`} />
            </button>
            {labsOpen && (
              <div className="absolute top-full right-0 rtl:right-auto rtl:left-0 mt-2 w-72 max-h-[70vh] overflow-hidden bg-slate-950 border border-slate-800 rounded-xl shadow-2xl flex flex-col z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-900 bg-slate-900/20">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-[0.2em]">
                    {activeSimulationId === 'devsecops' ? (language === 'ar' ? 'أقسام عالم DevSecOps' : 'DevSecOps Workstations') : (language === 'ar' ? 'مركز التحكم بالمختبرات' : 'Lab Simulation Center')}
                  </span>
                </div>
                <div className="overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                  {activeSimulationId === 'devsecops' ? (
                    // Show DevSecOps Sub-labs in Switcher when in DevSecOps World
                    devSecOpsSubLabs.map((lab) => (
                      <button
                        key={lab.id}
                        onClick={() => { setDevSecOpsTab(lab.id); setLabsOpen(false); }}
                        className={`w-full p-2 rounded-lg flex items-center gap-3 text-left rtl:text-right transition-all group ${
                          devSecOpsTab === lab.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/10' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${devSecOpsTab === lab.id ? 'bg-cyan-500/20' : 'bg-slate-950 border border-slate-900 group-hover:border-slate-700'}`}>
                          {React.createElement(lab.icon, { className: 'w-4 h-4' })}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] truncate uppercase tracking-tight">{language === 'ar' ? lab.nameAr : lab.nameEn}</div>
                          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">SUB-LAB</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    // Standard Lab Switcher
                    labsList.map((lab) => (
                      <button
                        key={lab.id}
                        onClick={() => { setActiveSimulation(lab.id); setLabsOpen(false); }}
                        className={`w-full p-2 rounded-lg flex items-center gap-3 text-left rtl:text-right transition-all group ${
                          activeSimulationId === lab.id ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/10' : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${activeSimulationId === lab.id ? 'bg-cyan-500/20' : 'bg-slate-950 border border-slate-900 group-hover:border-slate-700'}`}>
                          {React.createElement(lab.icon, { className: 'w-4 h-4' })}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] truncate uppercase tracking-tight">{language === 'ar' ? lab.nameAr : lab.nameEn}</div>
                          <div className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">{lab.category}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="h-5 w-px bg-slate-800 hidden sm:block mx-1" />

        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          data-testid="lang-toggle-btn"
          aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          className="h-8 px-3 rounded-lg border border-slate-800 bg-slate-900 text-[10px] font-bold text-cyan-500 hover:text-white transition-all shadow-sm flex items-center justify-center min-w-[36px]"
        >
          {language === 'ar' ? 'EN' : 'ع'}
        </button>

        <button
          onClick={() => {
            const nextTheme = theme === 'modern' ? 'dark' : theme === 'dark' ? 'light' : 'modern';
            setTheme(nextTheme);
          }}
          title={
            language === 'ar'
              ? `تبديل المظهر (الحالي: ${theme === 'modern' ? 'عصري كحلي' : theme === 'dark' ? 'داكن عسكري' : 'فاتح نقي'})`
              : `Switch Theme (Current: ${theme.toUpperCase()})`
          }
          data-testid="theme-toggle-btn"
          className="h-8 px-2.5 rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-semibold text-slate-200 hover:text-cyan-400 hover:border-cyan-500/40 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
        >
          {theme === 'light' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : theme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="hidden sm:inline text-[10px]">
            {language === 'ar'
              ? theme === 'modern'
                ? 'عصري'
                : theme === 'dark'
                ? 'داكن'
                : 'فاتح'
              : theme.toUpperCase()}
          </span>
        </button>

        {!isLabActive && (
          <>
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
              <button
                onClick={() => setMode('guided')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${mode === 'guided' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {language === 'ar' ? 'موجه' : 'Guided'}
              </button>
              <button
                onClick={() => setMode('sandbox')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${mode === 'sandbox' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {language === 'ar' ? 'حر' : 'Sandbox'}
              </button>
            </div>

            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-cyan-400"
              aria-label={mobileNavOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {!isLabActive && mobileNavOpen && (
        <div className="md:hidden fixed inset-x-0 top-12 bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl p-3 shadow-2xl z-50 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {universeNav.map((item) => {
            const isActive = activeSimulationId === item.id;
            const NavIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSimulation(item.id);
                  setMobileNavOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                  isActive
                    ? item.isHighlight
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <NavIcon className={`w-4 h-4 ${item.isHighlight ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                </div>
                {item.isHighlight && (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                    Start
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
