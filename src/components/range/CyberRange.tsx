import React, { useState, useEffect } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { CyberRangeLayer, CyberTimelineEvent } from '../../types/universe';
import {
  Shield,
  Laptop,
  Users,
  Globe,
  Activity,
  Compass,
  Play,
  RotateCcw,
  AlertTriangle,
  Lock,
  Terminal,
  Radio,
  Layers,
  Database,
  Server,
  Cloud,
  CheckCircle2,
  Sliders,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Network,
} from 'lucide-react';

interface SimulatedHost {
  id: string;
  name: string;
  ip: string;
  role: string;
  status: 'normal' | 'suspicious' | 'compromised' | 'isolated';
  processes: { pid: number; name: string; user: string; status: string }[];
  sessions: { user: string; authMethod: string; tokenValid: boolean }[];
}

export const CyberRange: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const cyberRangeLayer = useSimulationStore((s) => s.cyberRangeLayer);
  const setCyberRangeLayer = useSimulationStore((s) => s.setCyberRangeLayer);
  const cyberTimelineEvents = useSimulationStore((s) => s.cyberTimelineEvents);
  const addCyberTimelineEvent = useSimulationStore((s) => s.addCyberTimelineEvent);
  const clearCyberTimeline = useSimulationStore((s) => s.clearCyberTimeline);
  const selectEntity = useSimulationStore((s) => s.selectEntity);

  const [simActive, setSimActive] = useState(false);
  const [activeIncidentStep, setActiveIncidentStep] = useState(0);

  // Enterprise State
  const [hosts, setHosts] = useState<SimulatedHost[]>([
    {
      id: 'ws-finance-01',
      name: 'Workstation Finance (Alice)',
      ip: '10.0.10.45',
      role: 'Accounting Client',
      status: 'normal',
      processes: [
        { pid: 1042, name: 'explorer.exe', user: 'alice', status: 'clean' },
        { pid: 2180, name: 'excel.exe', user: 'alice', status: 'clean' },
      ],
      sessions: [{ user: 'alice@corp.local', authMethod: 'Kerberos/MFA', tokenValid: true }],
    },
    {
      id: 'app-web-01',
      name: 'Production Web App Server',
      ip: '10.0.20.10',
      role: 'NodeJS Express Worker',
      status: 'normal',
      processes: [
        { pid: 501, name: 'nginx', user: 'www-data', status: 'clean' },
        { pid: 504, name: 'node server.js', user: 'app-svc', status: 'clean' },
      ],
      sessions: [{ user: 'app-svc', authMethod: 'Service Token', tokenValid: true }],
    },
    {
      id: 'dc-corp-01',
      name: 'Active Directory Domain Controller',
      ip: '10.0.1.5',
      role: 'Enterprise Kerberos KDC',
      status: 'normal',
      processes: [
        { pid: 400, name: 'lsass.exe', user: 'SYSTEM', status: 'clean' },
        { pid: 402, name: 'ntds.dit', user: 'SYSTEM', status: 'clean' },
      ],
      sessions: [{ user: 'admin@corp.local', authMethod: 'SmartCard', tokenValid: true }],
    },
    {
      id: 'db-postgres-01',
      name: 'Customer Database Server',
      ip: '10.0.30.80',
      role: 'PostgreSQL Cluster',
      status: 'normal',
      processes: [{ pid: 880, name: 'postgres', user: 'postgres', status: 'clean' }],
      sessions: [{ user: 'db_admin', authMethod: 'Mutual TLS', tokenValid: true }],
    },
  ]);

  const [firewallBlockedIps, setFirewallBlockedIps] = useState<string[]>([]);
  const [quarantinedUsers, setQuarantinedUsers] = useState<string[]>([]);

  // Multi-step realistic incident simulation
  const startIncidentSimulation = () => {
    setSimActive(true);
    clearCyberTimeline();
    setActiveIncidentStep(1);

    // Step 1: Phishing email & attachment execution (Endpoint + Identity)
    setTimeout(() => {
      setActiveIncidentStep(2);
      setHosts((prev) =>
        prev.map((h) =>
          h.id === 'ws-finance-01'
            ? {
                ...h,
                status: 'suspicious',
                processes: [
                  ...h.processes,
                  { pid: 4088, name: 'powershell.exe -enc JAB...', user: 'alice', status: 'suspicious' },
                ],
              }
            : h
        )
      );
      addCyberTimelineEvent({
        layer: 'endpoint',
        titleAr: 'إنشاء عملية PowerShell مشبوهة بأمر مشفر (Event 4688)',
        titleEn: 'Suspicious Encoded PowerShell Spawned from Document',
        descriptionAr: 'قام المستخدم alice بتشغيل مستند نتج عنه استدعاء موجه أوامر مشفر في الخلفية على 10.0.10.45.',
        descriptionEn: 'Process excel.exe spawned powershell.exe with base64 encoded payload on host 10.0.10.45.',
        severity: 'high',
        sourceEntity: 'ws-finance-01',
      });
    }, 1500);

    // Step 2: Ingress C2 Traffic & Port Scan (Network Layer)
    setTimeout(() => {
      setActiveIncidentStep(3);
      addCyberTimelineEvent({
        layer: 'network',
        titleAr: 'رصد اتصال C2 خارجي وفحص منافذ داخلي نحو متحكم النطاق',
        titleEn: 'Outbound C2 Callback & Internal Port Scan to DC',
        descriptionAr: 'رصد جدار الحماية اتصالاً مشبوهاً بالمنفذ 4444 نحو IP خارجي 198.51.100.99 مع فحص المنفذ 88 و 445.',
        descriptionEn: 'Egress connection to 198.51.100.99:4444 followed by SYN scan targeting Domain Controller.',
        severity: 'critical',
        sourceEntity: '10.0.10.45',
        targetEntity: '198.51.100.99',
      });
    }, 3500);

    // Step 3: Kerberoasting & Token Replay (Identity Layer)
    setTimeout(() => {
      setActiveIncidentStep(4);
      addCyberTimelineEvent({
        layer: 'identity',
        titleAr: 'طلب تذكرة Kerberos TGS غير معتادة لحساب الخدمة (Kerberoasting)',
        titleEn: 'Anomalous Kerberos TGS Ticket Requested for SPN',
        descriptionAr: 'تم رصد طلب تذاكر تشفير RC4 لحساب db_service من محطة عمل غير مصرح لها في Active Directory.',
        descriptionEn: 'Anomalous TGS request issued from ws-finance-01 for MSSQL service SPN.',
        severity: 'high',
        sourceEntity: 'alice@corp.local',
      });
    }, 5500);

    // Step 4: Web Application SQL Query (App Layer)
    setTimeout(() => {
      setActiveIncidentStep(5);
      addCyberTimelineEvent({
        layer: 'application',
        titleAr: 'استعلام قاعدة بيانات غير معتاد عبر API Worker',
        titleEn: 'Anomalous Batch Export Query Issued to Database',
        descriptionAr: 'طلب استخراج جدول الحسابات بالكامل عبر اتصال التطبيق الداخلي.',
        descriptionEn: 'High-volume SELECT * FROM customer_vault query executed via backend connection pool.',
        severity: 'medium',
        sourceEntity: 'app-web-01',
      });
    }, 7500);

    // Step 5: SOC SIEM Correlation Rule Fired (SOC Layer)
    setTimeout(() => {
      setActiveIncidentStep(6);
      addCyberTimelineEvent({
        layer: 'soc',
        titleAr: 'إنذار أحمر في SIEM: ربط هجوم متعدد المراحل (APT Multi-Stage Incident)',
        titleEn: 'SIEM Correlation Rule Fired: Multi-Stage Breach in Progress',
        descriptionAr: 'ارتباط أحداث EDR مع فحص الشبكة وتذاكر Kerberos يثبت وجود هجوم نشط يستهدف قاعدة البيانات.',
        descriptionEn: 'High-confidence correlation alert: Endpoint anomaly + C2 egress + Kerberoasting signature.',
        severity: 'critical',
        sourceEntity: 'SIEM_ENGINE',
      });
    }, 9500);
  };

  // Coordinated Response Actions
  const handleBlockAttackerIp = () => {
    setFirewallBlockedIps((prev) => [...prev, '198.51.100.99']);
    addCyberTimelineEvent({
      layer: 'network',
      titleAr: 'تنفيذ دفاعي: حظر IP المهاجم 198.51.100.99 في جدار الحماية',
      titleEn: 'Defensive Action: Ingress/Egress Firewall Rule Dropped 198.51.100.99',
      descriptionAr: 'تم قطع اتصال خادم القيادة والسيطرة (C2) وعزل الاتصال الخارجي.',
      descriptionEn: 'Perimeter firewall dropped all packets to/from adversary C2 server.',
      severity: 'info',
      sourceEntity: 'SOAR_PLAYBOOK',
    });
  };

  const handleIsolateCompromisedHost = () => {
    setHosts((prev) =>
      prev.map((h) => (h.id === 'ws-finance-01' ? { ...h, status: 'isolated' } : h))
    );
    addCyberTimelineEvent({
      layer: 'endpoint',
      titleAr: 'تنفيذ دفاعي: عزل الجهاز المصاب ws-finance-01 عن الشبكة عبر EDR',
      titleEn: 'Defensive Action: Host ws-finance-01 Network Isolated via EDR',
      descriptionAr: 'تم حظر كافة بطاقات الشبكة للجهاز لمنع التحرك الجانبي وحصر التهديد.',
      descriptionEn: 'EDR agent disconnected endpoint from corporate VLAN to stop lateral spread.',
      severity: 'info',
      sourceEntity: 'EDR_AGENT',
    });
  };

  const handleRevokeCompromisedIdentity = () => {
    setQuarantinedUsers((prev) => [...prev, 'alice@corp.local']);
    setHosts((prev) =>
      prev.map((h) =>
        h.id === 'ws-finance-01'
          ? {
              ...h,
              sessions: h.sessions.map((s) => ({ ...s, tokenValid: false })),
            }
          : h
      )
    );
    addCyberTimelineEvent({
      layer: 'identity',
      titleAr: 'تنفيذ دفاعي: إلغاء تذاكر وجلسات حساب alice@corp.local في Active Directory',
      titleEn: 'Defensive Action: Revoked Kerberos TGT & Sessions for alice@corp.local',
      descriptionAr: 'تم إبطال جميع التذاكر وتجميد الحساب لحين إعادة تعيين بيانات الاعتماد.',
      descriptionEn: 'Domain Controller invalidated TGT and forced immediate session logout.',
      severity: 'info',
      sourceEntity: 'IAM_GOVERNANCE',
    });
  };

  const layers: { id: CyberRangeLayer; labelAr: string; labelEn: string; icon: any }[] = [
    { id: 'network', labelAr: '1. طبقة الشبكة والمحيط', labelEn: '1. Network & Perimeter', icon: Network },
    { id: 'endpoint', labelAr: '2. طبقة الأجهزة وEDR', labelEn: '2. Endpoint & EDR', icon: Laptop },
    { id: 'identity', labelAr: '3. طبقة الهوية وKerberos', labelEn: '3. Identity & Kerberos', icon: Users },
    { id: 'application', labelAr: '4. طبقة التطبيقات وقواعد البيانات', labelEn: '4. App & Database', icon: Globe },
    { id: 'soc', labelAr: '5. طبقة مركز العمليات SIEM/SOC', labelEn: '5. SOC & SIEM Correlation', icon: Activity },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-slate-950">
      {/* Top Range Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-950/90 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-300 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">WORLD #60</span>
              <h1 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                {language === 'ar' ? 'الميدان السيبراني المؤسسي الشامل' : 'Integrated Enterprise Cyber Range'}
              </h1>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {language === 'ar'
                ? 'محاكاة المنظومة الرقمية الحية عبر 5 طبقات دفاعية متزامنة'
                : 'Simultaneous 5-Layer Perspective on the Same Live Incident'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={startIncidentSimulation}
            disabled={simActive}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{language === 'ar' ? 'محاكاة هجوم اختراق حي' : 'Simulate Live Multi-Stage Attack'}</span>
          </button>

          <button
            onClick={() => {
              setSimActive(false);
              clearCyberTimeline();
              setFirewallBlockedIps([]);
              setQuarantinedUsers([]);
              setHosts((prev) =>
                prev.map((h) => ({
                  ...h,
                  status: 'normal',
                  processes: h.processes.filter((p) => p.status === 'clean'),
                  sessions: h.sessions.map((s) => ({ ...s, tokenValid: true })),
                }))
              );
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title={language === 'ar' ? 'إعادة تعيين الميدان' : 'Reset Cyber Range'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Switcher Bar (The Core Architectural Feature) */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-xs font-semibold text-slate-400 uppercase font-mono pe-2">
          {language === 'ar' ? 'منظور الطبقة الحالية:' : 'Active Perspective:'}
        </span>
        {layers.map((l) => {
          const Icon = l.icon;
          const isActive = cyberRangeLayer === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setCyberRangeLayer(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? l.labelAr : l.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Active Layer Dynamic Visualizer */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 bg-slate-950">
          {/* Layer 1: Network View */}
          {cyberRangeLayer === 'network' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono">
                      {language === 'ar' ? 'منظور الشبكة: تدفق الحزم وجدار الحماية المحيطي' : 'Network Perspective: Packet Flow & Perimeter Defense'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">VLAN 10 / VLAN 20 / DMZ</span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'في هذا المنظور، يظهر الهجوم كحزم بيانات تحاول الاتصال بخادم C2 الخارجي 198.51.100.99 عبر المنفذ 4444، وحزم SYN استطلاعية نحو متحكم النطاق.'
                    : 'Network perspective highlights suspicious outbound TCP 4444 sockets to 198.51.100.99 and port sweeps against DC.'}
                </p>
              </div>

              {/* Network Diagram Simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2">{language === 'ar' ? 'شبكة المحاسبة (VLAN 10)' : 'Finance VLAN 10'}</span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">10.0.10.45 (ws-finance-01)</span>
                      <span className="text-[10px] font-mono text-rose-400">
                        {simActive ? (language === 'ar' ? 'اتصال C2 خارجي نشط' : 'Active C2 Beaconing') : (language === 'ar' ? 'حركة مرور طبيعية' : 'Normal')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2">{language === 'ar' ? 'جدار الحماية والمنطقة المعزولة' : 'Firewall & DMZ'}</span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">198.51.100.99</span>
                      <span className={`font-mono font-bold ${firewallBlockedIps.includes('198.51.100.99') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {firewallBlockedIps.includes('198.51.100.99') ? 'BLOCKED' : 'TRAFFIC_ALLOWED'}
                      </span>
                    </div>
                    <button
                      onClick={handleBlockAttackerIp}
                      disabled={firewallBlockedIps.includes('198.51.100.99')}
                      className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold"
                    >
                      {language === 'ar' ? 'حظر IP المهاجم في جدار الحماية' : 'Block IP on Perimeter Firewall'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-xs font-bold text-slate-400 block mb-2">{language === 'ar' ? 'شبكة الخوادم الأساسية (VLAN 20)' : 'Server Infrastructure'}</span>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <span className="text-white block font-semibold">10.0.1.5 (Domain Controller)</span>
                    <span className="text-white block font-semibold">10.0.30.80 (Database Vault)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layer 2: Endpoint / EDR View */}
          {cyberRangeLayer === 'endpoint' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono">
                      {language === 'ar' ? 'منظور النقاط النهائية: شجرة العمليات وسلوك EDR' : 'Endpoint Perspective: Process Lineage & EDR Telemetry'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-indigo-400">Host Telemetry Stream</span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'في هذا المنظور، يظهر الهجوم كعملية مشبوهة powershell.exe تفرعت مباشرة من excel.exe بمتحولات مشفرة (Base64).'
                    : 'Endpoint view reveals process spawning ancestry: excel.exe spawned powershell.exe with obfuscated CLI arguments.'}
                </p>
              </div>

              {/* Host List & Process Trees */}
              <div className="space-y-3">
                {hosts.map((h) => (
                  <div key={h.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold text-white block">{h.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{h.ip} · {h.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                          h.status === 'isolated'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : h.status === 'suspicious'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {h.status}
                        </span>
                        {h.id === 'ws-finance-01' && (
                          <button
                            onClick={handleIsolateCompromisedHost}
                            disabled={h.status === 'isolated'}
                            className="py-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold"
                          >
                            {language === 'ar' ? 'عزل الجهاز عبر EDR' : 'Isolate Endpoint Host'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Process Tree List */}
                    <div className="space-y-1 border-t border-slate-800/80 pt-2">
                      {h.processes.map((proc) => (
                        <div
                          key={proc.pid}
                          className={`p-2 rounded font-mono text-xs flex items-center justify-between ${
                            proc.status === 'suspicious'
                              ? 'bg-rose-950/60 border border-rose-700 text-rose-200'
                              : 'bg-slate-950/60 text-slate-300'
                          }`}
                        >
                          <span>PID {proc.pid}: {proc.name}</span>
                          <span className="text-[10px] text-slate-400">User: {proc.user}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layer 3: Identity & Kerberos View */}
          {cyberRangeLayer === 'identity' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono">
                      {language === 'ar' ? 'منظور الهوية والمصادقة: تذاكر Kerberos وحسابات AD' : 'Identity Perspective: Kerberos Tickets & IAM Tokens'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-purple-400">Active Directory KDC</span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'في هذا المنظور، يظهر الهجوم كطلب تذكرة TGS غير معتادة لحساب خدمة قاعدة البيانات بهدف كسر تشفيرها أوفلاين (Kerberoasting).'
                    : 'Identity perspective exposes anomalous Kerberos service ticket requests for offline password cracking.'}
                </p>
              </div>

              {/* Active Sessions & Identity Revocation */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-300 block">{language === 'ar' ? 'الجلسات وتذاكر TGT النشطة' : 'Active Sessions & Kerberos TGT Tokens'}</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">alice@corp.local</span>
                    <span className="text-[10px] font-mono text-slate-400">TGT Status: {quarantinedUsers.includes('alice@corp.local') ? 'REVOKED (Locked)' : 'ACTIVE'}</span>
                  </div>
                  <button
                    onClick={handleRevokeCompromisedIdentity}
                    disabled={quarantinedUsers.includes('alice@corp.local')}
                    className="py-1 px-3 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold"
                  >
                    {language === 'ar' ? 'إلغاء الجلسات وتجميد الحساب' : 'Revoke Session & Lock Account'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Layer 4: Application & Database View */}
          {cyberRangeLayer === 'application' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono">
                      {language === 'ar' ? 'منظور التطبيقات وقواعد البيانات: استعلامات SQL وAPI' : 'Application & Database Perspective: API & Data Vault'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">App Runtime & DB Cluster</span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'في هذا المنظور، يظهر الهجوم كمحاولة استعلام سحب بيانات بالجملة (Batch Export) على جدول السجلات الحساسة.'
                    : 'App perspective traces database query logs and validates parameterization defenses against data exfiltration.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2">{language === 'ar' ? 'سجل استعلامات قاعدة بيانات PostgreSQL' : 'Database Query Audit Log'}</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  {`[2026-09-24 14:20:00] SELECT * FROM customer_vault WHERE 1=1; -- EXFILTRATION DETECTED
[2026-09-24 14:19:55] SELECT user_id, email FROM users WHERE id = $1; [PARAM: 104]`}
                </pre>
              </div>
            </div>
          )}

          {/* Layer 5: SOC & SIEM Correlation View */}
          {cyberRangeLayer === 'soc' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-400" />
                    <h2 className="text-sm font-bold text-white uppercase font-mono">
                      {language === 'ar' ? 'منظور مركز العمليات (SOC): ربط السجلات واستجابة SOAR' : 'SOC Analyst Perspective: Unified Event Correlation & SOAR'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-rose-400">SIEM Correlation Engine</span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'في هذا المنظور، يجمع نظام SIEM جميع الإشارات السابقة (الشبكة + الجهاز + الهوية + التطبيق) في حادث أمني موحد ويقترح خطة الاحتواء.'
                    : 'SOC view combines telemetry across all 4 previous layers into a single correlated incident with automated SOAR mitigations.'}
                </p>
              </div>

              {/* Coordinated Defense Action Deck */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <span className="text-xs font-bold text-white uppercase font-mono block">
                  {language === 'ar' ? 'إجراءات الاستجابة الدفاعية المنسقة (SOAR Playbook)' : 'Coordinated SOAR Response Actions'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={handleBlockAttackerIp}
                    disabled={firewallBlockedIps.includes('198.51.100.99')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-left rtl:text-right transition-colors disabled:opacity-40"
                  >
                    <span className="text-xs font-bold text-cyan-300 block mb-1">1. حظر IP المهاجم</span>
                    <span className="text-[11px] text-slate-400 block">قطع قناة C2 على جدار الحماية</span>
                  </button>

                  <button
                    onClick={handleIsolateCompromisedHost}
                    disabled={hosts.find((h) => h.id === 'ws-finance-01')?.status === 'isolated'}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left rtl:text-right transition-colors disabled:opacity-40"
                  >
                    <span className="text-xs font-bold text-indigo-300 block mb-1">2. عزل الجهاز المصاب</span>
                    <span className="text-[11px] text-slate-400 block">فصل ws-finance-01 عبر EDR</span>
                  </button>

                  <button
                    onClick={handleRevokeCompromisedIdentity}
                    disabled={quarantinedUsers.includes('alice@corp.local')}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left rtl:text-right transition-colors disabled:opacity-40"
                  >
                    <span className="text-xs font-bold text-purple-300 block mb-1">3. إلغاء تذاكر الهوية</span>
                    <span className="text-[11px] text-slate-400 block">تجميد حساب alice في Active Directory</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Universal Cyber Timeline */}
        <div className="w-80 lg:w-96 h-full border-l rtl:border-l-0 rtl:border-r border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-col p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono">
                {language === 'ar' ? 'الخط الزمني السيبراني الموحد' : 'Universal Cyber Timeline'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{cyberTimelineEvents.length} Events</span>
          </div>

          <div className="flex-1 overflow-y-auto pt-3 space-y-2.5">
            {cyberTimelineEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <p>{language === 'ar' ? 'انقر على "محاكاة هجوم اختراق حي" لبدء تدفق الأحداث' : 'Click "Simulate Live Multi-Stage Attack" to stream telemetry'}</p>
              </div>
            ) : (
              cyberTimelineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    evt.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : evt.severity === 'high'
                      ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {evt.layer}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="font-bold block text-white">
                    {language === 'ar' ? evt.titleAr : evt.titleEn}
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {language === 'ar' ? evt.descriptionAr : evt.descriptionEn}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
