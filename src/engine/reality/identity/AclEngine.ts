/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory AclEngine
 * Access Control List evaluation order (User/Group SIDs -> DENY check -> ALLOW check -> Effective Rights).
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { AccessControlList, AccessControlEntry, AccessRight } from './types';
import { WELL_KNOWN_AD_SIDS } from './DirectoryStore';

export class AclEngine {
  private acls: Map<string, AccessControlList> = new Map();

  constructor() {
    this.resetToBaseline();
  }

  public resetToBaseline(): void {
    this.acls.clear();

    // Baseline Share ACLs for FILE01
    const financeAcl: AccessControlList = {
      objectPath: '\\\\FILE01\\Finance',
      ownerSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
      entries: [
        {
          type: 'DENY',
          principalSid: WELL_KNOWN_AD_SIDS.HR_USERS,
          rights: ['READ', 'WRITE', 'MODIFY', 'FULL_CONTROL'],
        },
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.FINANCE_USERS,
          rights: ['READ', 'WRITE'],
        },
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
          rights: ['FULL_CONTROL', 'READ', 'WRITE', 'MODIFY'],
        },
      ],
    };

    const hrAcl: AccessControlList = {
      objectPath: '\\\\FILE01\\HR',
      ownerSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
      entries: [
        {
          type: 'DENY',
          principalSid: WELL_KNOWN_AD_SIDS.FINANCE_USERS,
          rights: ['READ', 'WRITE', 'MODIFY', 'FULL_CONTROL'],
        },
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.HR_USERS,
          rights: ['READ', 'WRITE'],
        },
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
          rights: ['FULL_CONTROL', 'READ', 'WRITE', 'MODIFY'],
        },
      ],
    };

    const publicAcl: AccessControlList = {
      objectPath: '\\\\FILE01\\Public',
      ownerSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
      entries: [
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.DOMAIN_USERS,
          rights: ['READ'],
        },
        {
          type: 'ALLOW',
          principalSid: WELL_KNOWN_AD_SIDS.DOMAIN_ADMINS,
          rights: ['FULL_CONTROL', 'READ', 'WRITE', 'MODIFY'],
        },
      ],
    };

    this.acls.set('\\\\FILE01\\FINANCE', financeAcl);
    this.acls.set('\\\\FILE01\\HR', hrAcl);
    this.acls.set('\\\\FILE01\\PUBLIC', publicAcl);
  }

  public getAcl(objectPath: string): AccessControlList | undefined {
    return this.acls.get(objectPath.toUpperCase());
  }

  public setAcl(acl: AccessControlList): void {
    this.acls.set(acl.objectPath.toUpperCase(), acl);
  }

  public evaluateAccess(params: {
    objectPath: string;
    userSid: string;
    groupSids: string[];
    requestedRight: AccessRight;
  }): { granted: boolean; aclDecision: 'ACL_ALLOW' | 'ACL_DENY'; matchedAce?: AccessControlEntry } {
    const acl = this.getAcl(params.objectPath);
    if (!acl) {
      // Default fallback if no ACL exists
      return { granted: false, aclDecision: 'ACL_DENY' };
    }

    const allSids = new Set<string>([params.userSid, ...params.groupSids]);

    // 1. Evaluate DENY ACEs FIRST
    for (const entry of acl.entries) {
      if (entry.type === 'DENY' && allSids.has(entry.principalSid)) {
        if (entry.rights.includes(params.requestedRight) || entry.rights.includes('FULL_CONTROL')) {
          return { granted: false, aclDecision: 'ACL_DENY', matchedAce: entry };
        }
      }
    }

    // 2. Evaluate ALLOW ACEs SECOND
    for (const entry of acl.entries) {
      if (entry.type === 'ALLOW' && allSids.has(entry.principalSid)) {
        if (entry.rights.includes(params.requestedRight) || entry.rights.includes('FULL_CONTROL')) {
          return { granted: true, aclDecision: 'ACL_ALLOW', matchedAce: entry };
        }
      }
    }

    // 3. No matching ALLOW ACE -> Implicit DENY
    return { granted: false, aclDecision: 'ACL_DENY' };
  }

  public getStateSnapshot(): Record<string, AccessControlList> {
    const snapshot: Record<string, AccessControlList> = {};
    this.acls.forEach((acl, key) => {
      snapshot[key] = JSON.parse(JSON.stringify(acl));
    });
    return snapshot;
  }

  public restoreStateSnapshot(snapshot: Record<string, AccessControlList>): void {
    this.acls.clear();
    Object.entries(snapshot).forEach(([key, acl]) => {
      this.acls.set(key, acl);
    });
  }
}
