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
  ArrowRight,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export const Header: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const setLanguage = useSimulationStore((s) => s.setLanguage);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const mode = useSimulationStore((s) => s.mode);
  const setMode = useSimulationStore((s) => s.setMode);
  const setIsSearchOpen = useSimulationStore((s) => s.setIsSearchOpen);

  const [labsOpen, setLabsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { id: 'cia_triad', nameAr: 'ثالوث CIA وحساب المخاطر', nameEn: 'CIA Triad & Risk Model', icon: Shield, category: 'A. الأسس' },
    { id: 'system_internals', nameAr: 'عمارة الحاسوب وحماية الذاكرة', nameEn: 'System Internals & Memory', icon: Cpu, category: 'A. الأسس' },
    { id: 'subnet_routing', nameAr: 'تقسيم الشبكات والتوجيه وNAT', nameEn: 'Subnetting & Routing Table', icon: Network, category: 'B. الشبكات' },
    { id: 'tcp', nameAr: 'المصافحة الثلاثية TCP Handshake', nameEn: 'TCP 3-Way Handshake', icon: Network, category: 'B. الشبكات' },
    { id: 'dns', nameAr: 'خوادم وحل أسماء النطاقات DNS', nameEn: 'DNS Recursive Resolution', icon: Globe, category: 'B. الشبكات' },
    { id: 'firewall', nameAr: 'جدار الحماية وقواعد ACL وDMZ', nameEn: 'Firewall ACL & DMZ Ingress', icon: Shield, category: 'B. الشبكات' },
    { id: 'linux', nameAr: 'صلاحيات لينكس الثمانية وDAC', nameEn: 'Linux OS DAC Permissions', icon: Terminal, category: 'B. الأنظمة' },
    { id: 'windows', nameAr: 'أمن أنظمة ويندوز وهيكل الصلاحيات', nameEn: 'Windows Security & Tokens', icon: Laptop, category: 'B. الأنظمة' },
    { id: 'active_directory', nameAr: 'Active Directory ومصادقة Kerberos', nameEn: 'Active Directory & Kerberos', icon: Key, category: 'B. الأنظمة' },
    { id: 'http', nameAr: 'دورة طلب واستجابة HTTP', nameEn: 'HTTP Full Request Lifecycle', icon: Globe, category: 'C. التطبيقات' },
    { id: 'appsec_api', nameAr: 'أمن الويب وتحديد معدل API', nameEn: 'Web AppSec & API Rate Limiting', icon: FileCode, category: 'C. التطبيقات' },
    { id: 'crypto', nameAr: 'دوال التجزئة والانهيار الجليدي', nameEn: 'SHA-256 Hashing & Avalanche', icon: Key, category: 'D. التشفير' },
    { id: 'tls', nameAr: 'تأسيس قناة TLS 1.3 وسلسلة الثقة', nameEn: 'TLS 1.3 Handshake & PKI', icon: Key, category: 'D. التشفير' },
    { id: 'cloud_containers', nameAr: 'أمن الحاويات وسحابة AWS/K8s', nameEn: 'Container & Cloud Security', icon: Cloud, category: 'E. السحابة' },
    { id: 'siem', nameAr: 'مركز العمليات SOC وربط SIEM', nameEn: 'SOC Operations & SIEM Rules', icon: Activity, category: 'F. الرصد' },
    { id: 'threat_hunting', nameAr: 'شجرة EDR والتحقيق الجنائي', nameEn: 'EDR Telemetry & Forensics', icon: Laptop, category: 'G. التحقيق' },
    { id: 'zero_trust', nameAr: 'محرك قرارات انعدام الثقة ZTA', nameEn: 'Zero Trust Decision Engine', icon: Shield, category: 'H. المعمارية' },
  ];

  const universeNav = [
    {
      id: 'range' as SimulationId,
      labelAr: 'الميدان الشامل',
      labelEn: 'Cyber Range',
      icon: Compass,
      isSpecial: true,
    },
    {
      id: 'explorer' as SimulationId,
      labelAr: 'العوالم الـ 60',
      labelEn: '60 Worlds',
      icon: Globe,
    },
    {
      id: 'knowledge' as SimulationId,
      labelAr: 'خارطة المعرفة',
      labelEn: 'Knowledge Graph',
      icon: Compass,
    },
    {
      id: 'paths' as SimulationId,
      labelAr: 'المسارات المهنية',
      labelEn: 'Learning Paths',
      icon: Workflow,
    },
    {
      id: 'glossary' as SimulationId,
      labelAr: 'المعجم التقني',
      labelEn: 'Glossary',
      icon: BookOpen,
    },
  ];

  const isLabActive = labsList.some((l) => l.id === activeSimulationId);
  const activeLab = labsList.find((l) => l.id === activeSimulationId);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 sticky top-0">
      {/* Zone 1: Wordmark & Home link */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveSimulation('landing')}
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-500/20" />
          <span className="font-mono">{t.appTitle}</span>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            UNIVERSE
          </span>
        </button>

        {/* Global Search Quick Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'بحث شامل في المفاهيم والمختبرات...' : 'Search concepts, labs, worlds...'}</span>
          <kbd className="px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Zone 2: Universe Main Navigation + Labs Dropdown */}
      <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
        {universeNav.map((item) => {
          const isActive = activeSimulationId === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSimulation(item.id)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : item.isSpecial
                  ? 'bg-slate-900 text-cyan-300 hover:text-white border border-cyan-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
            </button>
          );
        })}

        {/* Labs Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLabsOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap border ${
              isLabActive
                ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-sm'
                : 'bg-slate-900 text-cyan-400 hover:text-white border-slate-700/80 hover:border-cyan-500/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {isLabActive && activeLab
                ? language === 'ar'
                  ? `مختبر: ${activeLab.nameAr}`
                  : `Lab: ${activeLab.nameEn}`
                : language === 'ar'
                ? 'المختبرات التفاعلية (16)'
                : 'Interactive Labs (16)'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${labsOpen ? 'rotate-180' : ''}`} />
          </button>

          {labsOpen && (
            <div className="absolute top-full mt-2 w-80 max-h-[75vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                  {language === 'ar' ? 'اختر مختبر محاكاة تفاعلي' : 'Select Interactive Lab'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">16 Labs</span>
              </div>
              <div className="space-y-1">
                {labsList.map((lab) => {
                  const Icon = lab.icon;
                  const isSelected = activeSimulationId === lab.id;
                  return (
                    <button
                      key={lab.id}
                      onClick={() => {
                        setActiveSimulation(lab.id);
                        setLabsOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left rtl:text-right transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-950 text-cyan-400 border border-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs truncate block font-medium">
                          {language === 'ar' ? lab.nameAr : lab.nameEn}
                        </span>
                        <span
                          className={`text-[9px] font-mono block ${
                            isSelected ? 'text-slate-900 opacity-80' : 'text-slate-500'
                          }`}
                        >
                          {lab.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Zone 3: Actions & Language / Search Trigger */}
      <div className="flex items-center gap-2">
        {/* Search Mobile Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <Search className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-800 bg-slate-900 text-cyan-300 hover:text-white hover:border-cyan-500/60 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Guided vs Sandbox Mode Toggle */}
        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setMode('guided')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              mode === 'guided'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.modes.guided}
          </button>
          <button
            onClick={() => setMode('sandbox')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              mode === 'sandbox'
                ? 'bg-slate-700 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.modes.sandbox}
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-slate-950/98 border-b border-slate-800 shadow-2xl p-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto z-50 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-4">
            {/* Main Universe Navigation */}
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-2 px-1">
                {language === 'ar' ? 'الكون السيبراني والأقسام الرئيسية' : 'Cyber Universe Navigation'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {universeNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSimulationId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSimulation(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 16 Interactive Labs List */}
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase block mb-2 px-1">
                {language === 'ar' ? 'المختبرات التفاعلية الـ 16' : '16 Interactive Labs'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-60 overflow-y-auto p-1 bg-slate-900/50 rounded-xl border border-slate-800/80">
                {labsList.map((lab) => {
                  const Icon = lab.icon;
                  const isSelected = activeSimulationId === lab.id;
                  return (
                    <button
                      key={lab.id}
                      onClick={() => {
                        setActiveSimulation(lab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-lg flex items-center gap-2 text-xs text-left rtl:text-right transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{language === 'ar' ? lab.nameAr : lab.nameEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
