/**
 * OMEGA ULTRA REALITY V1.3 — Active Directory GroupResolver
 * Direct and nested group membership resolution architecture.
 * Fully deterministic - no Date.now(), Math.random(), or local timers.
 */

import { DirectoryStore } from './DirectoryStore';

export class GroupResolver {
  private store: DirectoryStore;

  constructor(store: DirectoryStore) {
    this.store = store;
  }

  /**
   * Resolves all group SIDs (direct and nested) for a user.
   */
  public resolveUserGroupSids(userSidOrName: string): string[] {
    const user = this.store.findUser(userSidOrName);
    if (!user) return [];

    const resolvedSids = new Set<string>();
    const queue: string[] = [];

    // Add primary group SID if available
    if (user.primaryGroup) {
      const primaryGrp = this.store.findGroup(user.primaryGroup);
      if (primaryGrp) {
        resolvedSids.add(primaryGrp.sid);
        queue.push(primaryGrp.sid);
      } else if (user.primaryGroup.startsWith('S-1-')) {
        resolvedSids.add(user.primaryGroup);
        queue.push(user.primaryGroup);
      }
    }

    // Add direct user group memberships
    if (Array.isArray(user.groups)) {
      user.groups.forEach((g) => {
        const grp = this.store.findGroup(g);
        if (grp) {
          resolvedSids.add(grp.sid);
          queue.push(grp.sid);
        } else if (g.startsWith('S-1-')) {
          resolvedSids.add(g);
          queue.push(g);
        }
      });
    }

    // Expand nested group memberships iteratively (BFS with visited Set)
    const visited = new Set<string>(queue);

    while (queue.length > 0) {
      const currentSid = queue.shift()!;
      const currentGrp = this.store.findGroup(currentSid);
      if (!currentGrp) continue;

      if (Array.isArray(currentGrp.members)) {
        currentGrp.members.forEach((member) => {
          // Check if member is itself a group
          const memberGrp = this.store.findGroup(member);
          if (memberGrp && !visited.has(memberGrp.sid)) {
            visited.add(memberGrp.sid);
            resolvedSids.add(memberGrp.sid);
            queue.push(memberGrp.sid);
          }
        });
      }
    }

    return Array.from(resolvedSids);
  }

  /**
   * Resolves all group names (direct and nested) for a user.
   */
  public resolveUserGroupNames(userSidOrName: string): string[] {
    const sids = this.resolveUserGroupSids(userSidOrName);
    const names: string[] = [];
    sids.forEach((sid) => {
      const grp = this.store.findGroup(sid);
      if (grp) names.push(grp.name);
    });
    return names;
  }

  /**
   * Checks if user is a member of target group (direct or nested).
   */
  public isUserInGroup(userSidOrName: string, groupSidOrName: string): boolean {
    const userSids = this.resolveUserGroupSids(userSidOrName);
    const targetGrp = this.store.findGroup(groupSidOrName);
    const targetSid = targetGrp ? targetGrp.sid : groupSidOrName;

    if (userSids.includes(targetSid)) return true;

    // Check by group name case-insensitively
    if (targetGrp) {
      const groupNames = this.resolveUserGroupNames(userSidOrName);
      return groupNames.some((n) => n.toUpperCase() === targetGrp.name.toUpperCase());
    }

    return false;
  }
}
