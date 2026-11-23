export type DigitalTwinNodeKind = 'internet' | 'firewall' | 'workstation' | 'application' | 'database' | 'identity' | 'soc' | 'endpoint';
export type DigitalTwinNodeStatus = 'healthy' | 'watch' | 'isolated' | 'protected';
export type DigitalTwinConnectionStatus = 'active' | 'blocked' | 'isolated';
export type DigitalTwinAlertStatus = 'open' | 'investigating' | 'contained' | 'resolved';
export type DigitalTwinIncidentStatus = 'investigating' | 'contained' | 'resolved';
export type DigitalTwinEventLevel = 'info' | 'warning' | 'success';

export interface DigitalTwinNode {
  id: string;
  kind: DigitalTwinNodeKind;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: DigitalTwinNodeStatus;
  x: number;
  y: number;
}

export interface DigitalTwinConnection {
  id: string;
  source: string;
  target: string;
  labelAr: string;
  labelEn: string;
  status: DigitalTwinConnectionStatus;
}

export interface DigitalTwinAlert {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  severity: 'high' | 'medium' | 'low';
  status: DigitalTwinAlertStatus;
  sourceNodeId: string;
}

export interface DigitalTwinFirewallRule {
  id: string;
  nameAr: string;
  nameEn: string;
  destination: string;
  protocol: 'TCP';
  port: number;
  action: 'ALLOW' | 'DENY';
  enabled: boolean;
  hitCount: number;
}

export interface DigitalTwinEvent {
  id: string;
  minute: number;
  level: DigitalTwinEventLevel;
  type: string;
  titleAr: string;
  titleEn: string;
  detailAr: string;
  detailEn: string;
}

export interface DigitalTwinProgress {
  alertInspected: boolean;
  endpointIsolated: boolean;
  egressBlocked: boolean;
}

export interface DigitalTwinWorldState {
  schemaVersion: 1;
  scenarioId: 'nexora-incident-01';
  virtualMinutes: number;
  incidentStatus: DigitalTwinIncidentStatus;
  score: number;
  nodes: DigitalTwinNode[];
  connections: DigitalTwinConnection[];
  alerts: DigitalTwinAlert[];
  firewallRules: DigitalTwinFirewallRule[];
  events: DigitalTwinEvent[];
  progress: DigitalTwinProgress;
  selectedNodeId: string | null;
  generatedFlowCount: number;
}

type EventInput = Omit<DigitalTwinEvent, 'id' | 'minute'>;

function pushEvent(state: DigitalTwinWorldState, event: EventInput): DigitalTwinWorldState {
  const nextEvent: DigitalTwinEvent = {
    ...event,
    id: `evt-${String(state.events.length + 1).padStart(3, '0')}`,
    minute: state.virtualMinutes,
  };
  return { ...state, events: [nextEvent, ...state.events].slice(0, 60) };
}

function updateAlertStatus(state: DigitalTwinWorldState, status: DigitalTwinAlertStatus): DigitalTwinAlert[] {
  return state.alerts.map((alert) => alert.id === 'alert-egress-01' ? { ...alert, status } : alert);
}

function markContainedIfReady(state: DigitalTwinWorldState): DigitalTwinWorldState {
  if (!state.progress.endpointIsolated || !state.progress.egressBlocked || state.incidentStatus !== 'investigating') {
    return state;
  }
  const contained: DigitalTwinWorldState = {
    ...state,
    incidentStatus: 'contained',
    alerts: updateAlertStatus(state, 'contained'),
    score: 90,
  };
  return pushEvent(contained, {
    level: 'success',
    type: 'INCIDENT_CONTAINED',
    titleAr: 'تم احتواء الحادث',
    titleEn: 'Incident contained',
    detailAr: 'اكتمل العزل وقاعدة الحظر الدقيقة مع استمرار الخدمات الأساسية.',
    detailEn: 'Isolation and precise blocking are complete while core services remain available.',
  });
}

