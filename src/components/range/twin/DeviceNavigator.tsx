/**
 * OMEGA ULTRA REALITY — Device Navigator Tree
 * Hierarchical building, room, and rack navigation.
 */

import React from 'react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { RoomId } from '../../../engine/reality/digitalTwinTypes';
import {
  Server,
  Building,
  HardDrive,
  Network,
  Shield,
  Laptop,
  Zap,
  ChevronRight,
  Radio,
  Cable,
} from 'lucide-react';

interface DeviceNavigatorProps {
  language: 'ar' | 'en';
}

export const DeviceNavigator: React.FC<DeviceNavigatorProps> = ({ language }) => {
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const selectedCableId = useDigitalTwinStore((s) => s.selectedCableId);
  const selectedRoomId = useDigitalTwinStore((s) => s.selectedRoomId);
  const selectDevice = useDigitalTwinStore((s) => s.selectDevice);
  const selectCable = useDigitalTwinStore((s) => s.selectCable);
  const selectRoom = useDigitalTwinStore((s) => s.selectRoom);
  const rooms = useDigitalTwinStore((s) => s.rooms);
  const racks = useDigitalTwinStore((s) => s.racks);
  const devices = useDigitalTwinStore((s) => s.devices);
  const cables = useDigitalTwinStore((s) => s.cables);

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'server':
        return Server;
      case 'switch':
        return Network;
      case 'firewall':
        return Shield;
      case 'workstation':
        return Laptop;
      case 'pdu':
      case 'ups':
        return Zap;
      default:
        return HardDrive;
    }
  };

  return (
    <div className="w-72 h-full bg-slate-950 border-r rtl:border-r-0 rtl:border-l border-slate-900 flex flex-col select-none relative z-10 shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold tracking-tight text-white uppercase font-mono">
            {language === 'ar' ? 'مقر شركة NEXORA' : 'NEXORA HQ INVENTORY'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
          LIVE TWIN
        </span>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {/* ROOM 1: SERVER ROOM */}
        <div className="space-y-1">
          <button
            onClick={() => selectRoom('server-room')}
            className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left rtl:text-right transition-colors ${
              selectedRoomId === 'server-room'
                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {language === 'ar' ? rooms['server-room'].nameAr : rooms['server-room'].nameEn}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">RU 1-42</span>
          </button>

          {/* RACK-01 Nested Device List */}
          <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-900 ml-2 rtl:ml-0 rtl:mr-2 space-y-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 tracking-wider">
              {racks['RACK-01'].name}
            </div>

            {racks['RACK-01'].devices.map((devId) => {
              const dev = devices[devId];
              if (!dev) return null;
              const isSelected = selectedDeviceId === devId;
              const Icon = getDeviceIcon(dev.category);
              const isOnline = dev.powerStatus === 'ONLINE';

              return (
                <button
                  key={dev.id}
                  data-testid={`nav-device-${dev.id}`}
                  onClick={() => selectDevice(dev.id)}
                  className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between text-left rtl:text-right transition-all group ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                    <span className="text-[11px] font-mono font-medium truncate">{dev.id}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 group-hover:text-slate-400">
                    RU {dev.rackUnitStart}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROOM 2: FINANCE DEPT */}
        <div className="space-y-1">
          <button
            onClick={() => selectRoom('finance-dept')}
            className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left rtl:text-right transition-colors ${
              selectedRoomId === 'finance-dept'
                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Laptop className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {language === 'ar' ? rooms['finance-dept'].nameAr : rooms['finance-dept'].nameEn}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Floor 2</span>
          </button>

          {/* Workstations in Finance */}
          <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-900 ml-2 rtl:ml-0 rtl:mr-2 space-y-1">
            {rooms['finance-dept'].devices.map((devId) => {
              const dev = devices[devId];
              if (!dev) return null;
              const isSelected = selectedDeviceId === devId;
              const Icon = getDeviceIcon(dev.category);
              const isOnline = dev.powerStatus === 'ONLINE';

              return (
                <button
                  key={dev.id}
                  data-testid={`nav-device-${dev.id}`}
                  onClick={() => selectDevice(dev.id)}
                  className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between text-left rtl:text-right transition-all group ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 shrink-0" />
                    <span className="text-[11px] font-mono font-medium truncate">{dev.id}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">WS</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROOM 3: HR DEPT */}
        <div className="space-y-1">
          <button
            onClick={() => selectRoom('hr-dept')}
            className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left rtl:text-right transition-colors ${
              selectedRoomId === 'hr-dept'
                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Laptop className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {rooms['hr-dept'] ? (language === 'ar' ? rooms['hr-dept'].nameAr : rooms['hr-dept'].nameEn) : 'HR Department'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Floor 2</span>
          </button>

          {/* Workstations in HR */}
          <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-900 ml-2 rtl:ml-0 rtl:mr-2 space-y-1">
            {(rooms['hr-dept']?.devices || []).map((devId) => {
              const dev = devices[devId];
              if (!dev) return null;
              const isSelected = selectedDeviceId === devId;
              const Icon = getDeviceIcon(dev.category);
              const isOnline = dev.powerStatus === 'ONLINE';

              return (
                <button
                  key={dev.id}
                  data-testid={`nav-device-${dev.id}`}
                  onClick={() => selectDevice(dev.id)}
                  className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between text-left rtl:text-right transition-all group ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-pink-400 shrink-0" />
                    <span className="text-[11px] font-mono font-medium truncate">{dev.id}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">WS</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ROOM 4: IT DEPT */}
        <div className="space-y-1">
          <button
            onClick={() => selectRoom('it-dept')}
            className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left rtl:text-right transition-colors ${
              selectedRoomId === 'it-dept'
                ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Laptop className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs font-semibold truncate">
                {rooms['it-dept'] ? (language === 'ar' ? rooms['it-dept'].nameAr : rooms['it-dept'].nameEn) : 'IT Department'}
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Floor 2</span>
          </button>

          {/* Workstations in IT */}
          <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-900 ml-2 rtl:ml-0 rtl:mr-2 space-y-1">
            {(rooms['it-dept']?.devices || []).map((devId) => {
              const dev = devices[devId];
              if (!dev) return null;
              const isSelected = selectedDeviceId === devId;
              const Icon = getDeviceIcon(dev.category);
              const isOnline = dev.powerStatus === 'ONLINE';

              return (
                <button
                  key={dev.id}
                  data-testid={`nav-device-${dev.id}`}
                  onClick={() => selectDevice(dev.id)}
                  className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between text-left rtl:text-right transition-all group ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-slate-700'
                      }`}
                    />
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0" />
                    <span className="text-[11px] font-mono font-medium truncate">{dev.id}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">WS</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* OTHER SECTORS */}
        {(['soc', 'netops', 'reception', 'data-center'] as RoomId[]).map((rId) => {
          const room = rooms[rId];
          if (!room) return null;
          const isSelected = selectedRoomId === rId;
          return (
            <button
              key={rId}
              onClick={() => selectRoom(rId)}
              className={`w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-left rtl:text-right transition-colors ${
                isSelected
                  ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Radio className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-xs font-semibold truncate">
                  {language === 'ar' ? room.nameAr : room.nameEn}
                </span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-600 rtl:rotate-180" />
            </button>
          );
        })}

        {/* PHYSICAL CABLES & TOPOLOGY RUNS */}
        <div className="pt-2 border-t border-slate-900 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 tracking-wider flex items-center justify-between">
            <span>{language === 'ar' ? 'الكابلات والتوصيلات الفيزيائية' : 'PHYSICAL CABLE RUNS'}</span>
            <span className="text-[9px] text-cyan-400">{Object.keys(cables).length}</span>
          </div>

          {Object.values(cables).map((cable) => {
            const isSelected = selectedCableId === cable.id;
            const isConnected = cable.status === 'CONNECTED';
            return (
              <button
                key={cable.id}
                data-testid={`cable-${cable.id}`}
                onClick={() => selectCable(cable.id)}
                className={`w-full px-2 py-1.5 rounded-md flex items-center justify-between text-left rtl:text-right transition-all group ${
                  isSelected
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    data-testid={`cable-status-${cable.id}`}
                    data-state={cable.status}
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isConnected ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'
                    }`}
                  />
                  <Cable className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 shrink-0" />
                  <span className="text-[10px] font-mono font-bold truncate">{cable.id}</span>
                </div>
                <span className="text-[8px] font-mono text-slate-500 group-hover:text-slate-400">
                  {isConnected ? 'UP' : 'DOWN'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Environmental Footer */}
      <div className="p-3 border-t border-slate-900 bg-slate-900/20 text-[10px] font-mono text-slate-500 space-y-1">
        <div className="flex justify-between">
          <span>SERVER ROOM AMBIENT</span>
          <span className="text-slate-300">20.5 °C</span>
        </div>
        <div className="flex justify-between">
          <span>RACK INTAKE AIR</span>
          <span className="text-emerald-400">19.2 °C</span>
        </div>
        <div className="flex justify-between">
          <span>TOTAL LOAD</span>
          <span className="text-amber-400">1.84 kW</span>
        </div>
      </div>
    </div>
  );
};
