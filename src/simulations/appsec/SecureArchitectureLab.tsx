import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  ArchitectureLayer,
  ARCHITECTURE_CONTROLS,
  evaluateArchitecturePosture,
  ArchitectureEvaluationResult,
} from './logic/architecture';
import {
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface SecureArchitectureLabProps {
  onBackToMap?: () => void;
  onNavigateToChallenge?: () => void;
}

export const SecureArchitectureLab: React.FC<SecureArchitectureLabProps> = ({
  onBackToMap,
  onNavigateToChallenge,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [layers, setLayers] = useState<ArchitectureLayer[]>([
    { id: 'layer-cdn-edge', nameEn: '1. Edge CDN & DDoS', nameAr: '1. شبكة التوزيع الطرفية (CDN)', category: 'Edge', assignedControls: ['ctrl-ddos-edge'] },
    { id: 'layer-waf', nameEn: '2. Web Application Firewall (WAF)', nameAr: '2. جدار حماية تطبيقات الويب', category: 'Gateway', assignedControls: ['ctrl-waf-inspection'] },
    { id: 'layer-reverse-proxy', nameEn: '3. Reverse Proxy & TLS', nameAr: '3. البروكسي العكسي وإنهاء TLS', category: 'Network', assignedControls: ['ctrl-tls-termination'] },
    { id: 'layer-api-gateway', nameEn: '4. API Gateway & Rate Limiting', nameAr: '4. بوابة API وتقييد المعدل', category: 'Gateway', assignedControls: ['ctrl-rate-limiting'] },
    { id: 'layer-web-app', nameEn: '5. Web App & Validation', nameAr: '5. تطبيق الويب وتدقيق المدخلات', category: 'Application', assignedControls: ['ctrl-input-validation', 'ctrl-rbac-ownership'] },
    { id: 'layer-database', nameEn: '6. Database Layer', nameAr: '6. طبقة قاعدة البيانات والاستعلامات', category: 'Data', assignedControls: ['ctrl-parameterized-db'] },
    { id: 'layer-logging-siem', nameEn: '7. SIEM & Security Observability', nameAr: '7. المراقبة وسجلات SIEM', category: 'Security', assignedControls: ['ctrl-audit-siem'] },
  ]);

  const posture: ArchitectureEvaluationResult = evaluateArchitecturePosture(layers);

  const toggleControl = (layerId: string, controlId: string) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === layerId) {
          const hasIt = l.assignedControls.includes(controlId);
          return {
            ...l,
            assignedControls: hasIt
              ? l.assignedControls.filter((c) => c !== controlId)
              : [...l.assignedControls, controlId],
          };
        }
        return l;
      })
    );
  };

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
              <Layers className="w-6 h-6 text-indigo-400" />
              <span>{isAr ? 'مصمم البنية المعمارية متعددة الطبقات (Defense in Depth)' : 'Secure Multi-Tier Architecture Designer'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'توزيع الضوابط الأمنية على الطبقات المناسبة لضمان الدفاع في العمق وتفادي نقاط الفشل الأحادية'
                : 'Position enterprise security controls across CDN, WAF, Proxy, Web App, API, Database, and SIEM.'}
            </p>
          </div>
        </div>

        {onNavigateToChallenge && (
          <button
            onClick={onNavigateToChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isAr ? 'التحدي الشامل' : 'Launch Master Challenge'}</span>
          </button>
        )}
      </div>

      {/* Posture Score Banner */}
      <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        posture.valid ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span>{posture.valid ? 'Defense in Depth Posture Verified' : 'Architecture Posture Needs Hardening'}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] ${posture.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-300'}`}>
              Score: {posture.score} / 100
            </span>
          </div>
          <div className="text-slate-400">{isAr ? posture.summaryAr : posture.summaryEn}</div>
        </div>

        {posture.missingControls.length > 0 && (
          <div className="text-red-400 text-[11px]">
            Missing: {posture.missingControls.length} mandatory control(s)
          </div>
        )}
      </div>

      {/* Architecture Layers Deck */}
      <div className="space-y-4">
        {layers.map((layer) => (
          <div key={layer.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-slate-200 text-sm">{isAr ? layer.nameAr : layer.nameEn}</span>
              <span className="text-slate-500 text-[10px] uppercase">Category: {layer.category}</span>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block">Available Defensive Controls for this Tier:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {ARCHITECTURE_CONTROLS.map((ctrl) => {
                  const isAssigned = layer.assignedControls.includes(ctrl.id);
                  const isLayerValid = ctrl.validLayers.includes(layer.id);

                  return (
                    <button
                      key={ctrl.id}
                      onClick={() => toggleControl(layer.id, ctrl.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        isAssigned
                          ? isLayerValid
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                            : 'bg-red-950/40 border-red-500/60 text-red-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold truncate">{isAr ? ctrl.nameAr : ctrl.nameEn}</div>
                      <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                        <span>{isAssigned ? (isLayerValid ? '✓ Active' : '⚠️ Misplaced') : '+ Assign'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
