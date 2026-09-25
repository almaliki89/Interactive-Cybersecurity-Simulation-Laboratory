/**
 * Web & Application Security: Deterministic HTTP Request Pipeline Runtime Scenario
 * Obeying the global SimulationRuntime virtual time, clock, and EventEngine architecture.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { SimulationRuntime } from '../../../engine/runtime/SimulationRuntime';
import { ScheduledEvent } from '../../../engine/events/EventEngine';
import { HttpRequestModel, HttpResponseModel, buildRequest, buildResponse, routeRequest } from '../logic/http';

export type HttpPipelineFailure =
  | 'NONE'
  | 'AUTH_REQUIRED_401'
  | 'BOLA_IDOR_403'
  | 'ROLE_FORBIDDEN_403'
  | 'VALIDATION_FAILED_422'
  | 'RATE_LIMIT_429'
  | 'CSRF_INVALID_403';

export interface HttpRequestScenarioConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  userId?: string;
  username?: string;
  role?: 'Customer' | 'Finance' | 'Manager' | 'Administrator';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  failureScenario?: HttpPipelineFailure;
  startVirtualTime?: number;
  stepIntervalMs?: number;
}

export interface DerivedHttpPipelineState {
  currentStage:
    | 'IDLE'
    | 'BROWSER_INIT'
    | 'DNS_RESOLVED'
    | 'TCP_ESTABLISHED'
    | 'TLS_ESTABLISHED'
    | 'REVERSE_PROXY'
    | 'ROUTE_MATCHED'
    | 'SESSION_RESOLVED'
    | 'AUTH_EVALUATED'
    | 'INPUT_VALIDATED'
    | 'DB_QUERIED'
    | 'RESPONSE_SENT'
    | 'FAILED';
  request: HttpRequestModel;
  response?: HttpResponseModel;
  dnsResolvedIp?: string;
  tlsCipherSuite?: string;
  matchedRoute?: string;
  sessionValid?: boolean;
  authorized?: boolean;
  inputValid?: boolean;
  databaseQuery?: string;
  failureReason?: HttpPipelineFailure;
  errorMessageEn?: string;
  errorMessageAr?: string;
  pipelineLogs: {
    stage: string;
    messageEn: string;
    messageAr: string;
    time: number;
    failure?: boolean;
    eventId: string;
  }[];
}

export const HTTP_EVENT_TYPES = {
  REQUEST_CREATED: 'HTTP_REQUEST_CREATED',
  DNS_RESOLVED: 'DNS_RESOLUTION_COMPLETED',
  TCP_ESTABLISHED: 'TCP_CONNECTION_ESTABLISHED',
  TLS_ESTABLISHED: 'TLS_SESSION_ESTABLISHED',
  REQUEST_RECEIVED: 'HTTP_REQUEST_RECEIVED',
  ROUTE_MATCHED: 'ROUTE_MATCHED',
  SESSION_RESOLVED: 'SESSION_RESOLVED',
  AUTHORIZATION_CHECKED: 'AUTHORIZATION_CHECKED',
  INPUT_VALIDATED: 'INPUT_VALIDATED',
  DATABASE_QUERY_EXECUTED: 'DATABASE_QUERY_EXECUTED',
  RESPONSE_CREATED: 'HTTP_RESPONSE_CREATED',
  RESPONSE_SENT: 'HTTP_RESPONSE_SENT',
  PIPELINE_FAILED: 'HTTP_PIPELINE_FAILED',
} as const;

/**
 * Schedules a deterministic multi-tier HTTP Request Lifecycle on the SimulationRuntime
 */
