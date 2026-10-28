import React, { useState, useMemo } from 'react';
import {
  Code,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Terminal,
  Play,
  Layers,
  Lock,
  Unlock,
  RefreshCw,
  Cpu,
  FileJson,
  Activity,
} from 'lucide-react';

interface GraphQLApiLabProps {
  language?: 'ar' | 'en';
}

interface GraphQLScenario {
  id: string;
  nameEn: string;
  nameAr: string;
  category: 'CIRCULAR_DOS' | 'INTROSPECTION' | 'FIELD_AUTH_BYPASS' | 'BATCHING';
  descriptionEn: string;
  descriptionAr: string;
  queryPayload: string;
  queryDepth: number;
  calculatedCost: number;
  unauthorizedFieldExfiltrated?: string;
}

const GRAPHQL_SCENARIOS: GraphQLScenario[] = [
  {
    id: 'GQL-01',
    nameEn: 'Deeply Nested Circular Query (DoS)',
    nameAr: 'الاستعلام الدائري المتداخل عميقاً (حرمان الخدمة)',
    category: 'CIRCULAR_DOS',
    descriptionEn: 'An attacker submits a 12-layer deep recursive query expanding users and friends relationships, forcing exponential SQL joins and thread pool exhaustion.',
    descriptionAr: 'يرسل المهاجم استعلامًا متداخلًا بعمق 12 طبقة يوسع علاقات الأصدقاء، مما يجبر الخادم على عمليات ربط SQL أصلية وإجهاد خيوط التنفيذ.',
    queryPayload: `query RecursiveFriendsDoSHash {
  user(id: "usr_102") {
    name
    friends {
      name
      friends {
        name
        friends {
          name
          posts {
            title
            author {
              friends {
                name
              }
            }
          }
        }
      }
    }
  }
}`,
    queryDepth: 12,
    calculatedCost: 840,
  },
  {
    id: 'GQL-02',
    nameEn: 'Schema Introspection Abuse',
    nameAr: 'إساءة استخدام الاستكشاف الذاتي للمخطط (Introspection)',
    category: 'INTROSPECTION',
    descriptionEn: 'Querying internal __schema types to discover hidden mutations, legacy admin endpoints, and unreleased feature flags.',
    descriptionAr: 'استعلام الأنواع الداخلية __schema لاكتشاف التعديلات المخفية، ونقاط نهاية الإدارة القديمة، وميزات التكوين غير المعروضة.',
    queryPayload: `query IntrospectionFullSchemaDump {
  __schema {
    types {
      name
      fields {
        name
        type { name kind }
        args { name type { name } }
      }
    }
    mutationType { name }
  }
}`,
    queryDepth: 3,
    calculatedCost: 45,
    unauthorizedFieldExfiltrated: 'Exposed 42 internal types: AdminSystemConfig, InternalPayrollMutation, RootOwnerBypassKey',
  },
  {
    id: 'GQL-03',
    nameEn: 'Field-Level Authorization Bypass',
    nameAr: 'تجاوز الصلاحيات على مستوى الحقل (Field-Level RBAC)',
    category: 'FIELD_AUTH_BYPASS',
    descriptionEn: 'Querying restricted sensitive fields (ssn, salary, internalNote) directly on public User type where field resolvers lack authorization checks.',
    descriptionAr: 'استعلام عن الحقول الحساسة المحظورة (ssn, salary, internalNote) مباشرة على نوع المستهلك حيث تفتقر الموزعات إلى تدقيق الصلاحيات.',
    queryPayload: `query PublicUserWithSensitiveFields {
  user(id: "usr_5502") {
    id
    username
    email
    ssn
    salary
    internalSecurityClearance
  }
}`,
    queryDepth: 2,
    calculatedCost: 15,
    unauthorizedFieldExfiltrated: 'ssn: "992-10-8841", salary: $185,000, internalSecurityClearance: "LEVEL_5"',
  },
  {
    id: 'GQL-04',
    nameEn: 'Query Batching & Rate Limit Evasion',
    nameAr: 'تجميد الاستعلامات والالتفاف على تحديد المعدل (Batching)',
    category: 'BATCHING',
    descriptionEn: 'Sending an array of 250 distinct alias queries in a single HTTP POST request to brute-force user OTPs without triggering endpoint rate limiters.',
    descriptionAr: 'إرسال مصفوفة من 250 استعلامًا بأسماء مستعارة فريدة في طلب POST واحد للتخمين دون إثارة أجهزة تحديد المعدل.',
    queryPayload: `[
  { "query": "mutation { verifyOtp(code: \"0001\") { token } }" },
  { "query": "mutation { verifyOtp(code: \"0002\") { token } }" },
  { "query": "mutation { verifyOtp(code: \"0003\") { token } }" },
  /* ... 247 additional batched query payloads ... */
]`,
    queryDepth: 2,
    calculatedCost: 500,
  },
];

