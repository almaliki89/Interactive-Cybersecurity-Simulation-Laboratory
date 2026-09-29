/**
 * OMEGA ULTRA REALITY V1.4 — Windows Reality Engine Type Definitions
 * Complete type contracts for FileSystem, NTFS ACLs, Services, Processes, Shell, Registry, and Desktop.
 * Fully deterministic - no Date.now(), Math.random(), or timers.
 */

export type FileType = 'FILE' | 'DIRECTORY' | 'DRIVE' | 'SYMLINK' | 'SHARE';

export type FileAttribute = 
  | 'READ_ONLY' 
  | 'HIDDEN' 
  | 'SYSTEM' 
  | 'ARCHIVE' 
  | 'DIRECTORY' 
  | 'ENCRYPTED' 
  | 'COMPRESSED';

export type NtfsRight = 
  | 'READ' 
  | 'WRITE' 
  | 'MODIFY' 
  | 'DELETE' 
  | 'EXECUTE' 
  | 'FULL_CONTROL'
  | 'READ_PERMISSIONS'
  | 'CHANGE_PERMISSIONS'
  | 'TAKE_OWNERSHIP';

export type NtfsPermissionType = 'ALLOW' | 'DENY';

export type NtfsInheritance = 'EXPLICIT' | 'INHERITED';

export interface NtfsAce {
  id: string;
  principalSid: string; // User SID or Group SID
  principalName: string; // e.g., 'sara.finance', 'CORP\\Finance-ReadWrite', 'BUILTIN\\Administrators'
  permissionType: NtfsPermissionType; // 'ALLOW' | 'DENY'
  rights: NtfsRight[];
  inheritance: NtfsInheritance;
  appliesTo: 'THIS_FOLDER_ONLY' | 'THIS_FOLDER_SUBFOLDERS_FILES' | 'SUBFOLDERS_AND_FILES_ONLY' | 'FILES_ONLY';
}

export interface NtfsAcl {
  id: string;
  ownerSid: string;
  ownerName: string;
  isInheritanceBlocked: boolean;
  aces: NtfsAce[];
  auditAces?: {
    principalSid: string;
    principalName: string;
    rights: NtfsRight[];
    auditSuccess: boolean;
    auditFailure: boolean;
  }[];
}

export interface FileObject {
  id: string;
  name: string;
  extension: string;
  fullPath: string; // e.g. "C:\\Users\\sara.finance\\Documents\\report.txt"
  type: FileType;
  sizeBytes: number;
  ownerSid: string;
  ownerName: string;
  createdAtVirtual: number;
  modifiedAtVirtual: number;
  accessedAtVirtual: number;
  attributes: FileAttribute[];
  parentId: string | null;
  aclId: string;
  contentType: string; // e.g. 'text/plain', 'application/json', 'application/vnd.ms-excel'
  contentPreview?: string;
  isDeleted: boolean;
  deletedAtVirtual?: number;
  originalPathBeforeDelete?: string;
  hashSimulation: string;
  auditEnabled?: boolean;
}

export interface SimulatedDrive {
  letter: string; // 'C', 'D', 'F'
  label: string;
  totalBytes: number;
  freeBytes: number;
  fileSystemType: 'NTFS' | 'FAT32' | 'ReFS';
  isNetworkDrive?: boolean;
  networkTargetShare?: string; // '\\\\FILE01\\Finance'
}

export interface NtfsAccessEvaluationResult {
  granted: boolean;
  denied: boolean;
  principal: string;
  principalSid: string;
  requestedRight: NtfsRight;
  matchedAce?: NtfsAce;
  effectiveRights: NtfsRight[];
  reason: string;
  deniedByExplicit?: boolean;
  deniedByInherited?: boolean;
}

