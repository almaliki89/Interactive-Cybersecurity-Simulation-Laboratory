/**
 * OMEGA V15 — Automated Compliance as Code (SOC2 / PCI-DSS) Lab
 */

import React from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import { Shield, CheckCircle2 } from 'lucide-react';

export const CompliancePolicyLab: React.FC = () => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
            <Shield className="w-4 h-4" />
            <span>{isAr ? 'مختبر الامتثال التلقائي ككود (Compliance as Code)' : 'Compliance as Code (SOC2 / PCI-DSS) Lab'}</span>
          </div>
          <h1 className="text-xl font-black text-white">
            {isAr ? 'فحص ضوابط SOC2 و ISO27001 و PCI-DSS تلقائياً في خط CI/CD' : 'Automated CI/CD Regulatory Compliance Audits'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isAr
              ? 'تأكد من مطابقة خط الإنتاج لمتطلبات الفصل بين المهام (Segregation of Duties) والمراجعة الإلزامية.'
              : 'Enforce Segregation of Duties and mandatory code review approvals in CI pipelines.'}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300">
          ✓ SOC2 Type II & PCI-DSS 4.0 Automated Pipeline Controls: 100% Compliant.
        </div>
      </div>
    </div>
  );
};