export function createInitialDigitalTwinWorld(): DigitalTwinWorldState {
  return {
    schemaVersion: 1,
    scenarioId: 'nexora-incident-01',
    virtualMinutes: 9 * 60 + 12,
    incidentStatus: 'investigating',
    score: 0,
    nodes: [
      { id: 'internet', kind: 'internet', labelAr: 'بوابة الإنترنت', labelEn: 'Internet Gateway', descriptionAr: 'مدخل افتراضي إلى شبكة المؤسسة. لا توجد اتصالات خارجية فعلية.', descriptionEn: 'A simulated entry point. No real external connections exist.', status: 'healthy', x: 12, y: 24 },
      { id: 'edge-fw', kind: 'firewall', labelAr: 'جدار الحماية', labelEn: 'Edge Firewall', descriptionAr: 'يفحص حركة المرور بين القطاعات وفق قواعد افتراضية.', descriptionEn: 'Evaluates traffic between simulated network segments using virtual rules.', status: 'healthy', x: 38, y: 24 },
      { id: 'app-server', kind: 'application', labelAr: 'خادم التطبيقات', labelEn: 'Application Server', descriptionAr: 'يستضيف بوابة الموظفين الداخلية وخدمة الموارد البشرية.', descriptionEn: 'Hosts the internal employee portal and HR service.', status: 'healthy', x: 65, y: 24 },
      { id: 'db-server', kind: 'database', labelAr: 'قاعدة البيانات', labelEn: 'Database Server', descriptionAr: 'تخزن بيانات تدريبية اصطناعية لخدمات المؤسسة.', descriptionEn: 'Stores synthetic training records for enterprise services.', status: 'healthy', x: 88, y: 48 },
      { id: 'hr-ws-04', kind: 'workstation', labelAr: 'محطة HR-04', labelEn: 'HR Workstation 04', descriptionAr: 'محطة موظف ظهرت منها محاولات اتصال صادر غير معتادة داخل السيناريو.', descriptionEn: 'An employee workstation producing unusual simulated outbound requests.', status: 'watch', x: 38, y: 76 },
      { id: 'sim-endpoint', kind: 'endpoint', labelAr: 'وجهة خارجية تجريبية', labelEn: 'Simulated External Host', descriptionAr: 'وجهة اصطناعية محجوزة للتوثيق والاختبارات، وليست مضيفاً حقيقياً.', descriptionEn: 'A documentation-only synthetic endpoint, not a real host.', status: 'watch', x: 12, y: 76 },
      { id: 'identity', kind: 'identity', labelAr: 'خدمة الهوية', labelEn: 'Identity Service', descriptionAr: 'تدير هويات المستخدمين وجلسات الدخول داخل المؤسسة الافتراضية.', descriptionEn: 'Manages user identities and sign-in sessions in the virtual enterprise.', status: 'healthy', x: 65, y: 76 },
      { id: 'soc', kind: 'soc', labelAr: 'مركز العمليات SOC', labelEn: 'SOC Console', descriptionAr: 'يجمع الأحداث والسجلات ويعرض التنبيهات الأمنية المترابطة.', descriptionEn: 'Correlates events and logs and presents linked security alerts.', status: 'healthy', x: 88, y: 82 },
    ],
    connections: [
      { id: 'wan-fw', source: 'internet', target: 'edge-fw', labelAr: 'حركة محيطية', labelEn: 'Perimeter traffic', status: 'active' },
      { id: 'fw-app', source: 'edge-fw', target: 'app-server', labelAr: 'HTTPS · 443', labelEn: 'HTTPS · 443', status: 'active' },
      { id: 'app-db', source: 'app-server', target: 'db-server', labelAr: 'قاعدة البيانات', labelEn: 'Database link', status: 'active' },
      { id: 'fw-hr', source: 'edge-fw', target: 'hr-ws-04', labelAr: 'قطاع الموظفين', labelEn: 'Employee segment', status: 'active' },
      { id: 'hr-external', source: 'hr-ws-04', target: 'sim-endpoint', labelAr: 'اتصال صادر مشبوه', labelEn: 'Suspicious outbound', status: 'active' },
      { id: 'app-id', source: 'app-server', target: 'identity', labelAr: 'مصادقة', labelEn: 'Authentication', status: 'active' },
      { id: 'soc-fw', source: 'soc', target: 'edge-fw', labelAr: 'قياس ومراقبة', labelEn: 'Telemetry', status: 'active' },
    ],
    alerts: [
      {
        id: 'alert-egress-01',
        titleAr: 'نشاط صادر غير معتاد من HR-04',
        titleEn: 'Unusual outbound activity from HR-04',
        descriptionAr: 'رُصدت محاولات اتصال متكررة بوجهة تجريبية غير معتمدة. افحص المحطة، ثم احتوِ النشاط دون تعطيل خدمات المؤسسة.',
        descriptionEn: 'Repeated requests to an unapproved simulated endpoint were observed. Inspect the workstation, then contain the activity without disrupting enterprise services.',
        severity: 'high',
        status: 'open',
        sourceNodeId: 'hr-ws-04',
      },
    ],
    firewallRules: [
      { id: 'FW-001', nameAr: 'السماح بخدمة بوابة الموظفين', nameEn: 'Allow employee portal', destination: 'app-server · TCP/443', protocol: 'TCP', port: 443, action: 'ALLOW', enabled: true, hitCount: 0 },
    ],
    events: [
      { id: 'evt-004', minute: 9 * 60 + 12, level: 'warning', type: 'ALERT_RAISED', titleAr: 'إنشاء تنبيه عالي الخطورة', titleEn: 'High severity alert raised', detailAr: 'مصدر التنبيه: محطة HR-04 · الوجهة: مضيف تجريبي.', detailEn: 'Source: HR-04 workstation · Destination: simulated external host.' },
      { id: 'evt-003', minute: 9 * 60 + 11, level: 'warning', type: 'FLOW_OBSERVED', titleAr: 'رصد اتصال صادر', titleEn: 'Outbound request observed', detailAr: 'طلب TCP تجريبي إلى 198.51.100.77:443.', detailEn: 'Synthetic TCP request to 198.51.100.77:443.' },
      { id: 'evt-002', minute: 9 * 60 + 10, level: 'info', type: 'WORLD_READY', titleAr: 'اكتمل تحميل المؤسسة الافتراضية', titleEn: 'Virtual enterprise initialized', detailAr: 'تم تحميل الأجهزة والخدمات والروابط الاصطناعية.', detailEn: 'Synthetic devices, services, and links were loaded.' },
      { id: 'evt-001', minute: 9 * 60 + 0, level: 'info', type: 'SCENARIO_STARTED', titleAr: 'بدأ سيناريو NEXORA-IR-01', titleEn: 'NEXORA-IR-01 scenario started', detailAr: 'بيئة تدريب معزولة ببيانات وأحداث مولّدة.', detailEn: 'Isolated training environment with generated data and events.' },
    ],
    progress: { alertInspected: false, endpointIsolated: false, egressBlocked: false },
    selectedNodeId: 'hr-ws-04',
    generatedFlowCount: 1,
  };
}