export const GraphQLApiLab: React.FC<GraphQLApiLabProps> = ({ language = 'en' }) => {
  const isAr = language === 'ar';

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('GQL-01');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseLog, setResponseLog] = useState<{
    status: 'SUCCESS' | 'BLOCKED' | 'ERROR';
    rawJsonResponse: string;
    depth: number;
    cost: number;
    activeDefenses: string[];
  } | null>(null);

  // Security Guardrail Toggles
  const [guardDepthLimit, setGuardDepthLimit] = useState<boolean>(false);
  const [guardDisableIntrospection, setGuardDisableIntrospection] = useState<boolean>(false);
  const [guardFieldRbac, setGuardFieldRbac] = useState<boolean>(false);
  const [guardMaxCost, setGuardMaxCost] = useState<boolean>(false);

  const scenario = useMemo(
    () => GRAPHQL_SCENARIOS.find((s) => s.id === selectedScenarioId) || GRAPHQL_SCENARIOS[0],
    [selectedScenarioId]
  );

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    setResponseLog(null);

    setTimeout(() => {
      const activeDefenses: string[] = [];
      let isBlocked = false;
      let blockReason = '';

      if (scenario.category === 'CIRCULAR_DOS') {
        if (guardDepthLimit && scenario.queryDepth > 4) {
          activeDefenses.push('Query Depth Limiter (Max Depth = 4)');
          isBlocked = true;
          blockReason = isAr
            ? 'تم حظر الاستعلام: تجاوز الحد الأقصى لعمق الشجرة (تأتي بعمق 12 بينما المسموح 4).'
            : 'GRAPHQL_MAX_DEPTH_EXCEEDED: Query depth of 12 exceeds configured maximum limit of 4.';
        } else if (guardMaxCost && scenario.calculatedCost > 100) {
          activeDefenses.push('Query Cost Enforcer (Max Cost = 100)');
          isBlocked = true;
          blockReason = isAr
            ? 'تم حظر الاستعلام: تجاوز الحد الأقصى لتكلفة التعقيد (840 نقطة، المسموح 100).'
            : 'GRAPHQL_QUERY_COST_EXCEEDED: Query complexity score of 840 exceeds limit of 100.';
        }
      } else if (scenario.category === 'INTROSPECTION') {
        if (guardDisableIntrospection) {
          activeDefenses.push('Disable Schema Introspection Guard');
          isBlocked = true;
          blockReason = isAr
            ? 'تم حظر استعلام المخطط: تم إيقاف الميزة __schema في بيئة الإنتاج.'
            : 'GRAPHQL_INTROSPECTION_DISABLED: Schema introspection is prohibited in production.';
        }
      } else if (scenario.category === 'FIELD_AUTH_BYPASS') {
        if (guardFieldRbac) {
          activeDefenses.push('Field-Level Resolver RBAC Enforcer');
          isBlocked = true;
          blockReason = isAr
            ? 'تم حجب الحقول الحساسة: يفتقر المستخدم الحالم إلى الصلاحيات للوصول إلى [ssn, salary].'
            : 'GRAPHQL_FIELD_UNAUTHORIZED: Access to sensitive fields [ssn, salary, internalSecurityClearance] denied by field resolver RBAC.';
        }
      } else if (scenario.category === 'BATCHING') {
        if (guardMaxCost) {
          activeDefenses.push('Batching & Query Multiplexing Guard');
          isBlocked = true;
          blockReason = isAr
            ? 'تم حظر الطلب المجمّع: يتجاوز الحد المسموح للعمليات في الطلب الواحد.'
            : 'GRAPHQL_BATCH_LIMIT_EXCEEDED: Batch payload contains 250 operations (max allowed = 5).';
        }
      }

      if (isBlocked) {
        setResponseLog({
          status: 'BLOCKED',
          rawJsonResponse: JSON.stringify(
            {
              errors: [
                {
                  message: blockReason,
                  extensions: {
                    code: 'SECURITY_GUARDRAIL_INTERCEPT',
                    timestamp: new Date().toISOString(),
                    activeDefenses,
                  },
                },
              ],
            },
            null,
            2
          ),
          depth: scenario.queryDepth,
          cost: scenario.calculatedCost,
          activeDefenses,
        });
      } else {
        let simulatedData: any = {};
        if (scenario.category === 'CIRCULAR_DOS') {
          simulatedData = { user: { id: 'usr_102', friends: [{ friends: [{ friends: [{ posts: '...' }] }] }] } };
        } else if (scenario.category === 'INTROSPECTION') {
          simulatedData = { __schema: { types: [{ name: 'AdminSystemConfig' }, { name: 'RootOwnerBypassKey' }] } };
        } else if (scenario.category === 'FIELD_AUTH_BYPASS') {
          simulatedData = { user: { id: 'usr_5502', username: 'alex', email: 'alex@corp.com', ssn: '992-10-8841', salary: 185000 } };
        } else {
          simulatedData = { batchResults: Array(250).fill({ status: 'INVALID_OTP' }) };
        }

        setResponseLog({
          status: 'SUCCESS',
          rawJsonResponse: JSON.stringify({ data: simulatedData }, null, 2),
          depth: scenario.queryDepth,
          cost: scenario.calculatedCost,
          activeDefenses: [],
        });
      }

      setIsExecuting(false);
    }, 350);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4 font-mono select-none">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              {isAr ? 'مختبر أمان واستغلال APIs ببروتوكول GraphQL' : 'GraphQL & Modern API Security Laboratory'}
              <span className="px-2 py-0.5 text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800 rounded-full font-mono">
                OWASP API Top 10
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة تفاعلية للهجمات الدائرية، وتسريب المخططات، والتفاف حقول الصلاحيات، وآليات الحماية المتقدمة.'
                : 'Interactive simulation of query depth exhaustion, introspection leaks, field-level auth bypass, and cost-based guardrails.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {isAr ? 'بروتوكول الواجهة:' : 'API Gateway:'} <strong className="text-cyan-400">GraphQL / Apollo Server v4</strong>
          </span>
        </div>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Left Column: Attack Vector Selector + Guardrails */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            {isAr ? 'سيناريوهات ثغرات GraphQL' : 'GraphQL Attack Scenarios'}
          </h3>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {GRAPHQL_SCENARIOS.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenarioId(sc.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 text-slate-100 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{sc.id}</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-slate-900 border border-slate-800 text-slate-300 rounded uppercase font-semibold">
                      Depth: {sc.queryDepth} | Cost: {sc.calculatedCost}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-200">{isAr ? sc.nameAr : sc.nameEn}</span>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Defense Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
              <Shield className="w-4 h-4 text-emerald-400" />
              {isAr ? 'درع الأمان وتدابير GraphQL' : 'GraphQL Defense Guardrails'}
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تحديد عمق الشجرة (Max Depth = 4)' : 'Query Depth Limiter (Max Depth: 4)'}</span>
                <input
                  type="checkbox"
                  checked={guardDepthLimit}
                  onChange={(e) => setGuardDepthLimit(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تعطيل الاستكشاف (__schema)' : 'Disable Introspection in Production'}</span>
                <input
                  type="checkbox"
                  checked={guardDisableIntrospection}
                  onChange={(e) => setGuardDisableIntrospection(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'فحص حقول الصلاحيات (Field RBAC)' : 'Field Resolver Access Control'}</span>
                <input
                  type="checkbox"
                  checked={guardFieldRbac}
                  onChange={(e) => setGuardFieldRbac(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded cursor-pointer hover:border-slate-700">
                <span className="text-slate-300">{isAr ? 'تحليل التكلفة القصوى (Max Cost = 100)' : 'Query Cost Complexity Enforcer'}</span>
                <input
                  type="checkbox"
                  checked={guardMaxCost}
                  onChange={(e) => setGuardMaxCost(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: GraphQL Query Editor & Server Response Terminal */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              {isAr ? 'محرر الاستعلامات والبيانات الموجهة' : 'GraphQL Query Workbench'}
            </h3>
            <button
              onClick={handleExecuteQuery}
              disabled={isExecuting}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold transition-all flex items-center gap-2 shadow border border-cyan-400/30 disabled:opacity-50"
            >
              {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isAr ? 'تنفيذ الاستعلام' : 'Execute Query'}
            </button>
          </div>

          {/* GraphQL Query Payload View */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                {isAr ? 'حمولة GraphQL (POST /graphql)' : 'GraphQL Payload'}
              </span>
              <span className="text-slate-500">
                Calculated Depth: <strong className="text-cyan-400">{scenario.queryDepth}</strong> | Complexity Cost:{' '}
                <strong className="text-amber-400">{scenario.calculatedCost}</strong>
              </span>
            </div>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded text-cyan-300 text-xs font-mono overflow-x-auto max-h-[180px]">
              {scenario.queryPayload}
            </pre>
          </div>

          {/* Response Terminal */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col space-y-3 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-slate-400" />
                {isAr ? 'استجابة خادم GraphQL (Server Response)' : 'GraphQL Gateway Response'}
              </span>
              {responseLog && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    responseLog.status === 'BLOCKED'
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950 border border-rose-800 text-rose-300'
                  }`}
                >
                  {responseLog.status}
                </span>
              )}
            </div>

            {responseLog ? (
              <pre
                className={`p-3 rounded border text-xs font-mono overflow-x-auto max-h-[220px] ${
                  responseLog.status === 'BLOCKED'
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/80 text-slate-200'
                }`}
              >
                {responseLog.rawJsonResponse}
              </pre>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-8">
                <Activity className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs">
                  {isAr
                    ? 'انقر على "تنفيذ الاستعلام" لمعاينة استجابة خادم GraphQL أو اختبار دروع الحماية المفعلة.'
                    : 'Click "Execute Query" to inspect GraphQL response or test depth/cost limits.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
