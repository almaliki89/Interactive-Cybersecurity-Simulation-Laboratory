/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory Administrative Console UI
 * Interactive AD Users & Computers view (OUs, Users, Groups, Computers, SPNs, Active Sessions).
 */

import React, { useState } from 'react';
import { globalActiveDirectoryEngine } from '../../../engine/reality/identity/ActiveDirectoryEngine';
import {
  Users,
  Folder,
  Shield,
  Laptop,
  Key,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Building,
  Activity,
  Layers,
} from 'lucide-react';

interface ActiveDirectoryConsoleProps {
  language?: 'en' | 'ar';
}

export const ActiveDirectoryConsole: React.FC<ActiveDirectoryConsoleProps> = ({ language = 'en' }) => {
  const [activeSubTab, setActiveTab] = useState<'ous' | 'users' | 'groups' | 'computers' | 'spns' | 'sessions'>('users');
  const [selectedUser, setSelectedUser] = useState<string | null>('sara.finance');

  const ous = globalActiveDirectoryEngine.store.getAllOUs();
  const users = globalActiveDirectoryEngine.store.getAllUsers();
  const groups = globalActiveDirectoryEngine.store.getAllGroups();
  const computers = globalActiveDirectoryEngine.store.getAllComputers();
  const spns = globalActiveDirectoryEngine.spnRegistry.getAllSpns();
  const stats = globalActiveDirectoryEngine.dc.getStats();

  const isAr = language === 'ar';

  const userObj = selectedUser ? globalActiveDirectoryEngine.store.findUser(selectedUser) : null;
  const userGroups = selectedUser ? globalActiveDirectoryEngine.groupResolver.resolveUserGroupNames(selectedUser) : [];

  return (
    <div data-testid="ad-console" className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 font-sans text-xs overflow-hidden select-none border border-slate-800/80 rounded-xl shadow-2xl">
      {/* Header Banner */}
      <div className="p-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
              <span>NEXORA.LOCAL</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                HEALTHY
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {isAr ? 'مركز إدارة الأجهزة والهويات (Active Directory Administrative Center)' : 'Active Directory Administrative Center'}
            </div>
          </div>
        </div>

        {/* Domain Health Stats */}
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            <span className="text-slate-500">Users: </span>
            <span className="text-cyan-400 font-bold">{users.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            <span className="text-slate-500">Groups: </span>
            <span className="text-cyan-400 font-bold">{groups.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            <span className="text-slate-500">Computers: </span>
            <span className="text-cyan-400 font-bold">{computers.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 text-[11px] font-mono">
        {[
          { id: 'users', icon: Users, label: isAr ? 'المستخدمون' : 'Users' },
          { id: 'groups', icon: Shield, label: isAr ? 'المجموعات' : 'Groups' },
          { id: 'computers', icon: Laptop, label: isAr ? 'الأجهزة' : 'Computers' },
          { id: 'spns', icon: Key, label: isAr ? 'خوادم SPNs' : 'SPNs' },
          { id: 'ous', icon: Folder, label: isAr ? 'الوحدات التنظيمية OUs' : 'OUs' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List */}
        <div className="w-1/2 border-r border-slate-800/80 overflow-y-auto p-2 space-y-1 bg-slate-950/60">
          {activeSubTab === 'users' &&
            users.map((u) => {
              const isSelected = selectedUser === u.samAccountName;
              return (
                <div
                  key={u.id}
                  data-testid={`ad-user-${u.samAccountName}`}
                  onClick={() => setSelectedUser(u.samAccountName)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-800/80 text-white shadow-md'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold font-mono text-xs">{u.samAccountName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{u.displayName}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    {u.ou.split(',')[0].replace('OU=', '')}
                  </span>
                </div>
              );
            })}

          {activeSubTab === 'groups' &&
            groups.map((g) => (
              <div
                key={g.id}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-slate-300"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold font-mono text-xs text-white">{g.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{g.description || g.scope}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {g.members.length} members
                </span>
              </div>
            ))}

          {activeSubTab === 'computers' &&
            computers.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-slate-300"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold font-mono text-xs text-white">{c.hostname}</div>
                    <div className="text-[10px] text-slate-400 truncate">{c.osType}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-cyan-400">{c.ipAddress}</div>
                  <div className="text-[9px] font-mono text-emerald-400 font-bold">{c.secureChannelState}</div>
                </div>
              </div>
            ))}

          {activeSubTab === 'spns' &&
            spns.map((s) => (
              <div
                key={s.spn}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-slate-300 font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-cyan-300">{s.spn}</div>
                    <div className="text-[10px] text-slate-400">Host: {s.hostname}</div>
                  </div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {s.targetAccountName}
                </span>
              </div>
            ))}

          {activeSubTab === 'ous' &&
            ous.map((ou) => (
              <div
                key={ou.dn}
                className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 flex items-center justify-between text-slate-300 font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">{ou.name}</div>
                    <div className="text-[10px] text-slate-400">{ou.dn}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Right Details Inspector */}
        <div className="w-1/2 p-3 overflow-y-auto bg-slate-900/20 font-mono text-xs" data-testid="ad-user-details">
          {userObj ? (
            <div className="space-y-3">
              <div className="pb-2 border-b border-slate-800">
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{userObj.displayName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {userObj.samAccountName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5" data-testid="ad-user-upn">{userObj.upn}</div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Object SID:</span>
                  <span className="text-slate-300 font-mono text-[10px]" data-testid="ad-user-sid">{userObj.sid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">OU Location:</span>
                  <span className="text-slate-300 text-[10px]">{userObj.ou}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Enabled:</span>
                  <span className="text-emerald-400 font-bold" data-testid="ad-user-enabled">{userObj.enabled ? 'YES' : 'NO'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">UAC Flags:</span>
                  <span className="text-amber-400">0x200 (NORMAL_ACCOUNT)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5" data-testid="ad-user-groups">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Group Memberships ({userGroups.length})</div>
                <div className="space-y-1">
                  {userGroups.map((gName) => (
                    <div key={gName} className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1.5 text-[11px]">
                      <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-200">{gName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-center">
              Select an object on the left to inspect Active Directory attributes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
