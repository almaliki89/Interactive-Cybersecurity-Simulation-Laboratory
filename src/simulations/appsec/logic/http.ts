/**
 * Web & Application Security: HTTP Model & Deterministic Routing Logic
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export interface HttpRequestModel {
  id: string;
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: unknown;
  sessionId?: string;
  authenticatedUserId?: string;
  virtualTime: number;
}

export interface HttpResponseModel {
  id: string;
  requestId: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body?: unknown;
  virtualTime: number;
}

export interface HttpRouteDefinition {
  path: string;
  method: HttpMethod;
  requiredRole?: string;
  requiresOwnership?: boolean;
  requiresCsrf?: boolean;
  handlerName: string;
}

export const STANDARD_APP_ROUTES: HttpRouteDefinition[] = [
  { path: '/api/v1/health', method: 'GET', handlerName: 'healthCheck' },
  { path: '/api/v1/auth/login', method: 'POST', requiresCsrf: false, handlerName: 'authLogin' },
  { path: '/api/v1/auth/logout', method: 'POST', requiresCsrf: true, handlerName: 'authLogout' },
  { path: '/api/v1/profile', method: 'GET', requiredRole: 'Customer', handlerName: 'getProfile' },
  { path: '/api/v1/orders', method: 'GET', requiredRole: 'Customer', handlerName: 'listOrders' },
  { path: '/api/v1/orders/:id', method: 'GET', requiredRole: 'Customer', requiresOwnership: true, handlerName: 'getOrderById' },
  { path: '/api/v1/orders', method: 'POST', requiredRole: 'Customer', requiresCsrf: true, handlerName: 'createOrder' },
  { path: '/api/v1/finance/reports', method: 'GET', requiredRole: 'Finance', handlerName: 'getFinanceReports' },
  { path: '/api/v1/admin/users', method: 'GET', requiredRole: 'Administrator', handlerName: 'adminListUsers' },
  { path: '/api/v1/upload', method: 'POST', requiredRole: 'Customer', requiresCsrf: true, handlerName: 'uploadDocument' },
];

/**
 * Builds a deterministic HTTP request model
 */
export function buildRequest(params: {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
  sessionId?: string;
  authenticatedUserId?: string;
  virtualTime?: number;
  sequenceId?: number;
}): HttpRequestModel {
  const vTime = params.virtualTime ?? 0;
  const seq = params.sequenceId ?? 1;
  const id = `req-${params.method.toLowerCase()}-${seq}-${vTime}`;

  return {
    id,
    method: params.method,
    path: params.path,
    headers: params.headers || {
      'host': 'portal.corp.nexora.local',
      'user-agent': 'NexoraSecureBrowser/1.0',
      'accept': 'application/json',
    },
    query: params.query || {},
    body: params.body,
    sessionId: params.sessionId,
    authenticatedUserId: params.authenticatedUserId,
    virtualTime: vTime,
  };
}

/**
 * Matches an HTTP path against configured routes
 */
export function routeRequest(
  request: HttpRequestModel,
  routes: HttpRouteDefinition[] = STANDARD_APP_ROUTES
): { matched: boolean; route?: HttpRouteDefinition; params?: Record<string, string> } {
  for (const route of routes) {
    if (route.method !== request.method) continue;

    // Check exact match
    if (route.path === request.path) {
      return { matched: true, route, params: {} };
    }

    // Check parameterized match e.g. /api/v1/orders/:id
    const routeParts = route.path.split('/');
    const reqParts = request.path.split('/');

    if (routeParts.length === reqParts.length) {
      const extractedParams: Record<string, string> = {};
      let match = true;

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          const paramName = routeParts[i].slice(1);
          extractedParams[paramName] = reqParts[i];
        } else if (routeParts[i] !== reqParts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        return { matched: true, route, params: extractedParams };
      }
    }
  }

  return { matched: false };
}

/**
 * Builds a deterministic HTTP response
 */
export function buildResponse(params: {
  requestId: string;
  statusCode: number;
  body?: unknown;
  headers?: Record<string, string>;
  virtualTime?: number;
}): HttpResponseModel {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  const code = params.statusCode;
  const statusText = statusTexts[code] || 'Unknown Status';
  const vTime = params.virtualTime ?? 0;

  return {
    id: `res-${params.requestId}-${code}-${vTime}`,
    requestId: params.requestId,
    statusCode: code,
    statusText,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'server': 'Nexora-AppServer/1.0',
      'x-content-type-options': 'nosniff',
      ...(params.headers || {}),
    },
    body: params.body,
    virtualTime: vTime,
  };
}
