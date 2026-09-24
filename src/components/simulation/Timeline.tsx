import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { translations } from '../../i18n/translations';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  FastForward,
  Activity,
  Layers,
  Clock,
} from 'lucide-react';

interface TimelineProps {
  onRestart?: () => void;
  onStep?: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ onRestart, onStep }) => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const events = useSimulationStore((s) => s.events);
  const selectEntity = useSimulationStore((s) => s.selectEntity);
  const setTracedEventId = useSimulationStore((s) => s.setTracedEventId);

  const speedOptions = [0.25, 0.5, 1.0, 2.0, 4.0];

  const formatTime = (ms: number) => {
    const totalSecs = ms / 1000;
    const mins = Math.floor(totalSecs / 60);
    const secs = (totalSecs % 60).toFixed(2);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;
  };

  const handlePlayPause = () => {
    if (clockStatus === 'running') {
      globalSimulationRuntime.pause();
    } else {
      globalSimulationRuntime.resume();
    }
  };

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    } else {
      globalSimulationRuntime.reset();
    }
  };

  const handleStep = () => {
    if (onStep) {
      onStep();
    } else {
      globalSimulationRuntime.step(150);
    }
  };

  const handleSelectEvent = (evt: any) => {
    globalSimulationRuntime.pause();
    if (evt.virtualTime !== undefined) {
      globalSimulationRuntime.clock.seek(evt.virtualTime);
    }
    selectEntity('event', evt.id, evt);
    if (evt.causedByEventId || evt.id) {
      setTracedEventId(evt.id);
    }
  };

  const recentEvents = events.slice(0, 5);

  return (
    <div className="h-14 border-t border-slate-800 bg-slate-950/95 px-4 flex items-center justify-between text-slate-300 shrink-0 z-20">
      {/* Left: Playback Controls */}
      <div className="flex items-center gap-2">
        {/* Restart Button */}
        <button
          onClick={handleRestart}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title={t.timeline.restart}
          aria-label={t.timeline.restart}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={`p-1.5 px-3 rounded-lg flex items-center gap-1.5 font-medium text-xs border transition-colors ${
            clockStatus === 'running'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
              : 'bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 border-cyan-400'
          }`}
          aria-label={clockStatus === 'running' ? t.timeline.pause : t.timeline.play}
        >
          {clockStatus === 'running' ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{t.timeline.pause}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.timeline.play}</span>
            </>
          )}
        </button>

        {/* Step Forward Button */}
        <button
          onClick={handleStep}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1 text-xs"
          title={t.timeline.step}
          aria-label={t.timeline.step}
        >
          <StepForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.timeline.step}</span>
        </button>

        {/* Virtual Clock Display */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="tabular-nums font-semibold">{formatTime(virtualTime)}</span>
        </div>

        {/* Speed multiplier selector */}
        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => globalSimulationRuntime.setSpeed(speed)}
              className={`px-1.5 py-0.5 text-[11px] font-mono rounded transition-colors ${
                clockSpeed === speed
                  ? 'bg-slate-700 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Event timeline markers */}
      <div className="hidden lg:flex items-center gap-2 max-w-[450px] overflow-hidden">
        <Activity className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {recentEvents.length === 0 ? (
            <span className="text-xs text-slate-500 italic">{t.timeline.noEvents}</span>
          ) : (
            recentEvents.map((evt) => (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt)}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-cyan-300 text-slate-400 whitespace-nowrap transition-colors"
              >
                {evt.type.replace(/_/g, ' ')}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: Simulation State Status Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <span
            className={`w-2 h-2 rounded-full ${
              clockStatus === 'running'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="uppercase text-[11px] font-semibold tracking-wider">
            {clockStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

