import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { LinuxWorldMap } from './LinuxWorldMap';
import { FilesystemExplorer } from './FilesystemExplorer';
import { UsersGroupsLab } from './UsersGroupsLab';
import { PermissionsLab } from './PermissionsLab';
import { SudoPolicyLab } from './SudoPolicyLab';
import { ProcessTreeLab } from './ProcessTreeLab';
import { ServiceExposureLab } from './ServiceExposureLab';
import { LinuxLogLab } from './LinuxLogLab';
import { LinuxHardeningChallenge } from './LinuxHardeningChallenge';
import {
  Compass,
  FolderTree,
  Users,
  Shield,
  Lock,
  Cpu,
  Server,
  Terminal,
  ShieldAlert,
} from 'lucide-react';

export const LinuxSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [activeView, setActiveView] = useState<string>('map');

  const navItems = [
    { id: 'map', nameEn: 'World Map', nameAr: 'خارطة المنظومة', icon: Compass },
    { id: 'fs', nameEn: 'Filesystem', nameAr: 'نظام الملفات', icon: FolderTree },
    { id: 'users', nameEn: 'Users & Groups', nameAr: 'المستخدمون والمجموعات', icon: Users },
    { id: 'permissions', nameEn: 'POSIX Perms', nameAr: 'أذونات POSIX', icon: Shield },
    { id: 'sudo', nameEn: 'Sudo Policy', nameAr: 'سياسات Sudo', icon: Lock },
    { id: 'processes', nameEn: 'Process Tree', nameAr: 'شجرة العمليات', icon: Cpu },
    { id: 'services', nameEn: 'Service Exposure', nameAr: 'كشف الخدمات', icon: Server },
    { id: 'logs', nameEn: 'Audit Logs', nameAr: 'سجلات التدقيق', icon: Terminal },
    { id: 'challenge', nameEn: 'Hardening Challenge', nameAr: 'تحدي التحصين', icon: ShieldAlert },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Top Linux World Navigation Bar */}
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
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
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
        {activeView === 'map' && <LinuxWorldMap onSelectLab={(labId) => setActiveView(labId)} />}
        {activeView === 'fs' && <FilesystemExplorer onBackToMap={() => setActiveView('map')} />}
        {activeView === 'users' && <UsersGroupsLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'permissions' && <PermissionsLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'sudo' && <SudoPolicyLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'processes' && <ProcessTreeLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'services' && <ServiceExposureLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'logs' && <LinuxLogLab onBackToMap={() => setActiveView('map')} />}
        {activeView === 'challenge' && (
          <LinuxHardeningChallenge
            onBackToMap={() => setActiveView('map')}
            onNavigateToLab={(labId) => setActiveView(labId)}
          />
        )}
      </div>
    </div>
  );
};
