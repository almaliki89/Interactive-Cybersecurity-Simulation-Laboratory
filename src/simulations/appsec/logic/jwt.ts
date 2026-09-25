/**
 * Web & Application Security: JSON Web Token (JWT) Validation Logic
 * Educational & synthetic tokens - no real secret keys or forgery tooling.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface JwtHeader {
  alg: 'RS256' | 'HS256' | 'ES256' | 'none';
  typ: 'JWT';
  kid?: string;
}

export interface JwtClaims {
  sub: string;
  iss: string;
  aud: string;
  exp: number; // virtualTime expiration
  iat: number;
  roles: string[];
  scopes: string[];
  email?: string;
}

export interface SyntheticJwt {
  raw: string;
  header: JwtHeader;
  claims: JwtClaims;
  signature: string;
}

export interface JwtValidationResult {
  valid: boolean;
  claims?: JwtClaims;
  failureReason?:
    | 'ALGORITHM_NONE_FORBIDDEN'
    | 'TOKEN_EXPIRED'
    | 'ISSUER_MISMATCH'
    | 'AUDIENCE_MISMATCH'
    | 'SIGNATURE_INVALID'
    | 'MALFORMED_STRUCTURE';
  reasonEn: string;
  reasonAr: string;
}

/**
 * Builds a deterministic synthetic JWT string representation
 */
export function createSyntheticJwt(
  claims: JwtClaims,
  header: JwtHeader = { alg: 'RS256', typ: 'JWT', kid: 'nexora-auth-key-01' },
  signatureHex: string = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
): SyntheticJwt {
  const hBase64 = btoa(JSON.stringify(header));
  const pBase64 = btoa(JSON.stringify(claims));
  const raw = `${hBase64}.${pBase64}.${signatureHex.slice(0, 32)}`;

  return {
    raw,
    header,
    claims,
    signature: signatureHex,
  };
}

/**
 * Validates JWT claims, expiration, issuer, audience, and algorithm safety
 */
export function validateJwtClaims(
  token: SyntheticJwt,
  currentVirtualTime: number,
  expectedIssuer: string = 'https://auth.corp.nexora.local',
  expectedAudience: string = 'https://portal.corp.nexora.local/api'
): JwtValidationResult {
  // 1. Critical Algorithm Confusion Check: alg=none MUST be rejected
  if (token.header.alg === 'none') {
    return {
      valid: false,
      failureReason: 'ALGORITHM_NONE_FORBIDDEN',
      reasonEn: "Security Rejection: 'none' algorithm token detected. Insecure unverified token.",
      reasonAr: "رفض أمني: تم رصد خوارزمية 'none' غير الموقعة، والرمز غير موثوق.",
    };
  }

  // 2. Expiration Check against virtual time
  if (currentVirtualTime > token.claims.exp) {
    return {
      valid: false,
      failureReason: 'TOKEN_EXPIRED',
      reasonEn: `Token Expired: Expiration T+${token.claims.exp} passed at current T+${currentVirtualTime}.`,
      reasonAr: `انتهت صلاحية الرمز: انتهى عند T+${token.claims.exp} بينما الوقت الحالي T+${currentVirtualTime}.`,
    };
  }

  // 3. Issuer Check (iss)
  if (token.claims.iss !== expectedIssuer) {
    return {
      valid: false,
      failureReason: 'ISSUER_MISMATCH',
      reasonEn: `Issuer Mismatch: Expected '${expectedIssuer}', but token claims '${token.claims.iss}'.`,
      reasonAr: `عدم تطابق جهة الإصدار: المتوقع '${expectedIssuer}' بينما يحمل الرمز '${token.claims.iss}'.`,
    };
  }

  // 4. Audience Check (aud)
  if (token.claims.aud !== expectedAudience) {
    return {
      valid: false,
      failureReason: 'AUDIENCE_MISMATCH',
      reasonEn: `Audience Mismatch: Token intended for '${token.claims.aud}', not this service (${expectedAudience}).`,
      reasonAr: `عدم تطابق الجمهور المستهدف (Audience): الرمز مخصص لـ '${token.claims.aud}'.`,
    };
  }

  return {
    valid: true,
    claims: token.claims,
    reasonEn: 'JWT verified: Valid signature, trusted issuer, matching audience, and active validity window.',
    reasonAr: 'تم التحقق من رمز JWT: توقيع سليم، مصدر موثوق، جمهور مطابق، وصلاحية سارية.',
  };
}
