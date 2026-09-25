import { describe, it, expect } from 'vitest';
import {
  getEffectiveGroups,
  canUserAccessResource,
  createUser,
  changePrimaryGroup,
  addSupplementaryGroup,
  removeSupplementaryGroup,
  LinuxUser,
  LinuxResource,
} from '../../simulations/linux/logic/identity';
import {
  parseOctalMode,
  formatSymbolicMode,
  evaluatePosixPermission,
  applyChmodSymbolic,
  PosixPermissions,
} from '../../simulations/linux/logic/permissions';
import { evaluateSudoPolicy, SudoPolicyRule } from '../../simulations/linux/logic/sudo';
import { initProcessTree, killProcess, startProcess, LinuxProcess } from '../../simulations/linux/logic/processes';
import {
  initLinuxServices,
  startService,
  stopService,
  restartService,
  getExposedServices,
  evaluateServiceExposure,
  LinuxService,
} from '../../simulations/linux/logic/services';
import {
  validateLinuxHardeningState,
  LinuxHardeningState,
} from '../../simulations/linux/logic/hardening';

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

    it('provisions new users and manages group associations', () => {
      let users: LinuxUser[] = [{ username: 'root', primaryGroup: 'root', supplementaryGroups: [] }];
      users = createUser(users, 'eve', 'contractors');
      expect(users).toHaveLength(2);
      expect(users[1].username).toBe('eve');

      users = changePrimaryGroup(users, 'eve', 'developers');
      expect(users[1].primaryGroup).toBe('developers');

      users = addSupplementaryGroup(users, 'eve', 'devops');
      expect(users[1].supplementaryGroups).toContain('devops');

      users = removeSupplementaryGroup(users, 'eve', 'devops');
      expect(users[1].supplementaryGroups).not.toContain('devops');
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
        permissions: parseOctalMode('600'),
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
        permissions: parseOctalMode('640'),
      };

      expect(evaluatePosixPermission(user, file, 'r')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'w')).toBe(false);
    });

    it('evaluates Posix permissions correctly for others (world)', () => {
      const user = { username: 'charlie', primaryGroup: 'othergroup', supplementaryGroups: [] };
      const file = {
        owner: 'alice',
        group: 'developers',
        permissions: parseOctalMode('644'),
      };

      expect(evaluatePosixPermission(user, file, 'r')).toBe(true);
      expect(evaluatePosixPermission(user, file, 'w')).toBe(false);
    });

    it('applies symbolic chmod modifications accurately', () => {
      const initial = parseOctalMode('644');
      const updated = applyChmodSymbolic(initial, 'o', '-', ['r']);
      expect(updated.other.r).toBe(false);
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

  // 5. Service Exposure Logic Tests
  describe('Service Exposure & Port Binding Logic', () => {
    it('initializes default system services and filters exposed ports', () => {
      const services = initLinuxServices();
      const exposed = getExposedServices(services);
      expect(exposed.some((s) => s.id === 'sshd' && s.port === 22)).toBe(true);
      expect(exposed.some((s) => s.id === 'nginx' && s.port === 443)).toBe(true);
    });

    it('starts, stops, and restarts services predictably', () => {
      let services = initLinuxServices();
      services = stopService(services, 'sshd');
      expect(services.find((s) => s.id === 'sshd')?.running).toBe(false);

      services = startService(services, 'sshd');
      expect(services.find((s) => s.id === 'sshd')?.running).toBe(true);

      services = restartService(services, 'sshd');
      expect(services.find((s) => s.id === 'sshd')?.running).toBe(true);
    });

    it('evaluates reachability against firewall rules chain', () => {
      const services: LinuxService[] = [
        {
          id: 'nginx',
          name: 'Nginx',
          descriptionEn: '',
          descriptionAr: '',
          processName: 'nginx',
          user: 'www-data',
          port: 443,
          protocol: 'TCP',
          enabled: true,
          running: true,
          securityCritical: false,
        },
        {
          id: 'telnet',
          name: 'Telnet',
          descriptionEn: '',
          descriptionAr: '',
          processName: 'in.telnetd',
          user: 'root',
          port: 23,
          protocol: 'TCP',
          enabled: true,
          running: true,
          securityCritical: false,
        },
      ];

      const firewallRules = [
        { port: 443, protocol: 'TCP' as const, action: 'ALLOW' as const },
        { port: 23, protocol: 'TCP' as const, action: 'DROP' as const },
      ];

      const exposure = evaluateServiceExposure(services, firewallRules);
      const nginxExp = exposure.find((e) => e.serviceId === 'nginx');
      const telnetExp = exposure.find((e) => e.serviceId === 'telnet');

      expect(nginxExp?.reachableExternally).toBe(true);
      expect(telnetExp?.reachableExternally).toBe(false);
    });
  });

  // 6. Hardening Validator Tests
  describe('Linux Hardening State Validator', () => {
    const createHardenedState = (): LinuxHardeningState => ({
      files: [
        { path: '/etc/shadow', owner: 'root', group: 'shadow', permissions: '600' },
        { path: '/etc/sudoers', owner: 'root', group: 'root', permissions: '440' },
        { path: '/home/alice', owner: 'alice', group: 'developers', permissions: '700' },
      ],
      processes: [
        { pid: 1, ppid: 0, user: 'root', name: 'systemd', state: 'running', cpu: 0.1, executable: '/sbin/init' },
        { pid: 120, ppid: 1, user: 'root', name: 'sshd', state: 'sleeping', cpu: 0.0, port: 22, executable: '/usr/sbin/sshd' },
        { pid: 250, ppid: 1, user: 'root', name: 'rsyslogd', state: 'running', cpu: 0.1, executable: '/usr/sbin/rsyslogd' },
      ],
      services: [
        { id: 'sshd', name: 'SSH', descriptionEn: '', descriptionAr: '', processName: 'sshd', user: 'root', port: 22, enabled: true, running: true, securityCritical: true },
        { id: 'rsyslog', name: 'rsyslog', descriptionEn: '', descriptionAr: '', processName: 'rsyslogd', user: 'root', enabled: true, running: true, securityCritical: true },
        { id: 'telnet', name: 'telnet', descriptionEn: '', descriptionAr: '', processName: 'in.telnetd', user: 'root', port: 23, enabled: false, running: false, securityCritical: false },
        { id: 'postgresql', name: 'postgres', descriptionEn: '', descriptionAr: '', processName: 'postgres', user: 'postgres', port: 5432, enabled: false, running: false, securityCritical: false },
      ],
      sudoPolicies: [
        { userPattern: '%wheel', hostPattern: 'ALL', runAsUser: 'ALL', commands: ['ALL'], nopasswd: false },
        { userPattern: 'alice', hostPattern: 'ALL', runAsUser: 'root', commands: ['/bin/systemctl restart nginx'], nopasswd: true },
      ],
    });

    it('passes 100% when server is completely hardened', () => {
      const state = createHardenedState();
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(true);
      expect(res.score).toBe(100);
      expect(res.failedChecks).toHaveLength(0);
      expect(res.passedChecks).toHaveLength(6);
    });

    it('fails when /etc/shadow is too permissive (e.g. 644)', () => {
      const state = createHardenedState();
      state.files[0].permissions = '644'; // World readable!
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('/etc/shadow Root-Only Access Hardening');
    });

    it('fails when Bob has excessive sudo rights', () => {
      const state = createHardenedState();
      state.sudoPolicies.push({
        userPattern: 'bob',
        hostPattern: 'ALL',
        runAsUser: 'root',
        commands: ['/bin/cat /var/log/nginx/access.log'],
        nopasswd: false,
      });
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('Sudoers Least-Privilege Enforcement (User: Bob)');
    });

    it('fails when postgres database process is still running', () => {
      const state = createHardenedState();
      state.processes.push({
        pid: 200,
        ppid: 1,
        user: 'postgres',
        name: 'postgres',
        state: 'running',
        cpu: 0.5,
        port: 5432,
        executable: '/usr/lib/postgresql/bin/postgres',
      });
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('Attack Surface Reduction: Unnecessary DB Daemon Stopped');
    });

    it('fails when Alice home directory is world-readable (e.g. 755)', () => {
      const state = createHardenedState();
      const home = state.files.find((f) => f.path === '/home/alice')!;
      home.permissions = '755';
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('User Home Directory Isolation (/home/alice)');
    });

    it('fails when insecure Telnet daemon is enabled or running', () => {
      const state = createHardenedState();
      const telnet = state.services.find((s) => s.id === 'telnet')!;
      telnet.running = true;
      telnet.enabled = true;
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('Insecure Legacy Services Disabled (Telnet Port 23)');
    });

    it('fails when system logging daemon is disabled or stopped', () => {
      const state = createHardenedState();
      state.processes = state.processes.filter((p) => p.name !== 'rsyslogd');
      const res = validateLinuxHardeningState(state);
      expect(res.success).toBe(false);
      expect(res.failedChecks).toContain('Security Audit & Logging Subsystem Active (rsyslog)');
    });
  });
});
