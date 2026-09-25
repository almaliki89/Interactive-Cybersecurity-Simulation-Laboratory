import { describe, it, expect } from 'vitest';
import {
  WindowsUser,
  WindowsGroup,
  INITIAL_WINDOWS_USERS,
  INITIAL_WINDOWS_GROUPS,
  WELL_KNOWN_SIDS,
  getEffectiveWindowsGroups,
  isLocalAdministrator,
  canLogOnInteractively,
  createWindowsUser,
} from '../../simulations/windows/logic/identity';
import {
  buildAccessToken,
  tokenHasGroup,
  tokenHasPrivilege,
  canElevate,
} from '../../simulations/windows/logic/token';
import {
  NtfsResource,
  NtfsAce,
  INITIAL_NTFS_RESOURCES,
  evaluateNtfsAccess,
  getEffectiveNtfsPermissions,
  toggleInheritance,
  addAceToResource,
  removeAceFromResource,
} from '../../simulations/windows/logic/ntfs';
import {
  WindowsProcess,
  initWindowsProcessTree,
  canProcessAccessTarget,
  spawnWindowsProcess,
  terminateWindowsProcess,
} from '../../simulations/windows/logic/processes';
import {
  WindowsService,
  INITIAL_WINDOWS_SERVICES,
  startWindowsService,
  stopWindowsService,
  changeStartupType,
  detectUnquotedServicePaths,
  fixUnquotedServicePath,
  isPathUnquotedWithSpaces,
} from '../../simulations/windows/logic/services';
import {
  WindowsFirewallState,
  INITIAL_FIREWALL_STATE,
  evaluateFirewallPacket,
  setFirewallProfileState,
  toggleFirewallRule,
} from '../../simulations/windows/logic/firewall';
import {
  WindowsEvent,
  INITIAL_WINDOWS_EVENTS,
  filterWindowsEvents,
  createWindowsEvent,
} from '../../simulations/windows/logic/eventlog';
import {
  WindowsHardeningState,
  validateWindowsHardeningState,
} from '../../simulations/windows/logic/hardening';

