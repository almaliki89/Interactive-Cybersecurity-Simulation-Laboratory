/**
 * OMEGA ULTRA REALITY V1.4 — User Profile Engine
 * Manages Windows user profile folders, session bindings, and user profile state.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import { UserProfile } from './types';

export class UserProfileEngine {
  private machineId: string;
  private profiles: Map<string, UserProfile> = new Map();

  constructor(machineId: string) {
    this.machineId = machineId;
  }

  public loadOrCreateProfile(params: {
    samAccountName: string;
    domain: string;
    userSid: string;
    sessionId: number;
    vTime: number;
  }): UserProfile {
    const key = params.samAccountName.toLowerCase();
    const existing = this.profiles.get(key);

    if (existing) {
      existing.isActive = true;
      existing.sessionId = params.sessionId;
      existing.loadedAtVirtualTime = params.vTime;
      return existing;
    }

    const cleanUser = params.samAccountName.toLowerCase();
    const profile: UserProfile = {
      userSid: params.userSid,
      samAccountName: params.samAccountName,
      domain: params.domain,
      profilePath: `C:\\Users\\${cleanUser}`,
      desktopPath: `C:\\Users\\${cleanUser}\\Desktop`,
      documentsPath: `C:\\Users\\${cleanUser}\\Documents`,
      downloadsPath: `C:\\Users\\${cleanUser}\\Downloads`,
      appDataPath: `C:\\Users\\${cleanUser}\\AppData`,
      loadedAtVirtualTime: params.vTime,
      isActive: true,
      sessionId: params.sessionId,
    };

    this.profiles.set(key, profile);
    return profile;
  }

  public getProfile(username: string): UserProfile | undefined {
    return this.profiles.get(username.toLowerCase());
  }

  public getActiveProfile(): UserProfile | undefined {
    for (const p of this.profiles.values()) {
      if (p.isActive) return p;
    }
    return undefined;
  }

  public unloadProfile(username: string): void {
    const p = this.profiles.get(username.toLowerCase());
    if (p) {
      p.isActive = false;
      p.sessionId = 0;
    }
  }

  public exportSnapshot(): Record<string, UserProfile> {
    const res: Record<string, UserProfile> = {};
    for (const [k, v] of this.profiles.entries()) {
      res[k] = { ...v };
    }
    return res;
  }

  public restoreSnapshot(data: Record<string, UserProfile>): void {
    this.profiles.clear();
    for (const [k, v] of Object.entries(data)) {
      this.profiles.set(k, { ...v });
    }
  }
}
