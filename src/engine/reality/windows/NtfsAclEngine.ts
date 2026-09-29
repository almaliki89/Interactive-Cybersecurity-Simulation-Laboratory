/**
 * OMEGA ULTRA REALITY V1.4 — NTFS Access Control List (ACL) Engine
 * Evaluates Discretionary Access Control Lists (DACL) following standard Windows security semantics.
 * Evaluation Order:
 *   1. Explicit DENY
 *   2. Explicit ALLOW
 *   3. Inherited DENY
 *   4. Inherited ALLOW
 * Supports User SIDs, Group SIDs, Right Expansion (FULL_CONTROL, MODIFY), and Share ACL Intersection.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import {
  NtfsAce,
  NtfsAcl,
  NtfsRight,
  NtfsAccessEvaluationResult,
  EffectiveAccessResult,
} from './types';

export class NtfsAclEngine {
  private acls: Map<string, NtfsAcl> = new Map();
  private aclIdCounter: number = 100;

  /**
   * Expands composite rights into constituent atomic rights.
   */
  public expandRights(rights: NtfsRight[]): Set<NtfsRight> {
    const set = new Set<NtfsRight>();
    for (const r of rights) {
      set.add(r);
      if (r === 'FULL_CONTROL') {
        set.add('READ');
        set.add('WRITE');
        set.add('MODIFY');
        set.add('DELETE');
        set.add('EXECUTE');
        set.add('READ_PERMISSIONS');
        set.add('CHANGE_PERMISSIONS');
        set.add('TAKE_OWNERSHIP');
      } else if (r === 'MODIFY') {
        set.add('READ');
        set.add('WRITE');
        set.add('DELETE');
        set.add('EXECUTE');
      }
    }
    return set;
  }

  /**
   * Registers or updates an ACL.
   */
  public registerAcl(acl: NtfsAcl): void {
    this.acls.set(acl.id, {
      ...acl,
      aces: acl.aces.map((a) => ({ ...a })),
    });
  }

  /**
   * Retrieves an ACL by ID.
   */
  public getAcl(aclId: string): NtfsAcl | undefined {
    return this.acls.get(aclId);
  }

  /**
   * Creates a standard ACL with default owners and ACEs.
   */
  public createAcl(params: {
    ownerSid: string;
    ownerName: string;
    isInheritanceBlocked?: boolean;
    aces?: NtfsAce[];
  }): NtfsAcl {
    this.aclIdCounter += 1;
    const aclId = `acl-${this.aclIdCounter}`;
    const acl: NtfsAcl = {
      id: aclId,
      ownerSid: params.ownerSid,
      ownerName: params.ownerName,
      isInheritanceBlocked: params.isInheritanceBlocked || false,
      aces: params.aces ? [...params.aces] : [],
    };
    this.acls.set(aclId, acl);
    return acl;
  }

  /**
   * Evaluates user + group SIDs against a target NTFS ACL for a requested right.
   */
  public evaluateAccess(params: {
    aclId: string;
    userSid: string;
    userName: string;
    groupSids: string[];
    requestedRight: NtfsRight;
  }): NtfsAccessEvaluationResult {
    const acl = this.acls.get(params.aclId);
    if (!acl) {
      return {
        granted: false,
        denied: true,
        principal: params.userName,
        principalSid: params.userSid,
        requestedRight: params.requestedRight,
        effectiveRights: [],
        reason: `NTFS ACL ID '${params.aclId}' not found. Default deny.`,
      };
    }

    const principalSids = new Set<string>([params.userSid, ...params.groupSids]);
    // Also include Well-Known SIDs if matched
    principalSids.add('S-1-1-0'); // Everyone
    principalSids.add('S-1-5-11'); // Authenticated Users

    // Sort ACEs according to canonical Windows evaluation precedence:
    // 1. Explicit DENY
    // 2. Explicit ALLOW
    // 3. Inherited DENY
    // 4. Inherited ALLOW
    const explicitDeny: NtfsAce[] = [];
    const explicitAllow: NtfsAce[] = [];
    const inheritedDeny: NtfsAce[] = [];
    const inheritedAllow: NtfsAce[] = [];

    const cleanUser = params.userName.split("\\").pop()?.toLowerCase() || params.userName.toLowerCase();
    const matchesPrincipal = (ace: NtfsAce) => {
      if (principalSids.has(ace.principalSid)) return true;
      if (ace.principalSid === "S-1-1-0" || ace.principalSid === "S-1-5-11") return true;
      const aceClean = ace.principalName.split("\\").pop()?.toLowerCase();
      if (aceClean && aceClean === cleanUser) return true;
      return false;
    };

    for (const ace of acl.aces) {
      if (!matchesPrincipal(ace)) {
        continue;
      }
      if (ace.inheritance === 'EXPLICIT') {
        if (ace.permissionType === 'DENY') {
          explicitDeny.push(ace);
        } else {
          explicitAllow.push(ace);
        }
      } else {
        if (ace.permissionType === 'DENY') {
          inheritedDeny.push(ace);
        } else {
          inheritedAllow.push(ace);
        }
      }
    }

    // Step 1: Check Explicit DENY
    for (const ace of explicitDeny) {
      const expanded = this.expandRights(ace.rights);
      if (expanded.has(params.requestedRight) || expanded.has('FULL_CONTROL')) {
        return {
          granted: false,
          denied: true,
          principal: params.userName,
          principalSid: params.userSid,
          requestedRight: params.requestedRight,
          matchedAce: ace,
          effectiveRights: [],
          deniedByExplicit: true,
          reason: `Access Denied (0x80070005) - Explicit DENY ACE matched for principal '${ace.principalName}' (${ace.principalSid}) on right '${params.requestedRight}'.`,
        };
      }
    }

    // Collect accumulated effective rights
    const accumulatedRights = new Set<NtfsRight>();

    // Step 2: Check Explicit ALLOW
    for (const ace of explicitAllow) {
      const expanded = this.expandRights(ace.rights);
      for (const r of expanded) {
        accumulatedRights.add(r);
      }
      if (expanded.has(params.requestedRight) || expanded.has('FULL_CONTROL')) {
        return {
          granted: true,
          denied: false,
          principal: params.userName,
          principalSid: params.userSid,
          requestedRight: params.requestedRight,
          matchedAce: ace,
          effectiveRights: Array.from(accumulatedRights),
          reason: `Access Granted - Explicit ALLOW ACE matched for principal '${ace.principalName}' (${ace.principalSid}) with right '${params.requestedRight}'.`,
        };
      }
    }

    // Step 3: Check Inherited DENY
    for (const ace of inheritedDeny) {
      const expanded = this.expandRights(ace.rights);
      if (expanded.has(params.requestedRight) || expanded.has('FULL_CONTROL')) {
        return {
          granted: false,
          denied: true,
          principal: params.userName,
          principalSid: params.userSid,
          requestedRight: params.requestedRight,
          matchedAce: ace,
          effectiveRights: Array.from(accumulatedRights),
          deniedByInherited: true,
          reason: `Access Denied (0x80070005) - Inherited DENY ACE matched for principal '${ace.principalName}' (${ace.principalSid}) on right '${params.requestedRight}'.`,
        };
      }
    }

    // Step 4: Check Inherited ALLOW
    for (const ace of inheritedAllow) {
      const expanded = this.expandRights(ace.rights);
      for (const r of expanded) {
        accumulatedRights.add(r);
      }
      if (expanded.has(params.requestedRight) || expanded.has('FULL_CONTROL')) {
        return {
          granted: true,
          denied: false,
          principal: params.userName,
          principalSid: params.userSid,
          requestedRight: params.requestedRight,
          matchedAce: ace,
          effectiveRights: Array.from(accumulatedRights),
          reason: `Access Granted - Inherited ALLOW ACE matched for principal '${ace.principalName}' (${ace.principalSid}) with right '${params.requestedRight}'.`,
        };
      }
    }

    // Default Deny if no ALLOW ACE granted the requested right
    return {
      granted: false,
      denied: true,
      principal: params.userName,
      principalSid: params.userSid,
      requestedRight: params.requestedRight,
      effectiveRights: Array.from(accumulatedRights),
      reason: `Access Denied (0x80070005) - No matching ALLOW ACE found granting '${params.requestedRight}' to '${params.userName}'.`,
    };
  }

  /**
   * Computes the mathematical intersection of Share ACL and NTFS ACL.
   * In Windows security, effective access = Share Permission ∩ NTFS Permission (most restrictive wins).
   */
  public evaluateEffectiveAccess(params: {
    shareGranted: boolean;
    shareRights: NtfsRight[];
    shareDenialReason?: string;
    ntfsAclId: string;
    userSid: string;
    userName: string;
    groupSids: string[];
    requestedRight: NtfsRight;
  }): EffectiveAccessResult {
    // 1. Evaluate NTFS ACL
    const ntfsEval = this.evaluateAccess({
      aclId: params.ntfsAclId,
      userSid: params.userSid,
      userName: params.userName,
      groupSids: params.groupSids,
      requestedRight: params.requestedRight,
    });

    const shareExpanded = this.expandRights(params.shareRights);
    const ntfsExpanded = new Set<NtfsRight>(ntfsEval.effectiveRights);

    const shareHasRight = params.shareGranted && (shareExpanded.has(params.requestedRight) || shareExpanded.has('FULL_CONTROL'));
    const ntfsHasRight = ntfsEval.granted;

    const effectiveAllowed = shareHasRight && ntfsHasRight;

    // Intersect rights
    const effectiveRightsList: NtfsRight[] = [];
    if (params.shareGranted) {
      for (const r of shareExpanded) {
        if (ntfsExpanded.has(r)) {
          effectiveRightsList.push(r);
        }
      }
    }

    let failureReason: string | undefined;
    if (!shareHasRight) {
      failureReason = params.shareDenialReason || `Share permission denied for requested right '${params.requestedRight}'.`;
    } else if (!ntfsHasRight) {
      failureReason = ntfsEval.reason;
    }

    return {
      shareAllowed: shareHasRight,
      ntfsAllowed: ntfsHasRight,
      effectiveAllowed,
      shareRights: Array.from(shareExpanded),
      ntfsRights: Array.from(ntfsExpanded),
      effectiveRights: effectiveRightsList,
      failureReason,
      shareDenialDetails: params.shareDenialReason,
      ntfsDenialDetails: ntfsEval.reason,
    };
  }

  public exportSnapshot(): Record<string, NtfsAcl> {
    const res: Record<string, NtfsAcl> = {};
    for (const [id, acl] of this.acls.entries()) {
      res[id] = {
        ...acl,
        aces: acl.aces.map((a) => ({ ...a })),
        auditAces: acl.auditAces ? acl.auditAces.map((x) => ({ ...x })) : undefined,
      };
    }
    return res;
  }

  public restoreSnapshot(data: Record<string, NtfsAcl>): void {
    this.acls.clear();
    for (const [id, acl] of Object.entries(data)) {
      this.acls.set(id, {
        ...acl,
        aces: acl.aces.map((a) => ({ ...a })),
        auditAces: acl.auditAces ? acl.auditAces.map((x) => ({ ...x })) : undefined,
      });
    }
  }
}
