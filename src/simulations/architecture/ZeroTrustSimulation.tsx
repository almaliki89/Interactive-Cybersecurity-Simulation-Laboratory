import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Laptop,
  Globe,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface AccessRequest {
  user: string;
  role: string;
  deviceCompliant: boolean;
  location: string;
  targetResource: string;
  isHighRisk: boolean;
}

export const ZeroTrustSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  const [requireDeviceCompliance, setRequireDeviceCompliance] = useState(true);
  const [requireStepUpMfa, setRequireStepUpMfa] = useState(true);
  const [blockUntrustedLocations, setBlockUntrustedLocations] = useState(true);

  const [currentRequest, setCurrentRequest] = useState<AccessRequest>({
    user: 'alice@corp.local',
    role: 'Financial Analyst',
    deviceCompliant: true,
    location: 'US / Headquarters',
    targetResource: 'Customer Vault Database',
    isHighRisk: false,
  });

  const [decisionResult, setDecisionResult] = useState<'ALLOW' | 'DENY' | 'STEP_UP' | null>(null);

  const evaluateZeroTrustDecision = (req: AccessRequest): 'ALLOW' | 'DENY' | 'STEP_UP' => {
    if (requireDeviceCompliance && !req.deviceCompliant) return 'DENY';
    if (blockUntrustedLocations && req.location.includes('Untrusted')) return 'DENY';
    if (requireStepUpMfa && req.targetResource.includes('Vault')) return 'STEP_UP';
    return 'ALLOW';
  };

  const handleTestRequest = (req: AccessRequest) => {
    setCurrentRequest(req);
    const res = evaluateZeroTrustDecision(req);
    setDecisionResult(res);
  };

  const challenge: Challenge = {
    id: 'zero-trust-challenge',
    simulationId: 'zero_trust',
    title: language === 'ar' ? 'تحدي محرك قرارات انعدام الثقة (Zero Trust)' : 'Zero Trust Dynamic Decision Challenge',
    difficulty: 'Advanced',
    category: language === 'ar' ? 'الهندسة المعمارية وانعدام الثقة' : 'Security Architecture',
    mission:
      language === 'ar'
        ? 'اضبط سياسات انعدام الثقة لرفض الأجهزة غير المتوافقة، وفرض المصادقة الإضافية للبيانات الحساسة، وحظر المواقع الجغرافية المريبة.'
        : 'Configure Zero Trust policy rules to reject non-compliant endpoints and challenge high-risk requests.',
    initialExplanation:
      language === 'ar'
        ? 'انعدام الثقة يزيل الثقة الضمنية في المحيط ويقيم كل طلب وصول بناءً على هوية المستخدم، صحة الجهاز، والموقع.'
        : 'Zero Trust eliminates implicit perimeter trust; every request is continuously evaluated on context signals.',
    objectives: [
      {
        id: 'obj-posture',
        title: language === 'ar' ? 'فرض فحص صحة الجهاز' : 'Enforce Device Posture Compliance',
        description: language === 'ar' ? 'رفض أي جهاز لا يملك مضاد فيروسات محدث وتشفير قرص' : 'Deny requests from non-compliant endpoints',
        isCompleted: requireDeviceCompliance,
        validationKey: 'posture_ok',
      },
      {
        id: 'obj-stepup',
        title: language === 'ar' ? 'فرض المصادقة الإضافية Step-Up' : 'Enforce Step-Up MFA on High-Value Assets',
        description: language === 'ar' ? 'طلب مصادقة بيومترية للوصول لبيانات الخزنة المالية' : 'Trigger step-up challenge for sensitive vaults',
        isCompleted: requireStepUpMfa,
        validationKey: 'stepup_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'تأكد من تفعيل فحص صحة الجهاز والمصادقة الإضافية في شريط التحكم.' : 'Enable Device Posture and Step-Up MFA toggles.',
    ],
  };

  const validateChallenge = () => {
    if (requireDeviceCompliance && requireStepUpMfa && blockUntrustedLocations) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم ضبط محرك قرارات Zero Trust بنجاح والتحقق من السياق الأمني!'
            : 'Zero Trust context-aware policy engine successfully verified!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'تحقق من تفعيل سياسات انعدام الثقة الثلاث.' : 'Enable all Zero Trust policy rules.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي معمارية انعدام الثقة (Zero Trust Decision Engine)' : 'Zero Trust Architecture & Decision Engine Simulator'}
      subtitle={language === 'ar' ? 'التحقق المستمر، فحص صحة الأجهزة، المصادقة الإضافية، والقرارات المشروطة' : 'Context-Aware Evaluation, Device Posture & Dynamic Step-Up Auth'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase font-mono">
              {language === 'ar' ? 'سيناريوهات الاختبار:' : 'Test Scenarios:'}
            </span>
            <button
              onClick={() =>
                handleTestRequest({
                  user: 'bob@corp.local',
                  role: 'Contractor',
                  deviceCompliant: false,
                  location: 'Remote / Home',
                  targetResource: 'Internal Wiki',
                  isHighRisk: false,
                })
              }
              className="py-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold"
            >
              {language === 'ar' ? 'جهاز غير محدث (Non-Compliant)' : 'Non-Compliant Device'}
            </button>
            <button
              onClick={() =>
                handleTestRequest({
                  user: 'alice@corp.local',
                  role: 'Finance',
                  deviceCompliant: true,
                  location: 'Untrusted Country / TOR',
                  targetResource: 'Customer Vault Database',
                  isHighRisk: true,
                })
              }
              className="py-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono font-bold"
            >
              {language === 'ar' ? 'موقع مريب (TOR Exit Node)' : 'Suspicious Geo / TOR'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={requireDeviceCompliance}
                onChange={(e) => setRequireDeviceCompliance(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'فحص صحة الجهاز (Posture Check)' : 'Device Posture'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={requireStepUpMfa}
                onChange={(e) => setRequireStepUpMfa(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'مصادقة إضافية (Step-Up MFA)' : 'Step-Up MFA'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* Zero Trust Decision Card */}
        <div className="max-w-4xl w-full mb-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              {language === 'ar' ? 'تقييم طلب الوصول الحالي:' : 'Current Access Context Evaluation:'}
            </span>
            {decisionResult && (
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded ${
                  decisionResult === 'ALLOW'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : decisionResult === 'STEP_UP'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                DECISION: {decisionResult}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] mb-0.5">USER</span>
              <span className="text-white font-bold">{currentRequest.user}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] mb-0.5">DEVICE HEALTH</span>
              <span className={`font-bold ${currentRequest.deviceCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentRequest.deviceCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] mb-0.5">LOCATION</span>
              <span className="text-cyan-300 font-bold">{currentRequest.location}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px] mb-0.5">TARGET RESOURCE</span>
              <span className="text-amber-300 font-bold">{currentRequest.targetResource}</span>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
