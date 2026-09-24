import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  ConnectionLink,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { ScenarioDefinition } from '../../engine/scenario/ScenarioEngine';
import { translations } from '../../i18n/translations';
import {
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const TcpSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const packets = useSimulationStore((s) => s.packets);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  // TCP Finite State Machine states
  type TcpState = 'CLOSED' | 'SYN_SENT' | 'SYN_RCVD' | 'ESTABLISHED' | 'TIMEOUT_RETRY';

  const [clientState, setClientState] = useState<TcpState>('CLOSED');
  const [serverState, setServerState] = useState<TcpState>('CLOSED');

  // Simulation failure injections
  const [dropSyn, setDropSyn] = useState(false);
  const [dropSynAck, setDropSynAck] = useState(false);
  const [dropAck, setDropAck] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [latencyMs, setLatencyMs] = useState(250);

  const [stepPhase, setStepPhase] = useState<number>(0); // 0 = idle, 1 = SYN, 2 = SYN-ACK, 3 = ACK, 4 = connected
  const [retransmitCount, setRetransmitCount] = useState<number>(0);

  // Sync state machine according to virtualTime & events in Runtime
  useEffect(() => {
    const history = globalSimulationRuntime.events.getHistory();
    const hasConnectionOpened = history.some((e) => e.type === 'CONNECTION_OPENED');
    const hasSynAckArrived = history.some((e) => e.type === 'TCP_SYN_ACK_ARRIVED');
    const hasSynArrived = history.some((e) => e.type === 'TCP_SYN_ARRIVED');
    const hasSynSent = history.some((e) => e.type === 'TCP_SYN');

    if (hasConnectionOpened) {
      setClientState('ESTABLISHED');
      setServerState('ESTABLISHED');
      setStepPhase(4);
    } else if (hasSynAckArrived) {
      setClientState('ESTABLISHED');
      setServerState('SYN_RCVD');
      setStepPhase(3);
    } else if (hasSynArrived && serverOnline && !dropSyn) {
      setServerState('SYN_RCVD');
      setStepPhase(2);
    } else if (hasSynSent) {
      setClientState('SYN_SENT');
      setStepPhase(1);
    }
  }, [virtualTime, serverOnline, dropSyn]);

  // Base Nodes definition
  const nodes: SimulationNode[] = [
    {
      id: 'client',
      name: language === 'ar' ? 'محطة عمل العميل' : 'Client Workstation',
      type: 'client',
      ip: '192.168.1.100',
      status: clientState === 'ESTABLISHED' ? 'online' : 'active',
      position: { x: 22, y: 50 },
      services: [{ name: 'Ephemeral TCP', port: 49152, protocol: 'TCP', status: 'running' }],
      metadata: { tcpState: clientState, clientSeq: 1000 },
    },
    {
      id: 'server',
      name: language === 'ar' ? 'خادم الويب الهدف' : 'Web Server',
      type: 'server',
      ip: '93.184.216.34',
      status: !serverOnline ? 'offline' : serverState === 'ESTABLISHED' ? 'online' : 'active',
      position: { x: 78, y: 50 },
      services: [{ name: 'HTTPS Daemon', port: 443, protocol: 'TCP', status: serverOnline ? 'running' : 'stopped' }],
      metadata: { tcpState: serverState, serverSeq: 5000 },
    },
  ];

  const connections: ConnectionLink[] = [
    {
      id: 'conn-client-server',
      source: 'client',
      target: 'server',
      latencyMs,
      status: serverOnline ? 'active' : 'down',
      label: `${language === 'ar' ? 'زمن الذهاب والعودة (RTT)' : 'Round Trip Latency'}: ${latencyMs * 2}ms`,
    },
  ];

  // Challenge Definition
  const tcpChallenge: Challenge = {
    id: 'tcp-handshake-mastery',
    simulationId: 'tcp',
    title: t.tcp.missionTitle,
    difficulty: 'Beginner',
    category: t.tcp.missionCategory,
    mission: t.tcp.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'بروتوكول TCP يعتمد على الاتصال المسبق. قبل نقل أي بيانات ويب أو تشفير، يجب على الطرفين تبادل أرقام التسلسل ومزامنتها بنجاح.'
        : 'TCP is connection-oriented. Before any HTTP or TLS data can transfer, both peers must synchronize sequence numbers and acknowledge receipt.',
    objectives: [
      {
        id: 'obj-client-syn',
        title: t.tcp.objSynSent,
        description: t.tcp.objSynSentDesc,
        isCompleted: stepPhase >= 1,
        validationKey: 'syn_sent',
      },
      {
        id: 'obj-server-synack',
        title: t.tcp.objSynAckRcv,
        description: t.tcp.objSynAckRcvDesc,
        isCompleted: stepPhase >= 2 && !dropSyn,
        validationKey: 'synack_received',
      },
      {
        id: 'obj-established',
        title: t.tcp.objAckEstablished,
        description: t.tcp.objAckEstablishedDesc,
        isCompleted: clientState === 'ESTABLISHED' && serverState === 'ESTABLISHED',
        validationKey: 'established',
      },
    ],
    hints: [t.tcp.hint1, t.tcp.hint2, t.tcp.hint3],
  };

  // Reset simulation using runtime
  const handleReset = () => {
    setClientState('CLOSED');
    setServerState('CLOSED');
    setStepPhase(0);
    setRetransmitCount(0);
    globalSimulationRuntime.reset();
    globalSimulationRuntime.logs.log({
      level: 'INFO',
      source: 'TCP_ENGINE',
      message: 'TCP session reset to initial CLOSED state.',
      category: 'NETWORK',
    });
  };

  // Start sequence via deterministic Runtime scheduling
  const startHandshake = () => {
    handleReset();
    setClientState('SYN_SENT');
    setStepPhase(1);

    const scenario: ScenarioDefinition = {
      id: 'tcp-scenario-handshake',
      titleAr: 'مصافحة TCP',
      titleEn: 'TCP Handshake',
      nodes,
      connections,
      scheduledEvents: [],
      challenge: tcpChallenge,
    };

    globalSimulationRuntime.loadScenario(scenario);

    // 1. Dispatch SYN Event & Create SYN Packet in Runtime
    const synEvt = globalSimulationRuntime.dispatch({
      type: 'TCP_SYN',
      source: 'client',
      target: 'server',
      description: 'TCP SYN sent: seq=1000, window=65535, mss=1460 to 93.184.216.34:443',
      category: 'NETWORK',
      payload: { seq: 1000, win: 65535 },
    });

    const synPkt = globalSimulationRuntime.packets.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      sourcePort: 49152,
      destinationPort: 443,
      flags: ['SYN'],
      payload: { seq: 1000, win: 65535 },
      startVirtualTime: 0,
      durationMs: latencyMs,
    });

    globalSimulationRuntime.logs.log({
      level: 'INFO',
      source: 'CLIENT_192.168.1.100',
      message: 'TCP SYN sent: seq=1000, window=65535 to 93.184.216.34:443',
      category: 'NETWORK',
      relatedEventId: synEvt.id,
      relatedPacketId: synPkt.id,
    });

    // 2. Schedule SYN Arrival at `latencyMs`
    const synArriveTime = latencyMs;
    globalSimulationRuntime.schedule({
      at: synArriveTime,
      type: 'TCP_SYN_ARRIVED',
      source: 'client',
      target: 'server',
      causedByEventId: synEvt.id,
    });

    if (!serverOnline) {
      globalSimulationRuntime.schedule({
        at: synArriveTime,
        type: 'TCP_TIMEOUT',
        description: 'Server offline - SYN packet dropped without response',
        category: 'NETWORK',
      });
      return;
    }

    if (dropSyn) {
      globalSimulationRuntime.schedule({
        at: synArriveTime,
        type: 'PACKET_DROPPED',
        description: 'SIMULATED FAILURE: TCP SYN packet dropped in transit',
        category: 'NETWORK',
      });
      return;
    }

    // 3. Server responds with SYN-ACK at `latencyMs`
    const synAckTime = latencyMs;
    globalSimulationRuntime.schedule({
      at: synAckTime,
      type: 'TCP_SYN_ACK',
      source: 'server',
      target: 'client',
      description: 'TCP SYN-ACK sent: seq=5000, ack=1001 from 93.184.216.34:443',
      category: 'NETWORK',
      causedByEventId: synEvt.id,
    });

    const synAckPkt = globalSimulationRuntime.packets.createPacket({
      source: 'server',
      destination: 'client',
      protocol: 'TCP',
      sourcePort: 443,
      destinationPort: 49152,
      flags: ['SYN', 'ACK'],
      payload: { seq: 5000, ack: 1001 },
      startVirtualTime: synAckTime,
      durationMs: latencyMs,
    });

    // 4. Schedule SYN-ACK Arrival at `2 * latencyMs`
    const synAckArriveTime = 2 * latencyMs;
    globalSimulationRuntime.schedule({
      at: synAckArriveTime,
      type: 'TCP_SYN_ACK_ARRIVED',
      source: 'server',
      target: 'client',
    });

    if (dropSynAck) {
      globalSimulationRuntime.schedule({
        at: synAckArriveTime,
        type: 'PACKET_DROPPED',
        description: 'SIMULATED FAILURE: TCP SYN-ACK packet dropped in transit',
        category: 'NETWORK',
      });
      return;
    }

    // 5. Client sends ACK at `2 * latencyMs`
    const ackTime = 2 * latencyMs;
    globalSimulationRuntime.schedule({
      at: ackTime,
      type: 'TCP_ACK',
      source: 'client',
      target: 'server',
      description: 'TCP ACK sent: seq=1001, ack=5001 to 93.184.216.34:443',
      category: 'NETWORK',
    });

    const ackPkt = globalSimulationRuntime.packets.createPacket({
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      sourcePort: 49152,
      destinationPort: 443,
      flags: ['ACK'],
      payload: { seq: 1001, ack: 5001 },
      startVirtualTime: ackTime,
      durationMs: latencyMs,
    });

    // 6. Schedule ACK Arrival & Connection Opened at `3 * latencyMs`
    const ackArriveTime = 3 * latencyMs;
    globalSimulationRuntime.schedule({
      at: ackArriveTime,
      type: 'TCP_ACK_ARRIVED',
      source: 'client',
      target: 'server',
    });

    if (dropAck) {
      globalSimulationRuntime.schedule({
        at: ackArriveTime,
        type: 'PACKET_DROPPED',
        description: 'SIMULATED FAILURE: Final TCP ACK dropped in transit',
        category: 'NETWORK',
      });
      return;
    }

    globalSimulationRuntime.schedule({
      at: ackArriveTime + 50,
      type: 'CONNECTION_OPENED',
      description: 'TCP 3-Way Handshake successfully established! Stream open.',
      category: 'NETWORK',
    });

    globalSimulationRuntime.start();
  };

  return (
    <Workspace
      title={t.tcp.title}
      subtitle={t.tcp.subtitle}
      domainName={language === 'ar' ? 'البنية التحتية والشبكات' : 'Infrastructure & Networking'}
      challenge={tcpChallenge}
      onValidateChallenge={() => {
        const isSuccess = clientState === 'ESTABLISHED' && serverState === 'ESTABLISHED';
        return {
          success: isSuccess,
          message: isSuccess
            ? language === 'ar'
              ? 'ممتاز! تم إنشاء اتصال TCP ثلاثي الأطراف بنجاح وتزامن أرقام التسلسل.'
              : 'Success! TCP 3-Way Handshake established and sequence numbers synchronized.'
            : language === 'ar'
            ? 'الاتصال غير مكتمل بعد. اضغط على "بدء المصافحة الثلاثية" ومقاطعة الأعطال إذا كانت مفعّلة.'
            : 'Connection incomplete. Click "Start 3-Way Handshake" and ensure no drop flags block packets.',
        };
      }}
      onRestart={handleReset}
      onStep={() => globalSimulationRuntime.step(150)}
      controlDeck={
        <div className="space-y-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={startHandshake}
                disabled={clockStatus === 'running' && stepPhase > 0 && stepPhase < 4}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{t.tcp.startHandshake}</span>
              </button>

              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.tcp.resetSession}</span>
              </button>
            </div>

            {/* Current FSM State Pills */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">{language === 'ar' ? 'حالة العميل' : 'Client'}:</span>
                <span
                  className={`font-bold ${
                    clientState === 'ESTABLISHED'
                      ? 'text-emerald-400'
                      : clientState === 'CLOSED'
                      ? 'text-slate-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {clientState}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500">{language === 'ar' ? 'حالة الخادم' : 'Server'}:</span>
                <span
                  className={`font-bold ${
                    serverState === 'ESTABLISHED'
                      ? 'text-emerald-400'
                      : serverState === 'CLOSED'
                      ? 'text-slate-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {serverState}
                </span>
              </div>
            </div>
          </div>

          {/* Injection & Latency Controls */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Toggle Drop SYN */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300 font-mono text-[11px]">{t.tcp.dropSyn}</span>
              <input
                type="checkbox"
                checked={dropSyn}
                onChange={(e) => setDropSyn(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            {/* Toggle Drop SYN-ACK */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300 font-mono text-[11px]">{t.tcp.dropSynAck}</span>
              <input
                type="checkbox"
                checked={dropSynAck}
                onChange={(e) => setDropSynAck(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            {/* Toggle Drop ACK */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300 font-mono text-[11px]">{language === 'ar' ? 'إسقاط ACK' : 'Drop ACK'}</span>
              <input
                type="checkbox"
                checked={dropAck}
                onChange={(e) => setDropAck(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            {/* Server Online Switch */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800/80 cursor-pointer hover:border-slate-700">
              <span className="text-slate-300 font-mono text-[11px]">{language === 'ar' ? 'الخادم متصل' : 'Server Online'}</span>
              <input
                type="checkbox"
                checked={serverOnline}
                onChange={(e) => setServerOnline(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
              />
            </label>

            {/* Latency Slider */}
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-center">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>{t.tcp.latency}</span>
                <span className="text-cyan-300 font-bold">{latencyMs}ms</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="50"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>
      }
    >
      <StageCanvas
        nodes={nodes}
        connections={connections}
        packets={packets}
        onNodeClick={(node) => selectEntity('node', node.id, node)}
        onPacketClick={(pkt) => selectEntity('packet', pkt.id, pkt)}
      />
    </Workspace>
  );
};
