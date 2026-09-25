/**
 * Web & Application Security: Cross-Site Scripting (XSS) Contexts & Encoding Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export type XssContext = 'HTML_BODY' | 'HTML_ATTRIBUTE' | 'JAVASCRIPT_STRING' | 'URL_HREF';

export interface ContextEncodingResult {
  rawInput: string;
  context: XssContext;
  encodedOutput: string;
  rawWouldExecute: boolean;
  sanitizedSafe: boolean;
  domInterpretationEn: string;
  domInterpretationAr: string;
  renderedHtmlSnippet: string;
}

/**
 * Encodes special characters for HTML Body text context
 */
export function encodeForHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Encodes special characters for HTML attribute context e.g. <input value="...">
 */
export function encodeForAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#x60;');
}

/**
 * Encodes for JavaScript string context e.g. let name = "...";
 */
export function encodeForJs(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Encodes and validates for URL / href context
 */
export function encodeForUrl(input: string): string {
  const trimmed = input.trim().toLowerCase();
  // Neutralize dangerous schemes
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return 'about:blank';
  }
  return encodeURI(input);
}

/**
 * Evaluates safe vs unsafe rendering across different contexts
 */
export function validateRenderedContext(
  input: string,
  context: XssContext,
  applyEncoding: boolean
): ContextEncodingResult {
  let encodedOutput = input;
  let rawWouldExecute = false;
  let domInterpretationEn = '';
  let domInterpretationAr = '';
  let renderedHtmlSnippet = '';

  const lower = input.toLowerCase();

  switch (context) {
    case 'HTML_BODY': {
      rawWouldExecute = lower.includes('<script') || lower.includes('<img') || lower.includes('<svg') || lower.includes('onload=') || lower.includes('onerror=');
      encodedOutput = applyEncoding ? encodeForHtml(input) : input;
      renderedHtmlSnippet = `<div>Search results for: <span>${encodedOutput}</span></div>`;

      if (!applyEncoding && rawWouldExecute) {
        domInterpretationEn = 'VULNERABILITY: Browser parser creates executable HTML/script element inside DOM.';
        domInterpretationAr = 'ثغرة: محلل المتصفح ينشئ وسماً برمجياً تنفيذياً داخل شجرة DOM.';
      } else {
        domInterpretationEn = 'SECURE: All HTML meta-characters are entity-encoded. Rendered purely as visible text.';
        domInterpretationAr = 'آمن: تم ترميز المحارف الخاصة ككيانات نصية، وتعرض كنص بحت بدون تنفيذ.';
      }
      break;
    }

    case 'HTML_ATTRIBUTE': {
      rawWouldExecute = input.includes('"') || input.includes("'") || lower.includes('onfocus') || lower.includes('autofocus');
      encodedOutput = applyEncoding ? encodeForAttribute(input) : input;
      renderedHtmlSnippet = `<input type="text" name="username" value="${encodedOutput}">`;

      if (!applyEncoding && rawWouldExecute) {
        domInterpretationEn = 'VULNERABILITY: Input breaks out of attribute quotation and injects new event handlers.';
        domInterpretationAr = 'ثغرة: تخترق المدخلات علامات التنصيص وتضيف معالجات أحداث تنفيذية.';
      } else {
        domInterpretationEn = 'SECURE: Attribute quotes are preserved and encoded. Data remains inside attribute value.';
        domInterpretationAr = 'آمن: علامات التنصيص محمية وتبقى القيمة محصورة داخل السمة.';
      }
      break;
    }

    case 'JAVASCRIPT_STRING': {
      rawWouldExecute = input.includes('"') || input.includes("'") || input.includes('</script>') || input.includes(';');
      encodedOutput = applyEncoding ? encodeForJs(input) : input;
      renderedHtmlSnippet = `<script>\n  const userQuery = "${encodedOutput}";\n  console.log(userQuery);\n</script>`;

      if (!applyEncoding && rawWouldExecute) {
        domInterpretationEn = 'VULNERABILITY: Input terminates string literal and executes arbitrary JavaScript statements.';
        domInterpretationAr = 'ثغرة: تخترق المدخلات النص البرمجي وتنفذ تعليمات JavaScript غير مصرحة.';
      } else {
        domInterpretationEn = 'SECURE: JavaScript Unicode escaping prevents escaping string literal boundary.';
        domInterpretationAr = 'آمن: ترميز Unicode يمنع كسر حدود النص البرمجي في جافاسكريبت.';
      }
      break;
    }

    case 'URL_HREF': {
      rawWouldExecute = lower.startsWith('javascript:') || lower.startsWith('data:');
      encodedOutput = applyEncoding ? encodeForUrl(input) : input;
      renderedHtmlSnippet = `<a href="${encodedOutput}">Click here to view link</a>`;

      if (!applyEncoding && rawWouldExecute) {
        domInterpretationEn = 'VULNERABILITY: Pseudo-protocol javascript: executes code immediately when clicked.';
        domInterpretationAr = 'ثغرة: بروتوكول javascript: الوهمي ينفذ الأكواد فور الضغط على الرابط.';
      } else {
        domInterpretationEn = 'SECURE: Dangerous pseudo-protocols stripped or validated against allowlist (https://).';
        domInterpretationAr = 'آمن: تم حظر البروتوكولات الوهمية الخطيرة وحصر الروابط في النطاقات الآمنة.';
      }
      break;
    }
  }

  return {
    rawInput: input,
    context,
    encodedOutput,
    rawWouldExecute,
    sanitizedSafe: applyEncoding || !rawWouldExecute,
    domInterpretationEn,
    domInterpretationAr,
    renderedHtmlSnippet,
  };
}
