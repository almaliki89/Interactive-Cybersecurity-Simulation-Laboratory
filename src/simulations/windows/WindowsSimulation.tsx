import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { WindowsWorldMap } from './WindowsWorldMap';
import { AccountsGroupsLab } from './AccountsGroupsLab';
import { AccessTokenVisualizer } from './AccessTokenVisualizer';
import { NtfsPermissionsLab } from './NtfsPermissionsLab';
import { WindowsProcessLab } from './WindowsProcessLab';
import { WindowsServicesLab } from './WindowsServicesLab';
import { WindowsFirewallLab } from './WindowsFirewallLab';
import { WindowsEventLogLab } from './WindowsEventLogLab';
import { WindowsHardeningChallenge } from './WindowsHardeningChallenge';
import {
  Compass,
  Users,
  Key,
  FolderTree,
  Cpu,
  Server,
  Flame,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

export const WindowsSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [activeView, setActiveView] = useState<string>('map');

  const navItems = [
    { id: 'map', nameEn: 'World Map', nameAr: 'خارطة المنظومة', icon: Compass },
    { id: 'accounts', nameEn: 'Accounts & Groups', nameAr: 'الحسابات والمجموعات', icon: Users },
    { id: 'token', nameEn: 'Access Token', nameAr: 'رمز الأمان (Token)', icon: Key },
    { id: 'ntfs', nameEn: 'NTFS DACL', nameAr: 'أذونات NTFS', icon: FolderTree },
    { id: 'processes', nameEn: 'Process Tree', nameAr: 'شجرة العمليات', icon: Cpu },
    { id: 'services', nameEn: 'Services', nameAr: 'الخدمات', icon: Server },
    { id: 'firewall', nameEn: 'Firewall', nameAr: 'جدار الحماية', icon: Flame },
    { id: 'eventlog', nameEn: 'Event Logs', nameAr: 'سجل الأحداث', icon: Terminal },
    { id: 'challenge', nameEn: 'Hardening Challenge', nameAr: 'تحدي التحصين', icon: ShieldAlert },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Windows World Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto select-none sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isAr ? item.nameAr : item.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Views */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'map' && <WindowsWorldMap onSelectLab={(labId) => setActiveView(labId)} />}
        {activeView === 'accounts' && <AccountsGroupsLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'token' && (
          <AccessTokenVisualizer
            onBackToMap={() => setActiveView('map')}
            onNavigateToNtfs={() => setActiveView('ntfs')}
          />
        )}
        {activeView === 'ntfs' && <NtfsPermissionsLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'processes' && <WindowsProcessLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'services' && (
          <WindowsServicesLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToFirewall={() => setActiveView('firewall')}
          />
        )}
        {activeView === 'firewall' && <WindowsFirewallLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'eventlog' && <WindowsEventLogLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'challenge' && (
          <WindowsHardeningChallenge
            onBackToMap={() => setActiveView('map')}
            onNavigateToLab={(labId) => setActiveView(labId)}
          />
        )}
      </div>
    </div>
  );
};
