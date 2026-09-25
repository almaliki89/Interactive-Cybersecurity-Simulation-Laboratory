import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FieldValidationRule,
  validateInputSchema,
  ValidationReport,
} from './logic/validation';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Database,
  Sparkles,
  Info,
} from 'lucide-react';

interface InputValidationLabProps {
  onBackToMap?: () => void;
  onNavigateToSqli?: () => void;
}

export const InputValidationLab: React.FC<InputValidationLabProps> = ({
  onBackToMap,
  onNavigateToSqli,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Editable Form Inputs
  const [username, setUsername] = useState<string>('  alice_99  ');
  const [email, setEmail] = useState<string>('alice@nexora.local');
  const [quantity, setQuantity] = useState<string>('5');
  const [shippingCountry, setShippingCountry] = useState<string>('US');

  const rules: FieldValidationRule[] = [
    { fieldName: 'username', type: 'alphanumeric', required: true, minLength: 3, maxLength: 20 },
    { fieldName: 'email', type: 'email', required: true },
    { fieldName: 'quantity', type: 'number', required: true, min: 1, max: 100 },
    { fieldName: 'shippingCountry', type: 'string', required: true, allowedValues: ['US', 'CA', 'UK', 'DE', 'AE', 'SA'] },
  ];

  const report: ValidationReport = validateInputSchema(
    { username, email, quantity, shippingCountry },
    rules
  );

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
              <Sliders className="w-6 h-6 text-amber-400" />
              <span>{isAr ? 'مختبر التحقق من المدخلات وتوحيد الصيغة' : 'Input Validation & Canonicalization Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تدقيق أنواع البيانات والأطوال والنطاقات والقوائم البيضاء قبل وصول البيانات لمنطق الأعمال وقواعد البيانات'
                : 'Inspect raw input normalization, strict type/length/range schema validation, and structured error reporting'}
            </p>
          </div>
        </div>

        {onNavigateToSqli && (
          <button
            onClick={onNavigateToSqli}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isAr ? 'الدفاع ضد حقن SQL' : 'SQL Injection Lab'}</span>
          </button>
        )}
      </div>

      {/* Input Form & Real-Time Normalizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">1. Raw Client Input Form</span>
            <span className="text-slate-500">Untrusted Data Source</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-slate-400 font-bold block mb-1">Username (Alphanumeric, 3-20 chars):</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Email Address (Format RFC 5322):</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Quantity (Integer, 1 - 100):</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold block mb-1">Country Code (Allowed: US, CA, UK, DE, AE, SA):</label>
              <input
                type="text"
                value={shippingCountry}
                onChange={(e) => setShippingCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase"
              />
            </div>
          </div>
        </div>

        {/* Validation Engine Results */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">2. Validation & Normalization Report</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              report.isValid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {report.isValid ? 'SCHEMA VALID' : `REJECTED (${report.errors.length} ERRORS)`}
            </span>
          </div>

          {report.canonicalizationNotes.length > 0 && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 space-y-1">
              <span className="font-bold block">Canonicalization / Normalization Applied:</span>
              {report.canonicalizationNotes.map((note, i) => (
                <div key={i}>• {note}</div>
              ))}
            </div>
          )}

          {report.isValid ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
                Input passed all validation checks! Safe for business processing & database storage.
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto">
                {JSON.stringify(report.normalizedData, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-red-400 font-bold block">Validation Errors:</span>
              {report.errors.map((err, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 space-y-1">
                  <div className="font-bold">{err.field} → {err.errorCode}</div>
                  <div>{isAr ? err.messageAr : err.messageEn}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
