/**
 * OMEGA ULTRA REALITY V1.2 — SMB Service Engine
 * Safe simulated enterprise SMB shares on FILE01, LanmanServer dependency, and ACL enforcement.
 */

import { SmbShare, SmbAccessResult, SmbFailureReason } from './types';

export class SmbEngine {
  private shares: Map<string, SmbShare> = new Map();

  constructor() {
    this.initDefaultShares();
  }

  private initDefaultShares(): void {
    this.shares.clear();

    const shares: SmbShare[] = [
      {
        name: 'Finance',
        path: 'C:\\Shares\\Finance',
        description: 'Corporate Financial Records & Ledgers',
        allowedUsers: ['sara.finance', 'administrator'],
        allowedGroups: ['Domain Admins', 'Finance Team'],
        readOnly: false,
      },
      {
        name: 'HR',
        path: 'C:\\Shares\\HR',
        description: 'Employee Personnel Files & Payroll',
        allowedUsers: ['omar.hr', 'administrator'],
        allowedGroups: ['Domain Admins', 'HR Team'],
        readOnly: false,
      },
      {
        name: 'Public',
        path: 'C:\\Shares\\Public',
        description: 'General Enterprise Shared Repository',
        allowedUsers: ['*'], // All domain users
        allowedGroups: ['Domain Users'],
        readOnly: true,
      },
    ];

    shares.forEach((s) => this.shares.set(s.name.toLowerCase(), s));
  }

  public getShares(): SmbShare[] {
    return Array.from(this.shares.values());
  }

  public getShare(name: string): SmbShare | undefined {
    return this.shares.get(name.toLowerCase());
  }

  /**
   * Evaluates SMB share access authorization.
   */
  public evaluateAccess(params: {
    serverHostname: string;
    shareName: string;
    userName: string;
    userGroups?: string[];
    isFileServerOnline: boolean;
    isLanmanServerRunning: boolean;
  }): { allowed: boolean; error?: SmbFailureReason; errorDetails?: string } {
    if (!params.isFileServerOnline) {
      return {
        allowed: false,
        error: 'HOST_OFFLINE',
        errorDetails: `Target server '${params.serverHostname}' is powered OFFLINE`,
      };
    }

    if (!params.isLanmanServerRunning) {
      return {
        allowed: false,
        error: 'SERVICE_UNAVAILABLE',
        errorDetails: `The Server service (LanmanServer) is stopped on '${params.serverHostname}'`,
      };
    }

    const share = this.getShare(params.shareName);
    if (!share) {
      return {
        allowed: false,
        error: 'SHARE_NOT_FOUND',
        errorDetails: `Share '\\\\${params.serverHostname}\\${params.shareName}' does not exist`,
      };
    }

    // Authorization check
    const normalizedUser = params.userName.toLowerCase();
    const isUserAllowed =
      share.allowedUsers.includes('*') ||
      share.allowedUsers.map((u) => u.toLowerCase()).includes(normalizedUser);

    const isGroupAllowed =
      params.userGroups &&
      share.allowedGroups.some((g) => params.userGroups!.includes(g));

    if (isUserAllowed || isGroupAllowed) {
      return { allowed: true };
    }

    return {
      allowed: false,
      error: 'ACCESS_DENIED',
      errorDetails: `User '${params.userName}' does not have permission to access '\\\\${params.serverHostname}\\${params.shareName}'`,
    };
  }
}
