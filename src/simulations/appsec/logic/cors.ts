/**
 * Web & Application Security: Cross-Origin Resource Sharing (CORS) Policy Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface CorsConfig {
  allowedOrigins: string[]; // e.g. ["https://portal.nexora.local", "https://app.nexora.local"] or ["*"]
  allowedMethods: string[]; // e.g. ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allowedHeaders: string[]; // e.g. ["Content-Type", "Authorization", "X-CSRF-Token"]
  allowCredentials: boolean;
  maxAgeSeconds?: number;
}

export interface CorsPreflightRequest {
  origin: string;
  requestMethod: string;
  requestHeaders?: string[];
}

export interface CorsEvaluationResult {
  allowedByBrowser: boolean;
  isPreflight: boolean;
  responseHeaders: Record<string, string>;
  policyStatus: 'STRICT_ALLOW' | 'WILDCARD_ALLOW' | 'ORIGIN_BLOCKED' | 'METHOD_NOT_ALLOWED' | 'CREDENTIAL_CONFLICT';
  explanationEn: string;
  explanationAr: string;
}

export const DEFAULT_SECURE_CORS: CorsConfig = {
  allowedOrigins: ['https://portal.corp.nexora.local', 'https://app.corp.nexora.local'],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  allowCredentials: true,
  maxAgeSeconds: 86400,
};

/**
 * Evaluates a CORS Preflight (OPTIONS) request
 */
export function evaluatePreflight(
  req: CorsPreflightRequest,
  config: CorsConfig = DEFAULT_SECURE_CORS
): CorsEvaluationResult {
  const originMatches =
    config.allowedOrigins.includes('*') || config.allowedOrigins.includes(req.origin);

  // Critical CORS Conflict: Cannot use wildcard * with Allow-Credentials: true
  if (config.allowedOrigins.includes('*') && config.allowCredentials) {
    return {
      allowedByBrowser: false,
      isPreflight: true,
      responseHeaders: {},
      policyStatus: 'CREDENTIAL_CONFLICT',
      explanationEn: 'Browser Error: Wildcard (*) origin cannot be used when Access-Control-Allow-Credentials is true.',
      explanationAr: 'خطأ متصفح: لا يمكن استخدام النجمة (*) للنطاق عندما تكون بيانات الاعتماد (Credentials) مفعلة.',
    };
  }

  if (!originMatches) {
    return {
      allowedByBrowser: false,
      isPreflight: true,
      responseHeaders: {},
      policyStatus: 'ORIGIN_BLOCKED',
      explanationEn: `Browser blocked cross-origin request from unlisted origin '${req.origin}'.`,
      explanationAr: `حظر المتصفح الطلب لأن النطاق '${req.origin}' غير مدرج في قائمة النطاقات المسموحة.`,
    };
  }

  const methodAllowed = config.allowedMethods.includes(req.requestMethod.toUpperCase());
  if (!methodAllowed) {
    return {
      allowedByBrowser: false,
      isPreflight: true,
      responseHeaders: {},
      policyStatus: 'METHOD_NOT_ALLOWED',
      explanationEn: `HTTP method '${req.requestMethod}' is not permitted by Access-Control-Allow-Methods.`,
      explanationAr: `طريقة الطلب '${req.requestMethod}' غير مسموحة في سياسة CORS.`,
    };
  }

  const resHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': config.allowedOrigins.includes('*') ? '*' : req.origin,
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Max-Age': String(config.maxAgeSeconds ?? 86400),
  };

  if (config.allowCredentials) {
    resHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  return {
    allowedByBrowser: true,
    isPreflight: true,
    responseHeaders: resHeaders,
    policyStatus: config.allowedOrigins.includes('*') ? 'WILDCARD_ALLOW' : 'STRICT_ALLOW',
    explanationEn: 'Preflight approved: Browser is permitted to send the actual cross-origin request.',
    explanationAr: 'تمت الموافقة على الطلب التمهيدي: يسمح المتصفح بإرسال الطلب الفعلي.',
  };
}

/**
 * Evaluates actual CORS request
 */
export function evaluateCorsRequest(
  origin: string,
  method: string,
  config: CorsConfig = DEFAULT_SECURE_CORS
): CorsEvaluationResult {
  const originMatches =
    config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin);

  if (!originMatches) {
    return {
      allowedByBrowser: false,
      isPreflight: false,
      responseHeaders: {},
      policyStatus: 'ORIGIN_BLOCKED',
      explanationEn: `CORS Policy Block: Origin '${origin}' is not authorized to read response.`,
      explanationAr: `حظر سياسة CORS: النطاق '${origin}' غير مصرح له بقراءة استجابة الخادم.`,
    };
  }

  const resHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': config.allowedOrigins.includes('*') ? '*' : origin,
    'Vary': 'Origin',
  };

  if (config.allowCredentials) {
    resHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  return {
    allowedByBrowser: true,
    isPreflight: false,
    responseHeaders: resHeaders,
    policyStatus: config.allowedOrigins.includes('*') ? 'WILDCARD_ALLOW' : 'STRICT_ALLOW',
    explanationEn: 'CORS Headers present: Browser allows JavaScript client to read response payload.',
    explanationAr: 'ترويسات CORS موجودة: المتصفح يسمح لـ JavaScript بقراءة جسم الاستجابة بأمان.',
  };
}
