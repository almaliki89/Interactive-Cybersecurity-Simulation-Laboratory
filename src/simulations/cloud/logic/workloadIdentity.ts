/**
 * OMEGA V13 — Cloud Security World
 * logic/workloadIdentity.ts
 *
 * Deterministic Workload Identity & Instance Metadata Service (IMDS) Engine.
 * Models IMDSv1 (vulnerable to SSRF) vs IMDSv2 (session-token + hop limit),
 * Instance Profiles, and Workload Identity Federation.
 * Zero non-deterministic functions.
 */

export interface ImdsSessionToken {
  token: string;
  ttlSeconds: number;
  createdVirtualTime: number;
  expirationVirtualTime: number;
}

export interface ImdsConfig {
  version: 'v1' | 'v2';
  httpTokens: 'optional' | 'required'; // optional = v1 allowed, required = v2 enforced
  httpPutResponseHopLimit: number; // 1 prevents container/SSRF proxy hop, 2+ allows
  httpEndpoint: 'enabled' | 'disabled';
}

export interface ImdsRequest {
  method: 'GET' | 'PUT';
  path: string; // e.g. '/latest/api/token' or '/latest/meta-data/iam/security-credentials/NexoraAppWorkloadInstanceProfileRole'
  headers: Record<string, string>;
  hopCount: number; // 1 = direct from host, 2+ = traversed through container bridge / reverse proxy SSRF
  virtualTime: number;
}

export interface ImdsResponse {
  statusCode: number;
  statusText: string;
  body: string | Record<string, any>;
  headers?: Record<string, string>;
  isSsrfExploitable: boolean;
  securityAssessment: {
    en: string;
    ar: string;
  };
}

export class ImdsEngine {
  private activeTokens: Map<string, ImdsSessionToken> = new Map();

