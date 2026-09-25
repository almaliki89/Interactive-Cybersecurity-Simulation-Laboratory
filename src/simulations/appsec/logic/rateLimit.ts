/**
 * Web & Application Security: Deterministic Rate Limiting Engine (Token Bucket & Fixed Window)
 * Fully deterministic - driven strictly by SimulationClock virtual time.
 * No Date.now, Math.random, or local timers.
 */

export interface TokenBucketState {
  clientId: string;
  tokens: number;
  capacity: number;
  refillRatePerSec: number; // tokens added per 1000ms virtual time
  lastRefillVirtualTime: number;
}

export interface FixedWindowState {
  clientId: string;
  requestCount: number;
  maxRequests: number;
  windowSizeMs: number;
  windowStartVirtualTime: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  statusCode: 200 | 429;
  remainingQuota: number;
  resetAfterMs: number;
  headers: Record<string, string>;
  reasonEn: string;
  reasonAr: string;
}

/**
 * Refills a token bucket based on elapsed virtual time
 */
export function refillTokenBucket(
  bucket: TokenBucketState,
  currentVirtualTime: number
): TokenBucketState {
  if (currentVirtualTime <= bucket.lastRefillVirtualTime) {
    return { ...bucket };
  }

  const elapsedMs = currentVirtualTime - bucket.lastRefillVirtualTime;
  const elapsedSec = elapsedMs / 1000;
  const tokensToAdd = elapsedSec * bucket.refillRatePerSec;
  const newTokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);

  return {
    ...bucket,
    tokens: newTokens,
    lastRefillVirtualTime: currentVirtualTime,
  };
}

/**
 * Evaluates request consumption against Token Bucket
 */
export function consumeTokenBucket(
  bucket: TokenBucketState,
  currentVirtualTime: number,
  tokensToConsume: number = 1
): { decision: RateLimitDecision; updatedBucket: TokenBucketState } {
  const refilled = refillTokenBucket(bucket, currentVirtualTime);

  if (refilled.tokens >= tokensToConsume) {
    const remaining = refilled.tokens - tokensToConsume;
    const updated: TokenBucketState = {
      ...refilled,
      tokens: remaining,
    };

    return {
      decision: {
        allowed: true,
        statusCode: 200,
        remainingQuota: Math.floor(remaining),
        resetAfterMs: 0,
        headers: {
          'X-RateLimit-Limit': String(refilled.capacity),
          'X-RateLimit-Remaining': String(Math.floor(remaining)),
          'X-RateLimit-Reset': String(Math.ceil((refilled.capacity - remaining) / refilled.refillRatePerSec)),
        },
        reasonEn: `Allowed: Token bucket has ${refilled.tokens.toFixed(1)} tokens available.`,
        reasonAr: `مسموح: الحاوية تحتوي على ${refilled.tokens.toFixed(1)} رمز متاح.`,
      },
      updatedBucket: updated,
    };
  }

  // Rate limit exceeded (429)
  const deficit = tokensToConsume - refilled.tokens;
  const waitMs = Math.ceil((deficit / refilled.refillRatePerSec) * 1000);

  return {
    decision: {
      allowed: false,
      statusCode: 429,
      remainingQuota: 0,
      resetAfterMs: waitMs,
      headers: {
        'X-RateLimit-Limit': String(refilled.capacity),
        'X-RateLimit-Remaining': '0',
        'Retry-After': String(Math.ceil(waitMs / 1000)),
      },
      reasonEn: `HTTP 429 Rate Limit Exceeded: Bucket exhausted. Retry after ${Math.ceil(waitMs / 1000)}s virtual time.`,
      reasonAr: `تم تجاوز معدل الطلبات (429): نفدت الرموز المتاحة. أعد المحاولة بعد ${Math.ceil(waitMs / 1000)} ثانية افتراضية.`,
    },
    updatedBucket: refilled,
  };
}

/**
 * Evaluates Fixed Window Rate Limiter
 */
export function evaluateFixedWindow(
  state: FixedWindowState,
  currentVirtualTime: number
): { decision: RateLimitDecision; updatedState: FixedWindowState } {
  const elapsed = currentVirtualTime - state.windowStartVirtualTime;

  // Window expired -> reset window
  if (elapsed >= state.windowSizeMs) {
    const updated: FixedWindowState = {
      ...state,
      requestCount: 1,
      windowStartVirtualTime: currentVirtualTime,
    };

    return {
      decision: {
        allowed: true,
        statusCode: 200,
        remainingQuota: state.maxRequests - 1,
        resetAfterMs: state.windowSizeMs,
        headers: {
          'X-RateLimit-Limit': String(state.maxRequests),
          'X-RateLimit-Remaining': String(state.maxRequests - 1),
        },
        reasonEn: 'New rate limit window started. Request accepted.',
        reasonAr: 'بدأت نافذة زمنية جديدة، تم قبول الطلب.',
      },
      updatedState: updated,
    };
  }

  if (state.requestCount < state.maxRequests) {
    const nextCount = state.requestCount + 1;
    const remaining = state.maxRequests - nextCount;
    const updated: FixedWindowState = {
      ...state,
      requestCount: nextCount,
    };

    return {
      decision: {
        allowed: true,
        statusCode: 200,
        remainingQuota: remaining,
        resetAfterMs: state.windowSizeMs - elapsed,
        headers: {
          'X-RateLimit-Limit': String(state.maxRequests),
          'X-RateLimit-Remaining': String(remaining),
        },
        reasonEn: `Request ${nextCount}/${state.maxRequests} accepted in current window.`,
        reasonAr: `تم قبول الطلب ${nextCount}/${state.maxRequests} في النافذة الحالية.`,
      },
      updatedState: updated,
    };
  }

  // Quota exceeded
  const waitMs = state.windowSizeMs - elapsed;
  return {
    decision: {
      allowed: false,
      statusCode: 429,
      remainingQuota: 0,
      resetAfterMs: waitMs,
      headers: {
        'X-RateLimit-Limit': String(state.maxRequests),
        'X-RateLimit-Remaining': '0',
        'Retry-After': String(Math.ceil(waitMs / 1000)),
      },
      reasonEn: `HTTP 429 Quota Exceeded: ${state.requestCount}/${state.maxRequests} requests consumed in window.`,
      reasonAr: `تم تجاوز الحصة (429): استنفدت ${state.requestCount}/${state.maxRequests} طلب في النافذة الحالية.`,
    },
    updatedState: state,
  };
}