export function loadHttpRequestScenario(
  runtime: SimulationRuntime,
  config: HttpRequestScenarioConfig
): void {
  const startTime = config.startVirtualTime ?? runtime.clock.getVirtualTime();
  const interval = config.stepIntervalMs ?? 100;
  const failure = config.failureScenario ?? 'NONE';
  const userId = config.userId ?? 'usr-alice';
  const username = config.username ?? 'alice';
  const role = config.role ?? 'Customer';

  const scheduled: ScheduledEvent[] = [];

  const req = buildRequest({
    method: config.method,
    path: config.path,
    headers: config.headers,
    body: config.body,
    authenticatedUserId: failure === 'AUTH_REQUIRED_401' ? undefined : userId,
    virtualTime: startTime,
  });

  // T+0: Browser creates HTTP Request
  scheduled.push({
    at: startTime,
    type: HTTP_EVENT_TYPES.REQUEST_CREATED,
    source: 'Browser (Client)',
    target: 'Local Resolver',
    category: 'HTTP',
    severity: 'info',
    description: `HTTP ${req.method} request created for ${req.path}`,
    payload: { request: req, userId, username, role },
  });

  // T+100: DNS Resolution
  scheduled.push({
    at: startTime + interval,
    type: HTTP_EVENT_TYPES.DNS_RESOLVED,
    source: 'DNS Resolver',
    target: 'Browser (Client)',
    category: 'NETWORKING',
    severity: 'info',
    description: 'DNS Lookup: portal.corp.nexora.local -> 10.0.10.50 (A Record)',
    payload: { domain: 'portal.corp.nexora.local', resolvedIp: '10.0.10.50' },
  });

  // T+200: TCP 3-Way Handshake
  scheduled.push({
    at: startTime + interval * 2,
    type: HTTP_EVENT_TYPES.TCP_ESTABLISHED,
    source: 'Client (192.168.1.50)',
    target: 'Reverse Proxy (10.0.10.50:443)',
    category: 'NETWORKING',
    severity: 'info',
    description: 'TCP 3-Way Handshake Complete (SYN, SYN-ACK, ACK) on Port 443',
    payload: { port: 443, seq: 10001, ack: 20001 },
  });

  // T+300: TLS 1.3 Session Established
  scheduled.push({
    at: startTime + interval * 3,
    type: HTTP_EVENT_TYPES.TLS_ESTABLISHED,
    source: 'Reverse Proxy (Nginx)',
    target: 'Client',
    category: 'CRYPTO',
    severity: 'info',
    description: 'TLS 1.3 Handshake Complete: Cipher TLS_AES_256_GCM_SHA384 (Encrypted)',
    payload: { cipherSuite: 'TLS_AES_256_GCM_SHA384', cert: 'CN=portal.corp.nexora.local' },
  });

  // T+400: Reverse Proxy Receives & Forwards
  scheduled.push({
    at: startTime + interval * 4,
    type: HTTP_EVENT_TYPES.REQUEST_RECEIVED,
    source: 'Reverse Proxy (Nginx)',
    target: 'App Server (Node.js)',
    category: 'GATEWAY',
    severity: 'info',
    description: `Nginx terminated TLS and forwarded ${req.method} ${req.path} to upstream app worker`,
    payload: { upstream: '127.0.0.1:3000', path: req.path },
  });

  // T+500: App Router Matches Route
  const routeMatch = routeRequest(req);
  scheduled.push({
    at: startTime + interval * 5,
    type: HTTP_EVENT_TYPES.ROUTE_MATCHED,
    source: 'App Router',
    target: 'Route Handler',
    category: 'APPSEC',
    severity: 'info',
    description: `Route Matched: ${req.method} ${req.path} -> Handler '${routeMatch.route?.handlerName || 'defaultHandler'}'`,
    payload: { route: routeMatch.route, params: routeMatch.params },
  });

  // Rate Limiting Failure Check
  if (failure === 'RATE_LIMIT_429') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 429,
      body: { error: 'Too Many Requests', retryAfter: 30 },
      virtualTime: startTime + interval * 6,
    });
    scheduled.push({
      at: startTime + interval * 6,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'Rate Limiter',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: 'HTTP 429 Too Many Requests: Rate limit quota exceeded.',
      payload: {
        failureReason: 'RATE_LIMIT_429',
        response: errRes,
        messageEn: 'Rate limit triggered (HTTP 429). Client exceeded allowed request threshold.',
        messageAr: 'تم تجاوز معدل الطلبات المسموح به (رمز 429).',
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  // T+600: Session Resolved
  if (failure === 'AUTH_REQUIRED_401') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 401,
      body: { error: 'Unauthorized', message: 'Authentication required' },
      virtualTime: startTime + interval * 6,
    });
    scheduled.push({
      at: startTime + interval * 6,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'Session Middleware',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: 'HTTP 401 Unauthorized: Request missing valid session cookie or token.',
      payload: {
        failureReason: 'AUTH_REQUIRED_401',
        response: errRes,
        messageEn: 'Authentication failed (HTTP 401): No valid active session.',
        messageAr: 'فشلت المصادقة (رمز 401): لا توجد جلسة مستخدم نشطة صالحة.',
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  scheduled.push({
    at: startTime + interval * 6,
    type: HTTP_EVENT_TYPES.SESSION_RESOLVED,
    source: 'Session Manager',
    target: 'Auth Guard',
    category: 'APPSEC',
    severity: 'info',
    description: `Session Verified: User '${username}' (${userId}) authenticated as role '${role}'`,
    payload: { userId, username, role, sessionValid: true },
  });

  // T+700: Authorization Evaluated (BOLA / Role check)
  if (failure === 'BOLA_IDOR_403') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 403,
      body: { error: 'Forbidden', message: 'Object access denied' },
      virtualTime: startTime + interval * 7,
    });
    scheduled.push({
      at: startTime + interval * 7,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'Authorization Guard',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: `HTTP 403 Forbidden: BOLA Violation: User '${username}' cannot access resource owned by another user.`,
      payload: {
        failureReason: 'BOLA_IDOR_403',
        response: errRes,
        messageEn: "BOLA / IDOR Violation (HTTP 403): User lacks object-level ownership rights.",
        messageAr: "انتهاك تفويض الكائنات (رمز 403): المستخدم لا يملك صلاحية الوصول لهذا الكائن.",
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'ROLE_FORBIDDEN_403') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 403,
      body: { error: 'Forbidden', message: 'Insufficient role privilege' },
      virtualTime: startTime + interval * 7,
    });
    scheduled.push({
      at: startTime + interval * 7,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'RBAC Guard',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: `HTTP 403 Forbidden: User with role '${role}' cannot access route requiring 'Finance'.`,
      payload: {
        failureReason: 'ROLE_FORBIDDEN_403',
        response: errRes,
        messageEn: `RBAC Violation (HTTP 403): Role '${role}' lacks privilege for requested route.`,
        messageAr: `انتهاك الصلاحيات (رمز 403): الدور '${role}' لا يملك إذن الوصول للمسار.`,
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  if (failure === 'CSRF_INVALID_403') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 403,
      body: { error: 'Forbidden', message: 'Invalid CSRF token' },
      virtualTime: startTime + interval * 7,
    });
    scheduled.push({
      at: startTime + interval * 7,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'CSRF Guard',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: 'HTTP 403 Forbidden: State-changing cross-origin request lacked valid Anti-CSRF Token.',
      payload: {
        failureReason: 'CSRF_INVALID_403',
        response: errRes,
        messageEn: 'CSRF Defense Triggered (HTTP 403): Missing or invalid anti-CSRF token.',
        messageAr: 'تم تفعيل حماية CSRF (رمز 403): رمز الحماية مفقود أو غير مطابق.',
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  scheduled.push({
    at: startTime + interval * 7,
    type: HTTP_EVENT_TYPES.AUTHORIZATION_CHECKED,
    source: 'Auth Guard',
    target: 'Input Validator',
    category: 'APPSEC',
    severity: 'info',
    description: `Authorization Granted: User '${username}' verified for ${req.path}`,
    payload: { authorized: true, userId, role },
  });

  // T+800: Input Validation
  if (failure === 'VALIDATION_FAILED_422') {
    const errRes = buildResponse({
      requestId: req.id,
      statusCode: 422,
      body: { error: 'Unprocessable Entity', errors: ['Quantity out of range (min: 1, max: 100)'] },
      virtualTime: startTime + interval * 8,
    });
    scheduled.push({
      at: startTime + interval * 8,
      type: HTTP_EVENT_TYPES.PIPELINE_FAILED,
      source: 'Input Validator',
      target: 'Client',
      category: 'APPSEC',
      severity: 'threat',
      description: 'HTTP 422 Unprocessable Entity: Request body failed schema validation.',
      payload: {
        failureReason: 'VALIDATION_FAILED_422',
        response: errRes,
        messageEn: 'Input Validation Failed (HTTP 422): Payload schema rules violated.',
        messageAr: 'فشل التحقق من المدخلات (رمز 422): البيانات لا تطابق الشروط المطلوبة.',
      },
    });
    runtime.events.scheduleBatch(scheduled);
    return;
  }

  scheduled.push({
    at: startTime + interval * 8,
    type: HTTP_EVENT_TYPES.INPUT_VALIDATED,
    source: 'Input Validator',
    target: 'Database Adapter',
    category: 'APPSEC',
    severity: 'info',
    description: 'Input Validation Succeeded: Parameters normalized and canonicalized',
    payload: { inputValid: true },
  });

  // T+900: Database Query Executed
  scheduled.push({
    at: startTime + interval * 9,
    type: HTTP_EVENT_TYPES.DATABASE_QUERY_EXECUTED,
    source: 'Database Adapter',
    target: 'PostgreSQL DB',
    category: 'DATA',
    severity: 'info',
    description: 'SQL Prepared Statement: SELECT * FROM orders WHERE user_id = $1 AND id = $2',
    payload: { query: 'SELECT * FROM orders WHERE user_id = $1 AND id = $2', parameterized: true },
  });

  // T+1000: Response Created
  const successRes = buildResponse({
    requestId: req.id,
    statusCode: 200,
    body: {
      status: 'success',
      data: { orderId: 'ord-1001', item: 'Enterprise Server Rack', amount: 14500, status: 'Shipped' },
    },
    virtualTime: startTime + interval * 10,
  });

  scheduled.push({
    at: startTime + interval * 10,
    type: HTTP_EVENT_TYPES.RESPONSE_CREATED,
    source: 'App Server',
    target: 'Reverse Proxy',
    category: 'HTTP',
    severity: 'success',
    description: 'HTTP 200 OK Response generated with security headers',
    payload: { response: successRes },
  });

  // T+1100: Response Sent to Client
  scheduled.push({
    at: startTime + interval * 11,
    type: HTTP_EVENT_TYPES.RESPONSE_SENT,
    source: 'Reverse Proxy',
    target: 'Browser (Client)',
    category: 'HTTP',
    severity: 'success',
    description: `HTTP 200 OK delivered to client. Request lifecycle complete.`,
    payload: { response: successRes, totalDurationMs: interval * 11 },
  });

  runtime.events.scheduleBatch(scheduled);
}

/**
 * Pure deterministic reducer that projects runtime event history
 * into the complete authoritative HTTP request pipeline state.
 */
export function deriveHttpRequestStateFromEvents(
  events: Array<{
    id: string;
    type: string;
    virtualTime?: number;
    source?: string;
    target?: string;
    category?: string;
    severity?: string;
    description?: string;
    payload?: any;
    [key: string]: any;
  }>,
  maxVirtualTime?: number
): DerivedHttpPipelineState {
  let relevant = events.filter((e) =>
    e.type.startsWith('HTTP_') ||
    e.type === HTTP_EVENT_TYPES.DNS_RESOLVED ||
    e.type === HTTP_EVENT_TYPES.TCP_ESTABLISHED ||
    e.type === HTTP_EVENT_TYPES.TLS_ESTABLISHED ||
    e.type === HTTP_EVENT_TYPES.ROUTE_MATCHED ||
    e.type === HTTP_EVENT_TYPES.SESSION_RESOLVED ||
    e.type === HTTP_EVENT_TYPES.AUTHORIZATION_CHECKED ||
    e.type === HTTP_EVENT_TYPES.INPUT_VALIDATED ||
    e.type === HTTP_EVENT_TYPES.DATABASE_QUERY_EXECUTED
  );

  if (maxVirtualTime !== undefined) {
    relevant = relevant.filter((e) => (e.virtualTime ?? 0) <= maxVirtualTime);
  }

  relevant.sort((a, b) => (a.virtualTime ?? 0) - (b.virtualTime ?? 0) || a.id.localeCompare(b.id));

  let currentStage: DerivedHttpPipelineState['currentStage'] = 'IDLE';
  let request: HttpRequestModel = buildRequest({ method: 'GET', path: '/api/v1/orders/1001', virtualTime: 0 });
  let response: HttpResponseModel | undefined = undefined;
  let dnsResolvedIp: string | undefined = undefined;
  let tlsCipherSuite: string | undefined = undefined;
  let matchedRoute: string | undefined = undefined;
  let sessionValid: boolean | undefined = undefined;
  let authorized: boolean | undefined = undefined;
  let inputValid: boolean | undefined = undefined;
  let databaseQuery: string | undefined = undefined;
  let failureReason: HttpPipelineFailure = 'NONE';
  let errorMessageEn: string | undefined = undefined;
  let errorMessageAr: string | undefined = undefined;

  const pipelineLogs: DerivedHttpPipelineState['pipelineLogs'] = [];

  for (const evt of relevant) {
    const vTime = evt.virtualTime ?? 0;

    if (evt.payload?.request) request = evt.payload.request;
    if (evt.payload?.response) response = evt.payload.response;

    switch (evt.type) {
      case HTTP_EVENT_TYPES.REQUEST_CREATED: {
        currentStage = 'BROWSER_INIT';
        pipelineLogs.push({
          stage: 'Browser Init',
          messageEn: `Client initiated ${request.method} ${request.path}`,
          messageAr: `بدأ المتصفح إرسال طلب ${request.method} ${request.path}`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.DNS_RESOLVED: {
        currentStage = 'DNS_RESOLVED';
        dnsResolvedIp = evt.payload?.resolvedIp || '10.0.10.50';
        pipelineLogs.push({
          stage: 'DNS Resolution',
          messageEn: `DNS resolved domain to ${dnsResolvedIp}`,
          messageAr: `تم حل اسم النطاق إلى عنوان IP ${dnsResolvedIp}`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.TCP_ESTABLISHED: {
        currentStage = 'TCP_ESTABLISHED';
        pipelineLogs.push({
          stage: 'TCP Handshake',
          messageEn: 'TCP 3-Way Handshake established on port 443',
          messageAr: 'تمت مصافحة TCP الثلاثية على المنفذ 443',
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.TLS_ESTABLISHED: {
        currentStage = 'TLS_ESTABLISHED';
        tlsCipherSuite = evt.payload?.cipherSuite || 'TLS_AES_256_GCM_SHA384';
        pipelineLogs.push({
          stage: 'TLS Session',
          messageEn: `TLS 1.3 encrypted tunnel established (${tlsCipherSuite})`,
          messageAr: `تم إنشاء نفق TLS 1.3 المشفر (${tlsCipherSuite})`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.REQUEST_RECEIVED: {
        currentStage = 'REVERSE_PROXY';
        pipelineLogs.push({
          stage: 'Reverse Proxy',
          messageEn: 'Nginx terminated TLS and routed HTTP payload to app worker',
          messageAr: 'قام خادم Nginx بإنهاء التشفير وتوجيه الطلب لمعالج التطبيقات',
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.ROUTE_MATCHED: {
        currentStage = 'ROUTE_MATCHED';
        matchedRoute = evt.payload?.route?.path;
        pipelineLogs.push({
          stage: 'Router',
          messageEn: `Express router matched route handler: ${matchedRoute || request.path}`,
          messageAr: `طابق موجه Express مسار المعالجة: ${matchedRoute || request.path}`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.SESSION_RESOLVED: {
        currentStage = 'SESSION_RESOLVED';
        sessionValid = true;
        pipelineLogs.push({
          stage: 'Session Auth',
          messageEn: `Active session validated for user '${evt.payload?.username}' (${evt.payload?.role})`,
          messageAr: `تم التحقق من الجلسة النشطة للمستخدم '${evt.payload?.username}' (${evt.payload?.role})`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.AUTHORIZATION_CHECKED: {
        currentStage = 'AUTH_EVALUATED';
        authorized = true;
        pipelineLogs.push({
          stage: 'Authorization',
          messageEn: 'RBAC & Object-Level Ownership access granted',
          messageAr: 'تم منح الإذن بعد التحقق من الدور وملكية الكائن',
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.INPUT_VALIDATED: {
        currentStage = 'INPUT_VALIDATED';
        inputValid = true;
        pipelineLogs.push({
          stage: 'Input Validation',
          messageEn: 'Parameters schema-validated, normalized, and canonicalized',
          messageAr: 'تم التحقق من المعلمات وتوحيد صيغتها بنجاح',
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.DATABASE_QUERY_EXECUTED: {
        currentStage = 'DB_QUERIED';
        databaseQuery = evt.payload?.query;
        pipelineLogs.push({
          stage: 'Database',
          messageEn: `Prepared statement executed on database: ${databaseQuery}`,
          messageAr: `تم تنفيذ الاستعلام المعلمي على قاعدة البيانات: ${databaseQuery}`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.RESPONSE_CREATED:
      case HTTP_EVENT_TYPES.RESPONSE_SENT: {
        currentStage = 'RESPONSE_SENT';
        pipelineLogs.push({
          stage: 'Response',
          messageEn: `HTTP ${response?.statusCode || 200} OK delivered to client`,
          messageAr: `تم تسليم الاستجابة رمز ${response?.statusCode || 200} بنجاح للعميل`,
          time: vTime,
          eventId: evt.id,
        });
        break;
      }
      case HTTP_EVENT_TYPES.PIPELINE_FAILED: {
        currentStage = 'FAILED';
        failureReason = evt.payload?.failureReason || 'AUTH_REQUIRED_401';
        errorMessageEn = evt.payload?.messageEn || evt.description;
        errorMessageAr = evt.payload?.messageAr || 'فشلت معالجة الطلب.';
        pipelineLogs.push({
          stage: 'Pipeline Rejected',
          messageEn: errorMessageEn || 'HTTP Request Rejected',
          messageAr: errorMessageAr || 'تم رفض طلب HTTP',
          time: vTime,
          failure: true,
          eventId: evt.id,
        });
        break;
      }
    }
  }

  return {
    currentStage,
    request,
    response,
    dnsResolvedIp,
    tlsCipherSuite,
    matchedRoute,
    sessionValid,
    authorized,
    inputValid,
    databaseQuery,
    failureReason,
    errorMessageEn,
    errorMessageAr,
    pipelineLogs,
  };
}
