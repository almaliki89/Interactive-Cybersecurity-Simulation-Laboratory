/**
 * OMEGA V14 — Container Image Security & Supply Chain Lab
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  getSampleVulnerableImage,
  getHardenedDistrolessImage,
  scanImageSecurity,
} from './logic/images';
import { ContainerImage } from './logic/types';
import { FileCode, ShieldAlert, CheckCircle2, AlertTriangle, Key, Layers, ArrowRight } from 'lucide-react';

export const ImageSecurityLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const [image, setImage] = useState<ContainerImage>(getSampleVulnerableImage());
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);

  const scan = scanImageSecurity(image);

  const switchToDistroless = () => {
    setImage(getHardenedDistrolessImage());
    setSelectedLayerIndex(0);
  };

  const switchToVulnerable = () => {
    setImage(getSampleVulnerableImage());
    setSelectedLayerIndex(0);
  };

  const currentLayer = image.layers[selectedLayerIndex] || image.layers[0];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Lab Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
              <FileCode className="w-4 h-4" />
              <span>{isAr ? 'مختبر أمن صور الحاويات وسلاسل التوريد' : 'Container Image Security & Supply Chain Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'فحص ثغرات CVEs والأسرار والتوقيع الرقمي (Cosign)' : 'Image Vulnerability Scanning, Secrets & Cosign Signatures'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'قارن بين الصور التقليدية المليئة بالحزم والثغرات وبين صور Distroless الخفيفة والموقعة رقمياً عبر Sigstore.'
                : 'Inspect layer-by-layer vulnerabilities, secret leaks in Dockerfile history, and non-root execution.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={switchToVulnerable}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                image.id === 'img-vulnerable-monolith'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'صورة مليئة بالثغرات (Ubuntu:latest)' : 'Vulnerable Image (Ubuntu)'}
            </button>

            <button
              onClick={switchToDistroless}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                image.id === 'img-distroless-hardened'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'صورة محصنة (Distroless Non-Root)' : 'Hardened (Distroless Non-Root)'}
            </button>
          </div>
        </div>

        {/* Security Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? 'درجة الأمان' : 'Security Score'}</div>
            <div
              className={`text-xl font-black mt-0.5 ${
                scan.securityScore >= 80
                  ? 'text-emerald-400'
                  : scan.securityScore >= 50
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {scan.securityScore}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? 'الثغرات الحرجة (CVEs)' : 'Critical CVEs'}</div>
            <div
              className={`text-xl font-black mt-0.5 ${
                scan.criticalCount === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {scan.criticalCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? 'أسرار مكشوفة في الطبقات' : 'Secret Leaks'}</div>
            <div
              className={`text-xl font-black mt-0.5 ${
                scan.secretLeaksCount === 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {scan.secretLeaksCount}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400">{isAr ? 'التوقيع الرقمي (Cosign)' : 'Cosign Signature'}</div>
            <div
              className={`text-sm font-black mt-1 ${
                scan.isCosignVerified ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              {scan.isCosignVerified ? (isAr ? 'موثقة وموقعة' : 'Verified (OIDC)') : (isAr ? 'غير موقعة' : 'Unsigned')}
            </div>
          </div>
        </div>

        {/* Layer-by-Layer Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Layers List */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>{isAr ? 'طبقات صورة الحاوية (Image Layers)' : 'Container Image Layers'}</span>
            </div>

            {image.layers.map((layer, index) => {
              const isSelected = selectedLayerIndex === index;
              const hasCrit = layer.vulnerabilities.some((v) => v.severity === 'CRITICAL');

              return (
                <div
                  key={layer.id}
                  onClick={() => setSelectedLayerIndex(index)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer font-mono text-xs ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500 text-white shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-500 text-[10px]">Layer #{index + 1}</span>
                    <div className="flex items-center gap-1">
                      {layer.hasSecretLeak && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold">
                          SECRET LEAK
                        </span>
                      )}
                      {layer.vulnerabilities.length > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            hasCrit
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {layer.vulnerabilities.length} CVEs
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="truncate text-slate-200">{layer.instruction}</div>
                </div>
              );
            })}
          </div>

          {/* Layer Detail Panel */}
          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                {isAr ? 'تفاصيل الطبقة المحددة' : 'Selected Layer Details'}
              </div>
              <div className="font-mono text-xs text-purple-300 mt-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                {currentLayer.instruction}
              </div>
            </div>

            {currentLayer.hasSecretLeak && (
              <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/40 text-rose-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Key className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'رصد تسريب سر برمجي في تاريخ الطبقات!' : 'Secret Leak Detected in Layer History!'}</span>
                </div>
                <div className="text-[11px]">{currentLayer.leakedSecretType}</div>
              </div>
            )}

            {currentLayer.vulnerabilities.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  {isAr ? 'الثغرات المكتشفة في هذه الطبقة:' : 'CVE Vulnerabilities in this Layer:'}
                </div>
                {currentLayer.vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.cveId}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-rose-400">{vuln.cveId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        CVSS {vuln.cvss} ({vuln.severity})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Package: <span className="text-slate-200">{vuln.package}</span> ({vuln.installedVersion} → Fixed:{' '}
                      <span className="text-emerald-400 font-bold">{vuln.fixedVersion}</span>)
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {isAr ? vuln.descriptionAr : vuln.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'لا توجد ثغرات أو أسرار في هذه الطبقة' : 'Zero vulnerabilities or secret leaks in this layer'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
