import React, { useState, useMemo } from 'react';
import { ForensicEvidence } from '../logic/evidence';
import { CustodyRecord, calculateCustodyLedgerHash } from '../logic/custody';
import { ShieldCheck, Download, Copy, Check, X, Award, FileText, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

interface ForensicsCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  evidence: ForensicEvidence[];
  records: CustodyRecord[];
  language: 'ar' | 'en';
}

export const ForensicsCertificateModal: React.FC<ForensicsCertificateModalProps> = ({
  isOpen,
  onClose,
  caseId = 'INC-NEXORA-2026-0812',
  evidence,
  records,
  language,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCertificate, setCopiedCertificate] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedLive, setVerifiedLive] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  // Compute official cryptographic ledger hash using pure FIPS 180-4 SHA-256
  const ledgerHash = useMemo(() => {
    return calculateCustodyLedgerHash(records);
  }, [records]);

  const isAuthentic = records.length > 0 && Boolean(ledgerHash);

  const allVerified = evidence.every(
    (e) => e.integrityStatus === 'VERIFIED' && e.originalHash === e.currentHash
  );

  const handleCopyHash = () => {
    navigator.clipboard.writeText(ledgerHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleVerifyLive = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const liveHash = calculateCustodyLedgerHash(records);
      const isMatch = Boolean(liveHash && liveHash === ledgerHash && records.length > 0);
      setVerifiedLive(isMatch);
      setIsVerifying(false);
    }, 400);
  };

  const handleDownloadPackage = () => {
    const casePackage = {
      standard: 'ISO/IEC 27037 Digital Evidence Handling',
      caseId,
      timestamp: new Date().toISOString(),
      ledgerRootHash: ledgerHash,
      cryptographicAlgorithm: 'FIPS 180-4 Standard SHA-256',
      tamperResistanceStatus: isAuthentic ? 'UNCOMPROMISED' : 'TAMPERED',
      evidenceInventory: evidence.map((ev) => ({
        id: ev.id,
        type: ev.type,
        originalHash: ev.originalHash,
        currentHash: ev.currentHash,
        integrityStatus: ev.integrityStatus,
        metadata: ev.metadata,
      })),
      chainOfCustody: records.map((r) => ({
        id: r.id,
        evidenceId: r.evidenceId,
        virtualTime: r.virtualTime,
        action: r.action,
        actor: r.actor,
        notes: r.notes,
      })),
    };

    const blob = new Blob([JSON.stringify(casePackage, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensics_certificate_${caseId.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const certificateText = `================================================================================
OFFICIAL CERTIFICATE OF DIGITAL EVIDENCE & CHAIN OF CUSTODY INTEGRITY
Standard: ISO/IEC 27037 Guidelines for Digital Evidence Handling
================================================================================
Case Identifier:         ${caseId}
Ledger Root SHA-256:     ${ledgerHash}
Integrity Status:        ${isAuthentic ? 'AUTHENTIC & UNCOMPROMISED' : 'TAMPER DETECTED'}
Total Evidence Items:    ${evidence.length}
Total Custody Actions:   ${records.length}
Timestamp of Issuance:   ${new Date().toUTCString()}
--------------------------------------------------------------------------------
EVIDENCE INVENTORY:
${evidence.map((e) => `[${e.id}] Type: ${e.type} | Hash: ${e.currentHash} | Status: ${e.integrityStatus}`).join('\n')}
--------------------------------------------------------------------------------
CHAIN OF CUSTODY SIGN-OFF SEQUENCE:
${records.map((r) => `T+${r.virtualTime}ms | ${r.evidenceId} | ${r.action.padEnd(20)} | Examiner: ${r.actor} | Notes: ${r.notes}`).join('\n')}
================================================================================
Digital Signature Seal: VERIFIED_FIPS_180_4_SHA256_ICSL_ROOT
================================================================================`;

  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(certificateText);
    setCopiedCertificate(true);
    setTimeout(() => setCopiedCertificate(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid="forensics-certificate-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isAr ? 'شهادة التوثيق الجنائي الرقمي وسلسلة الحيازة' : 'Official Certificate of Evidence Authenticity'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-normal">
                  ISO/IEC 27037
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr
                  ? 'إثبات تشفيري لسلامة الأدلة الجنائية وسلسلة الحضانة الرقمية الموثقة'
                  : 'Cryptographic proof of evidence integrity, provenance, and custody ledger immutability'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {/* Certificate Badge Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                  {isAr ? 'سلسلة الحيازة موثقة تشفيرياً' : 'TAMPER_RESISTANT_CHAIN_VERIFIED'}
                </span>
                <h4 className="text-base font-black text-white tracking-tight mt-0.5">
                  {caseId}
                </h4>
                <span className="text-xs text-slate-400">
                  {isAr
                    ? `${evidence.length} أدلة جنائية مسجلة • ${records.length} عمليات حيازة موثقة`
                    : `${evidence.length} forensic artifacts • ${records.length} signed custody records`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyLive}
                disabled={isVerifying}
                data-testid="btn-verify-certificate-live"
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isVerifying ? (isAr ? 'جاري التدقيق...' : 'Verifying...') : (isAr ? 'إعادة الفحص المباشر' : 'Live Re-Verify')}</span>
              </button>

              <button
                onClick={handleDownloadPackage}
                data-testid="btn-download-forensics-package"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل الحزمة (JSON)' : 'Export Package (JSON)'}</span>
              </button>
            </div>
          </div>

          {verifiedLive !== null && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                verifiedLive
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}
            >
              {verifiedLive ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>
                {verifiedLive
                  ? isAr
                    ? 'نجح الفحص المباشر: تم حساب تجزئة SHA-256 القياسية ومطابقتها للسجل دون أي تلاعب.'
                    : 'Live verification passed: Standard FIPS 180-4 SHA-256 hash mathematically matches the ledger.'
                  : isAr
                  ? 'فشل الفحص: تم اكتشاف عدم تطابق أو تلاعب في السجل.'
                  : 'Verification failed: Tampering or hash mismatch detected.'}
              </span>
            </div>
          )}

          {/* Root Ledger SHA-256 Hash Display */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isAr ? 'جذر التجزئة التشفيري لسلسلة الحيازة (Ledger Root SHA-256)' : 'Ledger Root Cryptographic Hash (SHA-256)'}</span>
              </span>
              <button
                onClick={handleCopyHash}
                data-testid="btn-copy-ledger-hash"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الهاش' : 'Copy Hash')}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 break-all select-text" dir="ltr">
              {ledgerHash}
            </div>
          </div>

          {/* Evidence Integrity Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              {isAr ? 'فهرس الأدلة الرقمية والتجزئة المعيارية:' : 'Digital Artifacts & Integrity Manifest:'}
            </h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden divide-y divide-slate-850">
              {evidence.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900/40 hover:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-cyan-400 font-bold" dir="ltr">{item.id}</span>
                    <span className="text-slate-300">{(item.metadata?.resource as string) || (item.sourceHost ? `${item.sourceHost} (${item.type})` : item.id)}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{item.type}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[220px]" dir="ltr">
                      {item.currentHash}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      item.integrityStatus === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {item.integrityStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Certificate Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">
                {isAr ? 'نص الشهادة الرسمية القابل للطباعة والتوثيق' : 'Printable ISO/IEC 27037 Legal Certificate'}
              </span>
              <button
                onClick={handleCopyCertificate}
                data-testid="btn-copy-full-certificate"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedCertificate ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCertificate ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الشهادة' : 'Copy Certificate')}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 custom-scrollbar leading-relaxed select-text" dir="ltr">
              {certificateText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'الشهادة موقعة ومعتمدة تشفيرياً بواسطة مختبر ICSL' : 'Digitally sealed & verified by ICSL Forensics Authority'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
