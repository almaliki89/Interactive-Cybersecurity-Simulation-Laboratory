/**
 * OMEGA ULTRA REALITY — Accessible 2D Digital Twin Schematic View
 * 2D elevation diagram of RACK-01 and NEXORA HQ floorplan.
 * Provides complete accessible alternative to WebGL 3D rendering.
 */

import React from 'react';
import { useDigitalTwinStore } from '../../../engine/reality/digitalTwinStore';
import { Server, Shield, Network, Zap, Laptop, Power, CheckCircle2 } from 'lucide-react';

interface SchematicView2DProps {
  language: 'ar' | 'en';
}

export const SchematicView2D: React.FC<SchematicView2DProps> = ({ language }) => {
  const selectedDeviceId = useDigitalTwinStore((s) => s.selectedDeviceId);
  const selectDevice = useDigitalTwinStore((s) => s.selectDevice);
  const devices = useDigitalTwinStore((s) => s.devices);
  const racks = useDigitalTwinStore((s) => s.racks);

  const rack = racks['RACK-01'];

  // Map 42 units down to 1
  const rackUnits = Array.from({ length: 42 }, (_, i) => 42 - i);

  // Helper to find which device occupies a rack unit
  const getDeviceForRU = (ru: number) => {
    return Object.values(devices).find(
      (d) => d.rackUnitStart !== undefined && d.rackUnitHeight !== undefined &&
             ru >= d.rackUnitStart && ru < d.rackUnitStart + d.rackUnitHeight
    );
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-slate-950 flex flex-col md:flex-row gap-6 select-none custom-scrollbar">
      {/* 1. RACK-01 42U Physical Elevation Diagram */}
      <div className="flex-1 max-w-xl mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              {language === 'ar' ? 'مخطط كابينة الخوادم (RACK-01)' : 'RACK-01 ELEVATION SCHEMATIC (42U)'}
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            LOAD: <span className="text-amber-400 font-bold">1.84 kW</span> | TEMP:{' '}
            <span className="text-cyan-400 font-bold">21.4 °C</span>
          </div>
        </div>

        {/* The 42U Rack Frame Container */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 shadow-2xl space-y-1 font-mono">
          {rackUnits.map((ru) => {
            const dev = getDeviceForRU(ru);
            const isDeviceStart = dev && dev.rackUnitStart! + dev.rackUnitHeight! - 1 === ru;
            const isSelected = dev && selectedDeviceId === dev.id;
            const isOnline = dev ? dev.powerStatus === 'ONLINE' : false;

            // If unit is middle/lower part of a multi-U device, skip drawing duplicate headers
            if (dev && !isDeviceStart) {
              return null;
            }

            if (dev) {
              const heightClass = dev.rackUnitHeight === 2 ? 'h-16' : 'h-8';
              return (
                <div
                  key={ru}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectDevice(dev.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      selectDevice(dev.id);
                    }
                  }}
                  className={`w-full ${heightClass} px-3 rounded-md flex items-center justify-between cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[9px] text-slate-500 font-bold w-6 shrink-0">
                      U{dev.rackUnitStart}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-rose-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-slate-200 truncate">{dev.id}</div>
                      <div className="text-[9px] text-slate-500 truncate">{dev.model}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[10px]">
                    <span className="text-slate-400">{dev.powerWatts} W</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        isOnline
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              );
            }

            // Unused blanking panel
            return (
              <div
                key={ru}
                className="w-full h-4 px-3 rounded bg-slate-950/30 border border-slate-900/60 flex items-center justify-between opacity-50"
              >
                <span className="text-[8px] text-slate-600 font-mono">U{ru}</span>
                <span className="text-[8px] text-slate-700 tracking-widest font-mono">BLANKING PANEL</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Office & Building 2D Floor Plan Overview */}
      <div className="w-full md:w-80 flex flex-col space-y-4">
        <div className="text-xs font-bold font-mono text-white uppercase tracking-wider">
          {language === 'ar' ? 'مخطط غرف المقر' : 'NEXORA HQ ROOM SCHEMATIC'}
        </div>

        {/* Server Room Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-cyan-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-300 font-mono">ROOM 101: SERVER ROOM</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">ZONE A</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {language === 'ar'
              ? 'تحتوي على كابينة الخوادم الرئيسية RACK-01 وجدار الحماية ومبدل التوزيع ومتحكم النطاق DC01 وخادم الملفات FILE01.'
              : 'Houses RACK-01 core infrastructure: DC01, FILE01, Core Switch, Perimeter Firewall, and UPS units.'}
          </p>
        </div>

        {/* Finance Department Box */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-purple-800/40 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-purple-300 font-mono">ROOM 204: FINANCE OFFICE</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 font-mono">ZONE B</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {language === 'ar'
              ? 'مكتب إدارة الحسابات المالية. يحتوي على محطة العمل FIN-WS01 الخاصة بالمسؤولة المالية Sara.'
              : 'Finance leadership office. Houses FIN-WS01 workstation assigned to Sara with active Kerberos session.'}
          </p>
          <button
            onClick={() => selectDevice('FIN-WS01')}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-between border transition-all ${
              selectedDeviceId === 'FIN-WS01'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span>INSPECT FIN-WS01</span>
            <Laptop className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