describe('Windows Security World — Production Logic Suite', () => {
  // 1. Identity & Groups Logic
  describe('Identity & Groups (SAM & SIDs)', () => {
    it('calculates effective groups including implicit Everyone and Authenticated Users', () => {
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const effective = getEffectiveWindowsGroups(alice, INITIAL_WINDOWS_GROUPS);

      const sids = effective.map((g) => g.sid);
      expect(sids).toContain(WELL_KNOWN_SIDS.USERS);
      expect(sids).toContain(WELL_KNOWN_SIDS.ADMINISTRATORS);
      expect(sids).toContain(WELL_KNOWN_SIDS.EVERYONE);
      expect(sids).toContain(WELL_KNOWN_SIDS.AUTHENTICATED_USERS);
    });

    it('identifies local administrators accurately', () => {
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const bob = INITIAL_WINDOWS_USERS.find((u) => u.username === 'bob')!;
      const finance = INITIAL_WINDOWS_USERS.find((u) => u.username === 'finance-admin')!;
      const guest = INITIAL_WINDOWS_USERS.find((u) => u.username === 'Guest')!;

      expect(isLocalAdministrator(alice, INITIAL_WINDOWS_GROUPS)).toBe(true);
      expect(isLocalAdministrator(bob, INITIAL_WINDOWS_GROUPS)).toBe(true);
      expect(isLocalAdministrator(finance, INITIAL_WINDOWS_GROUPS)).toBe(false);
      expect(isLocalAdministrator(guest, INITIAL_WINDOWS_GROUPS)).toBe(false);
    });

    it('enforces interactive logon rights for standard users and denies service/guest accounts', () => {
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const guest = INITIAL_WINDOWS_USERS.find((u) => u.username === 'Guest')!;
      const svcWeb = INITIAL_WINDOWS_USERS.find((u) => u.username === 'service-web')!;

      expect(canLogOnInteractively(alice, INITIAL_WINDOWS_GROUPS)).toBe(true);
      expect(canLogOnInteractively(guest, INITIAL_WINDOWS_GROUPS)).toBe(false);
      expect(canLogOnInteractively(svcWeb, INITIAL_WINDOWS_GROUPS)).toBe(false);
    });

    it('creates new users with valid unique SID and default group membership', () => {
      const updatedUsers = createWindowsUser(INITIAL_WINDOWS_USERS, 'jordan', {
        fullName: 'Jordan Miller',
      });

      expect(updatedUsers).toHaveLength(INITIAL_WINDOWS_USERS.length + 1);
      const jordan = updatedUsers.find((u) => u.username === 'jordan')!;
      expect(jordan).toBeDefined();
      expect(jordan.sid).toContain('S-1-5-21-99887766-');
      expect(jordan.groupSids).toContain(WELL_KNOWN_SIDS.USERS);
    });
  });

  // 2. Access Token Logic
  describe('Access Token Visualizer Logic', () => {
    it('builds an authentic Windows security token with SIDs, privileges, and integrity level', () => {
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const token = buildAccessToken(alice, INITIAL_WINDOWS_GROUPS, undefined, 'High', 1000);

      expect(token.userSid).toBe(alice.sid);
      expect(token.integrityLevel).toBe('High');
      expect(token.elevationType).toBe('Full');
      expect(tokenHasGroup(token, WELL_KNOWN_SIDS.ADMINISTRATORS)).toBe(true);
      expect(tokenHasPrivilege(token, 'SeChangeNotifyPrivilege')).toBe(true);
      expect(tokenHasPrivilege(token, 'SeDebugPrivilege')).toBe(true);
    });

    it('creates a standard user token with Medium integrity and limited elevation', () => {
      const finance = INITIAL_WINDOWS_USERS.find((u) => u.username === 'finance-admin')!;
      const token = buildAccessToken(finance, INITIAL_WINDOWS_GROUPS);

      expect(token.integrityLevel).toBe('Medium');
      expect(token.elevationType).toBe('Default');
      expect(tokenHasGroup(token, WELL_KNOWN_SIDS.ADMINISTRATORS)).toBe(false);
      expect(canElevate(token)).toBe(false);
    });

    it('supports UAC elevation check for local administrators running at Medium integrity', () => {
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const mediumToken = buildAccessToken(alice, INITIAL_WINDOWS_GROUPS, undefined, 'Medium');

      expect(canElevate(mediumToken)).toBe(true);
    });
  });

  // 3. NTFS Permissions & DACL Logic
  describe('NTFS Permissions & Access Decision Engine', () => {
    it('explicit Deny takes absolute precedence over explicit Allow', () => {
      const resourceWithDeny: NtfsResource = {
        id: 'test-res',
        path: 'C:\\Test\\secret.txt',
        name: 'secret.txt',
        type: 'file',
        ownerSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
        ownerName: 'Administrators',
        inheritanceEnabled: false,
        dacl: [
          {
            id: 'ace-allow',
            trusteeSid: WELL_KNOWN_SIDS.USERS,
            trusteeName: 'Users',
            type: 'Allow',
            permissions: ['Read', 'Write'],
            isInherited: false,
          },
          {
            id: 'ace-deny',
            trusteeSid: 'S-1-5-21-1002', // bob
            trusteeName: 'bob',
            type: 'Deny',
            permissions: ['Write'],
            isInherited: false,
          },
        ],
        securityRelevanceEn: 'Test',
        securityRelevanceAr: 'اختبار',
      };

      const bob = INITIAL_WINDOWS_USERS.find((u) => u.username === 'bob')!;
      const bobToken = buildAccessToken(bob, INITIAL_WINDOWS_GROUPS);

      // Bob requesting Read: should be allowed (Allow is on Users)
      const readDecision = evaluateNtfsAccess(resourceWithDeny, bobToken, 'Read');
      expect(readDecision.allowed).toBe(true);

      // Bob requesting Write: should be DENIED because of Explicit Deny on bob
      const writeDecision = evaluateNtfsAccess(resourceWithDeny, bobToken, 'Write');
      expect(writeDecision.allowed).toBe(false);
      expect(writeDecision.reasonEn).toContain('Explicit DENY');
    });

    it('explicit ACE overrides inherited ACE', () => {
      const resourceWithInheritedDeny: NtfsResource = {
        id: 'test-res-2',
        path: 'C:\\Test\\subfile.txt',
        name: 'subfile.txt',
        type: 'file',
        ownerSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
        ownerName: 'Administrators',
        inheritanceEnabled: true,
        dacl: [
          {
            id: 'ace-exp-allow',
            trusteeSid: WELL_KNOWN_SIDS.USERS,
            trusteeName: 'Users',
            type: 'Allow',
            permissions: ['Read'],
            isInherited: false, // Explicit Allow on child
          },
          {
            id: 'ace-inh-deny',
            trusteeSid: WELL_KNOWN_SIDS.USERS,
            trusteeName: 'Users',
            type: 'Deny',
            permissions: ['Read'],
            isInherited: true, // Inherited Deny from parent
          },
        ],
        securityRelevanceEn: 'Test',
        securityRelevanceAr: 'اختبار',
      };

      const finance = INITIAL_WINDOWS_USERS.find((u) => u.username === 'finance-admin')!;
      const financeToken = buildAccessToken(finance, INITIAL_WINDOWS_GROUPS);

      const decision = evaluateNtfsAccess(resourceWithInheritedDeny, financeToken, 'Read');
      // In NTFS, explicit Allow takes precedence over inherited Deny
      expect(decision.allowed).toBe(true);
      expect(decision.reasonEn).toContain('Explicit ALLOW');
    });

    it('toggles inheritance and manages ACE addition/removal safely', () => {
      const baseResource: NtfsResource = {
        id: 'res-toggle',
        path: 'C:\\TestFolder',
        name: 'TestFolder',
        type: 'folder',
        ownerSid: WELL_KNOWN_SIDS.ADMINISTRATORS,
        ownerName: 'Administrators',
        inheritanceEnabled: false,
        dacl: [],
        securityRelevanceEn: 'Test',
        securityRelevanceAr: 'اختبار',
      };

      const parentDacl: NtfsAce[] = [
        {
          id: 'p-1',
          trusteeSid: WELL_KNOWN_SIDS.USERS,
          trusteeName: 'Users',
          type: 'Allow',
          permissions: ['Read'],
          isInherited: false,
        },
      ];

      const inherited = toggleInheritance(baseResource, parentDacl);
      expect(inherited.inheritanceEnabled).toBe(true);
      expect(inherited.dacl).toHaveLength(1);
      expect(inherited.dacl[0].isInherited).toBe(true);

      // Add ACE
      const withAce = addAceToResource(inherited, {
        trusteeSid: WELL_KNOWN_SIDS.FINANCE,
        trusteeName: 'Finance',
        type: 'Allow',
        permissions: ['Modify'],
        isInherited: false,
      });
      expect(withAce.dacl).toHaveLength(2);

      // Remove ACE
      const removed = removeAceFromResource(withAce, withAce.dacl[0].id);
      expect(removed.dacl).toHaveLength(1);
    });

    it('calculates comprehensive effective permissions matrix', () => {
      const confDir = INITIAL_NTFS_RESOURCES.find((r) => r.path === 'C:\\Windows\\System32')!;
      const alice = INITIAL_WINDOWS_USERS.find((u) => u.username === 'alice')!;
      const aliceToken = buildAccessToken(alice, INITIAL_WINDOWS_GROUPS, undefined, 'High');

      const matrix = getEffectiveNtfsPermissions(confDir, aliceToken);
      expect(matrix.Read).toBe(true);
      expect(matrix.Write).toBe(true);
      expect(matrix.FullControl).toBe(true);
    });
  });

  // 4. Process Tree & Mandatory Integrity Control (MIC)
  describe('Windows Process Tree & MIC', () => {
    it('initializes standard Windows core processes', () => {
      const tree = initWindowsProcessTree();
      expect(tree.length).toBeGreaterThanOrEqual(8);

      const lsass = tree.find((p) => p.name === 'lsass.exe')!;
      expect(lsass).toBeDefined();
      expect(lsass.integrityLevel).toBe('System');
      expect(lsass.securityCritical).toBe(true);

      const explorer = tree.find((p) => p.name === 'explorer.exe')!;
      expect(explorer).toBeDefined();
      expect(explorer.integrityLevel).toBe('Medium');
    });

    it('blocks Medium integrity process from modifying higher integrity process (No-Write-Up)', () => {
      const tree = initWindowsProcessTree();
      const powershell = tree.find((p) => p.name === 'powershell.exe')!; // Medium
      const lsass = tree.find((p) => p.name === 'lsass.exe')!; // System

      const decision = canProcessAccessTarget(powershell, lsass, 'WriteMemory', false);
      expect(decision.allowed).toBe(false);
      expect(decision.reasonEn).toContain('MIC Violation');
    });

    it('allows process access when caller possesses SeDebugPrivilege', () => {
      const tree = initWindowsProcessTree();
      const powershell = tree.find((p) => p.name === 'powershell.exe')!;
      const lsass = tree.find((p) => p.name === 'lsass.exe')!;

      const decision = canProcessAccessTarget(powershell, lsass, 'ReadMemory', true);
      expect(decision.allowed).toBe(true);
      expect(decision.reasonEn).toContain('SeDebugPrivilege');
    });

    it('spawns and terminates non-critical processes safely', () => {
      const tree = initWindowsProcessTree();
      const updated = spawnWindowsProcess(
        tree,
        'calculator.exe',
        'WORKSTATION\\alice',
        'S-1-5-21-1001',
        'Medium',
        'calc.exe'
      );
      expect(updated.length).toBe(tree.length + 1);

      const calc = updated.find((p) => p.name === 'calculator.exe')!;
      const afterKill = terminateWindowsProcess(updated, calc.pid);
      expect(afterKill.length).toBe(tree.length);
    });
  });

  // 5. Windows Services & Unquoted Paths
  describe('Windows Services & Unquoted Service Paths', () => {
    it('detects unquoted service path with spaces correctly', () => {
      expect(isPathUnquotedWithSpaces('C:\\Program Files\\Enterprise Cloud Backup\\agent.exe')).toBe(true);
      expect(isPathUnquotedWithSpaces('"C:\\Program Files\\Enterprise Cloud Backup\\agent.exe"')).toBe(false);
      expect(isPathUnquotedWithSpaces('C:\\Windows\\System32\\svchost.exe -k netsvcs')).toBe(false);
    });

    it('detects and fixes unquoted service path vulnerability', () => {
      const vulnerable = detectUnquotedServicePaths(INITIAL_WINDOWS_SERVICES);
      expect(vulnerable.length).toBeGreaterThan(0);
      expect(vulnerable[0].serviceName).toBe('EnterpriseBackupAgent');

      const fixed = fixUnquotedServicePath(vulnerable[0]);
      expect(fixed.isVulnerableUnquotedPath).toBe(false);
      expect(fixed.binaryPath.startsWith('"')).toBe(true);
    });

    it('starts, stops, and changes startup type of services', () => {
      const tree = initWindowsProcessTree();
      const telnet = INITIAL_WINDOWS_SERVICES.find((s) => s.serviceName === 'TlntSvr')!;

      // Stop service
      const stopped = stopWindowsService(telnet);
      expect(stopped.status).toBe('Stopped');
      expect(stopped.processId).toBeUndefined();

      // Change startup
      const disabled = changeStartupType(stopped, 'Disabled');
      expect(disabled.startupType).toBe('Disabled');

      // Start service
      const started = startWindowsService(disabled, tree);
      expect(started.service.status).toBe('Running');
      expect(started.service.processId).toBeDefined();
    });
  });

  // 6. Windows Defender Firewall Logic
  describe('Windows Defender Firewall Engine', () => {
    it('enforces Block rules with priority over Allow rules', () => {
      const state = { ...INITIAL_FIREWALL_STATE };
      const decision = evaluateFirewallPacket(state, {
        direction: 'Inbound',
        protocol: 'TCP',
        port: 4444, // Block rule exists for 4444
        remoteIp: '192.168.1.50',
        profile: 'Public',
      });

      expect(decision.allowed).toBe(false);
      expect(decision.reasonEn).toContain('BLOCKED by rule');
    });

    it('allows all traffic when firewall profile is disabled', () => {
      const disabledState = setFirewallProfileState(INITIAL_FIREWALL_STATE, 'Public', false);
      const decision = evaluateFirewallPacket(disabledState, {
        direction: 'Inbound',
        protocol: 'TCP',
        port: 4444,
        remoteIp: '192.168.1.50',
        profile: 'Public',
      });

      expect(decision.allowed).toBe(true);
      expect(decision.profileActive).toBe(false);
      expect(decision.reasonEn).toContain('DISABLED');
    });

    it('toggles rule and blocks dangerous Telnet port 23 when disabled', () => {
      const state = toggleFirewallRule(INITIAL_FIREWALL_STATE, 'fw-telnet-in'); // Disabled
      const decision = evaluateFirewallPacket(state, {
        direction: 'Inbound',
        protocol: 'TCP',
        port: 23,
        remoteIp: '10.0.0.5',
        profile: 'Private',
      });

      expect(decision.allowed).toBe(false);
    });
  });

  // 7. Event Logs Logic
  describe('Windows Event Viewer Telemetry', () => {
    it('filters events by Event ID, channel, and search query', () => {
      const logonEvents = filterWindowsEvents(INITIAL_WINDOWS_EVENTS, { eventId: 4624 });
      expect(logonEvents.length).toBeGreaterThan(0);
      expect(logonEvents[0].eventId).toBe(4624);

      const securityOnly = filterWindowsEvents(INITIAL_WINDOWS_EVENTS, { channel: 'Security' });
      expect(securityOnly.every((e) => e.channel === 'Security')).toBe(true);

      const bruteForce = filterWindowsEvents(INITIAL_WINDOWS_EVENTS, { query: 'Administrator' });
      expect(bruteForce.length).toBeGreaterThanOrEqual(2);
    });

    it('creates new events with sequential record IDs and deterministic timestamps', () => {
      const nextVirtual = 15000;
      const updated = createWindowsEvent(INITIAL_WINDOWS_EVENTS, {
        channel: 'Security',
        eventId: 4625,
        taskCategory: 'Logon',
        severity: 'Warning',
        virtualTimestamp: nextVirtual,
        computer: 'WIN-SRV-2025',
        provider: 'Microsoft-Windows-Security-Auditing',
        subjectUser: 'ANONYMOUS',
        details: { LogonType: 3 },
        descriptionEn: 'Test Logon failure',
        descriptionAr: 'اختبار فشل دخول',
      });

      expect(updated.length).toBe(INITIAL_WINDOWS_EVENTS.length + 1);
      expect(updated[0].virtualTimestamp).toBe(nextVirtual);
    });
  });

  // 8. Master Hardening Challenge Validator
  describe('Windows Hardening Challenge Validator', () => {
    const getHardenedState = (): WindowsHardeningState => ({
      users: INITIAL_WINDOWS_USERS.map((u) => {
        if (u.username === 'Guest') return { ...u, enabled: false };
        if (u.username === 'bob') return { ...u, groupSids: [WELL_KNOWN_SIDS.USERS] };
        return u;
      }),
      groups: INITIAL_WINDOWS_GROUPS.map((g) => {
        if (g.sid === WELL_KNOWN_SIDS.ADMINISTRATORS) {
          return { ...g, memberSids: ['S-1-5-21-1001'] }; // Only alice
        }
        return g;
      }),
      ntfsResources: INITIAL_NTFS_RESOURCES.map((r) => {
        if (r.path === 'C:\\Confidential') {
          return {
            ...r,
            dacl: r.dacl.filter((ace) => ace.trusteeSid !== WELL_KNOWN_SIDS.EVERYONE),
          };
        }
        return r;
      }),
      services: INITIAL_WINDOWS_SERVICES.map((s) => {
        if (s.serviceName === 'TlntSvr') {
          return { ...s, status: 'Stopped', startupType: 'Disabled' };
        }
        if (s.serviceName === 'EnterpriseBackupAgent') {
          return fixUnquotedServicePath(s);
        }
        return s;
      }),
      firewallState: {
        profilesEnabled: { Domain: true, Private: true, Public: true },
        currentActiveProfile: 'Public',
        rules: INITIAL_FIREWALL_STATE.rules.map((r) => {
          if (r.id === 'fw-smb-in') return { ...r, profiles: ['Domain', 'Private'] };
          if (r.id === 'fw-telnet-in') return { ...r, enabled: false };
          return r;
        }),
      },
      auditPolicies: {
        auditLogonEvents: true,
        auditProcessCreation: true,
        auditPrivilegeUse: true,
      },
    });

    it('returns score: 100 and success: true for fully hardened Windows workstation', () => {
      const state = getHardenedState();
      const result = validateWindowsHardeningState(state);

      expect(result.success).toBe(true);
      expect(result.score).toBe(100);
      expect(result.failedChecks).toHaveLength(0);
      expect(result.passedChecks).toHaveLength(7);
    });

    it('fails when built-in Guest account is enabled', () => {
      const state = getHardenedState();
      state.users = state.users.map((u) => (u.username === 'Guest' ? { ...u, enabled: true } : u));

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('guest_account_disabled');
    });

    it('fails when Bob remains in Administrators group', () => {
      const state = getHardenedState();
      state.users = state.users.map((u) =>
        u.username === 'bob' ? { ...u, groupSids: [WELL_KNOWN_SIDS.USERS, WELL_KNOWN_SIDS.ADMINISTRATORS] } : u
      );

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('bob_least_privilege');
    });

    it('fails when insecure Telnet service is still running or enabled', () => {
      const state = getHardenedState();
      state.services = state.services.map((s) =>
        s.serviceName === 'TlntSvr' ? { ...s, status: 'Running', startupType: 'Automatic' } : s
      );

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('telnet_service_disabled');
    });

    it('fails when EnterpriseBackupAgent has an unquoted service path', () => {
      const state = getHardenedState();
      state.services = state.services.map((s) =>
        s.serviceName === 'EnterpriseBackupAgent'
          ? { ...s, binaryPath: 'C:\\Program Files\\Enterprise Cloud Backup\\agent.exe', isVulnerableUnquotedPath: true }
          : s
      );

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('unquoted_service_path_fixed');
    });

    it('fails when C:\\Confidential has Everyone FullControl or Write permissions', () => {
      const state = getHardenedState();
      state.ntfsResources = state.ntfsResources.map((r) => {
        if (r.path === 'C:\\Confidential') {
          return {
            ...r,
            dacl: [
              ...r.dacl,
              {
                id: 'bad-ace',
                trusteeSid: WELL_KNOWN_SIDS.EVERYONE,
                trusteeName: 'Everyone',
                type: 'Allow',
                permissions: ['FullControl', 'Write'],
                isInherited: false,
              },
            ],
          };
        }
        return r;
      });

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('ntfs_confidential_hardened');
    });

    it('fails when a firewall profile is disabled or SMB 445 is exposed to Public', () => {
      const state = getHardenedState();
      state.firewallState.profilesEnabled.Public = false;

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('firewall_perimeter_hardened');
    });

    it('fails when Process Creation Auditing is disabled', () => {
      const state = getHardenedState();
      state.auditPolicies.auditProcessCreation = false;

      const result = validateWindowsHardeningState(state);
      expect(result.success).toBe(false);
      expect(result.failedChecks).toContain('process_auditing_enabled');
    });
  });
});