export interface EffectiveAccessResult {
  shareAllowed: boolean;
  ntfsAllowed: boolean;
  effectiveAllowed: boolean;
  shareRights: NtfsRight[];
  ntfsRights: NtfsRight[];
  effectiveRights: NtfsRight[];
  failureReason?: string;
  shareDenialDetails?: string;
  ntfsDenialDetails?: string;
}

export type ServiceStatus = 
  | 'RUNNING' 
  | 'STOPPED' 
  | 'START_PENDING' 
  | 'STOP_PENDING' 
  | 'PAUSED';

export type ServiceStartupType = 
  | 'AUTO' 
  | 'DELAYED_AUTO' 
  | 'MANUAL' 
  | 'DISABLED';

export interface WindowsService {
  name: string;
  displayName: string;
  status: ServiceStatus;
  startupType: ServiceStartupType;
  serviceAccount: string; // e.g., 'LocalSystem', 'NT AUTHORITY\\NetworkService'
  pid: number | null;
  dependencies: string[];
  description: string;
  binaryPath: string;
  canPause?: boolean;
  lastStateChangeVirtualTime: number;
}

export type ProcessIntegrityLevel = 'System' | 'High' | 'Medium' | 'Low';

export interface WindowsProcess {
  pid: number;
  name: string;
  executablePath: string;
  commandLine: string;
  userSid: string;
  userName: string;
  parentPid: number;
  sessionId: number;
  integrityLevel: ProcessIntegrityLevel;
  cpuPercentSimulated: number;
  memoryMbSimulated: number;
  status: 'RUNNING' | 'SUSPENDED' | 'TERMINATED';
  startVirtualTime: number;
  threadsCount: number;
  handlesCount: number;
}

export interface RecycleBinItem {
  id: string;
  originalPath: string;
  originalName: string;
  deletedAtVirtual: number;
  deletedByUserSid: string;
  deletedByUserName: string;
  sizeBytes: number;
  fileObject: FileObject;
}

export interface UserProfile {
  userSid: string;
  samAccountName: string;
  domain: string;
  profilePath: string; // "C:\\Users\\sara.finance"
  desktopPath: string; // "C:\\Users\\sara.finance\\Desktop"
  documentsPath: string; // "C:\\Users\\sara.finance\\Documents"
  downloadsPath: string; // "C:\\Users\\sara.finance\\Downloads"
  appDataPath: string; // "C:\\Users\\sara.finance\\AppData"
  loadedAtVirtualTime: number;
  isActive: boolean;
  sessionId: number;
}

export interface DesktopIcon {
  id: string;
  title: string;
  iconType: 'THIS_PC' | 'RECYCLE_BIN' | 'FILE_EXPLORER' | 'EVENT_VIEWER' | 'SERVICES' | 'TASK_MANAGER' | 'CMD' | 'FILE' | 'FOLDER' | 'NETWORK_SHARE';
  targetPath?: string;
  fileId?: string;
  position: { x: number; y: number };
}

export interface OpenWindow {
  id: string;
  title: string;
  appType: 'FILE_EXPLORER' | 'TASK_MANAGER' | 'SERVICES' | 'CMD' | 'EVENT_VIEWER' | 'NOTEPAD';
  initialPath?: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface ShellCommandResult {
  command: string;
  exitCode: number;
  output: string;
  error?: string;
  currentDirectory: string;
}

export interface WindowsMachineRealitySnapshot {
  machineId: string;
  drives: SimulatedDrive[];
  files: Record<string, FileObject>;
  acls: Record<string, NtfsAcl>;
  services: Record<string, WindowsService>;
  processes: Record<number, WindowsProcess>;
  recycleBin: RecycleBinItem[];
  userProfiles: Record<string, UserProfile>;
  registryHives: {
    hklm: Record<string, any>;
    hkcu: Record<string, any>;
  };
  desktopState: {
    activeSessionId: number | null;
    activeUserSid: string | null;
    activeUserName: string | null;
    openWindows: OpenWindow[];
    activeWindowId: string | null;
  };
}
