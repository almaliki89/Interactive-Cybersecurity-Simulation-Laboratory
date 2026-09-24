import React, { useState, useEffect } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { StageCanvas } from '../../components/simulation/StageCanvas';
import {
  SimulationNode,
  ConnectionLink,
  FirewallRule,
  Challenge,
} from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import { globalSimulationRuntime } from '../../engine/runtime/SimulationRuntime';
import { Rule } from '../../engine/rules/RuleEngine';
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
  const virtualTime = useSimulationStore((s) => s.virtualTime);
  const packets = useSimulationStore((s) => s.packets);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  // Default Firewall Rules
  const initialRules: Rule[] = [
    {
      id: 'rule-1',
      order: 1,
      enabled: true,
      name: language === 'ar' ? 'السماح بحركة مرور HTTPS' : 'Allow HTTPS Traffic',
      action: 'ALLOW',
      hitCount: 0,
      description: language === 'ar' ? 'السماح بمرور حركة مرور الويب المشفرة من أي مصدر' : 'Permits encrypted TLS web traffic from anywhere',
      matches: (ctx) => ctx.destinationPort === 443 || ctx.destinationPort === '443',
    },
    {
      id: 'rule-2',
      order: 2,
      enabled: true,
      name: language === 'ar' ? 'حظر بروتوكول HTTP غير المشفر' : 'Deny Cleartext HTTP',
      action: 'DENY',
      hitCount: 0,
      description: language === 'ar' ? 'حظر الاتصالات غير المشفرة لحماية البيانات' : 'Blocks unencrypted HTTP connections',
      matches: (ctx) => ctx.destinationPort === 80 || ctx.destinationPort === '80',
    },
    {
      id: 'rule-3',
      order: 3,
      enabled: true,
      name: language === 'ar' ? 'السماح باتصال SSH الداخلي' : 'Allow Internal Admin SSH',
      action: 'ALLOW',
      hitCount: 0,
      description: language === 'ar' ? 'حصر إدارة الخادم عبر SSH على الشبكة الداخلية فقط' : 'Restricted administrative SSH access for intranet only',
      matches: (ctx) => (ctx.destinationPort === 22 || ctx.destinationPort === '22') && ctx.sourceIp.startsWith('10.0.0.'),
    },
    {
      id: 'rule-4',
      order: 4,
      enabled: true,
      name: language === 'ar' ? 'حظر شامل افتراضي (Drop All)' : 'Default Deny All',
      action: 'DROP',
      hitCount: 0,
      description: language === 'ar' ? 'إسقاط أي حزم لا تطابق القواعد السابقة' : 'Implicit perimeter defense drop rule',
      matches: () => true,
    },
  ];

  const [rules, setRules] = useState<Rule[]>(initialRules);

  useEffect(() => {
    globalSimulationRuntime.rules.setRules(rules);
  }, [rules]);

  // Sync rule hits from Runtime
  useEffect(() => {
    setRules(globalSimulationRuntime.rules.getRules());
  }, [packets, virtualTime]);

  // Nodes definition
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
        { name: 'HTTP', port: 80, protocol: 'TCP', status: 'stopped' },
        { name: 'SSH', port: 22, protocol: 'TCP', status: 'running' },
      ],
    },
  ];

  const connections: ConnectionLink[] = [
    { id: 'c1', source: 'internet', target: 'firewall', latencyMs: 150, status: 'active', label: 'Inbound Ingress' },
    { id: 'c2', source: 'firewall', target: 'app_server', latencyMs: 100, status: 'active', label: 'Internal DMZ' },
  ];

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
        isCompleted: rules.some((r) => r.enabled && r.order <= 2 && r.action === 'ALLOW'),
        validationKey: 'https_rule',
      },
      {
        id: 'obj-http-deny',
        title: t.firewall.objBlockTelnet,
        description: t.firewall.objBlockTelnetDesc,
        isCompleted: rules.some((r) => r.enabled && r.action === 'DENY'),
        validationKey: 'http_blocked',
      },
      {
        id: 'obj-default-deny',
        title: t.firewall.objDefaultDrop,
        description: t.firewall.objDefaultDropDesc,
        isCompleted: rules.some((r) => r.enabled && r.action === 'DROP'),
        validationKey: 'default_deny',
      },
    ],
    hints: [t.firewall.hint1, t.firewall.hint2],
  };

  // Inject Packet using Causal Chain
  const injectPacket = (port: number, srcIp = '203.0.113.42') => {
    // 1. TRAFFIC_GENERATED
    const genEvt = globalSimulationRuntime.dispatch({
      type: 'TRAFFIC_GENERATED',
      source: 'internet',
      target: 'firewall',
      description: `Ingress traffic initiated from ${srcIp} towards port ${port}`,
      category: 'NETWORK',
    });

    // 2. PACKET_CREATED & SENT
    const pkt = globalSimulationRuntime.packets.createPacket({
      source: 'internet',
      destination: 'app_server',
      protocol: 'TCP',
      sourcePort: 40000 + ((port * 37) % 20000),
      destinationPort: port,
      flags: ['SYN'],
      route: ['internet', 'firewall', 'app_server'],
      startVirtualTime: virtualTime,
      durationMs: 800,
    });

    globalSimulationRuntime.dispatch({
      type: 'PACKET_CREATED',
      source: 'internet',
      target: 'firewall',
      causedByEventId: genEvt.id,
      payload: { packetId: pkt.id, port, srcIp },
    });

    // 3. FIREWALL_RULE_MATCHED
    const evalRes = globalSimulationRuntime.rules.evaluateFirstMatch({
      sourceIp: srcIp,
      destinationPort: port,
      protocol: 'TCP',
    });

    const matchEvt = globalSimulationRuntime.dispatch({
      type: 'FIREWALL_RULE_MATCHED',
      source: 'firewall',
      target: 'app_server',
      causedByEventId: genEvt.id,
      description: evalRes.reason,
      payload: { action: evalRes.action, ruleId: evalRes.matchedRule?.id },
    });

    // 4. ACTION DISPATCH & LOG_GENERATED
    if (evalRes.action === 'ALLOW') {
      globalSimulationRuntime.dispatch({
        type: 'PACKET_ALLOWED',
        source: 'firewall',
        target: 'app_server',
        causedByEventId: matchEvt.id,
        description: `Packet allowed through firewall to port ${port}`,
      });
      globalSimulationRuntime.logs.log({
        level: 'INFO',
        source: 'FIREWALL_NGFW',
        message: `ALLOW: Ingress ${srcIp} -> 10.0.0.50:${port} [Rule #${evalRes.matchedRule?.order}]`,
        category: 'FIREWALL',
        relatedEventId: matchEvt.id,
        relatedPacketId: pkt.id,
      });
    } else if (evalRes.action === 'DENY') {
      globalSimulationRuntime.packets.blockPacket(pkt.id, evalRes.reason, evalRes.matchedRule?.id, 'firewall');
      globalSimulationRuntime.dispatch({
        type: 'PACKET_BLOCKED',
        source: 'firewall',
        target: 'app_server',
        causedByEventId: matchEvt.id,
        description: `Packet blocked by firewall rule #${evalRes.matchedRule?.order}`,
      });
      globalSimulationRuntime.logs.log({
        level: 'WARN',
        source: 'FIREWALL_NGFW',
        message: `DENY: Blocked connection from ${srcIp} to port ${port}`,
        category: 'FIREWALL',
        relatedEventId: matchEvt.id,
        relatedPacketId: pkt.id,
      });
    } else {
      globalSimulationRuntime.packets.dropPacket(pkt.id, evalRes.reason);
      globalSimulationRuntime.dispatch({
        type: 'PACKET_DROPPED',
        source: 'firewall',
        target: 'app_server',
        causedByEventId: matchEvt.id,
        description: `Packet silently dropped by default policy`,
      });
      globalSimulationRuntime.logs.log({
        level: 'WARN',
        source: 'FIREWALL_NGFW',
        message: `DROP: Implicit drop for ${srcIp} -> port ${port}`,
        category: 'FIREWALL',
        relatedEventId: matchEvt.id,
        relatedPacketId: pkt.id,
      });
    }
  };

  const handleToggleRule = (id: string) => {
    globalSimulationRuntime.rules.toggleRule(id);
    setRules(globalSimulationRuntime.rules.getRules());
  };

  const handleMoveRule = (id: string, dir: 'up' | 'down') => {
    globalSimulationRuntime.rules.moveRule(id, dir);
    setRules(globalSimulationRuntime.rules.getRules());
  };

  const handleRemoveRule = (id: string) => {
    globalSimulationRuntime.rules.removeRule(id);
    setRules(globalSimulationRuntime.rules.getRules());
  };

  const handleAddCustomRule = () => {
    const newRule: Rule = {
      id: `rule-custom-${rules.length + 1}`,
      order: rules.length + 1,
      enabled: true,
      name: language === 'ar' ? 'قاعدة مخصصة جديدة' : 'New Custom Rule',
      action: 'ALLOW',
      hitCount: 0,
      description: 'Custom user defined ACL rule',
      matches: (ctx) => ctx.destinationPort === 8080 || ctx.destinationPort === '8080',
    };
    globalSimulationRuntime.rules.addRule(newRule);
    setRules(globalSimulationRuntime.rules.getRules());
  };

  return (
    <Workspace
      title={t.firewall.title}
      subtitle={t.firewall.subtitle}
      domainName={language === 'ar' ? 'البنية التحتية والشبكات' : 'Infrastructure & Networking'}
      challenge={firewallChallenge}
      onValidateChallenge={() => {
        const isSuccess = rules.some((r) => r.enabled && r.action === 'ALLOW') && rules.some((r) => r.enabled && r.action === 'DENY');
        return {
          success: isSuccess,
          message: isSuccess
            ? language === 'ar'
              ? 'ممتاز! تم تشكيل قواعد جدار الحماية بنجاح للسماح بالمشفر وحظر الأخطار.'
              : 'Great job! Firewall rules correctly configured for HTTPS permit and cleartext block.'
            : language === 'ar'
            ? 'تأكد من ترتيب القواعد للسماح بمنفذ 443 وحظر منفذ 80.'
            : 'Ensure rule order permits 443 and blocks port 80.',
        };
      }}
      onRestart={() => {
        globalSimulationRuntime.reset();
        globalSimulationRuntime.rules.setRules(initialRules);
        setRules(initialRules);
      }}
      onStep={() => globalSimulationRuntime.step(150)}
      controlDeck={
        <div className="space-y-3">
          {/* Quick Traffic Test Injections */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              {language === 'ar' ? 'حقن حزم اختبار جدار الحماية:' : 'Inject Test Ingress Traffic:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => injectPacket(443)}
                className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 font-mono text-xs flex items-center gap-1.5 font-bold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>HTTPS (443)</span>
              </button>

              <button
                onClick={() => injectPacket(80)}
                className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900/60 font-mono text-xs flex items-center gap-1.5 font-bold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span>HTTP (80)</span>
              </button>

              <button
                onClick={() => injectPacket(22, '10.0.0.15')}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900/60 font-mono text-xs flex items-center gap-1.5 font-bold transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>SSH Intranet (22)</span>
              </button>

              <button
                onClick={() => injectPacket(3389)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-slate-400" />
                <span>RDP (3389)</span>
              </button>
            </div>
          </div>

          {/* ACL Rules Table Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{language === 'ar' ? 'جدول قواعد جدار الحماية (First-Match Execution):' : 'Firewall ACL Table (First-Match Order):'}</span>
              <button
                onClick={handleAddCustomRule}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 text-[11px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إضافة قاعدة' : 'Add Rule'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 p-2 bg-slate-900/80 font-mono text-slate-400 text-[10px] uppercase border-b border-slate-800 font-bold">
                <span className="col-span-1">#</span>
                <span className="col-span-1">{language === 'ar' ? 'الحالة' : 'State'}</span>
                <span className="col-span-4">{language === 'ar' ? 'اسم القاعدة' : 'Rule Name'}</span>
                <span className="col-span-2">{language === 'ar' ? 'الإجراء' : 'Action'}</span>
                <span className="col-span-2">{language === 'ar' ? 'المطابقات' : 'Hits'}</span>
                <span className="col-span-2 text-center">{language === 'ar' ? 'التحكم' : 'Order'}</span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-48 overflow-y-auto font-mono">
                {rules.map((rule, idx) => (
                  <div
                    key={rule.id}
                    className={`grid grid-cols-12 gap-2 p-2 items-center text-[11px] ${
                      !rule.enabled ? 'opacity-40 bg-slate-950' : 'bg-slate-900/30 hover:bg-slate-900/60'
                    }`}
                  >
                    <span className="col-span-1 font-bold text-slate-500">{rule.order}</span>
                    <span className="col-span-1">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => handleToggleRule(rule.id)}
                        className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                      />
                    </span>
                    <span className="col-span-4 font-bold text-white truncate">{rule.name}</span>
                    <span className="col-span-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rule.action === 'ALLOW'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : rule.action === 'DENY'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {rule.action}
                      </span>
                    </span>
                    <span className="col-span-2 text-cyan-400 font-bold">{rule.hitCount}</span>
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMoveRule(rule.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveRule(rule.id, 'down')}
                        disabled={idx === rules.length - 1}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveRule(rule.id)}
                        className="p-1 rounded bg-slate-900 hover:bg-rose-900/50 text-slate-500 hover:text-rose-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
