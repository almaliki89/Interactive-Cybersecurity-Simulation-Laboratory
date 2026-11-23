import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Globe,
  History,
  KeyRound,
  Monitor,
  Network,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Waypoints,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDigitalTwinStore } from '../../stores/digitalTwinStore';
import type {
  DigitalTwinNode,
  DigitalTwinNodeKind,
  DigitalTwinNodeStatus,
} from '../../engine/digitalTwin/DigitalTwinEngine';

const nodeIcons: Record<DigitalTwinNodeKind, LucideIcon> = {
  internet: Globe,
  firewall: Shield,
  workstation: Monitor,
  application: Server,
  database: Database,
  identity: KeyRound,
  soc: Activity,
  endpoint: Waypoints,
};

const timeLabel = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const nodeStatusText = (status: DigitalTwinNodeStatus, isAr: boolean) => {
  const labels: Record<DigitalTwinNodeStatus, [string, string]> = {
    healthy: ['سليم', 'Healthy'],
    watch: ['تحت المراقبة', 'Under watch'],
    isolated: ['معزول', 'Isolated'],
    protected: ['محمي', 'Protected'],
  };
  return isAr ? labels[status][0] : labels[status][1];
};

const nodeStatusClass = (status: DigitalTwinNodeStatus) => {
  if (status === 'watch') return 'border-amber-400/40 bg-amber-400/10 text-amber-300';
  if (status === 'isolated') return 'border-rose-400/40 bg-rose-400/10 text-rose-300';
  if (status === 'protected') return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300';
  return 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200';
};

const eventTone = (level: 'info' | 'warning' | 'success') => {
  if (level === 'warning') return 'bg-amber-400';
  if (level === 'success') return 'bg-emerald-400';
  return 'bg-cyan-400';
};

const formatNodeDescription = (node: DigitalTwinNode, isAr: boolean) =>
  isAr ? node.descriptionAr : node.descriptionEn;

