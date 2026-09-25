/**
 * OMEGA V12 — Disk Forensics & Filesystem Analysis Engine
 * Analyzes synthetic disk images, directory trees, deleted file entries, and MFT/inode metadata.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface DiskFileArtifact {
  id: string;
  path: string;
  filename: string;
  extension: string;
  sizeBytes: number;
  createdVirtualTime: number;
  modifiedVirtualTime: number;
  accessedVirtualTime: number;
  owner: string;
  isDeleted: boolean;
  isSuspicious: boolean;
  fileHash: string;
  attributes: Record<string, unknown>;
}

export const SYNTHETIC_DISK_ARTIFACTS: DiskFileArtifact[] = [
  {
    id: 'DISK-FILE-001',
    path: 'C:\\Users\\sara\\Downloads\\Q3_Financial_Analysis_Draft.xlsx',
    filename: 'Q3_Financial_Analysis_Draft.xlsx',
    extension: 'xlsx',
    sizeBytes: 1048576,
    createdVirtualTime: 0,
    modifiedVirtualTime: 100,
    accessedVirtualTime: 350,
    owner: 'NEXORA\\sara',
    isDeleted: false,
    isSuspicious: false,
    fileHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    attributes: { zoneIdentifier: 'ZoneId=3 (Internet)' },
  },
  {
    id: 'DISK-FILE-002',
    path: 'C:\\Windows\\Temp\\stager_payload.ps1',
    filename: 'stager_payload.ps1',
    extension: 'ps1',
    sizeBytes: 4096,
    createdVirtualTime: 740,
    modifiedVirtualTime: 750,
    accessedVirtualTime: 750,
    owner: 'NEXORA\\sara',
    isDeleted: true,
    isSuspicious: true,
    fileHash: 'sha256:8f34b2c28a8d1163e790a38d9263a23a3118991b2c4543d83ef3123890a21345',
    attributes: { deletedAtVirtualTime: 1560, recoveryPossible: true, entropyScore: 7.8 },
  },
  {
    id: 'DISK-FILE-003',
    path: 'C:\\Windows\\System32\\Tasks\\UpdateSyncTask',
    filename: 'UpdateSyncTask',
    extension: 'xml',
    sizeBytes: 2048,
    createdVirtualTime: 760,
    modifiedVirtualTime: 760,
    accessedVirtualTime: 760,
    owner: 'NT AUTHORITY\\SYSTEM',
    isDeleted: false,
    isSuspicious: true,
    fileHash: 'sha256:91238a87b1c432d00123ef890a21342139048123908123019238910283012983',
    attributes: { persistenceType: 'ScheduledTask', executePath: 'powershell.exe -Enc ...' },
  },
  {
    id: 'DISK-FILE-004',
    path: '\\\\FIN-SRV\\FinanceShare\\Q3_Report.xlsx',
    filename: 'Q3_Report.xlsx',
    extension: 'xlsx',
    sizeBytes: 5242880,
    createdVirtualTime: 0,
    modifiedVirtualTime: 1150,
    accessedVirtualTime: 1150,
    owner: 'NEXORA\\sara',
    isDeleted: false,
    isSuspicious: false,
    fileHash: 'sha256:4a8123901b238c9012389a012381203981203912039812039182309128309128',
    attributes: { sharePath: '\\\\FIN-SRV\\FinanceShare', sensitiveData: true },
  },
  {
    id: 'DISK-FILE-005',
    path: '/var/log/auth.log',
    filename: 'auth.log',
    extension: 'log',
    sizeBytes: 204800,
    createdVirtualTime: 0,
    modifiedVirtualTime: 820,
    accessedVirtualTime: 820,
    owner: 'root',
    isDeleted: false,
    isSuspicious: false,
    fileHash: 'sha256:11a83901b2380129381029381029381029381029381029381029381029381029',
    attributes: { platform: 'Linux', totalEntries: 450 },
  },
];

export function listFiles(artifacts = SYNTHETIC_DISK_ARTIFACTS): DiskFileArtifact[] {
  return [...artifacts];
}

export function findFilesByExtension(
  ext: string,
  artifacts = SYNTHETIC_DISK_ARTIFACTS
): DiskFileArtifact[] {
  const target = ext.toLowerCase().replace(/^\./, '');
  return artifacts.filter((f) => f.extension.toLowerCase() === target);
}

export function findRecentlyModifiedFiles(
  afterVirtualTime: number,
  artifacts = SYNTHETIC_DISK_ARTIFACTS
): DiskFileArtifact[] {
  return artifacts.filter((f) => f.modifiedVirtualTime >= afterVirtualTime);
}

export function findDeletedArtifacts(
  artifacts = SYNTHETIC_DISK_ARTIFACTS
): DiskFileArtifact[] {
  return artifacts.filter((f) => f.isDeleted);
}

export function inspectFileMetadata(
  fileId: string,
  artifacts = SYNTHETIC_DISK_ARTIFACTS
): DiskFileArtifact | undefined {
  return artifacts.find((f) => f.id === fileId);
}
