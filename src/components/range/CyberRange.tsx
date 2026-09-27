/**
 * OMEGA ULTRA REALITY V1.0 — Enterprise Digital Twin Cyber Range
 * Realistic 3D WebGL / 2D Accessible physical infrastructure synchronized with RealityEngine.
 */

import React, { useEffect } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDigitalTwinStore } from '../../engine/reality/digitalTwinStore';
import { DigitalTwinCanvas } from './twin/DigitalTwinCanvas';
import { DeviceNavigator } from './twin/DeviceNavigator';
import { DeviceInspector } from './twin/DeviceInspector';
import { SchematicView2D } from './twin/SchematicView2D';
import { CameraViewMode } from '../../engine/reality/digitalTwinTypes';
import {
  Building,
  Server,
  Layers,
  Laptop,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Shield,
  Activity,
  Box,
} from 'lucide-react';

export const CyberRange: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  const cameraMode = useDigitalTwinStore((s) => s.cameraMode);
  const setCameraMode = useDigitalTwinStore((s) => s.setCameraMode);
  const renderMode = useDigitalTwinStore((s) => s.renderMode);
  const setRenderMode = useDigitalTwinStore((s) => s.setRenderMode);
  const ambientNoiseMuted = useDigitalTwinStore((s) => s.ambientNoiseMuted);
  const setAmbientNoiseMuted = useDigitalTwinStore((s) => s.setAmbientNoiseMuted);
  const syncWithRealityEngine = useDigitalTwinStore((s) => s.syncWithRealityEngine);
  const racks = useDigitalTwinStore((s) => s.racks);
  const devices = useDigitalTwinStore((s) => s.devices);

  const rack01 = racks['RACK-01'];
  const dc01 = devices['DC01'];
  const coreSw = devices['CORE-SW01'];
  const totalPowerWatts = rack01?.totalPowerWatts ?? 0;
  const temperatureCelsius = rack01?.temperatureCelsius ?? 20.5;
  const upPortsCount = coreSw?.ports ? coreSw.ports.filter((p) => p.linkState === 'UP').length : 0;

  // Sync state on mount and clock ticks
  useEffect(() => {
    syncWithRealityEngine();
  }, [virtualTime, syncWithRealityEngine]);

  // Keyboard navigation shortcuts (1: Building, 2: Server Room, 3: Rack-01, 4: Workstation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === '1') setCameraMode('building');
      if (e.key === '2') setCameraMode('room');
      if (e.key === '3') setCameraMode('rack');
      if (e.key === '4') setCameraMode('rack-rear');
      if (e.key === '5') setCameraMode('workstation');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraMode]);

  const cameraButtons: { id: CameraViewMode; labelEn: string; labelAr: string; icon: any }[] = [
    { id: 'building', labelEn: 'Building HQ', labelAr: 'المقر العام', icon: Building },
    { id: 'room', labelEn: 'Server Room', labelAr: 'غرفة الخوادم', icon: Server },
    { id: 'rack', labelEn: 'Rack Front', labelAr: 'واجهة الكابينة', icon: Box },
    { id: 'rack-rear', labelEn: 'Rack Rear (Cabling)', labelAr: 'خلفية الكابينة', icon: Box },
    { id: 'workstation', labelEn: 'Workstation', labelAr: 'محطة العمل', icon: Laptop },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Viewport Navigation & Toolbar */}
      <div className="h-11 border-b border-slate-900 bg-slate-950 px-3.5 flex items-center justify-between z-20 shrink-0">
        {/* Left: Identity & Synchronized Reality Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-tight text-white uppercase">
              {language === 'ar' ? 'التوأم الرقمي المؤسسي' : 'ENTERPRISE DIGITAL TWIN'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-900/60 border border-slate-800 px-2 py-0.5 rounded">
            <span className="text-cyan-400 font-bold">REALITY ENGINE V1.1</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">T+{virtualTime}ms</span>
          </div>
        </div>

        {/* Center: Camera View Selectors */}
        <div className="hidden md:flex items-center gap-1 p-0.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
          {cameraButtons.map((btn) => {
            const isActive = cameraMode === btn.id;
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => setCameraMode(btn.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{language === 'ar' ? btn.labelAr : btn.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Render Mode (3D vs 2D) & Ambient Mute */}
        <div className="flex items-center gap-2">
          {/* 3D WebGL vs 2D Accessible Schematic Toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800">
            <button
              data-testid="digital-twin-mode-3d"
              onClick={() => setRenderMode('3d-webgl')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                renderMode === '3d-webgl'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D WebGL
            </button>
            <button
              data-testid="digital-twin-mode-2d"
              onClick={() => setRenderMode('2d-schematic')}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                renderMode === '2d-schematic'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2D Schematic
            </button>
          </div>

          {/* Mute Ambient Audio */}
          <button
            onClick={() => setAmbientNoiseMuted(!ambientNoiseMuted)}
            title={ambientNoiseMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {ambientNoiseMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Main 3-Column Content Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Device & Location Tree Navigator */}
        <DeviceNavigator language={language} />

        {/* Center: 3D WebGL Canvas or 2D Accessible Schematic */}
        <div className="flex-1 h-full relative overflow-hidden bg-slate-950">
          {renderMode === '3d-webgl' ? (
            <DigitalTwinCanvas />
          ) : (
            <SchematicView2D language={language} />
          )}

          {/* Controls helper HUD overlay */}
          {renderMode === '3d-webgl' && (
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 p-2 rounded-lg bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none space-y-0.5 hidden sm:block">
              <div>• Click device in 3D to inspect</div>
              <div>• Drag to orbit | Scroll to zoom</div>
              <div>• Press 1: HQ | 2: Room | 3: Rack | 4: Desk</div>
            </div>
          )}
        </div>

        {/* Right: Live Device Inspector */}
        <DeviceInspector language={language} />
      </div>

      {/* Bottom Telemetry & Status Bar */}
      <div className="h-7 border-t border-slate-900 bg-slate-950 px-4 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">NEXORA HEADQUARTERS</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span>
              RACK-01:{' '}
              <strong className={rack01?.pduOnline ? 'text-slate-300' : 'text-rose-400'}>
                {rack01?.pduOnline ? '42U ACTIVE' : '42U OFFLINE'}
              </strong>
            </span>
            <span>
              DC01:{' '}
              <strong className={dc01?.powerStatus === 'ONLINE' ? 'text-slate-300' : 'text-rose-400'}>
                {dc01?.powerStatus === 'ONLINE' ? 'ONLINE (10.10.10.10)' : 'OFFLINE'}
              </strong>
            </span>
            <span>
              CORE-SW01:{' '}
              <strong className={upPortsCount > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {upPortsCount}-PORT UP
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>CLOCK:</span>
            <span className={clockStatus === 'running' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {clockStatus.toUpperCase()}
            </span>
          </div>
          <div>POWER: <strong className="text-amber-400">{(totalPowerWatts / 1000).toFixed(2)} kW</strong></div>
          <div>TEMP: <strong className="text-cyan-400">{temperatureCelsius.toFixed(1)} °C</strong></div>
        </div>
      </div>
    </div>
  );
};
