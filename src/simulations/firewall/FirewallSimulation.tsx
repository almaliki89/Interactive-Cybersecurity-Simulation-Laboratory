import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  Packet,
  ConnectionLink,
  FirewallRule,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { translations } from '../../i18n/translations';
import {
  Shield,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
} from 'lucide-react';

export const FirewallSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const t = translations[language];

  const clockStatus = useSimulationStore((s) => s.clockStatus);
  const clockSpeed = useSimulationStore((s) => s.clockSpeed);
  const addLog = useSimulationStore((s) => s.addLog);
  const addEvent = useSimulationStore((s) => s.addEvent);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  // Firewall Rule Table State (Ordered evaluation: top to bottom)
  const [rules, setRules] = useState<FirewallRule[]>([
    {
      id: 'rule-1',
      order: 1,
      enabled: true,
      name: language === 'ar' ? 'السماح بحركة مرور HTTPS' : 'Allow HTTPS Traffic',
      action: 'ALLOW',
      protocol: 'TCP',
      sourceIp: '0.0.0.0/0',
      destinationPort: 443,
      hitCount: 0,
      description: language === 'ar' ? 'السماح بمرور حركة مرور الويب المشفرة من أي مصدر' : 'Permits encrypted TLS web traffic from anywhere',
    },
    {
      id: 'rule-2',
      order: 2,
      enabled: true,
      name: language === 'ar' ? 'حظر بروتوكول HTTP غير المشفر' : 'Deny Cleartext HTTP',
      action: 'DENY',
      protocol: 'TCP',
      sourceIp: '0.0.0.0/0',
      destinationPort: 80,
      hitCount: 0,
      description: language === 'ar' ? 'حظر الاتصالات غير المشفرة لحماية البيانات' : 'Blocks unencrypted HTTP connections',
    },
    {
      id: 'rule-3',
      order: 3,
      enabled: true,
      name: language === 'ar' ? 'السماح باتصال SSH الداخلي' : 'Allow Internal Admin SSH',
      action: 'ALLOW',
      protocol: 'TCP',
      sourceIp: '10.0.0.0/24',
      destinationPort: 22,
      hitCount: 0,
      description: language === 'ar' ? 'حصر إدارة الخادم عبر SSH على الشبكة الداخلية فقط' : 'Restricted administrative SSH access for intranet only',
    },
    {
      id: 'rule-4',
      order: 4,
      enabled: true,
      name: language === 'ar' ? 'حظر شامل افتراضي (Drop All)' : 'Default Deny All',
      action: 'DROP',
      protocol: 'ANY',
      sourceIp: '0.0.0.0/0',
      destinationPort: 'ANY',
      hitCount: 0,
      description: language === 'ar' ? 'إسقاط أي حزم لا تطابق القواعد السابقة' : 'Implicit perimeter defense drop rule',
    },
  ]);

  // Traffic Generator & Simulator State
  const [trafficRate, setTrafficRate] = useState<'low' | 'med' | 'high'>('med');
  const [autoTraffic, setAutoTraffic] = useState(true);
  const [packets, setPackets] = useState<Packet[]>([]);
  const packetSeqRef = useRef(1);

  // Challenge Definition
  const firewallChallenge: Challenge = {
    id: 'firewall-rule-mastery',
    simulationId: 'firewall',
    title: t.firewall.missionTitle,
    difficulty: 'Intermediate',
    category: t.firewall.missionCategory,
    mission: t.firewall.missionDesc,
    initialExplanation:
      language === 'ar'
        ? 'تفحص جدران الحماية ترويسات الحزم بالتسلسل من الأعلى للأسفل. أول قاعدة تطابق المصدر والبروتوكول والمنفذ يتم تطبيقها فوراً (First-Match).'
        : 'Firewalls inspect packet headers sequentially. The FIRST rule matching source, protocol, and destination port takes immediate effect.',
    objectives: [
      {
        id: 'obj-https-allow',
        title: t.firewall.objAllowHttps,
        description: t.firewall.objAllowHttpsDesc,
        isCompleted: rules.some((r) => r.enabled && r.destinationPort === 443 && r.action === 'ALLOW'),
        validationKey: 'https_rule',
      },
      {
        id: 'obj-http-deny',
        title: t.firewall.objBlockTelnet,
        description: t.firewall.objBlockTelnetDesc,
        isCompleted: rules.some((r) => r.enabled && r.destinationPort === 80 && (r.action === 'DENY' || r.action === 'DROP')),
        validationKey: 'http_blocked',
      },
      {
        id: 'obj-default-deny',
        title: t.firewall.objDefaultDrop,
        description: t.firewall.objDefaultDropDesc,
        isCompleted: rules.some((r) => r.enabled && r.destinationPort === 'ANY' && (r.action === 'DROP' || r.action === 'DENY')),
        validationKey: 'default_deny',
      },
    ],
    hints: [t.firewall.hint1, t.firewall.hint2],
  };

  // Node Topology
  const nodes: SimulationNode[] = [
    {
      id: 'internet',
      name: language === 'ar' ? 'الإنترنت الخارجي' : 'Internet Transit',
      type: 'internet',
      ip: 'WAN / 0.0.0.0/0',
      status: 'online',
      position: { x: 15, y: 50 },
    },
    {
      id: 'firewall',
      name: language === 'ar' ? 'جدار الحماية المحيطي NGFW' : 'Edge Next-Gen Firewall',
      type: 'firewall',
      ip: '198.51.100.1',
      status: 'protected',
      position: { x: 50, y: 50 },
      metadata: { activeRuleCount: rules.filter((r) => r.enabled).length },
    },
    {
      id: 'app_server',
      name: language === 'ar' ? 'خادم الويب والإنتاج' : 'Production Web Server',
      type: 'server',
      ip: '10.0.0.50',
      status: 'online',
      position: { x: 85, y: 50 },
      services: [
        { name: 'HTTPS', port: 443, protocol: 'TCP', status: 'running' },
        { name: 'SSH', port: 22, protocol: 'TCP', status: 'running' },
      ],
    },
  ];

  const connections: ConnectionLink[] = [
    { id: 'c-in-fw', source: 'internet', target: 'firewall', label: language === 'ar' ? 'حركة مرور WAN' : 'Ingress WAN' },
    { id: 'c-fw-srv', source: 'firewall', target: 'app_server', label: language === 'ar' ? 'المنطقة المعزولة DMZ' : 'Protected DMZ' },
  ];

  const packetsRef = useRef<Packet[]>([]);
  packetsRef.current = packets;

  const rulesRef = useRef<FirewallRule[]>([]);
  rulesRef.current = rules;

  // Evaluate packet against ordered rules (pure function without setState)
  const evaluatePacket = (
    pkt: Packet,
    ruleList: FirewallRule[]
  ): { rule: FirewallRule | null; action: 'ALLOW' | 'DENY' | 'DROP' } => {
    for (const rule of ruleList) {
      if (!rule.enabled) continue;

      const protoMatch = rule.protocol === 'ANY' || rule.protocol === pkt.protocol;
      const portMatch = rule.destinationPort === 'ANY' || rule.destinationPort === pkt.destinationPort;

      let ipMatch = false;
      if (rule.sourceIp === '0.0.0.0/0') {
        ipMatch = true;
      } else if (rule.sourceIp.startsWith('10.0.0') && pkt.source.startsWith('10.0.0')) {
        ipMatch = true;
      } else if (rule.sourceIp === pkt.source) {
        ipMatch = true;
      }

      if (protoMatch && portMatch && ipMatch) {
        return { rule, action: rule.action };
      }
    }
    return { rule: null, action: 'DROP' };
  };

  // Inject a single test packet
  const injectPacket = (port: number, protocol: 'TCP' | 'UDP' = 'TCP', srcIp = '203.0.113.55') => {
    const newPkt: Packet = {
      id: `pkt-${packetSeqRef.current++}`,
      source: 'internet',
      destination: 'app_server',
      protocol,
      sourcePort: Math.floor(40000 + Math.random() * 20000),
      destinationPort: port,
      state: 'moving',
      progress: 0,
      timestamp: Date.now(),
      payload: { srcIp, targetPort: port },
    };

    setPackets((prev) => [...prev.slice(-20), newPkt]);
    addLog({
      level: 'INFO',
      source: 'TRAFFIC_GEN',
      message: `Inbound packet from ${srcIp} targeting port ${port}/${protocol}`,
      category: 'NETWORK',
    });
  };

  // Continuous traffic generator
  useEffect(() => {
    if (!autoTraffic || clockStatus !== 'running') return;

    const intervalMs = trafficRate === 'low' ? 1200 : trafficRate === 'med' ? 600 : 250;
    const interval = setInterval(() => {
      // Pick common test ports: 443 (HTTPS), 80 (HTTP), 22 (SSH), 23 (Telnet), 445 (SMB)
      const testCases = [
        { port: 443, src: '198.51.100.80' },
        { port: 80, src: '198.51.100.90' },
        { port: 443, src: '198.51.100.85' },
        { port: 23, src: '203.0.113.100' },
        { port: 22, src: '10.0.0.15' }, // internal admin
        { port: 22, src: '203.0.113.200' }, // external attacker ssh
        { port: 445, src: '203.0.113.77' }, // SMB probe
      ];
      const selected = testCases[Math.floor(Math.random() * testCases.length)];
      injectPacket(selected.port, 'TCP', selected.src);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoTraffic, trafficRate, clockStatus]);

  // Motion & Firewall evaluation loop
  useEffect(() => {
    if (clockStatus !== 'running') return;

    const interval = setInterval(() => {
      const currentPackets = packetsRef.current;
      if (currentPackets.length === 0) return;

      const actionsToRun: (() => void)[] = [];
      const hitIncrements: Record<string, number> = {};
      const nextPackets: Packet[] = [];

      for (const pkt of currentPackets) {
        if (pkt.state === 'delivered' || pkt.state === 'dropped' || pkt.state === 'blocked') {
          nextPackets.push(pkt);
          continue;
        }

        const nextProgress = pkt.progress + 0.03 * clockSpeed;

        // When packet reaches firewall (progress = 0.5)
        if (nextProgress >= 0.5 && pkt.progress < 0.5) {
          const { rule, action } = evaluatePacket(pkt, rulesRef.current);

          if (rule) {
            hitIncrements[rule.id] = (hitIncrements[rule.id] || 0) + 1;
          }

          if (action === 'ALLOW') {
            actionsToRun.push(() => {
              addLog({
                level: 'INFO',
                source: 'FIREWALL_ACL',
                message: `PERMIT: Port ${pkt.destinationPort} allowed by Rule #${rule?.order} ('${rule?.name}')`,
                category: 'FIREWALL',
              });
            });
            nextPackets.push({ ...pkt, progress: nextProgress });
            continue;
          } else if (action === 'DENY') {
            actionsToRun.push(() => {
              addLog({
                level: 'WARN',
                source: 'FIREWALL_ACL',
                message: `DENIED: Port ${pkt.destinationPort} rejected by Rule #${rule?.order} ('${rule?.name}') - sending TCP RST`,
                category: 'FIREWALL',
              });
              addEvent({
                type: 'FIREWALL_BLOCKED',
                description: `Traffic to port ${pkt.destinationPort} denied`,
              });
            });
            nextPackets.push({
              ...pkt,
              progress: 0.5,
              state: 'blocked' as const,
              blockedReason: `DENIED (Rule #${rule?.order})`,
            });
            continue;
          } else {
            // DROP
            actionsToRun.push(() => {
              addLog({
                level: 'WARN',
                source: 'FIREWALL_ACL',
                message: `DROPPED: Silent discard on port ${pkt.destinationPort} by Rule #${rule?.order || 'Default'}`,
                category: 'FIREWALL',
              });
            });
            nextPackets.push({
              ...pkt,
              progress: 0.5,
              state: 'dropped' as const,
              blockedReason: `DROPPED (Rule #${rule?.order || 'Default'})`,
            });
            continue;
          }
        }

        if (nextProgress >= 1.0) {
          nextPackets.push({ ...pkt, progress: 1.0, state: 'delivered' as const });
          continue;
        }

        nextPackets.push({ ...pkt, progress: nextProgress });
      }

      setPackets(nextPackets.filter((p) => p.progress <= 1.05 || p.state === 'delivered'));

      // If any rules recorded hits, update them outside the loop
      if (Object.keys(hitIncrements).length > 0) {
        setRules((prev) =>
          prev.map((r) =>
            hitIncrements[r.id] ? { ...r, hitCount: r.hitCount + hitIncrements[r.id] } : r
          )
        );
      }

      // Execute side-effect logs and events outside of any state updater
      for (const action of actionsToRun) {
        action();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [clockStatus, clockSpeed]);

  // Rule management helpers
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleMoveRule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rules.length) return;

    const newRules = [...rules];
    const [moved] = newRules.splice(index, 1);
    newRules.splice(targetIndex, 0, moved);

    // Reassign order
    const updated = newRules.map((r, idx) => ({ ...r, order: idx + 1 }));
    setRules(updated);
    addLog({
      level: 'INFO',
      source: 'FIREWALL_CONFIG',
      message: `Reordered rules: '${moved.name}' moved to position #${targetIndex + 1}`,
      category: 'FIREWALL',
    });
  };

  const handleDeleteRule = (id: string) => {
    const filtered = rules
      .filter((r) => r.id !== id)
      .map((r, idx) => ({ ...r, order: idx + 1 }));
    setRules(filtered);
  };

  const handleAddRule = () => {
    const newRule: FirewallRule = {
      id: `rule-${Date.now()}`,
      order: rules.length + 1,
      enabled: true,
      name: 'Custom Permit Rule',
      action: 'ALLOW',
      protocol: 'TCP',
      sourceIp: '0.0.0.0/0',
      destinationPort: 8080,
      hitCount: 0,
      description: 'Custom operator-defined rule',
    };
    setRules([...rules, newRule]);
  };

  const validateChallenge = () => {
    // 1. Must allow port 443
    const hasHttps = rules.some((r) => r.enabled && r.destinationPort === 443 && r.action === 'ALLOW');
    // 2. Must deny port 80
    const hasHttpDeny = rules.some(
      (r) => r.enabled && r.destinationPort === 80 && (r.action === 'DENY' || r.action === 'DROP')
    );
    // 3. Must have default drop at end
    const hasDefaultDeny = rules.some(
      (r) => r.enabled && r.destinationPort === 'ANY' && (r.action === 'DROP' || r.action === 'DENY')
    );

    if (hasHttps && hasHttpDeny && hasDefaultDeny) {
      return {
        success: true,
        message: 'Excellent configuration! HTTPS is secured, unencrypted HTTP is denied, and perimeter default drop protects unauthorized ports.',
      };
    }

    if (!hasHttps) {
      return {
        success: false,
        message: 'HTTPS (Port 443) is not enabled for ALLOW.',
      };
    }
    if (!hasHttpDeny) {
      return {
        success: false,
        message: t.firewall.valFailed,
      };
    }
    return {
      success: false,
      message: t.firewall.valFailed,
    };
  };

  return (
    <Workspace
      title={t.firewall.title}
      subtitle={t.firewall.subtitle}
      challenge={firewallChallenge}
      onValidateChallenge={validateChallenge}
      onRestart={() => {
        setPackets([]);
        setRules((prev) => prev.map((r) => ({ ...r, hitCount: 0 })));
      }}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Quick Packet Injection Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">{t.firewall.injectPacket}</span>
            <button
              onClick={() => injectPacket(443, 'TCP')}
              className="py-1 px-2.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 hover:bg-emerald-900/60 text-xs font-mono transition-colors"
            >
              + HTTPS (443)
            </button>
            <button
              onClick={() => injectPacket(80, 'TCP')}
              className="py-1 px-2.5 rounded bg-amber-950/60 border border-amber-700 text-amber-300 hover:bg-amber-900/60 text-xs font-mono transition-colors"
            >
              + HTTP (80)
            </button>
            <button
              onClick={() => injectPacket(22, 'TCP', '10.0.0.12')}
              className="py-1 px-2.5 rounded bg-indigo-950/60 border border-indigo-700 text-indigo-300 hover:bg-indigo-900/60 text-xs font-mono transition-colors"
            >
              + SSH (22)
            </button>
            <button
              onClick={() => injectPacket(23, 'TCP', '203.0.113.8')}
              className="py-1 px-2.5 rounded bg-rose-950/60 border border-rose-700 text-rose-300 hover:bg-rose-900/60 text-xs font-mono transition-colors"
            >
              + Telnet (23) {language === 'ar' ? 'هجوم' : 'Attack'}
            </button>
          </div>

          {/* Traffic generator toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950/60 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={autoTraffic}
                onChange={(e) => setAutoTraffic(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>{t.firewall.continuousTraffic}</span>
            </label>

            <button
              onClick={handleAddRule}
              className="py-1 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.firewall.addRule}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Half: Live Stage Topology */}
        <div className="h-56 shrink-0 relative border-b border-slate-800/80">
          <StageCanvas
            nodes={nodes}
            connections={connections}
            packets={packets}
          />
        </div>

        {/* Bottom Half: Interactive Rule Table */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                {t.firewall.ruleTableTitle}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {t.firewall.evaluatedOrder}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl bg-slate-900/40">
            <table className="w-full text-left rtl:text-right border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3 w-12 text-center">{t.firewall.order}</th>
                  <th className="py-2.5 px-3 w-16">{t.firewall.active}</th>
                  <th className="py-2.5 px-3">{t.firewall.ruleName}</th>
                  <th className="py-2.5 px-3 w-24">{t.firewall.action}</th>
                  <th className="py-2.5 px-3 w-20">{t.firewall.protocol}</th>
                  <th className="py-2.5 px-3 w-32">{t.firewall.sourceIp}</th>
                  <th className="py-2.5 px-3 w-24">{t.firewall.port}</th>
                  <th className="py-2.5 px-3 w-20 text-center">{t.firewall.hits}</th>
                  <th className="py-2.5 px-3 w-28 text-right rtl:text-left">{t.firewall.reorder}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {rules.map((rule, idx) => {
                  return (
                    <tr
                      key={rule.id}
                      onClick={() => selectEntity('rule', rule.id, rule)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                        !rule.enabled ? 'opacity-40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-bold text-slate-400">
                        #{rule.order}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleRule(rule.id);
                          }}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-white truncate max-w-[180px]">
                        {rule.name}
                      </td>
                      <td className="py-2 px-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            rule.action === 'ALLOW'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : rule.action === 'DENY'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {rule.action}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{rule.protocol}</td>
                      <td className="py-2 px-3 text-slate-400">{rule.sourceIp}</td>
                      <td className="py-2 px-3 text-cyan-300 font-semibold">
                        {rule.destinationPort}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-300 tabular-nums">
                        {rule.hitCount}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveRule(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveRule(idx, 'down');
                            }}
                            disabled={idx === rules.length - 1}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRule(rule.id);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-rose-400 hover:text-rose-300"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