export function inspectDigitalTwinNode(state: DigitalTwinWorldState, nodeId: string): DigitalTwinWorldState {
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!node) return state;
  let next = { ...state, selectedNodeId: nodeId };
  if (nodeId === 'hr-ws-04' && !state.progress.alertInspected) {
    next = { ...next, progress: { ...next.progress, alertInspected: true }, alerts: updateAlertStatus(next, 'investigating') };
    next = pushEvent(next, {
      level: 'info',
      type: 'HOST_INSPECTED',
      titleAr: 'فحص محطة HR-04',
      titleEn: 'HR-04 workstation inspected',
      detailAr: 'تم فتح تفاصيل المحطة وربطها بالتنبيه الأمني.',
      detailEn: 'The workstation details were opened and correlated with the security alert.',
    });
  }
  return next;
}

export function isolateDigitalTwinEndpoint(state: DigitalTwinWorldState): DigitalTwinWorldState {
  if (state.progress.endpointIsolated) return state;
  if (!state.progress.alertInspected) return pushEvent(state, {
    level: 'warning', type: 'ACTION_REQUIRES_INSPECTION',
    titleAr: 'افحص التنبيه أولاً', titleEn: 'Inspect the alert first',
    detailAr: 'اقرأ تفاصيل HR-04 واربطها بالتنبيه قبل تنفيذ العزل.',
    detailEn: 'Inspect HR-04 and correlate it with the alert before isolating the host.',
  });
  const next: DigitalTwinWorldState = {
    ...state,
    nodes: state.nodes.map((node) => node.id === 'hr-ws-04' ? { ...node, status: 'isolated' } : node),
    connections: state.connections.map((link) => link.source === 'hr-ws-04' || link.target === 'hr-ws-04'
      ? { ...link, status: 'isolated' }
      : link),
    progress: { ...state.progress, endpointIsolated: true },
    alerts: updateAlertStatus(state, 'investigating'),
  };
  return markContainedIfReady(pushEvent(next, {
    level: 'success',
    type: 'HOST_ISOLATED',
    titleAr: 'عزل محطة HR-04 افتراضياً',
    titleEn: 'HR-04 isolated in the simulation',
    detailAr: 'انقطعت روابط المحطة في الخريطة الافتراضية وبقيت خدمات المؤسسة الأخرى متاحة.',
    detailEn: 'The workstation links were isolated on the virtual map while the other enterprise services remain available.',
  }));
}

