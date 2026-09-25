import { describe, it, expect } from 'vitest';

// Real production logic imports
import {
  AdObject,
  AdUser,
  AdGroup,
  AdComputer,
  INITIAL_DIRECTORY_OBJECTS,
  INITIAL_OUS,
  INITIAL_USERS,
  INITIAL_GROUPS,
  INITIAL_COMPUTERS,
  moveObjectToOu,
  enableDirectoryObject,
  disableDirectoryObject,
  findObjectBySid,
  getChildrenOfOu,
  DOMAIN_DN,
} from '../../simulations/identity/logic/directory';

import {
  resolveNestedMembership,
  getEffectiveGroups,
  wouldCreateGroupCycle,
  evaluateIdentityRisks,
} from '../../simulations/identity/logic/groups';

import {
  DirectoryResource,
  INITIAL_DIRECTORY_RESOURCES,
  evaluateDirectoryResourceAccess,
} from '../../simulations/identity/logic/authorization';

import {
  advanceKerberosProtocol,
  buildDeterministicTicketId,
  checkClockSkew,
  KerberosExchangeContext,
} from '../../simulations/identity/logic/kerberos';

import {
  searchDirectory,
  matchDirectoryFilter,
} from '../../simulations/identity/logic/ldap';

import {
  AdGpo,
  INITIAL_GPOS,
  resolveEffectivePolicies,
} from '../../simulations/identity/logic/gpo';

import {
  DomainTrust,
  INITIAL_DOMAIN_TRUSTS,
  canAuthenticateAcrossTrust,
} from '../../simulations/identity/logic/trusts';

import {
  createAdEvent,
  filterAdEvents,
  INITIAL_AD_EVENTS,
} from '../../simulations/identity/logic/eventlog';

import {
  getInitialChallengeState,
  validateActiveDirectoryState,
} from '../../simulations/identity/logic/hardening';

