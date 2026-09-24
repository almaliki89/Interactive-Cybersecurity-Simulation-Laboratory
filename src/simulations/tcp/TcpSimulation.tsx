import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  Packet,
  ConnectionLink,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
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
  const setClockStatus = useSimulationStore((s) => s.setClockStatus);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);
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

  // Active packets in motion
  const [packets, setPackets] = useState<Packet[]>([]);
  const [stepPhase, setStepPhase] = useState<number>(0); // 0 = idle, 1 = SYN in flight, 2 = SYN-ACK in flight, 3 = ACK in flight, 4 = connected
  const [retransmitCount, setRetransmitCount] = useState<number>(0);

  // Nodes definition
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

  // Reset simulation
  const handleReset = useCallback(() => {
    setClientState('CLOSED');
    setServerState('CLOSED');
    setPackets([]);
    setStepPhase(0);
    setRetransmitCount(0);
    addLog({
      level: 'INFO',
      source: 'TCP_ENGINE',
      message: 'TCP session reset to initial CLOSED state.',
      category: 'NETWORK',
    });
  }, [addLog]);

  // Start sequence
  const startHandshake = () => {
    handleReset();
    setClientState('SYN_SENT');
    setStepPhase(1);

    addLog({
      level: 'INFO',
      source: 'CLIENT_192.168.1.100',
      message: 'TCP SYN sent: seq=1000, window=65535, mss=1460 to 93.184.216.34:443',
      category: 'NETWORK',
    });

    addEvent({
      type: 'PACKET_SENT',
      description: 'SYN packet generated by client',
      details: { seq: 1000, flags: ['SYN'], src: 'client', dst: 'server' },
    });

    const synPacket: Packet = {
      id: `syn-${Date.now()}`,
      source: 'client',
      destination: 'server',
      protocol: 'TCP',
      sourcePort: 49152,
      destinationPort: 443,
      flags: ['SYN'],
      state: 'moving',
      progress: 0,
      timestamp: Date.now(),
      payload: { seq: 1000, win: 65535 },
    };

    setPackets([synPacket]);
  };

  const packetsRef = useRef<Packet[]>([]);
  packetsRef.current = packets;

  // Animation frame loop for packet transit & state progression
  useEffect(() => {
    if (clockStatus !== 'running') return;

    const interval = setInterval(() => {
      const currentPackets = packetsRef.current;
      if (currentPackets.length === 0) return;

      const actionsToRun: (() => void)[] = [];
      const arrivedPackets: Packet[] = [];
      const nextPackets: Packet[] = [];

      for (const pkt of currentPackets) {
        if (pkt.state === 'delivered' || pkt.state === 'dropped') {
          nextPackets.push(pkt);
          continue;
        }

        // Increment progress based on latency & speed
        const speedFactor = (100 / Math.max(latencyMs, 50)) * clockSpeed * 0.4;
        const nextProgress = pkt.progress + speedFactor * 0.05;

        // Halfway drop check
        if (nextProgress >= 0.5 && pkt.progress < 0.5) {
          const isSynPkt = pkt.flags?.includes('SYN') && !pkt.flags?.includes('ACK');
          const isSynAckPkt = pkt.flags?.includes('SYN') && pkt.flags?.includes('ACK');
          const isAckPkt = pkt.flags?.length === 1 && pkt.flags[0] === 'ACK';

          if (dropSyn && isSynPkt) {
            actionsToRun.push(() => {
              addLog({
                level: 'WARN',
                source: 'NETWORK_LINK',
                message: 'Packet dropped on wire: SYN lost (packet filter/congestion)',
                category: 'NETWORK',
              });
              addEvent({
                type: 'PACKET_DROPPED',
                description: 'SYN packet dropped in transit',
              });
            });
            nextPackets.push({ ...pkt, state: 'dropped' as const, blockedReason: 'PACKET_LOST_IN_TRANSIT' });
            continue;
          }

          if (dropSynAck && isSynAckPkt) {
            actionsToRun.push(() => {
              addLog({
                level: 'WARN',
                source: 'NETWORK_LINK',
                message: 'Packet dropped on wire: SYN-ACK lost in transit',
                category: 'NETWORK',
              });
              addEvent({
                type: 'PACKET_DROPPED',
                description: 'SYN-ACK dropped in transit',
              });
            });
            nextPackets.push({ ...pkt, state: 'dropped' as const, blockedReason: 'SYN_ACK_LOST' });
            continue;
          }

          if (dropAck && isAckPkt) {
            actionsToRun.push(() => {
              addLog({
                level: 'WARN',
                source: 'NETWORK_LINK',
                message: 'Packet dropped on wire: final ACK lost in transit',
                category: 'NETWORK',
              });
            });
            nextPackets.push({ ...pkt, state: 'dropped' as const, blockedReason: 'ACK_LOST' });
            continue;
          }
        }

        // Packet reached destination
        if (nextProgress >= 1.0) {
          arrivedPackets.push(pkt);
          nextPackets.push({ ...pkt, progress: 1.0, state: 'delivered' as const });
          continue;
        }

        nextPackets.push({ ...pkt, progress: nextProgress });
      }

      setPackets(nextPackets.filter((p) => p.progress < 1.05 || p.state === 'delivered'));

      // Run side-effects outside of state updater
      for (const action of actionsToRun) {
        action();
      }

      for (const arrivedPkt of arrivedPackets) {
        handlePacketArrival(arrivedPkt);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [clockStatus, clockSpeed, latencyMs, dropSyn, dropSynAck, dropAck]);

  // Handle packet arrival at peer
  const handlePacketArrival = (pkt: Packet) => {
    // 1. SYN arrived at Server
    if (pkt.flags?.includes('SYN') && !pkt.flags.includes('ACK')) {
      if (!serverOnline) {
        // Send RST
        addLog({
          level: 'ERROR',
          source: 'SERVER_93.184.216.34',
          message: 'Connection refused: Port 443 closed. Returning TCP RST.',
          category: 'NETWORK',
        });
        const rstPacket: Packet = {
          id: `rst-${Date.now()}`,
          source: 'server',
          destination: 'client',
          protocol: 'TCP',
          sourcePort: 443,
          destinationPort: 49152,
          flags: ['RST'],
          state: 'moving',
          progress: 0,
          timestamp: Date.now(),
          payload: { seq: 0, reason: 'CONNECTION_REFUSED' },
        };
        setPackets([rstPacket]);
        return;
      }

      setServerState('SYN_RCVD');
      setStepPhase(2);

      addLog({
        level: 'INFO',
        source: 'SERVER_93.184.216.34',
        message: 'TCP SYN received. Transition to SYN_RCVD. Sending SYN-ACK: seq=5000, ack=1001',
        category: 'NETWORK',
      });

      addEvent({
        type: 'PACKET_SENT',
        description: 'Server replies with SYN-ACK',
        details: { seq: 5000, ack: 1001 },
      });

      const synAckPacket: Packet = {
        id: `synack-${Date.now()}`,
        source: 'server',
        destination: 'client',
        protocol: 'TCP',
        sourcePort: 443,
        destinationPort: 49152,
        flags: ['SYN', 'ACK'],
        state: 'moving',
        progress: 0,
        timestamp: Date.now(),
        payload: { seq: 5000, ack: 1001 },
      };

      setPackets([synAckPacket]);
    }

    // 2. SYN-ACK arrived at Client
    else if (pkt.flags?.includes('SYN') && pkt.flags.includes('ACK')) {
      setClientState('ESTABLISHED');
      setStepPhase(3);

      addLog({
        level: 'INFO',
        source: 'CLIENT_192.168.1.100',
        message: 'SYN-ACK received! Client state = ESTABLISHED. Sending ACK: seq=1001, ack=5001',
        category: 'NETWORK',
      });

      addEvent({
        type: 'PACKET_SENT',
        description: 'Client replies with ACK',
        details: { seq: 1001, ack: 5001 },
      });

      const ackPacket: Packet = {
        id: `ack-${Date.now()}`,
        source: 'client',
        destination: 'server',
        protocol: 'TCP',
        sourcePort: 49152,
        destinationPort: 443,
        flags: ['ACK'],
        state: 'moving',
        progress: 0,
        timestamp: Date.now(),
        payload: { seq: 1001, ack: 5001 },
      };

      setPackets([ackPacket]);
    }

    // 3. ACK arrived at Server
    else if (pkt.flags?.includes('ACK') && !pkt.flags.includes('SYN')) {
      setServerState('ESTABLISHED');
      setStepPhase(4);

      addLog({
        level: 'INFO',
        source: 'SERVER_93.184.216.34',
        message: 'ACK received! Server state = ESTABLISHED. 3-Way Handshake COMPLETE.',
        category: 'NETWORK',
      });

      addEvent({
        type: 'CONNECTION_OPENED',
        description: 'TCP Connection Established Successfully',
      });
    }

    // 4. RST arrived at Client
    else if (pkt.flags?.includes('RST')) {
      setClientState('CLOSED');
      addLog({
        level: 'ERROR',
        source: 'CLIENT_192.168.1.100',
        message: 'Received TCP RST from server. Connection terminated.',
        category: 'NETWORK',
      });
    }
  };

  // Step manually
  const handleStep = () => {
    if (stepPhase === 0) {
      startHandshake();
    } else if (packets.length > 0) {
      // Advance packet by 25%
      setPackets((prev) =>
        prev.map((p) => {
          const next = Math.min(1.0, p.progress + 0.25);
          if (next >= 1.0 && p.progress < 1.0) {
            handlePacketArrival(p);
            return { ...p, progress: 1.0, state: 'delivered' };
          }
          return { ...p, progress: next };
        })
      );
    }
  };

  // Challenge validator
  const validateChallenge = () => {
    if (clientState === 'ESTABLISHED' && serverState === 'ESTABLISHED') {
      return {
        success: true,
        message: t.tcp.valSuccess,
      };
    }
    if (dropSyn) {
      return {
        success: false,
        message: t.tcp.valDropSyn,
      };
    }
    if (dropSynAck) {
      return {
        success: false,
        message: t.tcp.valDropSynAck,
      };
    }
    if (!serverOnline) {
      return {
        success: false,
        message: t.tcp.valOffline,
      };
    }
    return {
      success: false,
      message: t.tcp.valIncomplete,
    };
  };

  return (
    <Workspace
      title={t.tcp.title}
      subtitle={t.tcp.subtitle}
      challenge={tcpChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={handleReset}
      onStep={handleStep}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={startHandshake}
              className="py-1.5 px-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.tcp.startHandshake}</span>
            </button>
            <button
              onClick={handleReset}
              className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              {t.tcp.resetSession}
            </button>
          </div>

          {/* Fault Injections */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={dropSyn}
                onChange={(e) => setDropSyn(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={dropSyn ? 'text-rose-400 font-semibold' : ''}>{t.tcp.dropSyn}</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={dropSynAck}
                onChange={(e) => setDropSynAck(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={dropSynAck ? 'text-rose-400 font-semibold' : ''}>{t.tcp.dropSynAck}</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={!serverOnline}
                onChange={(e) => setServerOnline(!e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <span className={!serverOnline ? 'text-rose-400 font-semibold' : ''}>{t.tcp.serverOffline}</span>
            </label>

            {/* Latency slider */}
            <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1 rounded border border-slate-800">
              <span className="text-[11px] text-slate-400">{t.tcp.latency}</span>
              <input
                type="range"
                min="50"
                max="800"
                step="50"
                value={latencyMs}
                onChange={(e) => setLatencyMs(Number(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="text-[11px] font-mono text-cyan-300 tabular-nums w-12 text-right">
                {latencyMs}ms
              </span>
            </div>
          </div>
        </div>
      }
    >
      {/* Visual State Indicators at Top of Stage */}
      <div className="absolute top-4 left-6 right-6 z-20 flex justify-between pointer-events-none">
        {/* Client FSM state */}
        <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl shadow-lg pointer-events-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t.tcp.clientState}</span>
          <span
            className={`text-xs font-mono font-bold uppercase ${
              clientState === 'ESTABLISHED' ? 'text-emerald-400' : 'text-cyan-400'
            }`}
          >
            {clientState}
          </span>
        </div>

        {/* Protocol Sequence Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className={stepPhase >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>1. SYN</span>
          <span className="text-slate-600">→</span>
          <span className={stepPhase >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>2. SYN-ACK</span>
          <span className="text-slate-600">→</span>
          <span className={stepPhase >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-600'}>3. ACK</span>
          <span className="text-slate-600">→</span>
          <span className={stepPhase >= 4 ? 'text-emerald-400 font-bold' : 'text-slate-600'}>ESTABLISHED</span>
        </div>

        {/* Server FSM state */}
        <div className="bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl shadow-lg pointer-events-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">{t.tcp.serverState}</span>
          <span
            className={`text-xs font-mono font-bold uppercase ${
              serverState === 'ESTABLISHED' ? 'text-emerald-400' : 'text-cyan-400'
            }`}
          >
            {serverState}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <StageCanvas
        nodes={nodes}
        connections={connections}
        packets={packets}
      />
    </Workspace>
  );
};
