import React, { useEffect, Suspense } from 'react';
import { Header } from './components/ui/Header';
import { useSimulationStore, SimulationId } from './stores/simulationStore';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { getRegisteredSimulation, simulationRegistry } from './simulations/registry';
import { globalSimulationRuntime } from './engine/runtime/SimulationRuntime';
import { AlertTriangle, RotateCcw, Compass } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset: () => void;
  language: 'ar' | 'en';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SimulationErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Simulation error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isAr = this.props.language === 'ar';
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-center select-none">
          <div className="w-16 h-16 rounded-3xl bg-rose-950/60 border border-rose-800 flex items-center justify-center text-rose-400 mb-4 shadow-xl shadow-rose-950/50">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {isAr ? 'حدث خطأ غير متوقع أثناء تشغيل المحاكاة' : 'An unexpected simulation error occurred'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || (isAr ? 'تعذر تحميل حالة البيئة التفاعلية' : 'Failed to render simulation state')}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط المحاكاة' : 'Reset Simulation'}</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                useSimulationStore.getState().setActiveSimulation('explorer');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? 'العودة إلى الكون السيبراني' : 'Return to Universe'}</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const language = useSimulationStore((s) => s.language);
  const theme = useSimulationStore((s) => s.theme);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const setClockStatus = useSimulationStore((s) => s.setClockStatus);

  // Sync HTML direction, language, and theme class
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark', 'modern');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  // Global hotkeys (Space to pause/play, R to reset, ArrowRight to step, / for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or editable elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (clockStatus === 'running') {
          globalSimulationRuntime.pause();
        } else {
          globalSimulationRuntime.resume();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        globalSimulationRuntime.reset();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        globalSimulationRuntime.step(150);
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useSimulationStore.getState().setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clockStatus]);

  // Deep linking via hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as SimulationId;
      if (hash && simulationRegistry[hash as keyof typeof simulationRegistry]) {
        if (useSimulationStore.getState().activeSimulationId !== hash) {
          setActiveSimulation(hash);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveSimulation]);

  // Sync hash with active sim
  useEffect(() => {
    if (activeSimulationId) {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== activeSimulationId) {
        window.location.hash = activeSimulationId;
      }
    }
  }, [activeSimulationId]);

  const reloadFromStorage = useSimulationStore((s) => s.reloadFromStorage);

  // Initialize state from storage
  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  const activeRegistration = getRegisteredSimulation(activeSimulationId);
  const ActiveComponent = activeRegistration.component;

  const themeClass = 
    theme === 'light' 
      ? 'bg-slate-50 text-slate-900' 
      : theme === 'dark' 
      ? 'bg-slate-950 text-slate-100' 
      : 'bg-[#070b16] text-slate-100';

  return (
    <div className={`min-h-screen flex flex-col ${themeClass} selection:bg-cyan-500/20 selection:text-cyan-200 transition-colors duration-200`}>
      <Header />
      <GlobalSearchModal />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <SimulationErrorBoundary
          key={activeSimulationId}
          language={language}
          onReset={() => useSimulationStore.getState().setActiveSimulation(activeSimulationId)}
        >
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center bg-slate-950">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>INITIALIZING LAB ENVIRONMENT...</span>
                </div>
              </div>
            }
          >
            <ActiveComponent />
          </Suspense>
        </SimulationErrorBoundary>
      </main>
    </div>
  );
}
