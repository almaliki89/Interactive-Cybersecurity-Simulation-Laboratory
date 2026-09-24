import { describe, it, expect } from 'vitest';
import { getEffectiveGroups, canUserAccessResource, LinuxUser, LinuxResource } from '../../simulations/linux/logic/identity';
import { parseOctalMode, formatSymbolicMode, evaluatePosixPermission, PosixPermissions } from '../../simulations/linux/logic/permissions';
import { evaluateSudoPolicy, SudoPolicyRule } from '../../simulations/linux/logic/sudo';
import { initProcessTree, killProcess, startProcess, LinuxProcess } from '../../simulations/linux/logic/processes';

describe('Linux Security World Production Logic Modules', () => {
  
  // 1. Identity & Groups Logic Tests
  describe('Identity & Group Membership Resolution', () => {
    it('correctly resolves effective groups including primary and supplementary ones', () => {
      const user: LinuxUser = {
        username: 'alice',
        primaryGroup: 'developers',
        supplementaryGroups: ['devops', 'shadow'],
      };
      const groups = getEffectiveGroups(user);
      expect(groups).toContain('developers');
      expect(groups).toContain('devops');
      expect(groups).toContain('shadow');
      expect(groups).toHaveLength(3);
    });

    it('bypasses POSIX checks for root superuser via CAP_DAC_OVERRIDE', () => {
      const user: LinuxUser = { username: 'root', primaryGroup: 'root', supplementaryGroups: [] };
      const resource: LinuxResource = {
        path: '/etc/shadow',
        owner: 'root',
        group: 'shadow',
        permissions: parseOctalMode('000'), // No POSIX access at all
      };
      
      const readCheck = canUserAccessResource(user, resource, 'r');
      const writeCheck = canUserAccessResource(user, resource, 'w');
      expect(readCheck.allowed).toBe(true);
      expect(writeCheck.allowed).toBe(true);
      expect(readCheck.matchedClass).toBe('root');
    });
  });

  // 2. POSIX Permissions & Octal Calculator Tests
  describe('POSIX Permissions Evaluation', () => {
    it('correctly parses octal modes into permission bit flags', () => {
      const perms = parseOctalMode('750');
      expect(perms.owner).toEqual({ r: true, w: true, x: true });
      expect(perms.group).toEqual({ r: true, w: false, x: true });
      expect(perms.other).toEqual({ r: false, w: false, x: false });
    });

    it('correctly formats permissions into standard POSIX symbolic strings', () => {
      const perms = parseOctalMode('640');
      const symFile = formatSymbolicMode(perms, false);
      const symDir = formatSymbolicMode(perms, true);
      expect(symFile).toBe('-rw-r-----');
      expect(symDir).toBe('drw-r-----');
    });

    it('evaluates Posix permissions correctly for file owners', () => {
      const user = { username: 'alice', primaryGroup: 'developers', supplementaryGroups: [] };
      const file = {
        owner: 'alice',
        group: 'developers',
        permissions: parseOctalMode('600'), // owner can rw, others nothing
      };

      expect(evaluatePosixPermission(user, file, 'r')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'w')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'x')).toBe(false);
    });

    it('evaluates Posix permissions correctly for group members', () => {
      const user = { username: 'bob', primaryGroup: 'developers', supplementaryGroups: [] };
      const file = {
        owner: 'alice',
        group: 'developers',
        permissions: parseOctalMode('640'), // owner can rw, group can r, others nothing
      };

      expect(evaluatePosixPermission(user, file, 'r')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'w')).toBe(false);
    });

    it('evaluates Posix permissions correctly for others (world)', () => {
      const user = { username: 'charlie', primaryGroup: 'othergroup', supplementaryGroups: [] };
      const file = {
        owner: 'alice',
        group: 'developers',
        permissions: parseOctalMode('644'), // owner can rw, group can r, others can r
      };

      expect(evaluatePosixPermission(user, file, 'r')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'w')).toBe(false);
    });
  });

  // 3. Sudo Policy Evaluator Tests
  describe('Sudo Policies Configuration & Privilege Escalation Evaluation', () => {
    const policies: SudoPolicyRule[] = [
      { userPattern: '%wheel', hostPattern: 'ALL', runAsUser: 'ALL', commands: ['ALL'], nopasswd: false },
      { userPattern: 'alice', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/systemctl restart nginx'], nopasswd: true },
    ];

    it('permits access with NOPASSWD if command explicitly matches rule', () => {
      const user = { username: 'alice', groups: ['developers'] };
      const res = evaluateSudoPolicy(user, '/bin/systemctl restart nginx', policies);
      expect(res.allowed).toBe(true);
      expect(res.passwordRequired).toBe(false);
    });

    it('denies access if command does not match sudoers policy rules', () => {
      const user = { username: 'alice', groups: ['developers'] };
      const res = evaluateSudoPolicy(user, '/usr/sbin/useradd helper', policies);
      expect(res.allowed).toBe(false);
    });

    it('allows full command execution if user belongs to %wheel admin pattern group', () => {
      const user = { username: 'bob', groups: ['wheel'] };
      const res = evaluateSudoPolicy(user, '/usr/sbin/useradd helper', policies);
      expect(res.allowed).toBe(true);
      expect(res.passwordRequired).toBe(true);
    });
  });

  // 4. Process Tree Logic Tests
  describe('Process Tree Management & Manipulation', () => {
    it('correctly initializes standard Unix boot processes tree', () => {
      const list = initProcessTree();
      expect(list.length).toBeGreaterThan(3);
      expect(list.find((p) => p.pid === 1)?.name).toBe('systemd');
    });

    it('prevents termination of critical system init PID 1 process', () => {
      const list = initProcessTree();
      const updated = killProcess(list, 1);
      expect(updated.find((p) => p.pid === 1)).toBeDefined();
    });

    it('recursively terminates all child processes when killing parent process', () => {
      const list = initProcessTree();
      // SSHD (PID 120) has SSHD-session (PID 121) which has bash (PID 122) as children
      const updated = killProcess(list, 120);
      expect(updated.find((p) => p.pid === 120)).toBeUndefined();
      expect(updated.find((p) => p.pid === 121)).toBeUndefined();
      expect(updated.find((p) => p.pid === 122)).toBeUndefined();
    });

    it('correctly starts and tracks newly provisioned processes with deterministic PIDs', () => {
      let list = initProcessTree();
      list = startProcess(list, 1, 'root', 'dummy-daemon', '/usr/bin/dummy-daemon', 8080);
      const created = list.find((p) => p.name === 'dummy-daemon');
      expect(created).toBeDefined();
      expect(created?.user).toBe('root');
      expect(created?.port).toBe(8080);
    });
  });
});