export function blockDigitalTwinEgress(state: DigitalTwinWorldState): DigitalTwinWorldState {
  if (state.progress.egressBlocked) return state;
  if (!state.progress.alertInspected) return pushEvent(state, {
    level: 'warning', type: 'ACTION_REQUIRES_INSPECTION',
    titleAr: 'افحص التنبيه أولاً', titleEn: 'Inspect the alert first',
    detailAr: 'افحص مصدر النشاط قبل إضافة قاعدة الجدار الناري.',
    detailEn: 'Inspect the activity source before adding a firewall rule.',
  });
  const rule: DigitalTwinFirewallRule = {
    id: 'FW-019',
    nameAr: 'حظر الوجهة التجريبية المشبوهة',
    nameEn: 'Block suspicious simulated destination',
    destination: '198.51.100.77 · TCP/443',
    protocol: 'TCP',
    port: 443,
    action: 'DENY',
    enabled: true,
    hitCount: 1,
  };
  let next: DigitalTwinWorldState = {
    ...state,
    firewallRules: [...state.firewallRules.filter((item) => item.id !== rule.id), rule],
    connections: state.connections.map((link) => link.id === 'hr-external' ? { ...link, status: 'blocked' } : link),
    progress: { ...state.progress, egressBlocked: true },
  };
  next = pushEvent(next, {
    level: 'success',
    type: 'FIREWALL_RULE_ADDED',
    titleAr: 'إضافة قاعدة حظر دقيقة',
    titleEn: 'Precise firewall block rule added',
    detailAr: 'أُنشئت قاعدة تمنع الوجهة التجريبية المحددة فقط على TCP/443.',
    detailEn: 'A rule now denies only the specified simulated destination on TCP/443.',
  });
  next = pushEvent(next, {
    level: 'success',
    type: 'SIMULATED_FLOW_BLOCKED',
    titleAr: 'حظر الاتصال التجريبي',
    titleEn: 'Simulated flow blocked',
    detailAr: 'تم منع المسار المشبوه دون حظر خدمات بوابة الموظفين.',
    detailEn: 'The suspicious path was blocked without denying employee portal services.',
  });
  return markContainedIfReady(next);
}

