/**
 * Web & Application Security: SQL Injection Defense & Parameterized Query Logic
 * Educational & safe concept simulator - no real target tooling.
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface SqlQueryPlan {
  mode: 'UNSAFE_CONCATENATION' | 'PARAMETERIZED_PREPARED_STATEMENT';
  rawQueryText: string;
  parameters: unknown[];
  structureAltered: boolean;
  injectedTokens: string[];
  syntaxTreeTokens: string[];
  safetyAnalysisEn: string;
  safetyAnalysisAr: string;
}

export interface MockDatabaseRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
}

export const MOCK_ORDERS_DATABASE: MockDatabaseRecord[] = [
  { id: '1', orderNumber: '1001', customerName: 'Alice Corp', amount: 14500, status: 'Shipped' },
  { id: '2', orderNumber: '1002', customerName: 'Bob Retail', amount: 3200, status: 'Processing' },
  { id: '3', orderNumber: '1003', customerName: 'Sara Finance', amount: 8900, status: 'Completed' },
  { id: '4', orderNumber: '1004', customerName: 'Nexora Internal', amount: 50000, status: 'Secret Vault' },
];

/**
 * Builds an unsafe query via string concatenation (demonstration of flaw)
 */
export function buildUnsafeQueryConcept(userInput: string): SqlQueryPlan {
  const rawQuery = `SELECT * FROM orders WHERE order_number = '${userInput}'`;
  const { altered, tokens, injected } = detectQueryStructureChange(userInput);

  return {
    mode: 'UNSAFE_CONCATENATION',
    rawQueryText: rawQuery,
    parameters: [],
    structureAltered: altered,
    injectedTokens: injected,
    syntaxTreeTokens: tokens,
    safetyAnalysisEn: altered
      ? 'VULNERABILITY DETECTED: Untrusted input altered the SQL AST token stream. Data crossed the execution boundary into code.'
      : 'Unsafe concatenation pattern used. Even if benign, this pattern is inherently vulnerable.',
    safetyAnalysisAr: altered
      ? 'تم رصد ثغرة حقن: تلاعبت المدخلات غير الموثوقة ببنية الاستعلام وتحولت البيانات إلى كود تنفيذي.'
      : 'تم استخدام نمط الدمج غير الآمن، وهو نمط ضعيف وعرضة للاستغلال.',
  };
}

/**
 * Builds a secure parameterized query (Prepared Statement)
 */
export function buildParameterizedQuery(userInput: string): SqlQueryPlan {
  const preparedQuery = `SELECT * FROM orders WHERE order_number = $1`;

  return {
    mode: 'PARAMETERIZED_PREPARED_STATEMENT',
    rawQueryText: preparedQuery,
    parameters: [userInput],
    structureAltered: false,
    injectedTokens: [],
    syntaxTreeTokens: ['SELECT', '*', 'FROM', 'orders', 'WHERE', 'order_number', '=', '$1'],
    safetyAnalysisEn:
      'SECURE: Database engine compiles SQL syntax before binding data. Untrusted input remains pure data and cannot alter query structure.',
    safetyAnalysisAr:
      'آمن: محرك قاعدة البيانات يحلل بناء الاستعلام مسبقاً، وتبقى مدخلات المستخدم بيانات نقية يستحيل أن تتحول لأوامر.',
  };
}

/**
 * Inspects whether user input breaks quotation boundaries and injects SQL clauses
 */
export function detectQueryStructureChange(input: string): {
  altered: boolean;
  tokens: string[];
  injected: string[];
} {
  const lower = input.toLowerCase();
  const sqlKeywords = ["' or '", "' or 1=1", "or 1=1", "union select", "--", ";", "drop table", "admin'--", "1' or '1'='1"];

  const injected: string[] = [];
  for (const kw of sqlKeywords) {
    if (lower.includes(kw)) {
      injected.push(kw);
    }
  }

  const hasQuotes = input.includes("'") || input.includes('"');
  const hasLogicalOps = lower.includes(' or ') || lower.includes(' union ') || lower.includes('--');
  const altered = (hasQuotes && hasLogicalOps) || injected.length > 0;

  const tokens = ['SELECT', '*', 'FROM', 'orders', 'WHERE', 'order_number', '='];
  if (altered) {
    tokens.push("''", 'OR', '1=1', '-- (Injected AST modification)');
  } else {
    tokens.push(`'${input}'`);
  }

  return { altered, tokens, injected };
}

/**
 * Safe simulated query execution against synthetic database
 */
export function executeSimulatedQuery(
  plan: SqlQueryPlan,
  input: string
): { rows: MockDatabaseRecord[]; executionTimeMs: number } {
  if (plan.mode === 'PARAMETERIZED_PREPARED_STATEMENT') {
    // Exact match lookup
    const rows = MOCK_ORDERS_DATABASE.filter((o) => o.orderNumber === input.trim());
    return { rows, executionTimeMs: 12 };
  }

  // Unsafe mode simulation
  if (plan.structureAltered) {
    // Tautology simulated - dumps all rows!
    return { rows: [...MOCK_ORDERS_DATABASE], executionTimeMs: 18 };
  }

  const rows = MOCK_ORDERS_DATABASE.filter((o) => o.orderNumber === input.trim());
  return { rows, executionTimeMs: 15 };
}
