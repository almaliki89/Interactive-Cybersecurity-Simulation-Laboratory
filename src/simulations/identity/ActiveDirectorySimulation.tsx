import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { ActiveDirectoryWorldMap } from './ActiveDirectoryWorldMap';
import { DirectoryExplorer } from './DirectoryExplorer';
import { UsersComputersLab } from './UsersComputersLab';
import { GroupMembershipGraph } from './GroupMembershipGraph';
import { AuthVsAuthorizationLab } from './AuthVsAuthorizationLab';
import { KerberosSimulation } from './KerberosSimulation';
import { LdapVisualizer } from './LdapVisualizer';
import { GroupPolicyLab } from './GroupPolicyLab';
import { TrustRelationshipsLab } from './TrustRelationshipsLab';
import { IdentitySecurityLab } from './IdentitySecurityLab';
import { ActiveDirectoryEventLogLab } from './ActiveDirectoryEventLogLab';
import { ActiveDirectoryMasterChallenge } from './ActiveDirectoryMasterChallenge';
import { ActiveDirectoryEvent } from './logic/eventlog';
import {
  Compass,
  FolderTree,
  Users,
  Workflow,
  Lock,
  Key,
  Search,
  FileCode,
  Network,
  ShieldCheck,
  Server,
  ShieldAlert,
} from 'lucide-react';

export const ActiveDirectorySimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [activeView, setActiveView] = useState<string>('map');

  const navItems = [
    { id: 'map', nameEn: 'World Map', nameAr: 'خارطة المنظومة', icon: Compass },
    { id: 'directory', nameEn: 'Directory Explorer', nameAr: 'مستكشف الدليل', icon: FolderTree },
    { id: 'users', nameEn: 'Users & Computers', nameAr: 'المستخدمون والحواسيب', icon: Users },
    { id: 'groups', nameEn: 'Group Graph', nameAr: 'تداخل المجموعات', icon: Workflow },
    { id: 'auth', nameEn: 'Auth vs Authz', nameAr: 'المصادقة والتفويض', icon: Lock },
    { id: 'kerberos', nameEn: 'Kerberos 3-Tier', nameAr: 'مصادقة Kerberos', icon: Key },
    { id: 'ldap', nameEn: 'LDAP Queries', nameAr: 'استعلامات LDAP', icon: Search },
    { id: 'gpo', nameEn: 'Group Policy', nameAr: 'سياسات GPO', icon: FileCode },
    { id: 'trusts', nameEn: 'Domain Trusts', nameAr: 'علاقات الثقة', icon: Network },
    { id: 'risks', nameEn: 'Identity Risk', nameAr: 'مخاطر الهوية', icon: ShieldCheck },
    { id: 'eventlog', nameEn: 'Event Logs', nameAr: 'سجل الأحداث', icon: Server },
    { id: 'challenge', nameEn: 'Master Challenge', nameAr: 'التحدي الشامل', icon: ShieldAlert },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Active Directory World Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto select-none shrink-0 z-20 backdrop-blur-md no-scrollbar">
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
        {activeView === 'map' && (
          <ActiveDirectoryWorldMap onSelectLab={(labId) => setActiveView(labId)} />
        )}

        {activeView === 'directory' && (
          <DirectoryExplorer
            onBackToMap={() => setActiveView('map')}
            onNavigateToKerberos={() => setActiveView('kerberos')}
          />
        )}

        {activeView === 'users' && (
          <UsersComputersLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToAuth={() => setActiveView('auth')}
          />
        )}

        {activeView === 'groups' && (
          <GroupMembershipGraph
            onBackToMap={() => setActiveView('map')}
            onNavigateToAuth={() => setActiveView('auth')}
          />
        )}

        {activeView === 'auth' && (
          <AuthVsAuthorizationLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToKerberos={() => setActiveView('kerberos')}
          />
        )}

        {activeView === 'kerberos' && (
          <KerberosSimulation
            onBackToMap={() => setActiveView('map')}
            onNavigateToAuthz={() => setActiveView('auth')}
          />
        )}

        {activeView === 'ldap' && (
          <LdapVisualizer onBackToMap={() => setActiveView('map')} />
        )}

        {activeView === 'gpo' && (
          <GroupPolicyLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToChallenge={() => setActiveView('challenge')}
          />
        )}

        {activeView === 'trusts' && (
          <TrustRelationshipsLab onBackToMap={() => setActiveView('map')} />
        )}

        {activeView === 'risks' && (
          <IdentitySecurityLab
            onBackToMap={() => setActiveView('map')}
            onNavigateToChallenge={() => setActiveView('challenge')}
          />
        )}

        {activeView === 'eventlog' && (
          <ActiveDirectoryEventLogLab
            onBackToMap={() => setActiveView('map')}
          />
        )}

        {activeView === 'challenge' && (
          <ActiveDirectoryMasterChallenge
            onBackToMap={() => setActiveView('map')}
            onNavigateToLab={(labId) => setActiveView(labId)}
          />
        )}
      </div>
    </div>
  );
};
