import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  validateUpload,
  FileUploadPayload,
  UploadSecurityPolicy,
  DEFAULT_SECURE_UPLOAD_POLICY,
} from './logic/fileUpload';
import {
  FileCheck,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCode,
  HardDrive,
} from 'lucide-react';

interface FileUploadSecurityLabProps {
  onBackToMap?: () => void;
  onNavigateToHeaders?: () => void;
}

export const FileUploadSecurityLab: React.FC<FileUploadSecurityLabProps> = ({
  onBackToMap,
  onNavigateToHeaders,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;
  const virtualTime = useSimulationStore((s) => s.virtualTime);

  // File Upload Parameters
  const [filename, setFilename] = useState<string>('quarterly_report.pdf');
  const [mimeType, setMimeType] = useState<string>('application/pdf');
  const [sizeBytes, setSizeBytes] = useState<number>(1024 * 500); // 500 KB
  const [magicBytes, setMagicBytes] = useState<string>('25504446'); // %PDF

  // Defensive Toggles
  const [isolateOutsideWebroot, setIsolateOutsideWebroot] = useState<boolean>(true);
  const [renameFiles, setRenameFiles] = useState<boolean>(true);
  const [enforceMagicBytes, setEnforceMagicBytes] = useState<boolean>(true);

  const policy: UploadSecurityPolicy = {
    ...DEFAULT_SECURE_UPLOAD_POLICY,
    isolateStorageOutsideWebroot: isolateOutsideWebroot,
    renameToUuidOrHash: renameFiles,
    enforceMagicBytesMatch: enforceMagicBytes,
  };

  const payload: FileUploadPayload = {
    originalFilename: filename,
    declaredMimeType: mimeType,
    sizeBytes,
    magicBytesHeader: magicBytes,
    uploadedByUserId: 'usr-alice',
    virtualTime,
  };

  const validation = validateUpload(payload, policy);

  const presets = [
    { label: 'Valid PDF Document', name: 'report.pdf', mime: 'application/pdf', magic: '25504446', size: 500 * 1024 },
    { label: 'PHP Script Shell', name: 'shell.php', mime: 'application/x-php', magic: '3c3f7068', size: 10 * 1024 },
    { label: 'Double Extension Trick', name: 'avatar.php.png', mime: 'image/png', magic: '89504e47', size: 200 * 1024 },
    { label: 'Disguised Executable', name: 'invoice.pdf', mime: 'application/pdf', magic: '4d5a9000', size: 800 * 1024 },
    { label: 'Path Traversal Filename', name: '../../etc/cron.d/job.sh', mime: 'text/plain', magic: '23212f62', size: 5 * 1024 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <BackArrow className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مختبر تأمين رفع الملفات وتجريد التنفيذ' : 'File Upload Security & Storage Isolation Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فحص الامتدادات، مطابقة البايتات السحرية، عزل مسارات التخزين خارج webroot، وإعادة التسمية الآمنة'
                : 'Master extension allowlists, magic bytes inspection, isolated storage outside webroot, and execution neutralization.'}
            </p>
          </div>
        </div>

        {onNavigateToHeaders && (
          <button
            onClick={onNavigateToHeaders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAr ? 'الترويسات الأمنية' : 'Security Headers Lab'}</span>
          </button>
        )}
      </div>

      {/* Upload Parameters Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="md:col-span-6 space-y-2">
          <label className="text-slate-300 font-bold block">1. File Upload Payload Simulation:</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 block mb-1">Original Filename:</span>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Declared MIME:</span>
              <input
                type="text"
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setFilename(p.name);
                  setMimeType(p.mime);
                  setMagicBytes(p.magic);
                  setSizeBytes(p.size);
                }}
                className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-amber-400 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-6 space-y-2">
          <label className="text-slate-300 font-bold block">2. Defensive Policy Toggles:</label>
          <div className="space-y-1.5 pt-1">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isolateOutsideWebroot}
                onChange={(e) => setIsolateOutsideWebroot(e.target.checked)}
                className="rounded border-slate-700 text-amber-500"
              />
              <span>Isolate Storage Outside Webroot (/var/isolated_storage/)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={renameFiles}
                onChange={(e) => setRenameFiles(e.target.checked)}
                className="rounded border-slate-700 text-amber-500"
              />
              <span>Sanitize & Randomize Stored Filenames</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceMagicBytes}
                onChange={(e) => setEnforceMagicBytes(e.target.checked)}
                className="rounded border-slate-700 text-amber-500"
              />
              <span>Inspect Header Magic Bytes (%PDF, PNG magic)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Verdict & Storage Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl border space-y-4 ${
          validation.accepted
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20 text-emerald-300'
            : 'bg-red-950/30 border-red-500/60 shadow-lg shadow-red-950/20 text-red-300'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold uppercase tracking-wider">Upload Acceptance Verdict</span>
            <span className="font-bold">{validation.accepted ? 'ACCEPTED & STORED' : `REJECTED (${validation.rejectionReasonCode})`}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
            {isAr ? validation.reasonAr : validation.reasonEn}
          </div>

          <div className="space-y-1 text-slate-400">
            <span className="font-bold block text-slate-300">Defense Findings:</span>
            {validation.securityFindings.map((f, i) => (
              <div key={i}>• {f}</div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Server Storage Resolution</span>
            <HardDrive className="w-4 h-4 text-slate-500" />
          </div>

          {validation.accepted ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500">Stored Path on Server:</div>
                <div className="text-cyan-400 font-bold">{validation.safeStoredPath}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500">Generated Safe Filename:</div>
                <div className="text-emerald-400 font-bold">{validation.safeStoredFilename}</div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <ShieldAlert className="w-8 h-8 text-red-400 mx-auto" />
              <div>File rejected. No storage allocation created.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
