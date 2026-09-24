import React, { useEffect } from 'react';
import { Header } from './components/ui/Header';
import { useSimulationStore } from './stores/simulationStore';
import { InteractiveEnterpriseHero } from './components/landing/InteractiveEnterpriseHero';
import { UniverseExplorer } from './components/universe/UniverseExplorer';
import { GlobalKnowledgeGraph } from './components/universe/GlobalKnowledgeGraph';
import { CyberRange } from './components/range/CyberRange';
import { GlossaryView } from './components/glossary/GlossaryView';
import { LearningPathsView } from './components/paths/LearningPathsView';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

// Interactive Simulation Labs
import { CiaTriadSimulation } from './simulations/foundations/CiaTriadSimulation';
import { SystemInternalsSimulation } from './simulations/internals/SystemInternalsSimulation';
import { SubnetRoutingSimulation } from './simulations/networking/SubnetRoutingSimulation';
import { ActiveDirectorySimulation } from './simulations/identity/ActiveDirectorySimulation';
import { AppSecApiSimulation } from './simulations/appsec/AppSecApiSimulation';
import { CloudContainerSimulation } from './simulations/cloud/CloudContainerSimulation';
import { ThreatHuntingSimulation } from './simulations/threat/ThreatHuntingSimulation';
import { ZeroTrustSimulation } from './simulations/architecture/ZeroTrustSimulation';

import { TcpSimulation } from './simulations/tcp/TcpSimulation';
import { DnsSimulation } from './simulations/dns/DnsSimulation';
import { FirewallSimulation } from './simulations/firewall/FirewallSimulation';
import { HttpSimulation } from './simulations/http/HttpSimulation';
import { TlsSimulation } from './simulations/tls/TlsSimulation';
import { LinuxSimulation } from './simulations/linux/LinuxSimulation';
import { CryptoSimulation } from './simulations/crypto/CryptoSimulation';
import { SiemSimulation } from './simulations/siem/SiemSimulation';

export default function App() {
  const language = useSimulationStore((s) => s.language);
  const activeSimulationId = useSimulationStore((s) => s.activeSimulationId);
  const setActiveSimulation = useSimulationStore((s) => s.setActiveSimulation);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const setClockStatus = useSimulationStore((s) => s.setClockStatus);

  // Sync HTML direction and language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Global hotkeys (Space to pause/play, R to reset, / for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input or editable elements
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setClockStatus(clockStatus === 'running' ? 'paused' : 'running');
      } else if (e.key === 'r' || e.key === 'R') {
        // Reset virtual time
        useSimulationStore.getState().setVirtualTime(0);
      } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        useSimulationStore.getState().setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clockStatus, setClockStatus]);

  // Deep linking via hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as any;
      const validSims = [
        'landing',
        'explorer',
        'range',
        'knowledge',
        'glossary',
        'paths',
        'cia_triad',
        'system_internals',
        'subnet_routing',
        'active_directory',
        'appsec_api',
        'cloud_containers',
        'threat_hunting',
        'zero_trust',
        'tcp',
        'dns',
        'firewall',
        'http',
        'tls',
        'linux',
        'crypto',
        'siem',
      ];
      if (validSims.includes(hash)) {
        setActiveSimulation(hash);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [setActiveSimulation]);

  // Sync hash with active sim
  useEffect(() => {
    if (activeSimulationId) {
      window.location.hash = activeSimulationId;
    }
  }, [activeSimulationId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      <Header />
      <GlobalSearchModal />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeSimulationId === 'landing' && <InteractiveEnterpriseHero />}
        {activeSimulationId === 'explorer' && <UniverseExplorer />}
        {activeSimulationId === 'range' && <CyberRange />}
        {activeSimulationId === 'knowledge' && <GlobalKnowledgeGraph />}
        {activeSimulationId === 'glossary' && <GlossaryView />}
        {activeSimulationId === 'paths' && <LearningPathsView />}

        {/* New Universe Specialized Labs */}
        {activeSimulationId === 'cia_triad' && <CiaTriadSimulation />}
        {activeSimulationId === 'system_internals' && <SystemInternalsSimulation />}
        {activeSimulationId === 'subnet_routing' && <SubnetRoutingSimulation />}
        {activeSimulationId === 'active_directory' && <ActiveDirectorySimulation />}
        {activeSimulationId === 'appsec_api' && <AppSecApiSimulation />}
        {activeSimulationId === 'cloud_containers' && <CloudContainerSimulation />}
        {activeSimulationId === 'threat_hunting' && <ThreatHuntingSimulation />}
        {activeSimulationId === 'zero_trust' && <ZeroTrustSimulation />}

        {/* Core Protocol Labs */}
        {activeSimulationId === 'tcp' && <TcpSimulation />}
        {activeSimulationId === 'dns' && <DnsSimulation />}
        {activeSimulationId === 'firewall' && <FirewallSimulation />}
        {activeSimulationId === 'http' && <HttpSimulation />}
        {activeSimulationId === 'tls' && <TlsSimulation />}
        {activeSimulationId === 'linux' && <LinuxSimulation />}
        {activeSimulationId === 'crypto' && <CryptoSimulation />}
        {activeSimulationId === 'siem' && <SiemSimulation />}
      </main>
    </div>
  );
}
