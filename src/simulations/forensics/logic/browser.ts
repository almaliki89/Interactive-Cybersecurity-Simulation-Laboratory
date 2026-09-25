/**
 * OMEGA V12 — Browser Forensic Artifacts Engine
 * Analyzes browser history, downloads, cookies metadata, and cache records.
 * Fully safe & privacy-conscious - no sensitive auth tokens or passwords exposed.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface BrowserHistoryArtifact {
  id: string;
  virtualTime: number;
  url: string;
  title: string;
  visitCount: number;
  typedCount: number;
  user: string;
  host: string;
  isSuspicious: boolean;
}

export interface BrowserDownloadArtifact {
  id: string;
  virtualTime: number;
  url: string;
  targetPath: string;
  receivedBytes: number;
  totalBytes: number;
  user: string;
  host: string;
  isSuspicious: boolean;
}

export const SYNTHETIC_BROWSER_HISTORY: BrowserHistoryArtifact[] = [
  {
    id: 'BRW-HIST-001',
    virtualTime: 10,
    url: 'https://internal.corp.nexora.local/finance/portal',
    title: 'Nexora Internal Portal - Finance',
    visitCount: 15,
    typedCount: 2,
    user: 'sara',
    host: 'FIN-WS-01',
    isSuspicious: false,
  },
  {
    id: 'BRW-HIST-002',
    virtualTime: 720,
    url: 'https://malicious-external-repo.test/stager.ps1',
    title: 'External Code Repository',
    visitCount: 1,
    typedCount: 1,
    user: 'sara',
    host: 'FIN-WS-01',
    isSuspicious: true,
  },
  {
    id: 'BRW-HIST-003',
    virtualTime: 1340,
    url: 'https://APP-SRV-01/api/v1/finance/reports?id=admin_export',
    title: 'AppSec Finance Endpoint',
    visitCount: 3,
    typedCount: 0,
    user: 'sara',
    host: 'FIN-WS-01',
    isSuspicious: true,
  },
];

export const SYNTHETIC_BROWSER_DOWNLOADS: BrowserDownloadArtifact[] = [
  {
    id: 'BRW-DL-001',
    virtualTime: 730,
    url: 'https://malicious-external-repo.test/stager.ps1',
    targetPath: 'C:\\Users\\sara\\Downloads\\stager_payload.ps1',
    receivedBytes: 4096,
    totalBytes: 4096,
    user: 'sara',
    host: 'FIN-WS-01',
    isSuspicious: true,
  },
];

export function getBrowserArtifacts(): { history: BrowserHistoryArtifact[]; downloads: BrowserDownloadArtifact[] } {
  return {
    history: [...SYNTHETIC_BROWSER_HISTORY],
    downloads: [...SYNTHETIC_BROWSER_DOWNLOADS],
  };
}

export function filterBrowserHistory(
  user: string,
  history = SYNTHETIC_BROWSER_HISTORY
): BrowserHistoryArtifact[] {
  return history.filter((h) => h.user === user);
}

export function findDownloads(
  user: string,
  downloads = SYNTHETIC_BROWSER_DOWNLOADS
): BrowserDownloadArtifact[] {
  return downloads.filter((d) => d.user === user);
}
