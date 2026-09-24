import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  SimulationNode,
  Packet,
  FirewallRule,
  LogEntry,
  SimulationEvent,
} from '../../types/simulation';
import {
  X,
  Shield,
  Layers,
  Terminal,
  Activity,
  Server,
  Zap,
  Trash2,
  Play,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Info,
  Eye,
  HelpCircle,
  Network,
  Lock,
  Workflow,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Inspector: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const selectedEntity = useSimulationStore((s) => s.selectedEntity);
  const clearSelection = useSimulationStore((s) => s.clearSelection);
  const updatePacket = useSimulationStore((s) => s.updatePacket);
  const updateNode = useSimulationStore((s) => s.updateNode);
  const addLog = useSimulationStore((s) => s.addLog);
  const followedPacketId = useSimulationStore((s) => s.followedPacketId);
  const setFollowedPacketId = useSimulationStore((s) => s.setFollowedPacketId);
  const setTracedEventId = useSimulationStore((s) => s.setTracedEventId);
  const setExplanation = useSimulationStore((s) => s.setExplanation);
  const inspectorActiveTab = useSimulationStore((s) => s.inspectorActiveTab);
  const setInspectorActiveTab = useSimulationStore((s) => s.setInspectorActiveTab);

  const [depthMode, setDepthMode] = useState<'standard' | 'advanced'>('standard');
  const [copied, setCopied] = useState(false);

  if (!selectedEntity) {
    return (
      <aside className="w-80 lg:w-96 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 bg-slate-950/95 flex flex-col p-4 text-slate-400 select-none overflow-y-auto">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{t.workspace.inspector}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">{t.workspace.nothingSelected}</p>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[220px]">
              {language === 'ar'
                ? 'انقر فوق أي حزمة، عقدة، قاعدة جدار حماية، أو سجل أمني لفحصه وتشريح ترويساته.'
                : 'Click any packet, node, firewall rule, or log to inspect headers and state.'}
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedEntity.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isFollowed = selectedEntity.type === 'packet' && followedPacketId === selectedEntity.id;

  return (
    <aside className="w-80 lg:w-96 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 bg-slate-950/95 flex flex-col text-slate-300 select-none overflow-hidden z-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 shrink-0">
            {selectedEntity.type}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white truncate">
            {selectedEntity.data.name || selectedEntity.data.id || selectedEntity.data.label || selectedEntity.type}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Depth mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setDepthMode('standard')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                depthMode === 'standard' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.workspace.basicMode}
            </button>
            <button
              onClick={() => setDepthMode('advanced')}
              className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                depthMode === 'advanced' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.workspace.rawMode}
            </button>
          </div>

          <button
            onClick={clearSelection}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Signature Inspector Tabs */}
      <div className="flex items-center gap-1 px-4 py-1.5 border-b border-slate-800/80 bg-slate-950 overflow-x-auto no-scrollbar">
        {(['overview', 'rules', 'connections', 'events', 'logs', 'security'] as const).map((tab) => {
          const isSelected = inspectorActiveTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setInspectorActiveTab(tab)}
              className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors whitespace-nowrap ${
                isSelected
                  ? 'bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-800/80'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {depthMode === 'advanced' ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">RAW_STATE_DUMP</span>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? t.workspace.copied : t.workspace.copyJson}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
              {JSON.stringify(selectedEntity.data, null, 2)}
            </pre>
          </div>
        ) : (
          <>
            {/* Packet Inspector */}
            {selectedEntity.type === 'packet' && (
              <PacketInspectorContent
                packet={selectedEntity.data as Packet}
                isFollowed={isFollowed}
                t={t}
                language={language}
                onToggleFollow={() => setFollowedPacketId(isFollowed ? null : selectedEntity.id)}
                onExplainWhy={() => {
                  const p = selectedEntity.data as Packet;
                  setExplanation({
                    title: language === 'ar' ? `تحليل قرار الحزمة ${p.protocol}:${p.destinationPort}` : `Decision Analysis for ${p.protocol}:${p.destinationPort}`,
                    reason: p.blockedReason
                      ? (language === 'ar' ? `تم إسقاط الحزمة بسبب: ${p.blockedReason}` : `Packet dropped: ${p.blockedReason}`)
                      : (language === 'ar' ? 'الحزمة تسير في مسارها المصرح به وفق سياسات التوجيه' : 'Packet proceeding along authorized routing flow'),
                    ruleOrCause: p.blockedReason || `${p.protocol} ALLOWED`,
                  });
                }}
                onDrop={() => {
                  updatePacket(selectedEntity.id, {
                    state: 'dropped',
                    blockedReason: 'MANUAL_DROP_INSPECTOR',
                  });
                  addLog({
                    level: 'WARN',
                    source: 'INSPECTOR',
                    message: `Operator manually dropped packet ${selectedEntity.id}`,
                    category: 'NETWORK',
                  });
                }}
              />
            )}

            {/* Node Inspector */}
            {selectedEntity.type === 'node' && (
              <NodeInspectorContent
                node={selectedEntity.data as SimulationNode}
                t={t}
                language={language}
                onToggleStatus={(newStatus) => {
                  updateNode(selectedEntity.id, { status: newStatus });
                  addLog({
                    level: 'INFO',
                    source: 'ORCHESTRATOR',
                    message: `Node ${selectedEntity.data.name} status switched to ${newStatus}`,
                    category: 'SYSTEM',
                  });
                }}
              />
            )}

            {/* Firewall Rule Inspector */}
            {selectedEntity.type === 'rule' && (
              <RuleInspectorContent rule={selectedEntity.data as FirewallRule} t={t} />
            )}

            {/* Event / Log Inspector */}
            {(selectedEntity.type === 'log' || selectedEntity.type === 'event') && (
              <EventLogInspectorContent
                item={selectedEntity.data}
                type={selectedEntity.type}
                t={t}
                language={language}
                onTrace={() => setTracedEventId(selectedEntity.id)}
              />
            )}

            {/* Concept / World Inspector */}
            {(selectedEntity.type === 'world' || selectedEntity.type === 'concept') && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-cyan-300 block">
                    {selectedEntity.data.nameAr || selectedEntity.data.nameEn || selectedEntity.data.titleAr}
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {selectedEntity.data.briefAr || selectedEntity.data.briefEn || selectedEntity.data.descriptionAr}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

// Sub-component: Packet Details
function PacketInspectorContent({
  packet,
  isFollowed,
  t,
  language,
  onToggleFollow,
  onExplainWhy,
  onDrop,
}: {
  packet: Packet;
  isFollowed: boolean;
  t: any;
  language: string;
  onToggleFollow: () => void;
  onExplainWhy: () => void;
  onDrop: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* State & WHY Button Callout */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between ${
          packet.state === 'blocked' || packet.state === 'dropped'
            ? 'bg-rose-950/40 border-rose-800 text-rose-300'
            : 'bg-cyan-950/30 border-cyan-800 text-cyan-300'
        }`}
      >
        <div>
          <span className="text-[10px] font-mono uppercase text-slate-400 block">{t.workspace.packetState}</span>
          <span className="text-sm font-bold uppercase tracking-wider">{packet.state}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onExplainWhy}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs"
            title="Deterministic Decision Explanation"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{language === 'ar' ? 'لماذا؟ (WHY)' : 'WHY?'}</span>
          </button>

          <button
            onClick={onToggleFollow}
            className={`px-2 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs border ${
              isFollowed
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>{isFollowed ? (language === 'ar' ? 'قيد التتبع' : 'Tracking') : (language === 'ar' ? 'تتبع' : 'Follow')}</span>
          </button>
        </div>
      </div>

      {/* Layer 3 / 4 Network Headers */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
        <span className="text-xs font-semibold text-slate-400 block border-b border-slate-800 pb-1">
          {t.workspace.headersTitle}
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.protocol}</span>
            <span className="font-mono font-semibold text-white">{packet.protocol}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.progress}</span>
            <span className="font-mono text-cyan-400">{Math.round(packet.progress * 100)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.srcPort}</span>
            <span className="font-mono text-slate-300">{packet.sourcePort}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.destPort}</span>
            <span className="font-mono text-amber-400 font-semibold">{packet.destinationPort}</span>
          </div>
        </div>

        {packet.flags && packet.flags.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/60">
            <span className="text-slate-500 block text-[10px] mb-1">{t.workspace.flags}</span>
            <div className="flex flex-wrap gap-1">
              {packet.flags.map((flag) => (
                <span
                  key={flag}
                  className="px-1.5 py-0.5 rounded bg-cyan-900/50 border border-cyan-700 text-cyan-200 text-[11px] font-mono font-bold"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payload Display */}
      {packet.payload && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            {t.workspace.payload}
          </span>
          <pre className="text-xs font-mono text-emerald-400 p-2 bg-slate-950 rounded-lg border border-slate-800/80 overflow-x-auto">
            {typeof packet.payload === 'object'
              ? JSON.stringify(packet.payload, null, 2)
              : String(packet.payload)}
          </pre>
        </div>
      )}

      {/* Manual Actions */}
      <div className="pt-2">
        <button
          onClick={onDrop}
          disabled={packet.state === 'dropped' || packet.state === 'blocked'}
          className="w-full py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-700/80 text-rose-300 hover:bg-rose-900/60 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.workspace.dropPacketBtn}</span>
        </button>
      </div>
    </div>
  );
}

// Sub-component: Node Details
function NodeInspectorContent({
  node,
  t,
  language,
  onToggleStatus,
}: {
  node: SimulationNode;
  t: any;
  language: string;
  onToggleStatus: (status: any) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Node Identity */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
        <span className="text-xs font-semibold text-slate-400 block border-b border-slate-800 pb-1">
          {t.workspace.nodeIdentity}
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.nodeName}</span>
            <span className="font-semibold text-white">{node.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.nodeType}</span>
            <span className="font-mono text-slate-300 capitalize">{node.type}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.ipAddress}</span>
            <span className="font-mono text-cyan-300">{node.ip}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.workspace.nodeStatus}</span>
            <span className="font-semibold uppercase text-emerald-400">{node.status}</span>
          </div>
        </div>
      </div>

      {/* Services List */}
      {node.services && node.services.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            {t.workspace.activeServices}
          </span>
          <div className="space-y-1.5">
            {node.services.map((svc) => (
              <div
                key={svc.name + svc.port}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-medium">{svc.name}</span>
                </div>
                <span className="text-slate-400">
                  {svc.protocol}/{svc.port}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-semibold text-slate-400 block">{t.workspace.actions}</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onToggleStatus(node.status === 'online' ? 'warning' : 'online')}
            className="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {node.status === 'warning' ? t.workspace.clearWarning : t.workspace.simulateDegraded}
          </button>
          <button
            onClick={() => onToggleStatus(node.status === 'isolated' ? 'online' : 'isolated')}
            className="py-1.5 px-2 rounded-xl bg-rose-950/30 border border-rose-800 text-rose-300 hover:bg-rose-900/50 hover:text-white text-xs transition-colors"
          >
            {node.status === 'isolated' ? t.workspace.reattachHost : t.workspace.isolateHost}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Rule Details
function RuleInspectorContent({ rule, t }: { rule: FirewallRule; t: any }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
        <span className="text-xs font-semibold text-slate-400 block border-b border-slate-800 pb-1">
          {rule.name} (#{rule.order})
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">{t.firewall.action}</span>
            <span
              className={`font-bold font-mono ${
                rule.action === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {rule.action}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.firewall.protocol}</span>
            <span className="font-mono text-slate-300">{rule.protocol}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.firewall.sourceIp}</span>
            <span className="font-mono text-slate-300">{rule.sourceIp}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">{t.firewall.port}</span>
            <span className="font-mono text-amber-400 font-semibold">{rule.destinationPort}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[10px]">{t.firewall.hits}</span>
            <span className="font-mono text-cyan-300 font-bold">{rule.hitCount}</span>
          </div>
        </div>
      </div>
      {rule.description && (
        <p className="text-xs text-slate-400 italic bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/60">
          {rule.description}
        </p>
      )}
    </div>
  );
}

// Sub-component: Event / Log Details
function EventLogInspectorContent({
  item,
  type,
  t,
  language,
  onTrace,
}: {
  item: any;
  type: string;
  t: any;
  language: string;
  onTrace: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-400 uppercase font-mono">{type} RECORD</span>
          <button
            onClick={onTrace}
            className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-purple-900/60 transition-colors"
          >
            <Workflow className="w-3 h-3" />
            <span>{language === 'ar' ? 'تتبع المسار السببي' : 'Trace Causal Path'}</span>
          </button>
        </div>
        <p className="text-xs font-mono text-white bg-slate-950 p-2 rounded-lg border border-slate-800">
          {item.message || item.description}
        </p>
      </div>
      {item.details && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Metadata / Context</span>
          <pre className="text-xs font-mono text-cyan-300 p-2 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto">
            {JSON.stringify(item.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
