import React, { useState } from 'react';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  buildUnsafeQueryConcept,
  buildParameterizedQuery,
  executeSimulatedQuery,
  MOCK_ORDERS_DATABASE,
} from './logic/sql';
import {
  Database,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCode,
  Terminal,
  AlertTriangle,
} from 'lucide-react';

interface SqlInjectionConceptLabProps {
  onBackToMap?: () => void;
  onNavigateToXss?: () => void;
}

export const SqlInjectionConceptLab: React.FC<SqlInjectionConceptLabProps> = ({
  onBackToMap,
  onNavigateToXss,
}) => {
  const language = useSimulationStore((s) => s.language);
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [inputQuery, setInputQuery] = useState<string>("1001' OR '1'='1");
  const [defenseMode, setDefenseMode] = useState<'UNSAFE' | 'PARAMETERIZED'>('PARAMETERIZED');

  const unsafePlan = buildUnsafeQueryConcept(inputQuery);
  const safePlan = buildParameterizedQuery(inputQuery);
  const activePlan = defenseMode === 'PARAMETERIZED' ? safePlan : unsafePlan;

  const execution = executeSimulatedQuery(activePlan, inputQuery);

  const samplePayloads = [
    { label: 'Normal Lookup', val: '1001' },
    { label: 'Tautology (OR 1=1)', val: "1001' OR '1'='1" },
    { label: 'Comment Bypass (admin--)', val: "admin'--" },
    { label: 'Union Query Concept', val: "1' UNION SELECT" },
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
              <Database className="w-6 h-6 text-red-400" />
              <span>{isAr ? 'مختبر مفهوم حقن SQL والاستعلامات المعلمية' : 'SQL Injection Defense & Parameterized Queries Lab'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'فهم الفارق الجذري: دمج النصوص يحول البيانات لأوامر، بينما الاستعلامات المعلمية (Prepared Statements) تفصل البيانات كلياً عن بناء الكود'
                : 'Safe educational concept: Unsafe string concatenation vs Parameterized Prepared Statements.'}
            </p>
          </div>
        </div>

        {onNavigateToXss && (
          <button
            onClick={onNavigateToXss}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isAr ? 'الدفاع ضد XSS' : 'XSS Defense Lab'}</span>
          </button>
        )}
      </div>

      {/* Payload Selector & Defense Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="md:col-span-7 space-y-2">
          <label className="text-slate-300 font-bold block">1. User Search Input (Order Number):</label>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {samplePayloads.map((p) => (
              <button
                key={p.label}
                onClick={() => setInputQuery(p.val)}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-cyan-400 hover:text-white"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 space-y-2">
          <label className="text-slate-300 font-bold block">2. Database Query Building Pattern:</label>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setDefenseMode('UNSAFE')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                defenseMode === 'UNSAFE'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-400'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Unsafe Concatenation</span>
            </button>

            <button
              onClick={() => setDefenseMode('PARAMETERIZED')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 ${
                defenseMode === 'PARAMETERIZED'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Prepared Statement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Query Breakdown & AST Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Compiled SQL Statement & Parameters</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              defenseMode === 'PARAMETERIZED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {defenseMode}
            </span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-yellow-300 text-xs overflow-x-auto whitespace-pre-wrap">
            {activePlan.rawQueryText}
          </pre>

          {activePlan.parameters.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300">
              Bound Parameters: {JSON.stringify(activePlan.parameters)}
            </div>
          )}

          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            defenseMode === 'PARAMETERIZED'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/30 border-red-500/40 text-red-300'
          }`}>
            {isAr ? activePlan.safetyAnalysisAr : activePlan.safetyAnalysisEn}
          </div>
        </div>

        {/* Database Execution Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="font-bold text-slate-300 uppercase">Database Execution Result Table</span>
            <span className="text-slate-500">{execution.rows.length} row(s) returned</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Order #</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {execution.rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-800/60 text-slate-200">
                    <td className="py-2 px-3 text-cyan-400">{row.id}</td>
                    <td className="py-2 px-3 font-bold">{row.orderNumber}</td>
                    <td className="py-2 px-3">{row.customerName}</td>
                    <td className="py-2 px-3 text-emerald-400">${row.amount.toLocaleString()}</td>
                    <td className="py-2 px-3">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {defenseMode === 'UNSAFE' && activePlan.structureAltered && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-200">
              ⚠️ Tautology Exploit Demonstrated: The WHERE clause evaluated to TRUE for every row, leaking the entire database!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