  public evaluateRequest(config: ImdsConfig, request: ImdsRequest, roleCredentials?: Record<string, any>): ImdsResponse {
    // Check if IMDS endpoint is disabled
    if (config.httpEndpoint === 'disabled') {
      return {
        statusCode: 403,
        statusText: 'Forbidden',
        body: 'Instance metadata service endpoint is disabled.',
        isSsrfExploitable: false,
        securityAssessment: {
          en: 'IMDS is completely disabled. Secure against SSRF credential theft.',
          ar: 'خدمة بيانات التعريف معطلة بالكامل. محصنة ضد سرقة بيانات الاعتماد عبر SSRF.',
        },
      };
    }

    // Check hop limit: if hopCount exceeds httpPutResponseHopLimit, packet dropped!
    if (request.hopCount > config.httpPutResponseHopLimit) {
      return {
        statusCode: 408,
        statusText: 'Request Timeout / TTL Exceeded',
        body: 'Metadata packet dropped: IP TTL / hop limit exceeded.',
        isSsrfExploitable: false,
        securityAssessment: {
          en: `Hop limit violation (request hop count ${request.hopCount} > limit ${config.httpPutResponseHopLimit}). Mitigated SSRF proxy traversal!`,
          ar: `تجاوز الحد الأقصى للقفزات (عدد قفزات الطلب ${request.hopCount} > الحد ${config.httpPutResponseHopLimit}). تم إحباط قفزة وكيل SSRF!`,
        },
      };
    }

    // Token issuance: PUT /latest/api/token
    if (request.method === 'PUT' && request.path === '/latest/api/token') {
      const ttlHeader = request.headers['x-nexora-ec2-metadata-token-ttl-seconds'] || request.headers['x-aws-ec2-metadata-token-ttl-seconds'];
      const ttl = ttlHeader ? parseInt(ttlHeader, 10) : 21600;

      if (isNaN(ttl) || ttl <= 0 || ttl > 21600) {
        return {
          statusCode: 400,
          statusText: 'Bad Request',
          body: 'Invalid token TTL specified.',
          isSsrfExploitable: false,
          securityAssessment: {
            en: 'Token request rejected: invalid TTL.',
            ar: 'تم رفض طلب الرمز: مدة صلاحية غير صالحة.',
          },
        };
      }

      // Deterministic token generation
      const token = `imds2_tok_${request.virtualTime}_${ttl}`;
      this.activeTokens.set(token, {
        token,
        ttlSeconds: ttl,
        createdVirtualTime: request.virtualTime,
        expirationVirtualTime: request.virtualTime + ttl,
      });

      return {
        statusCode: 200,
        statusText: 'OK',
        body: token,
        headers: { 'x-nexora-ec2-metadata-token-ttl-seconds': String(ttl) },
        isSsrfExploitable: false,
        securityAssessment: {
          en: 'IMDSv2 Session Token successfully created via PUT request.',
          ar: 'تم إصدار رمز جلسة IMDSv2 بنجاح عبر طلب PUT.',
        },
      };
    }

    // Metadata GET request
    if (request.method === 'GET') {
      const isImdsv2Enforced = config.httpTokens === 'required' || config.version === 'v2';

      if (isImdsv2Enforced) {
        const receivedToken = request.headers['x-nexora-ec2-metadata-token'] || request.headers['x-aws-ec2-metadata-token'];

        if (!receivedToken) {
          return {
            statusCode: 401,
            statusText: 'Unauthorized',
            body: 'IMDSv2 token header (x-nexora-ec2-metadata-token) is missing. Unauthenticated GET denied.',
            isSsrfExploitable: false,
            securityAssessment: {
              en: 'IMDSv2 blocked token-less request. SSRF attack payload failed to steal credentials.',
              ar: 'حظر IMDSv2 الطلب الخالي من الرمز. فشل هجوم SSRF في سرقة بيانات الاعتماد.',
            },
          };
        }

        const validSession = this.activeTokens.get(receivedToken);
        if (!validSession || request.virtualTime > validSession.expirationVirtualTime) {
          return {
            statusCode: 401,
            statusText: 'Unauthorized',
            body: 'IMDSv2 session token expired or invalid.',
            isSsrfExploitable: false,
            securityAssessment: {
              en: 'Token is expired or invalid.',
              ar: 'الرمز منتهي الصلاحية أو غير صالح.',
            },
          };
        }
      }

      // If reached here: request allowed (either valid IMDSv2 or vulnerable IMDSv1!)
      const isVulnerableV1 = !isImdsv2Enforced;

      if (request.path.includes('iam/security-credentials')) {
        const payload = roleCredentials || {
          Code: 'Success',
          LastUpdated: '2026-09-26T00:00:00Z',
          Type: 'AWS-HMAC',
          AccessKeyId: 'NXASIAVULNERABLEKEY01',
          SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
          Token: 'session_token_app_workload_sample',
          Expiration: '2026-09-26T06:00:00Z',
        };

        return {
          statusCode: 200,
          statusText: 'OK',
          body: payload,
          isSsrfExploitable: isVulnerableV1,
          securityAssessment: isVulnerableV1
            ? {
                en: 'CRITICAL VULNERABILITY: IMDSv1 served temporary role credentials via direct GET without session token. Trivial SSRF theft!',
                ar: 'ثغرة حرجة: قدم IMDSv1 بيانات اعتماد الدور عبر طلب GET مباشر دون رمز جلسة. سرقة سهلة عبر SSRF!',
              }
            : {
                en: 'IMDSv2 successfully authenticated session token before dispensing temporary credentials.',
                ar: 'تحقق IMDSv2 بنجاح من رمز الجلسة قبل تسليم بيانات الاعتماد المؤقتة.',
              },
        };
      }

      return {
        statusCode: 200,
        statusText: 'OK',
        body: 'ami-id\nhostname\ninstance-id\ninstance-type\nlocal-ipv4\niam/',
        isSsrfExploitable: isVulnerableV1,
        securityAssessment: {
          en: 'Metadata directory listed.',
          ar: 'تم عرض دليل بيانات التعريف.',
        },
      };
    }

    return {
      statusCode: 405,
      statusText: 'Method Not Allowed',
      body: 'HTTP method not supported on IMDS.',
      isSsrfExploitable: false,
      securityAssessment: {
        en: 'Method not supported.',
        ar: 'البروتوكول غير مدعوم.',
      },
    };
  }
}
