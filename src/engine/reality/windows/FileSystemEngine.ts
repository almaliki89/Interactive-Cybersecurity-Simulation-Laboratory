/**
 * OMEGA ULTRA REALITY V1.4 — Windows File System Engine
 * Deterministic in-memory file system modeling drives, directories, files, metadata,
 * file opening/previews, NTFS permissions, and simulated 4663 Object Access audit logs.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

import {
  FileObject,
  FileType,
  FileAttribute,
  SimulatedDrive,
} from './types';
import { NtfsAclEngine } from './NtfsAclEngine';
import { RecycleBinEngine } from './RecycleBinEngine';
import { globalSimulationRuntime } from '../../runtime/SimulationRuntime';

export class FileSystemEngine {
  public readonly machineId: string;
  public readonly aclEngine: NtfsAclEngine;
  public readonly recycleBin: RecycleBinEngine;

  private drives: Map<string, SimulatedDrive> = new Map();
  private files: Map<string, FileObject> = new Map(); // Key: normalized fullPath
  private fileIdCounter: number = 1000;

  constructor(machineId: string, aclEngine?: NtfsAclEngine, recycleBin?: RecycleBinEngine) {
    this.machineId = machineId;
    this.aclEngine = aclEngine || new NtfsAclEngine();
    this.recycleBin = recycleBin || new RecycleBinEngine();
    this.initDefaultFileSystem();
  }

  public normalizePath(rawPath: string): string {
    let p = rawPath.replace(/\//g, '\\').trim();
    // Collapse multiple slashes (except leading UNC \\)
    const isUnc = p.startsWith('\\\\');
    if (isUnc) {
      const parts = p.slice(2).split('\\').filter(Boolean);
      return `\\\\${parts.join('\\')}`;
    }
    const parts = p.split('\\').filter(Boolean);
    if (parts.length > 0 && parts[0].endsWith(':')) {
      const drive = parts[0].toUpperCase();
      const rest = parts.slice(1).join('\\');
      return rest ? `${drive}\\${rest}` : `${drive}\\`;
    }
    return parts.join('\\');
  }

  public getDrives(): SimulatedDrive[] {
    return Array.from(this.drives.values()).map((d) => ({ ...d }));
  }

  public getDrive(letter: string): SimulatedDrive | undefined {
    return this.drives.get(letter.toUpperCase());
  }

  /**
   * Initializes baseline directory tree and sample files deterministically.
   */
  public initDefaultFileSystem(): void {
    this.drives.clear();
    this.files.clear();

    const isFileServer = this.machineId.toUpperCase().includes('FILE');
    const isDC = this.machineId.toUpperCase().includes('DC');
    const isFinWs = this.machineId.toUpperCase().includes('FIN');
    const isHrWs = this.machineId.toUpperCase().includes('HR');
    const isItWs = this.machineId.toUpperCase().includes('IT');

    // Drive C:
    this.drives.set('C', {
      letter: 'C',
      label: 'Local Disk',
      totalBytes: 512 * 1024 * 1024 * 1024,
      freeBytes: 380 * 1024 * 1024 * 1024,
      fileSystemType: 'NTFS',
    });

    // Default System Root Directories
    const sysAcl = this.aclEngine.createAcl({
      ownerSid: 'S-1-5-32-544',
      ownerName: 'BUILTIN\\Administrators',
      aces: [
        {
          id: 'ace-sys-admin',
          principalSid: 'S-1-5-32-544',
          principalName: 'BUILTIN\\Administrators',
          permissionType: 'ALLOW',
          rights: ['FULL_CONTROL'],
          inheritance: 'EXPLICIT',
          appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
        },
        {
          id: 'ace-sys-system',
          principalSid: 'S-1-5-18',
          principalName: 'NT AUTHORITY\\SYSTEM',
          permissionType: 'ALLOW',
          rights: ['FULL_CONTROL'],
          inheritance: 'EXPLICIT',
          appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
        },
        {
          id: 'ace-sys-users',
          principalSid: 'S-1-5-32-545',
          principalName: 'BUILTIN\\Users',
          permissionType: 'ALLOW',
          rights: ['READ', 'EXECUTE'],
          inheritance: 'EXPLICIT',
          appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
        },
      ],
    });

    this.createDirectoryInternal('C:\\', 'C:', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Windows', 'Windows', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Windows\\System32', 'System32', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Windows\\Temp', 'Temp', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Windows\\Logs', 'Logs', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Program Files', 'Program Files', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\Program Files (x86)', 'Program Files (x86)', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['SYSTEM']);
    this.createDirectoryInternal('C:\\ProgramData', 'ProgramData', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', ['HIDDEN', 'SYSTEM']);
    this.createDirectoryInternal('C:\\Users', 'Users', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', []);
    this.createDirectoryInternal('C:\\Users\\Public', 'Public', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', []);

    // Baseline User Profiles per machine
    if (isFinWs) {
      this.initUserProfileFolders('sara.finance', 'S-1-5-21-99887766-1001', 'Sara Al-Mansoor', 'Finance');
    } else if (isHrWs) {
      this.initUserProfileFolders('omar.hr', 'S-1-5-21-99887766-1002', 'Omar Khalid', 'HR');
    } else if (isItWs) {
      this.initUserProfileFolders('ali.it', 'S-1-5-21-99887766-1003', 'Ali Hassan', 'IT');
    }

    // Server-Specific File System Structure
    if (isFileServer) {
      // Drive D: Shares
      this.drives.set('D', {
        letter: 'D',
        label: 'Enterprise Storage',
        totalBytes: 2048 * 1024 * 1024 * 1024,
        freeBytes: 1650 * 1024 * 1024 * 1024,
        fileSystemType: 'NTFS',
      });

      this.createDirectoryInternal('D:\\', 'D:', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', []);
      this.createDirectoryInternal('D:\\Shares', 'Shares', sysAcl.id, 'S-1-5-32-544', 'BUILTIN\\Administrators', []);

      // 1. Finance Share Folder
      const financeAcl = this.aclEngine.createAcl({
        ownerSid: 'S-1-5-21-99887766-512', // Domain Admins
        ownerName: 'CORP\\Domain Admins',
        isInheritanceBlocked: true,
        aces: [
          {
            id: 'ace-fin-domain-admins',
            principalSid: 'S-1-5-21-99887766-512',
            principalName: 'CORP\\Domain Admins',
            permissionType: 'ALLOW',
            rights: ['FULL_CONTROL'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-fin-group-rw',
            principalSid: 'S-1-5-21-99887766-1101', // Finance-ReadWrite Group
            principalName: 'CORP\\Finance-ReadWrite',
            permissionType: 'ALLOW',
            rights: ['READ', 'WRITE', 'MODIFY', 'DELETE', 'EXECUTE'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-fin-sara',
            principalSid: 'S-1-5-21-99887766-1001', // sara.finance
            principalName: 'CORP\\sara.finance',
            permissionType: 'ALLOW',
            rights: ['READ', 'WRITE', 'MODIFY'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-fin-deny-hr',
            principalSid: 'S-1-5-21-99887766-1102', // HR-ReadOnly Group Explicit Deny
            principalName: 'CORP\\HR-ReadOnly',
            permissionType: 'DENY',
            rights: ['READ', 'WRITE', 'MODIFY', 'DELETE', 'EXECUTE', 'FULL_CONTROL'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-fin-deny-omar',
            principalSid: 'S-1-5-21-99887766-1002', // omar.hr Explicit Deny
            principalName: 'CORP\\omar.hr',
            permissionType: 'DENY',
            rights: ['READ', 'WRITE', 'MODIFY', 'DELETE', 'EXECUTE', 'FULL_CONTROL'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      this.createDirectoryInternal('D:\\Shares\\Finance', 'Finance', financeAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);
      this.createDirectoryInternal('D:\\Shares\\Finance\\Invoices', 'Invoices', financeAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);
      this.createDirectoryInternal('D:\\Shares\\Finance\\Forecasts', 'Forecasts', financeAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);
      this.createDirectoryInternal('D:\\Shares\\Finance\\Policies', 'Policies', financeAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);

      // Populate Safe Realistic Sample Files in Finance Share
      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Quarterly_Report_Q1.xlsx',
        name: 'Quarterly_Report_Q1.xlsx',
        extension: 'xlsx',
        sizeBytes: 45200,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        contentPreview: '=== Q1 CORPORATE FINANCIAL AUDIT REPORT ===\nRevenue: $12,450,000\nOperating Margin: 28.4%\nEBITDA: $3,535,800\nStatus: APPROVED BY CFO',
        auditEnabled: true,
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Budget_2026.xlsx',
        name: 'Budget_2026.xlsx',
        extension: 'xlsx',
        sizeBytes: 89400,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        contentPreview: '=== CORPORATE BUDGET ALLOCATION FY2026 ===\nOpEx Allocation: $45,000,000\nCapEx Infrastructure: $12,500,000\nHeadcount Expansion: 240 FTE',
        auditEnabled: true,
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Payroll_Summary.csv',
        name: 'Payroll_Summary.csv',
        extension: 'csv',
        sizeBytes: 18400,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'text/csv',
        contentPreview: 'Department,Headcount,GrossPayroll,TaxWithholding,NetDisbursement\nFinance,12,185000,42000,143000\nEngineering,48,740000,168000,572000\nHR,8,95000,21000,74000',
        auditEnabled: true,
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\README.txt',
        name: 'README.txt',
        extension: 'txt',
        sizeBytes: 1024,
        ownerSid: 'S-1-5-21-99887766-512',
        ownerName: 'CORP\\Domain Admins',
        aclId: financeAcl.id,
        contentType: 'text/plain',
        contentPreview: 'Finance Department Central Network Share (\\\\FILE01\\Finance)\nAccess restricted to authenticated Finance department personnel.\nAll read/write operations are logged for regulatory compliance.',
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Invoices\\INV-2026-001.csv',
        name: 'INV-2026-001.csv',
        extension: 'csv',
        sizeBytes: 2400,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'text/csv',
        contentPreview: 'InvoiceID,Vendor,Description,Amount,Status\nINV-001,Nexora Cloud Services,Virtual Datacenter Hosting,14500.00,PAID\nINV-002,CyberShield Technologies,SOC Telemetry Sensor License,8900.00,PENDING_APPROVAL',
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Forecasts\\FY26_Cashflow_Model.json',
        name: 'FY26_Cashflow_Model.json',
        extension: 'json',
        sizeBytes: 3100,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'application/json',
        contentPreview: '{\n  "modelName": "DCF-Enterprise-FY26",\n  "discountRate": 0.085,\n  "terminalGrowth": 0.025,\n  "netPresentValue": 48200000,\n  "sensitivityAnalysis": "MODERATE"\n}',
      });

      this.createFileInternal({
        fullPath: 'D:\\Shares\\Finance\\Policies\\Expense_Policy_v3.txt',
        name: 'Expense_Policy_v3.txt',
        extension: 'txt',
        sizeBytes: 1850,
        ownerSid: 'S-1-5-21-99887766-1001',
        ownerName: 'CORP\\sara.finance',
        aclId: financeAcl.id,
        contentType: 'text/plain',
        contentPreview: 'CORPORATE TRAVEL & EXPENSE POLICY v3.2\n1. All expenses exceeding $500 require departmental VP approval.\n2. Invoices must be submitted within 5 business days of receipt.',
      });

      // 2. HR Share Folder
      const hrAcl = this.aclEngine.createAcl({
        ownerSid: 'S-1-5-21-99887766-512',
        ownerName: 'CORP\\Domain Admins',
        aces: [
          {
            id: 'ace-hr-admins',
            principalSid: 'S-1-5-21-99887766-512',
            principalName: 'CORP\\Domain Admins',
            permissionType: 'ALLOW',
            rights: ['FULL_CONTROL'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
          {
            id: 'ace-hr-group',
            principalSid: 'S-1-5-21-99887766-1102',
            principalName: 'CORP\\HR-ReadOnly',
            permissionType: 'ALLOW',
            rights: ['READ', 'EXECUTE'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      this.createDirectoryInternal('D:\\Shares\\HR', 'HR', hrAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);
      this.createFileInternal({
        fullPath: 'D:\\Shares\\HR\\Employee_Directory.csv',
        name: 'Employee_Directory.csv',
        extension: 'csv',
        sizeBytes: 12400,
        ownerSid: 'S-1-5-21-99887766-1002',
        ownerName: 'CORP\\omar.hr',
        aclId: hrAcl.id,
        contentType: 'text/csv',
        contentPreview: 'ID,Name,Title,Department,Email\nE101,Sara Al-Mansoor,Senior Financial Analyst,Finance,sara.finance@corp.omega.local\nE102,Omar Khalid,HR Operations Specialist,HR,omar.hr@corp.omega.local\nE103,Ali Hassan,Lead Systems Engineer,IT,ali.it@corp.omega.local',
      });

      // 3. IT Share Folder
      const itAcl = this.aclEngine.createAcl({
        ownerSid: 'S-1-5-21-99887766-512',
        ownerName: 'CORP\\Domain Admins',
        aces: [
          {
            id: 'ace-it-admins',
            principalSid: 'S-1-5-21-99887766-512',
            principalName: 'CORP\\Domain Admins',
            permissionType: 'ALLOW',
            rights: ['FULL_CONTROL'],
            inheritance: 'EXPLICIT',
            appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
          },
        ],
      });

      this.createDirectoryInternal('D:\\Shares\\IT', 'IT', itAcl.id, 'S-1-5-21-99887766-512', 'CORP\\Domain Admins', []);
      this.createFileInternal({
        fullPath: 'D:\\Shares\\IT\\Inventory_Asset_Matrix.csv',
        name: 'Inventory_Asset_Matrix.csv',
        extension: 'csv',
        sizeBytes: 8200,
        ownerSid: 'S-1-5-21-99887766-1003',
        ownerName: 'CORP\\ali.it',
        aclId: itAcl.id,
        contentType: 'text/csv',
        contentPreview: 'Hostname,IP,MAC,OS,Role,Status\nDC01,10.10.10.10,00:50:56:01:00:01,Windows Server 2022,Domain Controller,ACTIVE\nFILE01,10.10.20.10,00:50:56:01:00:02,Windows Server 2022,Enterprise File Server,ACTIVE\nFIN-WS01,10.10.30.15,00:50:56:01:00:05,Windows 11 Enterprise,Finance Workstation,ACTIVE',
      });
    }
  }

  /**
   * Initializes profile directories and default desktop/document items for a user.
   */
  public initUserProfileFolders(
    samAccountName: string,
    userSid: string,
    displayName: string,
    department: string
  ): void {
    const cleanUser = samAccountName.toLowerCase();
    const userAcl = this.aclEngine.createAcl({
      ownerSid: userSid,
      ownerName: `CORP\\${samAccountName}`,
      aces: [
        {
          id: `ace-${cleanUser}-full`,
          principalSid: userSid,
          principalName: `CORP\\${samAccountName}`,
          permissionType: 'ALLOW',
          rights: ['FULL_CONTROL'],
          inheritance: 'EXPLICIT',
          appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
        },
        {
          id: `ace-${cleanUser}-sys`,
          principalSid: 'S-1-5-18',
          principalName: 'NT AUTHORITY\\SYSTEM',
          permissionType: 'ALLOW',
          rights: ['FULL_CONTROL'],
          inheritance: 'EXPLICIT',
          appliesTo: 'THIS_FOLDER_SUBFOLDERS_FILES',
        },
      ],
    });

    const rootPath = `C:\\Users\\${cleanUser}`;
    this.createDirectoryInternal(rootPath, cleanUser, userAcl.id, userSid, `CORP\\${samAccountName}`, []);
    this.createDirectoryInternal(`${rootPath}\\Desktop`, 'Desktop', userAcl.id, userSid, `CORP\\${samAccountName}`, []);
    this.createDirectoryInternal(`${rootPath}\\Documents`, 'Documents', userAcl.id, userSid, `CORP\\${samAccountName}`, []);
    this.createDirectoryInternal(`${rootPath}\\Downloads`, 'Downloads', userAcl.id, userSid, `CORP\\${samAccountName}`, []);
    this.createDirectoryInternal(`${rootPath}\\AppData`, 'AppData', userAcl.id, userSid, `CORP\\${samAccountName}`, ['HIDDEN']);
    this.createDirectoryInternal(`${rootPath}\\AppData\\Local`, 'Local', userAcl.id, userSid, `CORP\\${samAccountName}`, ['HIDDEN']);
    this.createDirectoryInternal(`${rootPath}\\AppData\\Roaming`, 'Roaming', userAcl.id, userSid, `CORP\\${samAccountName}`, ['HIDDEN']);

    // NTUSER.DAT (Hidden, System)
    this.createFileInternal({
      fullPath: `${rootPath}\\NTUSER.DAT`,
      name: 'NTUSER.DAT',
      extension: 'DAT',
      sizeBytes: 524288,
      ownerSid: userSid,
      ownerName: `CORP\\${samAccountName}`,
      aclId: userAcl.id,
      attributes: ['HIDDEN', 'SYSTEM'],
      contentType: 'application/octet-stream',
      contentPreview: '[Binary Registry Hive File - User Profile Registry Branch]',
    });

    // Workstation specific desktop & documents files
    this.createFileInternal({
      fullPath: `${rootPath}\\Documents\\Welcome_to_Workstation.txt`,
      name: 'Welcome_to_Workstation.txt',
      extension: 'txt',
      sizeBytes: 850,
      ownerSid: userSid,
      ownerName: `CORP\\${samAccountName}`,
      aclId: userAcl.id,
      contentType: 'text/plain',
      contentPreview: `Welcome ${displayName} (${department} Department)!\nHost: ${this.machineId}\nDomain: CORP.OMEGA.LOCAL\n\nTo access departmental network shares, map \\\\FILE01\\${department} or use File Explorer.`,
    });

    this.createFileInternal({
      fullPath: `${rootPath}\\Desktop\\Department_Notes.txt`,
      name: 'Department_Notes.txt',
      extension: 'txt',
      sizeBytes: 420,
      ownerSid: userSid,
      ownerName: `CORP\\${samAccountName}`,
      aclId: userAcl.id,
      contentType: 'text/plain',
      contentPreview: `Notes for ${displayName}:\n- Review monthly reports on \\\\FILE01\\${department}\n- Ensure Kerberos tickets are renewed before expiration\n- Contact IT Helpdesk for network access issues.`,
    });
  }

  private createDirectoryInternal(
    fullPath: string,
    name: string,
    aclId: string,
    ownerSid: string,
    ownerName: string,
    attributes: FileAttribute[] = []
  ): FileObject {
    this.fileIdCounter += 1;
    const norm = this.normalizePath(fullPath);
    const parentPath = this.getParentPath(norm);
    const parentObj = parentPath ? this.files.get(parentPath) : null;

    const dir: FileObject = {
      id: `dir-${this.fileIdCounter}`,
      name,
      extension: '',
      fullPath: norm,
      type: 'DIRECTORY',
      sizeBytes: 0,
      ownerSid,
      ownerName,
      createdAtVirtual: 0,
      modifiedAtVirtual: 0,
      accessedAtVirtual: 0,
      attributes: ['DIRECTORY', ...attributes],
      parentId: parentObj ? parentObj.id : null,
      aclId,
      contentType: 'inode/directory',
      isDeleted: false,
      hashSimulation: `dir-hash-${this.fileIdCounter}`,
    };

    this.files.set(norm, dir);
    return dir;
  }

  private createFileInternal(params: {
    fullPath: string;
    name: string;
    extension: string;
    sizeBytes: number;
    ownerSid: string;
    ownerName: string;
    aclId: string;
    attributes?: FileAttribute[];
    contentType: string;
    contentPreview?: string;
    auditEnabled?: boolean;
  }): FileObject {
    this.fileIdCounter += 1;
    const norm = this.normalizePath(params.fullPath);
    const parentPath = this.getParentPath(norm);
    const parentObj = parentPath ? this.files.get(parentPath) : null;

    const file: FileObject = {
      id: `file-${this.fileIdCounter}`,
      name: params.name,
      extension: params.extension,
      fullPath: norm,
      type: 'FILE',
      sizeBytes: params.sizeBytes,
      ownerSid: params.ownerSid,
      ownerName: params.ownerName,
      createdAtVirtual: 0,
      modifiedAtVirtual: 0,
      accessedAtVirtual: 0,
      attributes: params.attributes || ['ARCHIVE'],
      parentId: parentObj ? parentObj.id : null,
      aclId: params.aclId,
      contentType: params.contentType,
      contentPreview: params.contentPreview,
      isDeleted: false,
      hashSimulation: `sha256-sim-${this.fileIdCounter}`,
      auditEnabled: params.auditEnabled,
    };

    this.files.set(norm, file);
    return file;
  }

  public getParentPath(fullPath: string): string | null {
    const norm = this.normalizePath(fullPath);
    const isUnc = norm.startsWith('\\\\');
    if (isUnc) {
      const parts = norm.slice(2).split('\\');
      if (parts.length <= 1) return null;
      parts.pop();
      return `\\\\${parts.join('\\')}`;
    }
    const parts = norm.split('\\');
    if (parts.length <= 1) return null;
    if (parts.length === 2 && parts[1] === '') return null; // "C:\" has no parent
    parts.pop();
    const joined = parts.join('\\');
    return joined.endsWith(':') ? `${joined}\\` : joined;
  }

  public getFile(pathOrId: string): FileObject | undefined {
    const norm = this.normalizePath(pathOrId);
    if (this.files.has(norm)) {
      const f = this.files.get(norm)!;
      return f.isDeleted ? undefined : { ...f };
    }
    for (const f of this.files.values()) {
      if (f.id === pathOrId && !f.isDeleted) {
        return { ...f };
      }
    }
    return undefined;
  }

  public listDirectory(dirPath: string): FileObject[] {
    const norm = this.normalizePath(dirPath);
    const results: FileObject[] = [];

    for (const f of this.files.values()) {
      if (f.isDeleted) continue;
      const parent = this.getParentPath(f.fullPath);
      if (parent && this.normalizePath(parent) === norm && f.fullPath !== norm) {
        results.push({ ...f });
      }
    }

    return results.sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type === 'DIRECTORY' && b.type !== 'DIRECTORY') return -1;
      if (a.type !== 'DIRECTORY' && b.type === 'DIRECTORY') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Safe file creation in the simulated file system.
   */
  public createFile(params: {
    parentDirectoryPath: string;
    fileName: string;
    content: string;
    userSid: string;
    userName: string;
    vTime?: number;
  }): { success: boolean; file?: FileObject; error?: string } {
    const parentNorm = this.normalizePath(params.parentDirectoryPath);
    const parentObj = this.files.get(parentNorm);
    if (!parentObj || parentObj.type !== 'DIRECTORY' || parentObj.isDeleted) {
      return { success: false, error: `Directory '${params.parentDirectoryPath}' does not exist.` };
    }

    const fullPath = this.normalizePath(`${parentNorm}\\${params.fileName}`);
    if (this.files.has(fullPath) && !this.files.get(fullPath)!.isDeleted) {
      return { success: false, error: `File '${params.fileName}' already exists.` };
    }

    const ext = params.fileName.includes('.') ? params.fileName.split('.').pop() || 'txt' : 'txt';
    const vt = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();

    this.fileIdCounter += 1;
    const file: FileObject = {
      id: `file-${this.fileIdCounter}`,
      name: params.fileName,
      extension: ext,
      fullPath,
      type: 'FILE',
      sizeBytes: params.content.length,
      ownerSid: params.userSid,
      ownerName: params.userName,
      createdAtVirtual: vt,
      modifiedAtVirtual: vt,
      accessedAtVirtual: vt,
      attributes: ['ARCHIVE'],
      parentId: parentObj.id,
      aclId: parentObj.aclId, // Inherit parent directory ACL
      contentType: 'text/plain',
      contentPreview: params.content,
      isDeleted: false,
      hashSimulation: `sha256-user-created-${this.fileIdCounter}`,
    };

    this.files.set(fullPath, file);

    // Audit Event 4663 if parent or file has audit enabled
    if (file.auditEnabled || parentObj.auditEnabled) {
      this.emitAuditEvent({
        eventId: 4663,
        objectName: fullPath,
        accessMask: 'WRITE_DATA',
        subjectUserSid: params.userSid,
        subjectUserName: params.userName,
        vTime: vt,
      });
    }

    return { success: true, file: { ...file } };
  }

  /**
   * Safe directory creation.
   */
  public createDirectory(params: {
    parentDirectoryPath: string;
    folderName: string;
    userSid: string;
    userName: string;
    vTime?: number;
  }): { success: boolean; folder?: FileObject; error?: string } {
    const parentNorm = this.normalizePath(params.parentDirectoryPath);
    const parentObj = this.files.get(parentNorm);
    if (!parentObj || parentObj.type !== 'DIRECTORY' || parentObj.isDeleted) {
      return { success: false, error: `Parent directory '${params.parentDirectoryPath}' not found.` };
    }

    const fullPath = this.normalizePath(`${parentNorm}\\${params.folderName}`);
    if (this.files.has(fullPath) && !this.files.get(fullPath)!.isDeleted) {
      return { success: false, error: `Folder '${params.folderName}' already exists.` };
    }

    const vt = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    this.fileIdCounter += 1;

    const dir: FileObject = {
      id: `dir-${this.fileIdCounter}`,
      name: params.folderName,
      extension: '',
      fullPath,
      type: 'DIRECTORY',
      sizeBytes: 0,
      ownerSid: params.userSid,
      ownerName: params.userName,
      createdAtVirtual: vt,
      modifiedAtVirtual: vt,
      accessedAtVirtual: vt,
      attributes: ['DIRECTORY'],
      parentId: parentObj.id,
      aclId: parentObj.aclId,
      contentType: 'inode/directory',
      isDeleted: false,
      hashSimulation: `dir-hash-${this.fileIdCounter}`,
    };

    this.files.set(fullPath, dir);
    return { success: true, folder: { ...dir } };
  }

  /**
   * Deletes a file, moving normal user files to Recycle Bin.
   */
  public deleteFile(params: {
    filePath: string;
    userSid: string;
    userName: string;
    permanent?: boolean;
    vTime?: number;
  }): { success: boolean; error?: string } {
    const norm = this.normalizePath(params.filePath);
    const file = this.files.get(norm);
    if (!file || file.isDeleted) {
      return { success: false, error: `File '${params.filePath}' not found.` };
    }

    const vt = params.vTime ?? globalSimulationRuntime.clock.getVirtualTime();
    file.isDeleted = true;
    file.deletedAtVirtual = vt;

    if (!params.permanent && !norm.startsWith('\\\\')) {
      // Local file deletion moves to Recycle Bin
      this.recycleBin.moveToRecycleBin({
        file: { ...file },
        userSid: params.userSid,
        userName: params.userName,
        vTime: vt,
      });
    }

    if (file.auditEnabled) {
      this.emitAuditEvent({
        eventId: 4663,
        objectName: norm,
        accessMask: 'DELETE',
        subjectUserSid: params.userSid,
        subjectUserName: params.userName,
        vTime: vt,
      });
    }

    return { success: true };
  }

  /**
   * Restores a file from Recycle Bin back to its original location.
   */
  public restoreFromRecycleBin(itemId: string): { success: boolean; file?: FileObject; error?: string } {
    const item = this.recycleBin.restoreItem(itemId);
    if (!item) {
      return { success: false, error: `Recycle Bin item '${itemId}' not found.` };
    }

    const origPath = this.normalizePath(item.originalPath);
    const existing = this.files.get(origPath);
    if (existing) {
      existing.isDeleted = false;
      existing.deletedAtVirtual = undefined;
      return { success: true, file: { ...existing } };
    }

    const restored: FileObject = {
      ...item.fileObject,
      isDeleted: false,
      deletedAtVirtual: undefined,
    };
    this.files.set(origPath, restored);
    return { success: true, file: { ...restored } };
  }

  /**
   * Renames a file or directory.
   */
  public rename(oldPath: string, newName: string): { success: boolean; error?: string } {
    const norm = this.normalizePath(oldPath);
    const file = this.files.get(norm);
    if (!file || file.isDeleted) {
      return { success: false, error: `Item '${oldPath}' not found.` };
    }

    const parentPath = this.getParentPath(norm);
    const newFullPath = parentPath ? this.normalizePath(`${parentPath}\\${newName}`) : this.normalizePath(newName);

    if (this.files.has(newFullPath) && !this.files.get(newFullPath)!.isDeleted) {
      return { success: false, error: `An item named '${newName}' already exists in the destination.` };
    }

    this.files.delete(norm);
    file.name = newName;
    file.fullPath = newFullPath;
    file.extension = newName.includes('.') ? newName.split('.').pop() || '' : '';
    this.files.set(newFullPath, file);

    return { success: true };
  }

  private emitAuditEvent(params: {
    eventId: number;
    objectName: string;
    accessMask: string;
    subjectUserSid: string;
    subjectUserName: string;
    vTime: number;
  }): void {
    globalSimulationRuntime.dispatch({
      type: 'WINDOWS_OBJECT_ACCESS_AUDIT',
      category: 'SECURITY',
      source: this.machineId,
      severity: 'info',
      description: `Event 4663: An attempt was made to access an object (${params.objectName}, Access: ${params.accessMask}).`,
      payload: {
        machineId: this.machineId,
        eventId: params.eventId,
        logName: 'Security',
        objectServer: 'Security',
        objectType: 'File',
        objectName: params.objectName,
        accessMask: params.accessMask,
        subjectUserSid: params.subjectUserSid,
        subjectUserName: params.subjectUserName,
        virtualTime: params.vTime,
      },
    });
  }

  public exportSnapshot(): {
    drives: SimulatedDrive[];
    files: Record<string, FileObject>;
    acls: Record<string, any>;
    recycleBin: any[];
  } {
    const filesMap: Record<string, FileObject> = {};
    for (const [k, v] of this.files.entries()) {
      filesMap[k] = { ...v, attributes: [...v.attributes] };
    }

    return {
      drives: this.getDrives(),
      files: filesMap,
      acls: this.aclEngine.exportSnapshot(),
      recycleBin: this.recycleBin.exportSnapshot(),
    };
  }

  public restoreSnapshot(data: {
    drives: SimulatedDrive[];
    files: Record<string, FileObject>;
    acls: Record<string, any>;
    recycleBin: any[];
  }): void {
    this.drives.clear();
    for (const d of data.drives) {
      this.drives.set(d.letter, { ...d });
    }

    this.files.clear();
    for (const [k, v] of Object.entries(data.files)) {
      this.files.set(k, { ...v, attributes: [...v.attributes] });
    }

    if (data.acls) {
      this.aclEngine.restoreSnapshot(data.acls);
    }
    if (data.recycleBin) {
      this.recycleBin.restoreSnapshot(data.recycleBin);
    }
  }
}
