import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { listFiles, findDeletedArtifacts, inspectFileMetadata, DiskFileArtifact } from './logic/disk';
import { HardDrive, FileCode, Trash2, Search, Eye } from 'lucide-react';

export const DiskForensicsLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [files] = useState<DiskFileArtifact[]>(listFiles());
  const [selectedFileId, setSelectedFileId] = useState<string>('DISK-FILE-002');
  const [filterDeletedOnly, setFilterDeletedOnly] = useState<boolean>(false);

  const displayedFiles = filterDeletedOnly ? findDeletedArtifacts(files) : files;
  const selectedFile = inspectFileMetadata(selectedFileId, files);

  return (
    <div className="flex-1 p-6 bg-slate-950 text-slate-100 flex flex-col gap-6 overflow-y-auto">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>{isAr ? 'معمل التحقيق في الأقراص والملفات (Disk Forensics)' : 'Disk & Filesystem Forensics Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">
            {isAr ? 'تحليل صور الأقراص واستعادة الملفات المحذوفة' : 'Filesystem Artifact Analysis & Deleted File Recovery'}
          </h1>
        </div>

        <button
          onClick={() => setFilterDeletedOnly(!filterDeletedOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-colors ${
            filterDeletedOnly
              ? 'bg-rose-950 border-rose-800 text-rose-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>{filterDeletedOnly ? (isAr ? 'عرض كافة الملفات' : 'Show All Files') : (isAr ? 'تصفية المحذوفة فقط' : 'Show Deleted Only')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>{isAr ? 'شجرة الملفات والأدلة المستخرجة من القرص' : 'Filesystem Artifact Directory Tree'}</span>
          </h2>

          <div className="flex flex-col gap-2">
            {displayedFiles.map((f) => {
              const isSelected = f.id === selectedFileId;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFileId(f.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                      : f.isSuspicious
                      ? 'bg-rose-950/40 border-rose-900/60 text-slate-200 hover:border-rose-700'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate max-w-lg">
                    <FileCode className={`w-4 h-4 shrink-0 ${f.isSuspicious ? 'text-rose-400' : 'text-cyan-400'}`} />
                    <span className="font-mono text-[11px] truncate">{f.path}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {f.isDeleted && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono text-[10px]">
                        DELETED
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-400">T+{f.modifiedVirtualTime}ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>{isAr ? 'تفاصيل ومعايير الملف المختار' : 'File Metadata Inspector'}</span>
          </h2>

          {selectedFile ? (
            <div className="flex flex-col gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'اسم الملف' : 'Filename'}</span>
                <span className="text-cyan-300 font-bold">{selectedFile.filename}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'المالك والمباشر' : 'Owner'}</span>
                <span className="text-slate-200">{selectedFile.owner}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'بصمة الملف (SHA-256)' : 'File Hash'}</span>
                <span className="text-slate-300 break-all text-[10px]">{selectedFile.fileHash}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block mb-0.5">{isAr ? 'خصائص وصفات إضافية' : 'Extended Attributes'}</span>
                <pre className="text-[10px] text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(selectedFile.attributes, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic text-center py-8">
              {isAr ? 'حدد ملفاً من القائمة لمعاينة بياناته الجنائية' : 'Select a file to inspect forensic metadata'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