export const DigitalTwinWorkspace: React.FC = () => {
  const language = useSimulationStore((state) => state.language);
  const isAr = language === 'ar';
  const world = useDigitalTwinStore((state) => state.world);
  const inspectNode = useDigitalTwinStore((state) => state.inspectNode);
  const isolateEndpoint = useDigitalTwinStore((state) => state.isolateEndpoint);
  const blockSuspiciousEgress = useDigitalTwinStore((state) => state.blockSuspiciousEgress);
  const advanceMinute = useDigitalTwinStore((state) => state.advanceMinute);
  const resolveIncident = useDigitalTwinStore((state) => state.resolveIncident);
  const resetWorld = useDigitalTwinStore((state) => state.resetWorld);

  const selectedNode = world.nodes.find((node) => node.id === world.selectedNodeId) ?? world.nodes[0];
  const nodeById = Object.fromEntries(world.nodes.map((node) => [node.id, node]));
  const alert = world.alerts[0];
  const coreServices = world.nodes.filter((node) => ['app-server', 'db-server', 'identity'].includes(node.id));
  const servicesOnline = coreServices.filter((node) => node.status === 'healthy').length;
  const tasks = [
    { done: world.progress.alertInspected, title: isAr ? 'افحص التنبيه ومحطة HR-04' : 'Inspect the alert and HR-04' },
    { done: world.progress.endpointIsolated, title: isAr ? 'اعزل المحطة المشتبه بها' : 'Isolate the suspicious workstation' },
    { done: world.progress.egressBlocked, title: isAr ? 'احظر الوجهة المحددة بقاعدة دقيقة' : 'Block the exact destination with a precise rule' },
  ];
  const complete = world.incidentStatus === 'resolved';

  const statusLabel = (status: string) => {
    if (status === 'open') return isAr ? 'مفتوح' : 'Open';
    if (status === 'investigating') return isAr ? 'قيد التحقيق' : 'Investigating';
    if (status === 'contained') return isAr ? 'تم الاحتواء' : 'Contained';
    if (status === 'resolved') return isAr ? 'مغلق' : 'Resolved';
    return status;
  };

  const actionText = (ar: string, en: string) => isAr ? ar : en;

  return (
    <div className="flex-1 overflow-y-auto bg-[#070d19] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-5 p-4 sm:p-6 xl:p-7">
        <header className="flex flex-col justify-between gap-4 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {actionText('عالم افتراضي حي', 'LIVING DIGITAL WORLD')}
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1.5 text-emerald-300">
                {actionText('محاكاة معزولة وآمنة', 'ISOLATED SYNTHETIC SIMULATION')}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {actionText('المؤسسة الرقمية الحية', 'Living Digital Enterprise')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              {actionText(
                'أدر حادثاً تدريبياً داخل مؤسسة افتراضية واحدة. كل قرار يغيّر خريطة الشبكة، وقواعد الجدار الناري، وتنبيهات SOC، وسجل الأحداث في اللحظة نفسها.',
                'Handle a training incident inside one virtual enterprise. Every decision updates the network map, firewall rules, SOC alerts, and event timeline together.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={advanceMinute}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <Clock3 size={15} />
              {actionText('قدّم دقيقة افتراضية', 'Advance 1 virtual minute')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(actionText('إعادة ضبط العالم الافتراضي وإلغاء تقدمك في هذا السيناريو؟', 'Reset the virtual world and clear this scenario progress?'))) resetWorld();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <RefreshCw size={14} />
              {actionText('إعادة ضبط', 'Reset')}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400"><Clock3 size={14} />{actionText('الوقت الافتراضي', 'VIRTUAL TIME')}</div>
            <div data-testid="digital-twin-clock" className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">{timeLabel(world.virtualMinutes)}</div>
            <div className="mt-1 text-[10px] text-slate-500">{actionText('توقيت المؤسسة التجريبية', 'Simulated enterprise clock')}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400"><ShieldCheck size={14} />{actionText('حالة الحادث', 'INCIDENT STATUS')}</div>
            <div data-testid="digital-twin-incident-state" className="mt-2 text-lg font-bold text-white">{statusLabel(world.incidentStatus)}</div>
            <div className="mt-1 text-[10px] text-slate-500">NEXORA-IR-01</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400"><Server size={14} />{actionText('الخدمات الأساسية', 'CORE SERVICES')}</div>
            <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">{servicesOnline}<span className="text-base text-slate-500">/3</span></div>
            <div className="mt-1 text-[10px] text-slate-500">{actionText('متاحة دون انقطاع', 'Available and healthy')}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
            <div className="flex items-center gap-2 text-[11px] text-slate-400"><Zap size={14} />{actionText('نتيجة الاستجابة', 'RESPONSE SCORE')}</div>
            <div data-testid="digital-twin-score" className="mt-2 font-mono text-2xl font-bold tabular-nums text-white">{world.score}<span className="text-base text-slate-500">/100</span></div>
            <div className="mt-1 text-[10px] text-slate-500">{actionText('تُحتسب بعد الاحتواء والإغلاق', 'Awarded after containment and closure')}</div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,0.85fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1424]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Network className="text-cyan-300" size={17} />
                <h2 className="text-sm font-bold text-white">{actionText('خريطة الشبكة الحية', 'LIVE NETWORK MAP')}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" />{actionText('سليم', 'Healthy')}</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" />{actionText('مراقبة', 'Watch')}</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-400" />{actionText('معزول/محظور', 'Isolated/blocked')}</span>
              </div>
            </div>
            <div className="overflow-x-auto p-3 sm:p-5">
              <div className="relative h-[360px] min-w-[640px] rounded-xl border border-slate-800/80 bg-[radial-gradient(circle_at_center,rgba(14,116,144,0.11),transparent_60%),linear-gradient(rgba(30,41,59,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.28)_1px,transparent_1px)] bg-[size:auto,28px_28px,28px_28px]">
                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {world.connections.map((link) => {
                    const source = nodeById[link.source];
                    const target = nodeById[link.target];
                    if (!source || !target) return null;
                    const stroke = link.status === 'active' ? '#22d3ee' : link.status === 'blocked' ? '#fb7185' : '#94a3b8';
                    return (
                      <g key={link.id}>
                        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} stroke={stroke} strokeWidth="0.55" strokeDasharray={link.status === 'active' ? '1.2 1.5' : '2 2'} opacity={link.status === 'active' ? 0.75 : 0.9} />
                      </g>
                    );
                  })}
                </svg>
                {world.nodes.map((node) => {
                  const Icon = nodeIcons[node.kind];
                  const selected = selectedNode?.id === node.id;
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => inspectNode(node.id)}
                      aria-pressed={selected}
                      data-testid={`digital-twin-node-${node.id}`}
                      aria-label={actionText(`تحديد ${node.labelAr}`, `Select ${node.labelEn}`)}
                      className={`absolute z-10 flex w-[116px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-xl border p-2 text-center shadow-lg transition sm:w-[136px] sm:p-2.5 ${selected ? 'border-cyan-300 bg-cyan-950/90 ring-2 ring-cyan-400/25' : 'border-slate-700 bg-slate-950/95 hover:border-slate-500'}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${node.status === 'watch' ? 'bg-amber-400/10 text-amber-300' : node.status === 'isolated' ? 'bg-rose-400/10 text-rose-300' : 'bg-cyan-400/10 text-cyan-200'}`}>
                        <Icon size={17} />
                      </span>
                      <span className="text-[10px] font-bold leading-tight text-slate-100">{isAr ? node.labelAr : node.labelEn}</span>
                      <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold ${nodeStatusClass(node.status)}`}>{nodeStatusText(node.status, isAr)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-500">
                {actionText('اضغط على أي جهاز لعرض تفاصيله. الخطوط والألوان تتغير عندما تتخذ إجراءً داخل المحاكاة.', 'Select any device to inspect it. Links and states change as you take actions in the simulation.')}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/65 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white"><Monitor size={16} className="text-cyan-300" />{actionText('مستكشف الجهاز', 'DEVICE INSPECTOR')}</h2>
                <span className="text-[9px] font-mono text-slate-500">{selectedNode?.id}</span>
              </div>
              {selectedNode && (
                <>
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">
                      {React.createElement(nodeIcons[selectedNode.kind], { size: 22 })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white">{isAr ? selectedNode.labelAr : selectedNode.labelEn}</div>
                      <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${nodeStatusClass(selectedNode.status)}`}>{nodeStatusText(selectedNode.status, isAr)}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-400">{formatNodeDescription(selectedNode, isAr)}</p>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white"><ShieldAlert size={16} className="text-amber-300" />{actionText('مهمة الاستجابة للحادث', 'INCIDENT RESPONSE MISSION')}</h2>
                <span className="font-mono text-[9px] text-amber-200/80">NEXORA-IR-01</span>
              </div>
              <p className="mb-3 text-xs leading-6 text-slate-300">{actionText('احتوِ النشاط الصادر من محطة HR-04 مع الحفاظ على استمرار الخدمات الأساسية.', 'Contain the outbound activity from HR-04 while keeping core services online.')}</p>
              <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all" style={{ width: `${(tasks.filter((task) => task.done).length / tasks.length) * 100}%` }} />
              </div>
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={task.title} className="flex items-start gap-2 text-[11px]">
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${task.done ? 'bg-emerald-400/15 text-emerald-300' : 'border border-slate-600 text-slate-500'}`}>
                      {task.done ? <CheckCircle2 size={12} /> : <span className="text-[8px]">{index + 1}</span>}
                    </span>
                    <span className={task.done ? 'text-emerald-200' : 'text-slate-300'}>{task.title}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => inspectNode('hr-ws-04')}
                  data-testid="digital-twin-inspect-btn"
                  disabled={world.progress.alertInspected}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-default disabled:opacity-45"
                >
                  {actionText(world.progress.alertInspected ? 'تم فحص التنبيه' : '1. افحص محطة HR-04', world.progress.alertInspected ? 'Alert inspected' : '1. Inspect HR-04')}
                </button>
                <button
                  type="button"
                  onClick={isolateEndpoint}
                  data-testid="digital-twin-isolate-btn"
                  disabled={!world.progress.alertInspected || world.progress.endpointIsolated}
                  className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2.5 text-xs font-bold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {actionText(world.progress.endpointIsolated ? 'تم عزل المحطة' : '2. اعزل المحطة المشتبه بها', world.progress.endpointIsolated ? 'Workstation isolated' : '2. Isolate suspicious workstation')}
                </button>
                <button
                  type="button"
                  onClick={blockSuspiciousEgress}
                  data-testid="digital-twin-block-btn"
                  disabled={!world.progress.alertInspected || world.progress.egressBlocked}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {actionText(world.progress.egressBlocked ? 'تم تفعيل قاعدة الحظر الدقيقة' : '3. احظر الوجهة التجريبية', world.progress.egressBlocked ? 'Precise block rule active' : '3. Block simulated destination')}
                </button>
                <button
                  type="button"
                  onClick={resolveIncident}
                  data-testid="digital-twin-resolve-btn"
                  disabled={world.incidentStatus !== 'contained' || complete}
                  className="rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {actionText(complete ? 'أُغلق الحادث بنجاح ✓' : '4. اعتمد التقرير وأغلق الحادث', complete ? 'Incident resolved ✓' : '4. Confirm report and resolve incident')}
                </button>
              </div>
              {complete && (
                <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-xs leading-6 text-emerald-200">
                  {actionText('أحسنت. احتويت الحادث دون تعطيل خادم التطبيقات أو قاعدة البيانات. نتيجتك 100/100.', 'Excellent. You contained the incident without disrupting the application or database servers. Score: 100/100.')}
                </div>
              )}
            </section>
          </aside>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white"><AlertTriangle size={16} className="text-amber-300" />{actionText('تنبيهات مركز SOC', 'SOC ALERTS')}</h2>
              <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[9px] font-bold text-amber-200">{world.alerts.length} {actionText('تنبيه', 'ALERT')}</span>
            </div>
            {alert && (
              <article className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[9px] text-slate-500">{alert.id.toUpperCase()} · HIGH</span>
                  <span className="rounded-full border border-amber-400/25 px-2 py-0.5 text-[9px] text-amber-200">{statusLabel(alert.status)}</span>
                </div>
                <h3 className="mt-2 text-xs font-bold text-white">{isAr ? alert.titleAr : alert.titleEn}</h3>
                <p className="mt-1 text-[11px] leading-5 text-slate-400">{isAr ? alert.descriptionAr : alert.descriptionEn}</p>
                <button type="button" onClick={() => inspectNode(alert.sourceNodeId)} className="mt-3 text-[10px] font-bold text-cyan-300 hover:text-cyan-200">
                  {actionText('افحص مصدر التنبيه ←', 'Inspect alert source →')}
                </button>
              </article>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white"><Shield size={16} className="text-cyan-300" />{actionText('سياسة الجدار الناري', 'FIREWALL POLICY')}</h2>
              <span className="text-[9px] text-slate-500">{world.firewallRules.length} {actionText('قاعدة', 'RULES')}</span>
            </div>
            <div className="space-y-2">
              {world.firewallRules.map((rule) => (
                <div key={rule.id} className="rounded-xl border border-slate-800 bg-slate-950/55 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] text-slate-500">{rule.id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${rule.enabled ? (rule.action === 'DENY' ? 'bg-rose-400/10 text-rose-300' : 'bg-emerald-400/10 text-emerald-300') : 'bg-slate-700/50 text-slate-400'}`}>
                      {rule.enabled ? (rule.action === 'DENY' ? actionText('حظر مفعّل', 'DENY · ACTIVE') : actionText('سماح مفعّل', 'ALLOW · ACTIVE')) : actionText('غير مفعّل', 'DISABLED')}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-slate-200">{isAr ? rule.nameAr : rule.nameEn}</div>
                  <div className="mt-1 font-mono text-[9px] text-slate-500">{rule.destination}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-5 text-slate-500">{actionText('تغيّر القاعدة حالة المسار المشبوه في خريطة الشبكة وسجل الأحداث مباشرة.', 'Rule changes are reflected immediately in the network path and event timeline.')}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white"><History size={16} className="text-violet-300" />{actionText('التسلسل الزمني للأحداث', 'EVENT TIMELINE')}</h2>
              <span className="text-[9px] text-slate-500">{world.events.length} {actionText('حدث', 'EVENTS')}</span>
            </div>
            <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
              {world.events.map((event) => (
                <div key={event.id} className="flex gap-2.5">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${eventTone(event.level)}`} />
                  <div className="min-w-0 flex-1 border-b border-slate-800/80 pb-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-200">{isAr ? event.titleAr : event.titleEn}</span>
                      <span className="font-mono text-[9px] text-slate-500">{timeLabel(event.minute)}</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-5 text-slate-500">{isAr ? event.detailAr : event.detailEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] px-4 py-3 text-[10px] leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2 text-emerald-200"><CheckCircle2 size={14} />{actionText('بيئة اصطناعية بالكامل — لا توجد أجهزة أو شبكات حقيقية متصلة.', 'Fully synthetic environment — no real devices or networks are connected.')}</span>
          <span className="font-mono text-slate-500">NEXORA DIGITAL TWIN · SCENARIO 01</span>
        </footer>
      </div>
    </div>
  );
};
