import React, { useState } from 'react';
import { Workspace } from '../../components/simulation/Workspace';
import { Challenge } from '../../types/simulation';
import { useSimulationStore } from '../../stores/simulationStore';
import {
  FileCode,
  Braces,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Layers,
} from 'lucide-react';

export const AppSecApiSimulation: React.FC = () => {
  const language = useSimulationStore((s) => s.language);

  // AppSec Input & Filter State
  const [userInput, setUserInput] = useState<string>("admin' OR '1'='1");
  const [usePreparedStatement, setUsePreparedStatement] = useState(true);
  const [useOutputEncoding, setUseOutputEncoding] = useState(true);

  // API Rate Limiting State
  const [requestCount, setRequestCount] = useState<number>(0);
  const [rateLimitMax, setRateLimitMax] = useState<number>(5);

  const isRateLimited = requestCount > rateLimitMax;

  const handleSendBurstTraffic = () => {
    setRequestCount((prev) => prev + 3);
  };

  const challenge: Challenge = {
    id: 'appsec-api-challenge',
    simulationId: 'appsec_api',
    title: language === 'ar' ? 'تحدي تحصين استعلامات SQL وتحديد معدل API' : 'SQLi Defense & API Rate Limiting Challenge',
    difficulty: 'Intermediate',
    category: language === 'ar' ? 'أمن التطبيقات والـ API' : 'Application Security',
    mission:
      language === 'ar'
        ? 'فعل الاستعلامات المعلمية (Prepared Statements) لمنع حقن SQL، واختبر استجابة بوابة API برمز 429 عند تجاوز حد الطلبات.'
        : 'Enforce parameterized queries to block SQL injection and test API Gateway HTTP 429 throttling.',
    initialExplanation:
      language === 'ar'
        ? 'الاستعلامات المعلمية تعزل البيانات عن الكود، وتحديد المعدل يحمي الخادم من هجمات الإغراق والتخمين.'
        : 'Parameterized queries separate untrusted input from logic; rate limiting protects endpoints from abuse.',
    objectives: [
      {
        id: 'obj-sqli-defense',
        title: language === 'ar' ? 'تفعيل الاستعلامات المعلمية' : 'Enable Prepared Statements',
        description: language === 'ar' ? 'منع كسر جملة SQL عبر حقول الإدخال' : 'Ensure database driver binds input as data literal',
        isCompleted: usePreparedStatement,
        validationKey: 'sqli_ok',
      },
      {
        id: 'obj-rate-limit',
        title: language === 'ar' ? 'اختبار تحديد المعدل (429)' : 'Test Rate Limit Throttling',
        description: language === 'ar' ? 'إرسال طلبات متتالية لتجاوز حد العتبة' : 'Trigger HTTP 429 response on burst traffic',
        isCompleted: isRateLimited,
        validationKey: 'rate_ok',
      },
    ],
    hints: [
      language === 'ar' ? 'فعل خيار الاستعلامات المعلمية واضغط "إرسال طلبات سريعة (Burst)" لتجاوز حد المعدل.' : 'Enable prepared statements and send burst requests.',
    ],
  };

  const validateChallenge = () => {
    if (usePreparedStatement && isRateLimited) {
      return {
        success: true,
        message:
          language === 'ar'
            ? 'ممتاز! تم إحباط هجوم حقن SQL واختبار بوابة تحديد المعدل بنجاح!'
            : 'SQL Injection neutralized and API Gateway rate limiting verified successfully!',
      };
    }
    return {
      success: false,
      message: language === 'ar' ? 'تحقق من تفعيل الاستعلام المعلمي واختبار تجاوز المعدل.' : 'Verify prepared statements and rate throttling.',
    };
  };

  return (
    <Workspace
      title={language === 'ar' ? 'محاكي أمن تطبيقات الويب (OWASP) وبوابات API Gateway' : 'Web AppSec (OWASP) & API Security Gateway Simulator'}
      subtitle={language === 'ar' ? 'إحباط حقن SQL، ترميز المخرجات، وتحديد معدل الطلبات (HTTP 429)' : 'Parameterized Queries, XSS Sanitization & Rate Limiting Engine'}
      challenge={challenge}
      onValidateChallenge={validateChallenge}
      controlDeck={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendBurstTraffic}
              className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'ar' ? 'إرسال تدفق طلبات سريع (+3 Requests)' : 'Send Burst Traffic (+3)'}</span>
            </button>
            <button
              onClick={() => setRequestCount(0)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={usePreparedStatement}
                onChange={(e) => setUsePreparedStatement(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'استعلامات معلمية (Prepared Statements)' : 'Prepared Statements'}</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              <input
                type="checkbox"
                checked={useOutputEncoding}
                onChange={(e) => setUseOutputEncoding(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500"
              />
              <span>{language === 'ar' ? 'ترميز المخرجات (XSS Defense)' : 'Output HTML Encoding'}</span>
            </label>
          </div>
        </div>
      }
    >
      <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center select-none">
        {/* SQL Injection Comparison Card */}
        <div className="max-w-4xl w-full mb-6 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              {language === 'ar' ? 'اختبار حقن الاستعلامات البرمجية (SQLi Test):' : 'SQL Injection Evaluation:'}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                usePreparedStatement ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}
            >
              {usePreparedStatement ? 'SAFE (Parameter Bound)' : 'VULNERABLE (Raw Concatenation)'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">
              {language === 'ar' ? 'مدخل المستخدم غير الموثوق (User Input):' : 'Untrusted User Input:'}
            </label>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <span className="text-slate-500 block mb-1">{language === 'ar' ? 'الاستعلام المنفذ فعلياً في محرك قاعدة البيانات:' : 'Constructed Database Query:'}</span>
            {usePreparedStatement ? (
              <p className="text-emerald-400">SELECT * FROM accounts WHERE username = $1; -- [PARAM $1 = "{userInput}"]</p>
            ) : (
              <p className="text-rose-400">SELECT * FROM accounts WHERE username = '{userInput}'; -- [INJECTION EXECUTED!]</p>
            )}
          </div>
        </div>

        {/* API Rate Limiter Status */}
        <div className="max-w-4xl w-full p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase block mb-1">
              {language === 'ar' ? 'حالة بوابة تحديد معدل طلبات API (Rate Limiter):' : 'API Gateway Rate Limiter Status:'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">{requestCount} / {rateLimitMax} reqs</span>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isRateLimited ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
                {isRateLimited ? 'HTTP 429 TOO MANY REQUESTS' : 'HTTP 200 OK (ALLOWED)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Workspace>
  );
};