describe('Active Directory & Kerberos Enterprise Identity World', () => {
  // ==========================================
  // 1. Directory Object Model & Production Operations
  // ==========================================
  describe('Directory Object Model & Operations', () => {
    it('moves user object deterministically to a new OU', () => {
      const sara = INITIAL_USERS.find((u) => u.samAccountName === 'sara')!;
      expect(sara.ou).toBe('OU=HR,DC=corp,DC=nexora,DC=local');

      const targetOu = 'OU=Finance,DC=corp,DC=nexora,DC=local';
      const updated = moveObjectToOu(INITIAL_DIRECTORY_OBJECTS, sara.id, targetOu);

      const movedSara = updated.find((o) => o.id === sara.id) as AdUser;
      expect(movedSara.ou).toBe(targetOu);

      // Verify idempotency
      const secondCall = moveObjectToOu(updated, sara.id, targetOu);
      expect(secondCall).toEqual(updated);
    });

    it('enables and disables user accounts deterministically', () => {
      const auditor = INITIAL_USERS.find((u) => u.samAccountName === 'temp-auditor')!;
      expect(auditor.enabled).toBe(true);

      const disabledState = disableDirectoryObject(INITIAL_DIRECTORY_OBJECTS, auditor.id);
      const disabledAuditor = disabledState.find((o) => o.id === auditor.id) as AdUser;
      expect(disabledAuditor.enabled).toBe(false);

      const reEnabledState = enableDirectoryObject(disabledState, auditor.id);
      const reEnabledAuditor = reEnabledState.find((o) => o.id === auditor.id) as AdUser;
      expect(reEnabledAuditor.enabled).toBe(true);
    });

    it('finds directory object by exact SID', () => {
      const foundUser = findObjectBySid(INITIAL_DIRECTORY_OBJECTS, 'S-1-5-21-392841-1001') as AdUser;
      expect(foundUser).toBeDefined();
      expect(foundUser.samAccountName).toBe('sara');

      const foundGroup = findObjectBySid(INITIAL_DIRECTORY_OBJECTS, 'S-1-5-21-392841-512') as AdGroup;
      expect(foundGroup).toBeDefined();
      expect(foundGroup.name).toBe('Domain Admins');

      const notFound = findObjectBySid(INITIAL_DIRECTORY_OBJECTS, 'S-1-5-99-999999');
      expect(notFound).toBeUndefined();
    });

    it('retrieves children of an OU container', () => {
      const financeChildren = getChildrenOfOu(
        INITIAL_DIRECTORY_OBJECTS,
        'OU=Finance,DC=corp,DC=nexora,DC=local'
      );

      // Alice is in OU=Finance
      expect(financeChildren.some((c) => (c as any).samAccountName === 'alice')).toBe(true);
      // Sara initially is in OU=HR, not OU=Finance
      expect(financeChildren.some((c) => (c as any).samAccountName === 'sara')).toBe(false);
    });
  });

  // ==========================================
  // 2. Nested Groups, Cycle Detection, & AGDLP Resolution
  // ==========================================
  describe('Group Membership Graph & Nested Roles', () => {
    it('resolves multi-level group nesting (A -> B -> C)', () => {
      // Group C is Finance-Reporting, which contains Group B (Finance-Users)
      // Finance-Users contains Alice (S-1-5-21-392841-1002)
      const reportingGroup = INITIAL_GROUPS.find((g) => g.name === 'Finance-Reporting')!;
      const nestedMembers = resolveNestedMembership(INITIAL_GROUPS, reportingGroup.sid);

      // Must contain Finance-Users SID and Alice's SID
      const finUsersSid = 'S-1-5-21-392841-1101';
      const aliceSid = 'S-1-5-21-392841-1002';
      expect(nestedMembers).toContain(finUsersSid);
      expect(nestedMembers).toContain(aliceSid);
    });

    it('calculates effective groups for a user through nesting', () => {
      const alice = INITIAL_USERS.find((u) => u.samAccountName === 'alice')!;
      const effective = getEffectiveGroups(INITIAL_DIRECTORY_OBJECTS, alice.sid);
      const groupNames = effective.map((g) => g.name);

      // Alice is directly in Finance-Users and Domain Users
      expect(groupNames).toContain('Finance-Users');
      expect(groupNames).toContain('Domain Users');
      // Through nesting into Finance-Reporting, Alice effectively possesses Finance-Reporting
      expect(groupNames).toContain('Finance-Reporting');
    });

    it('detects and prevents cyclic group dependency loops', () => {
      const grpA: AdGroup = {
        id: 'g-a',
        type: 'group',
        sid: 'S-1-GRP-A',
        name: 'Group-A',
        scope: 'Global',
        groupType: 'Security',
        members: ['S-1-GRP-B'], // A contains B
        ou: 'OU=Groups',
        descriptionEn: '',
        descriptionAr: '',
        privileged: false,
      };

      const grpB: AdGroup = {
        id: 'g-b',
        type: 'group',
        sid: 'S-1-GRP-B',
        name: 'Group-B',
        scope: 'DomainLocal',
        groupType: 'Security',
        members: ['S-1-GRP-C'], // B contains C
        ou: 'OU=Groups',
        descriptionEn: '',
        descriptionAr: '',
        privileged: false,
      };

      const grpC: AdGroup = {
        id: 'g-c',
        type: 'group',
        sid: 'S-1-GRP-C',
        name: 'Group-C',
        scope: 'DomainLocal',
        groupType: 'Security',
        members: [],
        ou: 'OU=Groups',
        descriptionEn: '',
        descriptionAr: '',
        privileged: false,
      };

      const testGroups = [grpA, grpB, grpC];

      // Self-nesting is a cycle
      expect(wouldCreateGroupCycle(testGroups, 'S-1-GRP-A', 'S-1-GRP-A')).toBe(true);

      // Adding A into C would close the loop: A -> B -> C -> A
      expect(wouldCreateGroupCycle(testGroups, 'S-1-GRP-C', 'S-1-GRP-A')).toBe(true);

      // Adding an unlinked user or group does not create a cycle
      expect(wouldCreateGroupCycle(testGroups, 'S-1-GRP-C', 'S-1-USER-X')).toBe(false);
    });

    it('identifies enterprise identity risks deterministically', () => {
      const risks = evaluateIdentityRisks(INITIAL_DIRECTORY_OBJECTS);
      expect(risks.length).toBeGreaterThan(0);

      const staleRisk = risks.find((r) => r.id.includes('temp-auditor'));
      expect(staleRisk).toBeDefined();
      expect(staleRisk?.severity).toBe('HIGH');

      const svcRisk = risks.find((r) => r.id.includes('svc-interactive'));
      expect(svcRisk).toBeDefined();
      expect(svcRisk?.severity).toBe('CRITICAL');
    });
  });

  // ==========================================
  // 3. Authentication vs Authorization Separation
  // ==========================================
  describe('Authentication vs Authorization Engine', () => {
    it('grants access when user has effective group matching explicit ALLOW ACE', () => {
      const alice = INITIAL_USERS.find((u) => u.samAccountName === 'alice')!;
      const effective = getEffectiveGroups(INITIAL_DIRECTORY_OBJECTS, alice.sid);
      const finShare = INITIAL_DIRECTORY_RESOURCES.find((r) => r.id === 'res-finance-share')!;

      const result = evaluateDirectoryResourceAccess(alice, effective, finShare, 'Read');
      expect(result.authenticated).toBe(true);
      expect(result.allowed).toBe(true);
      expect(result.matchedRule?.type).toBe('Allow');
    });

    it('denies access when explicit DENY ACE matches user group', () => {
      const auditor = INITIAL_USERS.find((u) => u.samAccountName === 'temp-auditor')!;
      const effective = getEffectiveGroups(INITIAL_DIRECTORY_OBJECTS, auditor.sid);
      const hrShare = INITIAL_DIRECTORY_RESOURCES.find((r) => r.id === 'res-hr-payroll')!;

      // HR Payroll has explicit DENY for Contractors-Ext
      const result = evaluateDirectoryResourceAccess(auditor, effective, hrShare, 'Read');
      expect(result.authenticated).toBe(true);
      expect(result.allowed).toBe(false);
      expect(result.matchedRule?.type).toBe('Deny');
    });

    it('demonstrates Authentication SUCCESS but Authorization DENIED (Implicit Deny)', () => {
      const alice = INITIAL_USERS.find((u) => u.samAccountName === 'alice')!;
      const effective = getEffectiveGroups(INITIAL_DIRECTORY_OBJECTS, alice.sid);
      const itShare = INITIAL_DIRECTORY_RESOURCES.find((r) => r.id === 'res-it-tools')!;

      // Alice is valid/authenticated, but IT-Share only allows Domain Admins & IT-Operations
      const result = evaluateDirectoryResourceAccess(alice, effective, itShare, 'Read');
      expect(result.authenticated).toBe(true);
      expect(result.allowed).toBe(false);
      expect(result.reasonEn).toContain('Access Denied');
    });

    it('fails authentication if user account is disabled', () => {
      const disabledUser: AdUser = {
        ...INITIAL_USERS[0],
        enabled: false,
      };
      const finShare = INITIAL_DIRECTORY_RESOURCES.find((r) => r.id === 'res-finance-share')!;

      const result = evaluateDirectoryResourceAccess(disabledUser, [], finShare, 'Read');
      expect(result.authenticated).toBe(false);
      expect(result.allowed).toBe(false);
      expect(result.reasonEn).toContain('Authentication Failed');
    });
  });

  // ==========================================
  // 4. Kerberos 3-Tier Protocol Simulation
  // ==========================================
  describe('Kerberos Protocol State Machine', () => {
    it('executes full AS -> TGT -> TGS -> Service Ticket -> AP flow', () => {
      const ctx: KerberosExchangeContext = {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        clientVirtualTime: 100,
        kdcVirtualTime: 100,
        accountEnabled: true,
        passwordValid: true,
        userKnown: true,
        spnKnown: true,
        kdcAvailable: true,
        pacGroups: ['S-1-5-21-392841-513', 'S-1-5-21-392841-1101'],
        encryptionType: 'AES-256',
        ticketLifetime: 600,
        maxClockSkew: 300,
        seq: 1,
      };

      // Step 1: IDLE -> AS_REQ_SENT
      const step1 = advanceKerberosProtocol('IDLE', ctx);
      expect(step1.nextState).toBe('AS_REQ_SENT');

      // Step 2: AS_REQ_SENT -> TGT_ISSUED
      const step2 = advanceKerberosProtocol(step1.nextState, ctx);
      expect(step2.nextState).toBe('TGT_ISSUED');
      expect(step2.ticketIssued?.type).toBe('TGT');
      expect(step2.ticketIssued?.encryptionType).toBe('AES-256');

      const tgt = step2.ticketIssued!;

      // Step 3: TGT_ISSUED -> TGS_REQ_SENT
      const step3 = advanceKerberosProtocol(step2.nextState, ctx, tgt);
      expect(step3.nextState).toBe('TGS_REQ_SENT');

      // Step 4: TGS_REQ_SENT -> SERVICE_TICKET_ISSUED
      const step4 = advanceKerberosProtocol(step3.nextState, ctx, tgt);
      expect(step4.nextState).toBe('SERVICE_TICKET_ISSUED');
      expect(step4.ticketIssued?.type).toBe('SERVICE');
      expect(step4.ticketIssued?.servicePrincipal).toBe('cifs/fin-srv01.corp.nexora.local');

      const serviceTicket = step4.ticketIssued!;

      // Step 5: SERVICE_TICKET_ISSUED -> AP_REQ_SENT
      const step5 = advanceKerberosProtocol(step4.nextState, ctx, tgt, serviceTicket);
      expect(step5.nextState).toBe('AP_REQ_SENT');

      // Step 6: AP_REQ_SENT -> AUTHENTICATED
      const step6 = advanceKerberosProtocol(step5.nextState, ctx, tgt, serviceTicket);
      expect(step6.nextState).toBe('AUTHENTICATED');
    });

    it('fails AS-REQ when clock skew exceeds 300 seconds', () => {
      expect(checkClockSkew(100, 150, 300)).toBe(true);
      expect(checkClockSkew(100, 450, 300)).toBe(false);

      const skewCtx: KerberosExchangeContext = {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        clientVirtualTime: 100,
        kdcVirtualTime: 500, // 400s difference
        accountEnabled: true,
        passwordValid: true,
        userKnown: true,
        spnKnown: true,
        kdcAvailable: true,
        pacGroups: [],
        encryptionType: 'AES-256',
        ticketLifetime: 600,
        maxClockSkew: 300,
      };

      const result = advanceKerberosProtocol('IDLE', skewCtx);
      expect(result.nextState).toBe('FAILED');
      expect(result.failureReason).toBe('CLOCK_SKEW');
    });

    it('fails TGS-REQ when TGT has expired', () => {
      const expiredTgt = {
        id: 'tgt-test-1',
        type: 'TGT' as const,
        clientPrincipal: 'sara@corp.nexora.local',
        servicePrincipal: 'krbtgt/corp.nexora.local',
        realm: 'CORP.NEXORA.LOCAL',
        issuedAtVirtualTime: 100,
        expiresAtVirtualTime: 200,
        status: 'VALID' as const,
        pacGroups: [],
        encryptionType: 'AES-256' as const,
        sessionKey: 'key',
      };

      const ctx: KerberosExchangeContext = {
        clientPrincipal: 'sara@corp.nexora.local',
        targetSpn: 'cifs/fin-srv01.corp.nexora.local',
        clientVirtualTime: 250, // Beyond expiry
        kdcVirtualTime: 250,
        accountEnabled: true,
        passwordValid: true,
        userKnown: true,
        spnKnown: true,
        kdcAvailable: true,
        pacGroups: [],
        encryptionType: 'AES-256',
        ticketLifetime: 600,
        maxClockSkew: 300,
      };

      const result = advanceKerberosProtocol('TGT_ISSUED', ctx, expiredTgt);
      expect(result.nextState).toBe('FAILED');
      expect(result.failureReason).toBe('TGT_EXPIRED');
    });

    it('generates strictly deterministic ticket IDs', () => {
      const id1 = buildDeterministicTicketId('TGT', 'sara@corp.nexora.local', 100, 1);
      const id2 = buildDeterministicTicketId('TGT', 'sara@corp.nexora.local', 100, 1);
      expect(id1).toBe(id2);
      expect(id1).toBe('tgt-sara-100-1');
    });
  });

  // ==========================================
  // 5. Synthetic LDAP Search Engine
  // ==========================================
  describe('LDAP Query Engine & Filter Evaluation', () => {
    it('searches directory with RFC 4515 attribute filters', () => {
      const res = searchDirectory(
        INITIAL_DIRECTORY_OBJECTS,
        DOMAIN_DN,
        '(department=Finance)',
        'subtree'
      );

      expect(res.count).toBeGreaterThan(0);
      expect(res.results.every((r) => r.attributes.department === 'Finance')).toBe(true);
    });

    it('evaluates complex LDAP filters (&, |, !)', () => {
      // AND
      expect(
        matchDirectoryFilter(
          { department: 'Finance', enabled: true },
          '(&(department=Finance)(enabled=true))'
        )
      ).toBe(true);

      // OR
      expect(
        matchDirectoryFilter(
          { department: 'HR' },
          '(|(department=Finance)(department=HR))'
        )
      ).toBe(true);

      // NOT
      expect(
        matchDirectoryFilter(
          { enabled: false },
          '(!(enabled=true))'
        )
      ).toBe(true);

      // Prefix wildcard
      expect(
        matchDirectoryFilter(
          { samAccountName: 'svc-sql-backup' },
          '(samAccountName=svc*)'
        )
      ).toBe(true);
    });

    it('restricts search results according to search scope (oneLevel vs subtree)', () => {
      const financeOuDn = 'OU=Finance,DC=corp,DC=nexora,DC=local';

      // One level under OU=Finance returns Alice directly, but does NOT return workstations in sub-OU
      const oneLevelRes = searchDirectory(
        INITIAL_DIRECTORY_OBJECTS,
        financeOuDn,
        '(objectClass=*)',
        'oneLevel'
      );

      // Subtree returns both direct children and nested sub-OU children
      const subtreeRes = searchDirectory(
        INITIAL_DIRECTORY_OBJECTS,
        financeOuDn,
        '(objectClass=*)',
        'subtree'
      );

      expect(subtreeRes.count).toBeGreaterThanOrEqual(oneLevelRes.count);
    });
  });

  // ==========================================
  // 6. Group Policy (GPO) Inheritance Engine
  // ==========================================
  describe('Group Policy LSDOU Inheritance & Precedence', () => {
    it('applies domain baseline policy down to child OUs', () => {
      const res = resolveEffectivePolicies(
        INITIAL_GPOS,
        INITIAL_OUS,
        'OU=HR,DC=corp,DC=nexora,DC=local'
      );

      // Inherited password policy from Default Domain Policy
      expect(res.effectiveSettings.passwordMinLength).toBe(12);
      expect(res.effectiveSettings.accountLockoutThreshold).toBe(5);
    });

    it('overrides parent policy with downstream child OU settings', () => {
      const res = resolveEffectivePolicies(
        INITIAL_GPOS,
        INITIAL_OUS,
        'OU=Workstations,OU=Finance,DC=corp,DC=nexora,DC=local'
      );

      // Default Domain screenLockTimeoutMinutes = 15
      // Finance OU GPO screenLockTimeoutMinutes = 10
      // Workstation child OU GPO screenLockTimeoutMinutes = 5
      expect(res.effectiveSettings.screenLockTimeoutMinutes).toBe(5);
      expect(res.settingOrigins.screenLockTimeoutMinutes?.gpoName).toBe('Finance Workstation Lockdown');
    });

    it('honors Block Inheritance for non-enforced GPOs', () => {
      const ousWithBlock = INITIAL_OUS.map((ou) =>
        ou.id === 'ou-contractors' ? { ...ou, blockInheritance: true } : ou
      );

      const res = resolveEffectivePolicies(
        INITIAL_GPOS,
        ousWithBlock,
        'OU=Contractors,DC=corp,DC=nexora,DC=local'
      );

      // Non-enforced Default Domain Policy is blocked
      const domainGpoTrace = res.trace.find((t) => t.gpoId === 'gpo-domain-default');
      expect(domainGpoTrace?.blockedByInheritance).toBe(true);

      // But Enforced GPO (Tier 0 DC hardening) cannot be blocked
      const enforcedTrace = res.trace.find((t) => t.gpoId === 'gpo-tier0-dc');
      expect(enforcedTrace?.blockedByInheritance).toBe(false);
      expect(enforcedTrace?.applied).toBe(true);
    });

    it('ensures disabled GPOs do not apply to target containers', () => {
      const gposWithDisabled = INITIAL_GPOS.map((g) =>
        g.id === 'gpo-finance-security' ? { ...g, enabled: false } : g
      );

      const res = resolveEffectivePolicies(
        gposWithDisabled,
        INITIAL_OUS,
        'OU=Finance,DC=corp,DC=nexora,DC=local'
      );

      const finTrace = res.trace.find((t) => t.gpoId === 'gpo-finance-security');
      expect(finTrace?.disabled).toBe(true);
      expect(finTrace?.applied).toBe(false);
    });
  });

  // ==========================================
  // 7. Domain Trusts
  // ==========================================
  describe('Enterprise Domain Trusts', () => {
    it('verifies two-way parent-child domain authentication', () => {
      const res = canAuthenticateAcrossTrust(
        INITIAL_DOMAIN_TRUSTS,
        'emea.corp.nexora.local',
        'corp.nexora.local'
      );
      expect(res.canAuthenticate).toBe(true);
      expect(res.trustPath).toContain('emea.corp.nexora.local');
      expect(res.trustPath).toContain('corp.nexora.local');
    });

    it('verifies one-way incoming forest trust allows partner users', () => {
      // corp.nexora.local trusts partner-alliance.net
      const res = canAuthenticateAcrossTrust(
        INITIAL_DOMAIN_TRUSTS,
        'partner-alliance.net',
        'corp.nexora.local'
      );
      expect(res.canAuthenticate).toBe(true);
    });

    it('rejects cross-realm authentication when no trust path exists', () => {
      const res = canAuthenticateAcrossTrust(
        INITIAL_DOMAIN_TRUSTS,
        'untrusted-external.com',
        'corp.nexora.local'
      );
      expect(res.canAuthenticate).toBe(false);
      expect(res.trustPath).toHaveLength(0);
    });
  });

  // ==========================================
  // 8. Event Logging Engine
  // ==========================================
  describe('Security Event Logging Engine', () => {
    it('creates and filters events deterministically', () => {
      const evt = createAdEvent(
        4768,
        'Security',
        'Information',
        'sara',
        'DC01-NEXORA',
        'TGT requested',
        'طلب تذكرة TGT',
        'Kerberos TGT issued with AES-256.',
        'تم إصدار التذكرة.',
        'Logon/Logoff',
        150,
        1,
        'krbtgt/corp.nexora.local'
      );

      expect(evt.id).toBe('ad-evt-001-150');
      expect(evt.eventId).toBe(4768);

      const filtered = filterAdEvents([evt, ...INITIAL_AD_EVENTS], { eventId: 4768 });
      expect(filtered.every((e) => e.eventId === 4768)).toBe(true);
    });
  });

  // ==========================================
  // 9. Master Challenge Hardening & Least Privilege Validator
  // ==========================================
  describe('Master Challenge Production Validator', () => {
    it('fails on initial vulnerable state', () => {
      const initial = getInitialChallengeState();
      const res = validateActiveDirectoryState(initial);

      expect(res.success).toBe(false);
      expect(res.score).toBeLessThan(100);
      expect(res.failedChecks.length).toBeGreaterThan(0);
    });

    it('passes when all 10 security requirements are corrected', () => {
      const state = getInitialChallengeState();

      // 1. Move Sara to Finance OU
      state.objects = moveObjectToOu(
        state.objects,
        'usr-sara',
        'OU=Finance,DC=corp,DC=nexora,DC=local'
      );

      // 2. Add Sara to Finance-Users
      // 3. Remove Sara from HR-Admins
      state.objects = state.objects.map((obj) => {
        if (obj.id === 'usr-sara') {
          return {
            ...obj,
            groups: ['Domain Users', 'Finance-Users'],
            privileged: false,
          };
        }
        if (obj.type === 'group' && (obj as AdGroup).name === 'HR-Admins') {
          return {
            ...obj,
            members: (obj as AdGroup).members.filter((m) => m !== 'S-1-5-21-392841-1001'),
          };
        }
        return obj;
      });

      // 4. Remove Contractors-Ext from Finance-Share DACL
      state.resources = state.resources.map((r) => {
        if (r.id === 'res-finance-share') {
          return {
            ...r,
            dacl: r.dacl.filter((ace) => ace.principalName !== 'Contractors-Ext'),
          };
        }
        return r;
      });

      // 5. Disable stale temp-auditor account
      state.objects = disableDirectoryObject(state.objects, 'usr-temp-auditor');

      // 6. Restrict service account
      state.objects = state.objects.map((obj) => {
        if (obj.id === 'usr-svc-backup') {
          return {
            ...obj,
            allowInteractiveLogon: false,
            groups: ['Domain Users', 'Backup Operators'],
          };
        }
        if (obj.type === 'group' && (obj as AdGroup).name === 'Remote Desktop Users') {
          return {
            ...obj,
            members: (obj as AdGroup).members.filter((m) => m !== 'S-1-5-21-392841-1005'),
          };
        }
        return obj;
      });

      // 7. Enforce Workstation GPO
      state.gpos = state.gpos.map((g) => {
        if (g.id === 'gpo-workstation-baseline') {
          return {
            ...g,
            enabled: true,
            enforced: true,
            settings: {
              ...g.settings,
              screenLockTimeoutMinutes: 5,
              firewallEnabled: true,
              usbRemovableStorageBlocked: true,
            },
          };
        }
        return g;
      });

      const validation = validateActiveDirectoryState(state);
      expect(validation.score).toBe(100);
      expect(validation.success).toBe(true);
      expect(validation.failedChecks).toHaveLength(0);
    });

    it('anti-cheat: fails least privilege check if learner grants Domain Admins to Sara', () => {
      const state = getInitialChallengeState();

      // Cheating attempt: give Sara Domain Admins to satisfy file access
      state.objects = state.objects.map((obj) => {
        if (obj.id === 'usr-sara') {
          return {
            ...obj,
            groups: ['Domain Users', 'Finance-Users', 'Domain Admins'],
          };
        }
        return obj;
      });

      const validation = validateActiveDirectoryState(state);
      expect(validation.passedChecks).not.toContain('chk-least-privilege');
      expect(validation.failedChecks).toContain('chk-least-privilege');
      expect(validation.success).toBe(false);
    });
  });
});
