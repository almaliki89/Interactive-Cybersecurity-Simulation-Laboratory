/**
 * OMEGA V15.1 — Software Bill of Materials (SBOM) CycloneDX Lab
 * High-fidelity interactive lab for SBOM generation, compliance checks, and PURL ledger mapping.
 */

import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { useDevSecOpsStore } from '../../stores/devSecOpsStore';
import { validateSbom } from './logic/masterState';
import { Layers, Download, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

export const SbomInventoryLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  const masterState = useDevSecOpsStore((s) => s.masterState);
  const setMasterState = useDevSecOpsStore((s) => s.setMasterState);

  const sbomComponents = masterState.sbomComponents;
  const artifact = masterState.artifactState;

  const [generating, setGenerating] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Evaluate SBOM Validation
  const validationResult = validateSbom(sbomComponents, artifact);

  const appendLog = (msg: string) => setLogs((prev) => [...prev, `[cyclonedx] ${msg}`]);

  const generateSbom = () => {
    setGenerating(true);
    setLogs([]);
    appendLog('Scanning build environment workspace...');
    
    setTimeout(() => {
      appendLog('Found production package: react@19.0.1');
      appendLog('Found production package: express@4.21.2');
      appendLog('Found runtime base container: gcr.io/distroless/static-debian12');
      appendLog('Hashing components...');
      appendLog('Generating CycloneDX v1.5 JSON spec...');

      setMasterState((state) => {
        state.sbomComponents = [
          {
            id: 'sbom-react',
            name: 'react',
            version: '19.0.1',
            purl: 'pkg:npm/react@19.0.1',
            type: 'framework',
            license: 'MIT',
            supplier: 'Meta Open Source',
            hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }]
          },
          {
            id: 'sbom-express',
            name: 'express',
            version: '4.21.2',
            purl: 'pkg:npm/express@4.21.2',
            type: 'library',
            license: 'MIT',
            supplier: 'OpenJS Foundation',
            hashes: [{ algo: 'SHA-256', digest: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d' }]
          },
          {
            id: 'sbom-distroless',
            name: 'gcr.io/distroless/static-debian12',
            version: 'nonroot',
            purl: 'pkg:oci/distroless-static@sha256:881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
            type: 'container',
            license: 'Apache-2.0',
            supplier: 'Google Container Registry',
            hashes: [{ algo: 'SHA-256', digest: '881f3a2b1c0d9e8f7a6b5c4d3e2f1a0b' }]
          }
        ];
        state.containerImages[0].sbomVerified = true;
      });

      appendLog('CycloneDX SBOM Generated successfully with 3 fully pinned dependencies.');
      setGenerating(false);
    }, 1000);
  };

  const resetSbom = () => {
    setMasterState((state) => {
      // resets to incomplete
      state.sbomComponents = [
        {
          id: 'sbom-react',
          name: 'react',
          version: '19.0.1',
          purl: 'pkg:npm/react@19.0.1',
          type: 'framework',
          license: 'MIT',
          supplier: 'Meta Open Source',
          hashes: [{ algo: 'SHA-256', digest: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d' }]
        }
      ];
      state.containerImages[0].sbomVerified = false;
    });
    setLogs([]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-1">
              <Layers className="w-4 h-4" />
              <span>{isAr ? 'مختبر جرد مكونات البرمجيات (CycloneDX SBOM)' : 'Software Bill of Materials (SBOM) Lab'}</span>
            </div>
            <h1 className="text-xl font-black text-white">
              {isAr ? 'توليد وتصدير قائمة SBOM الموحدة للبيئات التجارية' : 'CycloneDX / SPDX SBOM Component Inventory Graph'}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {isAr
                ? 'استعرض جرد المكونات البرمجية والترخيص والتوقيعات بصيغة CycloneDX المعتمدة للتأكد من خلوها من الثغرات.'
                : 'Inspect complete software dependency trees, PURLs, hashes, and licenses for regulatory compliance.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={generateSbom}
              disabled={generating || validationResult.valid}
              className="px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? (isAr ? 'جاري التوليد...' : 'Generating...') : (isAr ? 'توليد CycloneDX SBOM' : 'Generate CycloneDX SBOM')}</span>
            </button>

            <button
              onClick={resetSbom}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SBOM Audit Banner */}
        <div
          className={`p-4.5 rounded-xl border flex items-center justify-between ${
            validationResult.valid
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {validationResult.valid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm text-white">
                {validationResult.valid
                  ? isAr
                    ? 'جرد SBOM سليم ومكتمل بنجاح (SBOM VERIFIED)'
                    : 'CycloneDX Software Bill of Materials Verified'
                  : isAr
                  ? 'جرد SBOM غير مكتمل أو تالف (SBOM INCOMPLETE)'
                  : 'SBOM Validation Failed: Missing core components or contains unverified libraries'}
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {isAr ? validationResult.reasonAr : validationResult.reasonEn}
              </p>
            </div>
          </div>
        </div>

        {/* Console & Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Diagnostic logs */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CycloneDX Generator Logs:</div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-950 text-[10px] text-violet-300 h-44 overflow-y-auto space-y-1">
              {logs.length === 0 && <span className="text-slate-500">// Run "Generate CycloneDX SBOM" to build graph</span>}
              {logs.map((lg, idx) => (
                <div key={idx}>{lg}</div>
              ))}
            </div>
          </div>

          {/* Component tree grid */}
          <div className="md:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>{isAr ? 'محتويات الجرد البرمجي الموثق:' : 'SBOM Package Inventory Graph:'}</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3 font-mono text-[11px]">
              <div className="grid grid-cols-12 text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                <div className="col-span-6">Package URL (PURL)</div>
                <div className="col-span-3">Type</div>
                <div className="col-span-3 text-right">License</div>
              </div>

              {sbomComponents.map((c) => (
                <div key={c.id} className="grid grid-cols-12 text-slate-200 border-b border-slate-900/60 py-2 items-center">
                  <div className="col-span-6 text-violet-300 font-bold truncate pr-2">{c.purl}</div>
                  <div className="col-span-3 text-slate-400 capitalize">{c.type}</div>
                  <div className="col-span-3 text-emerald-400 font-bold text-right">{c.license}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
