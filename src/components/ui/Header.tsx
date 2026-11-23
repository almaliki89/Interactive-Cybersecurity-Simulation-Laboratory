import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Compass,
  Layers3,
  Menu,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sun,
  Workflow,
  X,
} from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';
import { simulationRegistry } from '../../simulations/registry';

const primaryNavigation = [
  { id: 'landing', ar: 'الرئيسية', en: 'Home', icon: Compass },
  { id: 'lesson', ar: 'ابدأ هنا (المبتدئون)', en: 'Start Here', icon: BookOpen },
  { id: 'explorer', ar: 'المختبرات', en: 'Laboratories', icon: Layers3 },
  { id: 'range', ar: 'الميدان', en: 'Cyber Range', icon: Activity },
  { id: 'paths', ar: 'المسارات', en: 'Paths', icon: Workflow },
] as const;

export const Header: React.FC = () => {
  const language = useSimulationStore((state) => state.language);
  const setLanguage = useSimulationStore((state) => state.setLanguage);
  const theme = useSimulationStore((state) => state.theme);
  const setTheme = useSimulationStore((state) => state.setTheme);
  const activeSimulationId = useSimulationStore((state) => state.activeSimulationId);
  const setActiveSimulation = useSimulationStore((state) => state.setActiveSimulation);
  const setIsSearchOpen = useSimulationStore((state) => state.setIsSearchOpen);
  const clockStatus = useSimulationStore((state) => state.clockStatus);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  const registration = simulationRegistry[activeSimulationId];
  const isLabActive = registration?.category === 'lab' ||
    ['devsecops', 'forensics', 'soc', 'cloud', 'containers'].includes(activeSimulationId);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const changeTheme = () => {
    const nextTheme = theme === 'modern' ? 'light' : theme === 'light' ? 'dark' : 'modern';
    setTheme(nextTheme);
  };

  const goTo = (id: typeof primaryNavigation[number]['id']) => {
    setActiveSimulation(id);
    setMobileOpen(false);
  };

  return (
    <header className="zorg-header">
      <div className="zorg-header-inner">
        <div className="zorg-header-brand-area">
          {isLabActive && (
            <button
              type="button"
              className="zorg-header-back"
              onClick={() => setActiveSimulation('explorer')}
              aria-label={isAr ? 'العودة إلى المختبرات' : 'Back to laboratories'}
              title={isAr ? 'العودة إلى المختبرات' : 'Back to laboratories'}
            >
              <ArrowLeft size={17} className={isAr ? 'zorg-arrow-rtl' : ''} />
            </button>
          )}
          <button type="button" className="zorg-brand" onClick={() => setActiveSimulation('landing')}>
            <span className="zorg-brand-mark"><ShieldCheck size={19} strokeWidth={2} /></span>
            <span className="zorg-brand-copy">
              <strong>ZORG</strong>
              <small>{isAr ? 'مختبر الأمن السيبراني' : 'CYBER LAB PLATFORM'}</small>
            </span>
          </button>
          {isLabActive && (
            <>
              <span className="zorg-header-divider" />
              <div className="zorg-header-context">
                <span>{isAr ? 'المختبر الحالي' : 'CURRENT LAB'}</span>
                <strong>{isAr ? registration.nameAr : registration.nameEn}</strong>
              </div>
            </>
          )}
        </div>

        <nav className="zorg-desktop-nav" aria-label={isAr ? 'التنقل الرئيسي' : 'Primary navigation'}>
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeSimulationId === item.id ||
              (item.id === 'explorer' && isLabActive);
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => goTo(item.id)}
                className={'zorg-nav-link' + (active ? ' is-active' : '')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{isAr ? item.ar : item.en}</span>
              </button>
            );
          })}
        </nav>

        <div className="zorg-header-actions">
          {isLabActive && (
            <span className="zorg-session-status">
              <i className={clockStatus === 'running' ? 'is-running' : ''} />
              <span>{isAr ? 'المحاكاة' : 'SIMULATION'}</span>
            </span>
          )}
          <button
            type="button"
            className="zorg-header-action"
            onClick={() => setIsSearchOpen(true)}
            aria-label={isAr ? 'بحث' : 'Search'}
            title={isAr ? 'بحث ( / )' : 'Search ( / )'}
          >
            <Search size={18} />
          </button>
          <button
            type="button"
            className="zorg-header-action zorg-language-action"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
            data-testid="lang-toggle-btn"
            aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}
            title={isAr ? 'English' : 'العربية'}
          >
            {isAr ? 'EN' : 'ع'}
          </button>
          <button
            type="button"
            className="zorg-header-action"
            onClick={changeTheme}
            data-testid="theme-toggle-btn"
            aria-label={isAr ? 'تغيير المظهر' : 'Change appearance'}
            title={isAr ? 'تغيير المظهر' : 'Change theme'}
          >
            {theme === 'light' ? <Sun size={17} /> : theme === 'dark' ? <Moon size={17} /> : <Palette size={17} />}
          </button>
          {isLabActive && (
            <button
              type="button"
              className="zorg-return-learning"
              data-testid="return-to-lesson-btn"
              onClick={() => setActiveSimulation('lesson')}
            >
              <BookOpen size={15} />
              <span>{isAr ? 'العودة إلى الدرس' : 'Back to lesson'}</span>
            </button>
          )}
          <div className="zorg-mobile-menu-wrap" ref={mobileMenuRef}>
            <button
              type="button"
              className="zorg-header-action zorg-mobile-menu-button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? (isAr ? 'إغلاق القائمة' : 'Close menu') : (isAr ? 'فتح القائمة' : 'Open menu')}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {mobileOpen && (
              <div className="zorg-mobile-menu">
                <span className="zorg-mobile-menu-heading">{isAr ? 'التنقل' : 'NAVIGATION'}</span>
                {primaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = activeSimulationId === item.id ||
                    (item.id === 'explorer' && isLabActive);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => goTo(item.id)}
                      className={'zorg-mobile-link' + (active ? ' is-active' : '')}
                    >
                      <Icon size={17} />
                      <span>{isAr ? item.ar : item.en}</span>
                      {active && <i />}
                    </button>
                  );
                })}
                <div className="zorg-mobile-menu-footer">
                  <span><i className={clockStatus === 'running' ? 'is-running' : ''} /> {isAr ? 'بيئة المحاكاة' : 'Simulation workspace'}</span>
                  <button type="button" onClick={() => { setIsSearchOpen(true); setMobileOpen(false); }}>
                    <Search size={15} /> {isAr ? 'بحث' : 'Search'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLabActive && (
        <div className="zorg-mobile-context">
          <span>{isAr ? registration.nameAr : registration.nameEn}</span>
          <button type="button" onClick={() => setActiveSimulation('explorer')}>
            {isAr ? 'كل المختبرات' : 'All labs'} <ArrowUpRight size={13} />
          </button>
        </div>
      )}
    </header>
  );
};
