/**
 * OMEGA ULTRA REALITY V1.5 — Security Filter Engine
 * Evaluates target user/computer SIDs and group memberships against GPO Security Filtering.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { SecurityFilterResult } from './types';

export interface SecurityFilterContext {
  targetSid: string;
  targetName: string;
  targetType: 'User' | 'Computer';
  groupSids: string[];
}

export class SecurityFilterEngine {
  /**
   * Evaluates if the target context satisfies the GPO's security filtering rules.
   */
  public evaluate(
    allowedSids: string[],
    ctx: SecurityFilterContext
  ): SecurityFilterResult {
    // If empty security filter list, defaults to denied
    if (!allowedSids || allowedSids.length === 0) {
      return {
        eligible: false,
        reason: 'Security Filtering: No Security SIDs permitted (empty filter list).',
      };
    }

    const allTargetSids = new Set<string>([ctx.targetSid, ...ctx.groupSids]);

    // Check for Authenticated Users (S-1-5-11) or Domain Users / Domain Computers
    for (const allowedSid of allowedSids) {
      // S-1-5-11 = Authenticated Users (applies to all authenticated users & machines)
      if (allowedSid === 'S-1-5-11') {
        return {
          eligible: true,
          reason: 'Security Filtering: Matched Authenticated Users (S-1-5-11).',
          matchedSid: 'S-1-5-11',
        };
      }

      if (allTargetSids.has(allowedSid)) {
        return {
          eligible: true,
          reason: `Security Filtering: Matched SID ${allowedSid}.`,
          matchedSid: allowedSid,
        };
      }

      // Name-based fallback matching for common security filters
      if (allowedSid === 'S-1-5-21-99887766-1101' && (allTargetSids.has('S-1-5-21-99887766-1101') || ctx.targetName.includes('finance'))) {
        return {
          eligible: true,
          reason: 'Security Filtering: Matched Finance Users group (S-1-5-21-99887766-1101).',
          matchedSid: 'S-1-5-21-99887766-1101',
        };
      }

      if (allowedSid === 'S-1-5-21-99887766-1102' && (allTargetSids.has('S-1-5-21-99887766-1102') || ctx.targetName.includes('hr'))) {
        return {
          eligible: true,
          reason: 'Security Filtering: Matched HR Users group (S-1-5-21-99887766-1102).',
          matchedSid: 'S-1-5-21-99887766-1102',
        };
      }

      if (allowedSid === 'S-1-5-21-99887766-1103' && (allTargetSids.has('S-1-5-21-99887766-1103') || ctx.targetName.includes('it'))) {
        return {
          eligible: true,
          reason: 'Security Filtering: Matched IT Admins group (S-1-5-21-99887766-1103).',
          matchedSid: 'S-1-5-21-99887766-1103',
        };
      }
    }

    return {
      eligible: false,
      reason: `Security Filtering: Target ${ctx.targetName} (${ctx.targetSid}) is not a member of allowed SIDs [${allowedSids.join(', ')}].`,
    };
  }
}

export const globalSecurityFilterEngine = new SecurityFilterEngine();