export function advanceDigitalTwinMinute(state: DigitalTwinWorldState): DigitalTwinWorldState {
  const resolved = state.incidentStatus === 'resolved';
  const nextMinute = state.virtualMinutes + 1;
  const rules = !resolved && state.progress.egressBlocked
    ? state.firewallRules.map((rule) => rule.id === 'FW-019' ? { ...rule, hitCount: rule.hitCount + 1 } : rule)
    : state.firewallRules;
  const base: DigitalTwinWorldState = {
    ...state,
    virtualMinutes: nextMinute,
    generatedFlowCount: state.generatedFlowCount + (resolved ? 0 : 1),
    firewallRules: rules,
  };

  if (resolved) {
    return pushEvent(base, {
      level: 'info',
      type: 'VIRTUAL_CLOCK_TICK',
      titleAr: 'استمر الوقت الافتراضي بعد إغلاق الحادث',
      titleEn: 'Virtual clock continued after incident closure',
      detailAr: 'الحادث مغلق؛ لم تُنشأ محاولات اتصال أو تنبيهات جديدة.',
      detailEn: 'The incident is closed; no new connection attempts or alerts were generated.',
    });
  }
  if (state.progress.endpointIsolated) {
    return pushEvent(base, {
      level: 'info',
      type: 'VIRTUAL_CLOCK_TICK',
      titleAr: 'المحطة المعزولة خارج مسار الاتصال',
      titleEn: 'Isolated workstation is off the traffic path',
      detailAr: 'المحطة المعزولة لا تستطيع إنشاء حركة صادرة في هذا السيناريو.',
      detailEn: 'The isolated workstation cannot generate outbound traffic in this scenario.',
    });
  }
  if (state.progress.egressBlocked) {
    return pushEvent(base, {
      level: 'success',
      type: 'SIMULATED_FLOW_BLOCKED',
      titleAr: 'حظرت القاعدة المحاولة الجديدة',
      titleEn: 'The rule blocked the new request',
      detailAr: 'سُجلت ضربة جديدة على قاعدة FW-019 وبقيت الخدمات الأساسية متاحة.',
      detailEn: 'A new hit was recorded on FW-019 while core services remain available.',
    });
  }
  return pushEvent(base, {
    level: 'warning',
    type: 'SIMULATED_FLOW_REPEATED',
    titleAr: 'تكررت المحاولة الصادرة',
    titleEn: 'Outbound attempt repeated',
    detailAr: 'ظهرت محاولة TCP جديدة من HR-04 إلى الوجهة التجريبية؛ ما زالت بحاجة إلى احتواء.',
    detailEn: 'A new TCP attempt from HR-04 to the simulated endpoint was observed and still needs containment.',
  });
}

export function resolveDigitalTwinIncident(state: DigitalTwinWorldState): DigitalTwinWorldState {
  if (!state.progress.endpointIsolated || !state.progress.egressBlocked) {
    return pushEvent(state, {
      level: 'warning',
      type: 'RESOLUTION_REJECTED',
      titleAr: 'لم تكتمل متطلبات الإغلاق',
      titleEn: 'Resolution requirements not met',
      detailAr: 'اعزل محطة HR-04 وأضف قاعدة حظر دقيقة قبل إغلاق الحادث.',
      detailEn: 'Isolate HR-04 and add the precise block rule before closing the incident.',
    });
  }
  if (state.incidentStatus === 'resolved') return state;
  let next: DigitalTwinWorldState = {
    ...state,
    incidentStatus: 'resolved',
    alerts: updateAlertStatus(state, 'resolved'),
    score: 100,
  };
  next = pushEvent(next, {
    level: 'success',
    type: 'INCIDENT_RESOLVED',
    titleAr: 'أُغلق الحادث بنجاح',
    titleEn: 'Incident resolved successfully',
    detailAr: 'اكتملت خطوات الاحتواء والتوثيق. لم تتأثر خوادم التطبيقات أو قاعدة البيانات.',
    detailEn: 'Containment and documentation are complete. Application and database services were not disrupted.',
  });
  return next;
}
