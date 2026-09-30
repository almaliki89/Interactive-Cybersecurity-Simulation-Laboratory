/**
 * OMEGA ULTRA REALITY V1.4 — Windows File Explorer UI
 * High-fidelity Windows enterprise File Explorer supporting drive/directory navigation,
 * breadcrumbs, file search, file preview, CRUD operations, Recycle Bin, and real SMB share browsing.
 * Evaluates active Kerberos TGT + TGS + Share ACL + NTFS ACL on network shares.
 */

import React, { useState, useEffect } from 'react';
import {
  Folder,
  File,
  HardDrive,
  Network,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RefreshCw,
  Plus,
  FileText,
  FileSpreadsheet,
  FileCode,
  Shield,
  Search,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Info,
} from 'lucide-react';
import { WindowsDesktopEngine } from '../../../engine/reality/windows/WindowsDesktopEngine';
import { FileObject, SimulatedDrive, RecycleBinItem } from '../../../engine/reality/windows/types';
import { globalNetworkEngine } from '../../../engine/reality/network/NetworkEngine';
import { globalRealityEngine } from '../../../engine/reality/RealityEngine';

interface FileExplorerProps {
  desktop: WindowsDesktopEngine;
  initialPath?: string;
  onOpenNotepad?: (filePath: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  desktop,
  initialPath,
  onOpenNotepad,
}) => {
  const activeSession = desktop.getActiveSession();
  const defaultPath = initialPath || (activeSession.userName ? `C:\\Users\\${activeSession.userName.toLowerCase()}\\Documents` : 'C:\\');

  const [currentPath, setCurrentPath] = useState<string>(defaultPath);
  const [pathInput, setPathInput] = useState<string>(defaultPath);
  const [history, setHistory] = useState<string[]>([defaultPath]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isShareAccessError, setIsShareAccessError] = useState<string | null>(null);
  const [shareAccessResult, setShareAccessResult] = useState<{
    state: 'success' | 'denied' | 'unavailable';
    reason: string;
    details?: string;
  } | null>(null);
  const [shareFiles, setShareFiles] = useState<FileObject[]>([]);
  const [isNetworkShare, setIsNetworkShare] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [recycleBinItems, setRecycleBinItems] = useState<RecycleBinItem[]>([]);
  const [isRecycleBinView, setIsRecycleBinView] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const navigateTo = (newPath: string, addToHistory = true) => {
    const norm = desktop.fileSystem.normalizePath(newPath);
    setCurrentPath(norm);
    setPathInput(norm);
    setSelectedFile(null);
    setIsShareAccessError(null);
    setShareAccessResult(null);
    setRefreshTrigger((prev) => prev + 1);

    if (addToHistory) {
      const nextHist = history.slice(0, historyIndex + 1);
      nextHist.push(norm);
      setHistory(nextHist);
      setHistoryIndex(nextHist.length - 1);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      navigateTo(prev, false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      navigateTo(next, false);
    }
  };

  const goUp = () => {
    if (isRecycleBinView) {
      setIsRecycleBinView(false);
      navigateTo('C:\\');
      return;
    }
    const parent = desktop.fileSystem.getParentPath(currentPath);
    if (parent) {
      navigateTo(parent);
    }
  };

  // Load items based on path
  useEffect(() => {
    const norm = desktop.fileSystem.normalizePath(currentPath);

    if (norm.toLowerCase().includes('recycle bin') || norm === '::{645FF040-5081-101B-9F08-00AA002F954E}') {
      setIsRecycleBinView(true);
      setIsNetworkShare(false);
      setIsShareAccessError(null);
      setRecycleBinItems(desktop.recycleBin.getItems(activeSession.userSid || undefined));
      return;
    }

    setIsRecycleBinView(false);

    // Check if network UNC path (e.g. \\FILE01\Finance)
    if (norm.startsWith('\\\\')) {
      setIsNetworkShare(true);
      const parts = norm.slice(2).split('\\').filter(Boolean);
      const serverHostname = parts[0] || 'FILE01';
      const shareName = parts[1] || 'Finance';

      // Perform SMB Access Evaluation
      const smbRes = globalNetworkEngine.accessSmbShare({
        sourceDeviceId: desktop.machineId,
        serverHostname,
        shareName,
      });

      if (!smbRes.success) {
        const isUnavailable =
          smbRes.failureReason === 'SERVICE_UNAVAILABLE' ||
          smbRes.error === 'SERVICE_UNAVAILABLE';
        const failureReason =
          smbRes.failureReason ||
          smbRes.error ||
          (isUnavailable ? 'SERVICE_UNAVAILABLE' : 'ACCESS_DENIED');
        const stateType: 'unavailable' | 'denied' = isUnavailable ? 'unavailable' : 'denied';
        const details =
          smbRes.errorDetails ||
          (isUnavailable
            ? `LanmanServer service is stopped on '${serverHostname}'`
            : 'Access Denied');

        setShareAccessResult({
          state: stateType,
          reason: failureReason,
          details,
        });
        setIsShareAccessError(details);
        setShareFiles([]);
      } else {
        setShareAccessResult({
          state: 'success',
          reason: '',
          details: 'Access Granted',
        });
        setIsShareAccessError(null);
        const targetMachine = globalRealityEngine.registry.getMachine(serverHostname);
        if (targetMachine?.desktop?.fileSystem) {
          const subPath = parts.slice(2).join('\\');
          const serverFolder = subPath
            ? `D:\\Shares\\${shareName}\\${subPath}`
            : `D:\\Shares\\${shareName}`;
          const items = targetMachine.desktop.fileSystem.listDirectory(serverFolder);
          setShareFiles(items);
        } else {
          setShareFiles([]);
        }
      }
    } else {
      setIsNetworkShare(false);
      setIsShareAccessError(null);
      setShareAccessResult(null);
    }
  }, [currentPath, desktop, activeSession.userSid, refreshTrigger]);

  const itemsToDisplay = isNetworkShare
    ? shareFiles
    : desktop.fileSystem.listDirectory(currentPath);

  const filteredItems = searchQuery
    ? itemsToDisplay.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : itemsToDisplay;

  const handleItemClick = (item: FileObject) => {
    setSelectedFile(item);
  };

  const handleItemDoubleClick = (item: FileObject) => {
    if (item.type === 'DIRECTORY') {
      if (isNetworkShare) {
        const parts = currentPath.split('\\').filter(Boolean);
        navigateTo(`\\\\${parts.join('\\')}\\${item.name}`);
      } else {
        navigateTo(item.fullPath);
      }
    } else if (item.type === 'FILE') {
      if (onOpenNotepad) {
        onOpenNotepad(item.fullPath);
      }
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const res = desktop.fileSystem.createFile({
      parentDirectoryPath: currentPath,
      fileName: newFileName.trim(),
      content: 'Sample text content created in File Explorer.',
      userSid: activeSession.userSid || 'S-1-5-21-99887766-2001',
      userName: activeSession.userName || 'sara.finance',
    });
    if (res.success) {
      setNewFileName('');
      setIsCreatingFile(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const res = desktop.fileSystem.createDirectory({
      parentDirectoryPath: currentPath,
      folderName: newFolderName.trim(),
      userSid: activeSession.userSid || 'S-1-5-21-99887766-2001',
      userName: activeSession.userName || 'sara.finance',
    });
    if (res.success) {
      setNewFolderName('');
      setIsCreatingFolder(false);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedFile) return;
    desktop.fileSystem.deleteFile({
      filePath: selectedFile.fullPath,
      userSid: activeSession.userSid || 'S-1-5-21-99887766-2001',
      userName: activeSession.userName || 'sara.finance',
    });
    setSelectedFile(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleRestoreRecycleItem = (itemId: string) => {
    desktop.fileSystem.restoreFromRecycleBin(itemId);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getFileIcon = (item: FileObject) => {
    if (item.type === 'DIRECTORY') {
      return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
    const ext = item.extension.toLowerCase();
    if (['xlsx', 'csv'].includes(ext)) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (['json', 'ps1', 'bat', 'xml'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-300" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 font-sans select-none" data-testid="file-explorer">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/90 border-b border-slate-700/80 gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={goUp}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300"
            title="Up to Parent Directory"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRefreshTrigger((p) => p + 1)}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-300"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address Breadcrumb Bar */}
        <div className="flex-1 flex items-center bg-slate-950/80 border border-slate-700 rounded px-2.5 py-1 text-xs">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
          <input
            type="text"
            data-testid="file-explorer-path"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigateTo(pathInput);
              }
            }}
            className="w-full bg-transparent outline-none text-slate-200 font-mono text-xs"
          />
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-slate-950/80 border border-slate-700 rounded px-2.5 py-1 text-xs w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
          <input
            type="text"
            placeholder="Search folder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Action Ribbons */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border-b border-slate-800 text-xs">
        <button
          data-testid="btn-new-file"
          onClick={() => setIsCreatingFile(true)}
          disabled={isNetworkShare || isRecycleBinView}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          New Text Document
        </button>
        <button
          onClick={() => setIsCreatingFolder(true)}
          disabled={isNetworkShare || isRecycleBinView}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700/60 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          New Folder
        </button>
        {selectedFile && !isRecycleBinView && (
          <button
            data-testid="btn-delete-file"
            onClick={handleDeleteSelected}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/40 text-rose-200 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Delete
          </button>
        )}
      </div>

      {/* Modals for Create File / Folder */}
      {isCreatingFile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-950/30 border-b border-emerald-800/40 text-xs">
          <span className="text-emerald-300">File Name:</span>
          <input
            type="text"
            placeholder="NewDocument.txt"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="bg-slate-950 border border-emerald-600/50 rounded px-2 py-0.5 text-emerald-100 outline-none"
            autoFocus
          />
          <button
            onClick={handleCreateFile}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingFile(false)}
            className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {isCreatingFolder && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-950/30 border-b border-amber-800/40 text-xs">
          <span className="text-amber-300">Folder Name:</span>
          <input
            type="text"
            placeholder="New Folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="bg-slate-950 border border-amber-600/50 rounded px-2 py-0.5 text-amber-100 outline-none"
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium"
          >
            Create
          </button>
          <button
            onClick={() => setIsCreatingFolder(false)}
            className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Tree */}
        <div className="w-52 bg-slate-950/60 border-r border-slate-800 flex flex-col p-2 space-y-1 text-xs overflow-y-auto">
          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1">
            Quick Access
          </div>
          {activeSession.userName && (
            <>
              <button
                onClick={() => navigateTo(`C:\\Users\\${activeSession.userName?.toLowerCase()}\\Desktop`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.includes('Desktop') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
              >
                <Folder className="w-4 h-4 text-cyan-400" />
                Desktop
              </button>
              <button
                onClick={() => navigateTo(`C:\\Users\\${activeSession.userName?.toLowerCase()}\\Documents`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.includes('Documents') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
              >
                <Folder className="w-4 h-4 text-cyan-400" />
                Documents
              </button>
              <button
                onClick={() => navigateTo(`C:\\Users\\${activeSession.userName?.toLowerCase()}\\Downloads`)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.includes('Downloads') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
              >
                <Folder className="w-4 h-4 text-cyan-400" />
                Downloads
              </button>
            </>
          )}

          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1 pt-3">
            This PC
          </div>
          {desktop.fileSystem.getDrives().map((drive) => (
            <button
              key={drive.letter}
              onClick={() => navigateTo(`${drive.letter}:\\`)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.startsWith(`${drive.letter}:`) ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
            >
              <HardDrive className="w-4 h-4 text-slate-400" />
              {drive.label} ({drive.letter}:)
            </button>
          ))}

          {desktop.getMappedDrives().length > 0 && (
            <>
              <div className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase px-2 py-1 pt-3">
                Mapped Network Drives
              </div>
              {desktop.getMappedDrives().map((drive) => (
                <button
                  key={drive.driveLetter}
                  data-testid={`mapped-drive-${drive.driveLetter.replace(':', '')}`}
                  onClick={() => navigateTo(drive.remotePath)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.startsWith(drive.remotePath) ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
                >
                  <Network className="w-4 h-4 text-emerald-400" />
                  {drive.label || drive.remotePath} ({drive.driveLetter})
                </button>
              ))}
            </>
          )}

          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1 pt-3">
            Network Shares
          </div>
          <button
            onClick={() => navigateTo('\\\\FILE01\\Finance')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.startsWith('\\\\FILE01\\Finance') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
          >
            <Network className="w-4 h-4 text-emerald-400" />
            \\\\FILE01\\Finance
          </button>
          <button
            onClick={() => navigateTo('\\\\FILE01\\HR')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.startsWith('\\\\FILE01\\HR') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
          >
            <Network className="w-4 h-4 text-blue-400" />
            \\\\FILE01\\HR
          </button>
          <button
            onClick={() => navigateTo('\\\\FILE01\\IT')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${currentPath.startsWith('\\\\FILE01\\IT') ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
          >
            <Network className="w-4 h-4 text-purple-400" />
            \\\\FILE01\\IT
          </button>

          <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-2 py-1 pt-3">
            System
          </div>
          <button
            onClick={() => navigateTo('Recycle Bin')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 text-left ${isRecycleBinView ? 'bg-cyan-950/60 text-cyan-300 font-medium' : 'text-slate-300'}`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Recycle Bin
          </button>
        </div>

        {/* Center File Content List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Share Access Result Banner / Indicator */}
          {isNetworkShare && shareAccessResult && (
            shareAccessResult.state === 'success' ? (
              <div
                data-testid="file-access-result"
                data-state="success"
                data-reason=""
                className="sr-only"
                aria-hidden="true"
              />
            ) : (
              <div
                data-testid="file-access-result"
                data-state={shareAccessResult.state}
                data-reason={shareAccessResult.reason}
                className={`m-3 p-3 rounded flex items-start gap-2.5 text-xs ${
                  shareAccessResult.state === 'unavailable'
                    ? 'bg-amber-950/40 border border-amber-800/60 text-amber-200'
                    : 'bg-rose-950/40 border border-rose-800/60 text-rose-200'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    shareAccessResult.state === 'unavailable' ? 'text-amber-400' : 'text-rose-400'
                  }`}
                />
                <div>
                  <div
                    className={`font-semibold ${
                      shareAccessResult.state === 'unavailable' ? 'text-amber-300' : 'text-rose-300'
                    }`}
                  >
                    {shareAccessResult.state === 'unavailable'
                      ? 'Network Share Unavailable'
                      : 'Network Share Access Denied'}
                  </div>
                  <div className="mt-0.5 text-slate-300">{shareAccessResult.details}</div>
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    {shareAccessResult.state === 'unavailable'
                      ? `LanmanServer service is stopped on '${currentPath.slice(2).split('\\')[0] || 'FILE01'}'. Start the service via Services Console to resume share operations.`
                      : 'Kerberos authentication and NTFS authorization failed. Verify that your logged-in user possesses valid TGT/TGS tickets and the required Security Group memberships.'}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Recycle Bin View */}
          {isRecycleBinView ? (
            <div className="flex-1 p-3 overflow-y-auto">
              <div className="text-xs text-slate-400 mb-2 font-medium">
                Recycle Bin ({recycleBinItems.length} items)
              </div>
              {recycleBinItems.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center">
                  Recycle Bin is empty.
                </div>
              ) : (
                <div className="space-y-1">
                  {recycleBinItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <File className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-200">{item.originalName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.originalPath}</div>
                        </div>
                      </div>
                      <button
                        data-testid="btn-restore-file"
                        onClick={() => handleRestoreRecycleItem(item.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-cyan-900/40 hover:bg-cyan-800/50 border border-cyan-700/50 rounded text-cyan-200 text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Normal Directory Listing */
            <div className="flex-1 p-2 overflow-y-auto">
              {/* Header row */}
              <div className="grid grid-cols-12 px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                <div className="col-span-6">Name</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-3 text-right">Size</div>
              </div>

              {filteredItems.length === 0 && !isShareAccessError && (
                <div className="text-xs text-slate-500 italic py-8 text-center">
                  This folder is empty.
                </div>
              )}

              <div className="space-y-0.5 mt-1">
                {filteredItems.map((item) => {
                  const isSelected = selectedFile?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      data-testid={`file-row-${item.id}`}
                      onClick={() => handleItemClick(item)}
                      onDoubleClick={() => handleItemDoubleClick(item)}
                      className={`grid grid-cols-12 items-center px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${isSelected ? 'bg-cyan-950/70 border border-cyan-600/60 text-cyan-100' : 'hover:bg-slate-800/60 text-slate-200'}`}
                    >
                      <div className="col-span-6 flex items-center gap-2 truncate">
                        {getFileIcon(item)}
                        <span className="truncate font-medium">{item.name}</span>
                      </div>
                      <div className="col-span-3 text-slate-400 text-[11px]">
                        {item.type === 'DIRECTORY' ? 'File folder' : `${item.extension.toUpperCase()} File`}
                      </div>
                      <div className="col-span-3 text-right text-slate-400 text-[11px] font-mono">
                        {item.type === 'DIRECTORY' ? '' : `${(item.sizeBytes / 1024).toFixed(1)} KB`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Details & Preview Pane */}
        {selectedFile && (
          <div className="w-72 bg-slate-950/80 border-l border-slate-800 p-3 flex flex-col text-xs overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              {getFileIcon(selectedFile)}
              <div className="truncate font-semibold text-slate-200">{selectedFile.name}</div>
            </div>

            <div className="py-2 space-y-1 text-[11px] text-slate-400 border-b border-slate-800 font-mono">
              <div><span className="text-slate-500 font-sans">Path:</span> {selectedFile.fullPath}</div>
              <div><span className="text-slate-500 font-sans">Owner:</span> {selectedFile.ownerName}</div>
              <div><span className="text-slate-500 font-sans">Size:</span> {selectedFile.sizeBytes.toLocaleString()} bytes</div>
              <div><span className="text-slate-500 font-sans">Type:</span> {selectedFile.contentType}</div>
            </div>

            {/* NTFS ACL Preview */}
            <div className="py-2 border-b border-slate-800">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 mb-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                NTFS Permissions
              </div>
              {(() => {
                const acl = desktop.aclEngine.getAcl(selectedFile.aclId);
                if (!acl) return <div className="text-[10px] text-slate-500">Default permissions</div>;
                return (
                  <div className="space-y-1">
                    {acl.aces.slice(0, 4).map((ace) => (
                      <div
                        key={ace.id}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${ace.permissionType === 'DENY' ? 'bg-rose-950/30 border-rose-800/40 text-rose-300' : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'}`}
                      >
                        <span className="font-semibold">{ace.principalName}:</span> {ace.permissionType} {ace.rights.join(', ')}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Content Preview */}
            <div className="pt-2 flex-1 flex flex-col">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 mb-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                Preview
              </div>
              <div
                data-testid="file-preview-content"
                className="flex-1 bg-slate-900 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-48"
              >
                {selectedFile.contentPreview || '[No text preview available for binary file]'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
        <div>{filteredItems.length} item(s)</div>
        <div className="font-mono">{selectedFile ? `${selectedFile.sizeBytes} bytes` : ''}</div>
      </div>
    </div>
  );
};
