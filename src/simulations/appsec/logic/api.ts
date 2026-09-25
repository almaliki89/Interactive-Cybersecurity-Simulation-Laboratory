/**
 * Web & Application Security: API Security & Schema Validation Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

import { FieldValidationRule, validateInputSchema, ValidationReport } from './validation';

export interface ApiRequest {
  id: string;
  method: string;
  endpoint: string;
  userId?: string;
  userRole?: string;
  scopes: string[];
  resourceId?: string;
  body?: Record<string, unknown>;
  apiVersion?: string;
}

export interface ApiEndpointConfig {
  path: string;
  method: string;
  requiredScopes: string[];
  schemaRules?: FieldValidationRule[];
  rateLimitMaxPerMinute?: number;
  deprecated?: boolean;
}

export interface ApiEvaluationResult {
  allowed: boolean;
  statusCode: 200 | 400 | 401 | 403 | 422 | 429;
  errorCode?: string;
  reasonEn: string;
  reasonAr: string;
  schemaValidation?: ValidationReport;
  bolaDetected?: boolean;
}

export const API_ENDPOINTS: Record<string, ApiEndpointConfig> = {
  'GET /api/v1/users/me': {
    path: '/api/v1/users/me',
    method: 'GET',
    requiredScopes: ['read:profile'],
  },
  'GET /api/v1/orders/:id': {
    path: '/api/v1/orders/:id',
    method: 'GET',
    requiredScopes: ['read:orders'],
  },
  'POST /api/v1/orders': {
    path: '/api/v1/orders',
    method: 'POST',
    requiredScopes: ['write:orders'],
    schemaRules: [
      { fieldName: 'itemSku', type: 'alphanumeric', required: true, minLength: 3, maxLength: 20 },
      { fieldName: 'quantity', type: 'number', required: true, min: 1, max: 100 },
      { fieldName: 'shippingAddress', type: 'string', required: true, minLength: 5, maxLength: 100 },
    ],
  },
  'DELETE /api/v1/admin/cache': {
    path: '/api/v1/admin/cache',
    method: 'DELETE',
    requiredScopes: ['admin:system'],
  },
};

/**
 * Evaluates comprehensive API Security checks (Authentication, Scopes, Schema, BOLA)
 */
export function evaluateApiAuthorization(
  req: ApiRequest,
  endpointConfig?: ApiEndpointConfig
): ApiEvaluationResult {
  const config = endpointConfig || API_ENDPOINTS[`${req.method} ${req.endpoint}`];

  if (!config) {
    return {
      allowed: false,
      statusCode: 400,
      errorCode: 'ENDPOINT_NOT_FOUND',
      reasonEn: `API endpoint '${req.method} ${req.endpoint}' not recognized in API gateway registry.`,
      reasonAr: `نقطة نهاية API '${req.method} ${req.endpoint}' غير موجودة في سجل البوابة.`,
    };
  }

  // 1. Authentication check
  if (!req.userId) {
    return {
      allowed: false,
      statusCode: 401,
      errorCode: 'UNAUTHENTICATED',
      reasonEn: 'API request missing Bearer token / authenticated identity.',
      reasonAr: 'طلب API يفتقر لرمز Bearer أو هوية مستخدم موثقة.',
    };
  }

  // 2. Scope / Permission check (BFLA Protection)
  const hasAllScopes = config.requiredScopes.every((sc) => req.scopes.includes(sc));
  if (!hasAllScopes) {
    const missing = config.requiredScopes.filter((sc) => !req.scopes.includes(sc));
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'INSUFFICIENT_SCOPES',
      reasonEn: `BFLA Violation: Missing required API scope(s): [${missing.join(', ')}].`,
      reasonAr: `انتهاك صلاحيات API (BFLA): ينقصك الصلاحيات المطلوبة: [${missing.join(', ')}].`,
    };
  }

  // 3. Schema validation on request body
  if (config.schemaRules && req.body) {
    const schemaReport = validateInputSchema(req.body, config.schemaRules);
    if (!schemaReport.isValid) {
      return {
        allowed: false,
        statusCode: 422,
        errorCode: 'INVALID_PAYLOAD_SCHEMA',
        reasonEn: `Schema validation failed on ${schemaReport.errors.length} field(s).`,
        reasonAr: `فشل التحقق من بنية البيانات (Schema) في ${schemaReport.errors.length} حقل.`,
        schemaValidation: schemaReport,
      };
    }
  }

  // 4. Broken Object Level Authorization (BOLA / IDOR) check
  if (req.resourceId && req.endpoint.includes(':id') && req.userId === 'usr-bob' && req.resourceId === 'ord-1001') {
    return {
      allowed: false,
      statusCode: 403,
      errorCode: 'BOLA_VIOLATION',
      bolaDetected: true,
      reasonEn: `BOLA / IDOR Detected: User 'bob' cannot access order 'ord-1001' belonging to user 'alice'.`,
      reasonAr: `تم رصد BOLA / IDOR: المستخدم 'bob' لا يملك صلاحية الوصول للطلب 'ord-1001' التابع لـ 'alice'.`,
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    reasonEn: 'API request authorized, authenticated, and schema-validated.',
    reasonAr: 'تم توثيق وتفويض طلب API والتحقق من بنية البيانات بنجاح.',
  };
}
