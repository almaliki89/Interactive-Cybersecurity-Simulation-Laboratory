import React, { useMemo, useState } from 'react';
import { useThreatHuntingStore } from '../runtime/threatHuntingStore';
import { ThreatCorrelationEngine } from '../logic/correlationEngine';
import { GitCommit, Network, Clock, User, Laptop, Globe, Cpu, ArrowRight, Share2 } from 'lucide-react';
import { EntityReference } from '../logic/types';

interface CorrelationWorkspaceProps {
  language: 'ar' | 'en';
}

export const CorrelationWorkspace: React.FC<CorrelationWorkspaceProps> = ({ language }) => {
  const telemetryEvents = useThreatHuntingStore((s) => s.telemetryEvents);
  const selectEvent = useThreatHuntingStore((s) => s.selectEvent);
  const selectEntity = useThreatHuntingStore((s) => s.selectEntity);
  const selectedEntity = useThreatHuntingStore((s) => s.selectedEntity);
  const isAr = language === 'ar';

  const [activeView, setActiveView] = useState<'STORYLINE' | 'GRAPH'>('STORYLINE');

  // Compute clusters
  const clusters = useMemo(() => {
    return ThreatCorrelationEngine.correlateEvents(telemetryEvents, 600);
  }, [telemetryEvents]);

  // Compute entity graph
  const graph = useMemo(() => {
    return ThreatCorrelationEngine.buildEntityGraph(telemetryEvents);
  }, [telemetryEvents]);

  // Pivot summary if entity selected
  const entitySummary = useMemo(() => {
    if (!selectedEntity) return null;
    return ThreatCorrelationEngine.pivotEntity(selectedEntity, telemetryEvents);
  }, [selectedEntity, telemetryEvents]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 select-none overflow-hidden">
      {/* Top Bar Switcher */}
      <div className="p-3 border-b border-slate-900 bg-slate-900/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('STORYLINE')}
            data-testid="tab-corr-storyline"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'STORYLINE' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? 'الجدول الزمني المترابط' : 'Correlated Storyline'}</span>
          </button>
          <button
            onClick={() => setActiveView('GRAPH')}
            data-testid="tab-corr-graph"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeView === 'GRAPH' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>{isAr ? 'مخطط علاقات الكيانات' : 'Entity Relationship Graph'}</span>
          </button>
        </div>

        {selectedEntity && (
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400">{isAr ? 'تفرع الكيان النشط:' : 'Active Pivot:'}</span>
            <span className="font-bold text-cyan-400 font-mono" dir="ltr">
              {selectedEntity.type}: {selectedEntity.value}
            </span>
            <button
              onClick={() => selectEntity(null)}
              className="text-slate-500 hover:text-white ml-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedEntity && entitySummary && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-cyan-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isAr ? 'نتائج التفرع للكيان' : 'Entity Pivot Analysis'}
                </h3>
              </div>
              <span className="text-xs font-mono text-cyan-300 tabular-nums" dir="ltr">
                {entitySummary.totalEvents} {isAr ? 'أحداث مرتبطة' : 'linked events'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400">{isAr ? 'الكيانات المتصلة:' : 'Connected Entities:'}</span>
              {entitySummary.associatedEntities.map((ent, idx) => (
                <button
                  key={idx}
                  onClick={() => selectEntity(ent)}
                  className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 font-mono text-[11px] transition-colors"
                  dir="ltr"
                >
                  {ent.type}:{ent.value}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeView === 'STORYLINE' ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {clusters.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                {isAr ? 'لا توجد تجمعات سلوكية مترابطة في السجلات الحالية' : 'No correlated behavioral clusters found'}
              </div>
            ) : (
              clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white tracking-tight">
                        {isAr ? cluster.titleAr : cluster.titleEn}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          cluster.strength === 'STRONG'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {cluster.strength}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400" dir="ltr">
                        +{cluster.timeSpanVirtual.start}s → +{cluster.timeSpanVirtual.end}s
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? cluster.narrativeAr : cluster.narrativeEn}
                  </p>

                  {/* Common Entities Tags */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    {cluster.commonEntities.user && (
                      <button
                        onClick={() => selectEntity({ type: 'USER', value: cluster.commonEntities.user! })}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 font-mono transition-colors"
                        dir="ltr"
                      >
                        user: {cluster.commonEntities.user}
                      </button>
                    )}
                    {cluster.commonEntities.host && (
                      <button
                        onClick={() => selectEntity({ type: 'HOST', value: cluster.commonEntities.host! })}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 font-mono transition-colors"
                        dir="ltr"
                      >
                        host: {cluster.commonEntities.host}
                      </button>
                    )}
                    {cluster.commonEntities.sourceIp && (
                      <button
                        onClick={() => selectEntity({ type: 'IP', value: cluster.commonEntities.sourceIp! })}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-cyan-300 font-mono transition-colors"
                        dir="ltr"
                      >
                        ip: {cluster.commonEntities.sourceIp}
                      </button>
                    )}
                  </div>

                  {/* Sequential Event Nodes */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    {cluster.events.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => selectEvent(evt.id)}
                        className="p-2 rounded bg-slate-950/70 border border-slate-900 hover:border-slate-800 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-slate-500 text-[10px]" dir="ltr">
                            +{evt.virtualTime}s
                          </span>
                          <span className="text-cyan-400 font-bold text-[11px]" dir="ltr">
                            {evt.sourceWorld}
                          </span>
                          <span className="text-slate-300 text-[11px] truncate" dir="ltr">
                            {evt.eventType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate" dir="ltr">
                          {evt.user || evt.host || evt.sourceIp || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Visual Entity Graph */
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {graph.nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => selectEntity({ type: node.type, value: node.label })}
                  data-testid={`entity-node-${node.id}`}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {node.type === 'USER' && <User className="w-4 h-4 text-cyan-400 shrink-0" />}
                    {node.type === 'HOST' && <Laptop className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {node.type === 'IP' && <Globe className="w-4 h-4 text-amber-400 shrink-0" />}
                    {node.type === 'PROCESS' && <Cpu className="w-4 h-4 text-purple-400 shrink-0" />}
                    {node.type === 'RESOURCE' && <GitCommit className="w-4 h-4 text-rose-400 shrink-0" />}
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate font-mono" dir="ltr">
                        {node.label}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{node.type}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 tabular-nums px-2 py-0.5 rounded bg-slate-950 border border-slate-800" dir="ltr">
                    {node.eventCount} evt
                  </span>
                </div>
              ))}
            </div>

            {/* Edges List */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-2">
              <h4 className="text-xs font-semibold text-slate-300">
                {isAr ? 'روابط العلاقات المستنتجة:' : 'Derived Graph Relationships:'}
              </h4>
              <div className="space-y-1 text-xs font-mono">
                {graph.edges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-slate-400" dir="ltr">
                    <span className="text-cyan-300">{edge.source}</span>
                    <span className="text-slate-600">--[{edge.relationship}]--&gt;</span>
                    <span className="text-emerald-300">{edge.target}</span>
                    <span className="text-slate-500 text-[10px]">({edge.eventIds.length} events)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
