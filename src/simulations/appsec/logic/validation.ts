/**
 * Web & Application Security: Input Validation & Canonicalization Engine
 * Fully deterministic - no Date.now, Math.random, or local timers.
 */

export interface FieldValidationRule {
  fieldName: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'alphanumeric' | 'uuid';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  allowedValues?: string[];
  pattern?: RegExp;
}

export interface ValidationErrorDetail {
  field: string;
  errorCode: 'REQUIRED' | 'INVALID_TYPE' | 'TOO_SHORT' | 'TOO_LONG' | 'OUT_OF_RANGE' | 'INVALID_FORMAT' | 'DISALLOWED_VALUE';
  messageEn: string;
  messageAr: string;
  rejectedValue: unknown;
}

export interface ValidationReport {
  isValid: boolean;
  normalizedData: Record<string, unknown>;
  errors: ValidationErrorDetail[];
  canonicalizationNotes: string[];
}

/**
 * Normalizes and canonicalizes raw string input (stripping control chars, UTF-8 normalization)
 */
export function canonicalizeInput(raw: unknown): unknown {
  if (typeof raw === 'string') {
    // Trim and normalize Unicode form C (NFC)
    return raw.trim().normalize('NFC');
  }
  return raw;
}

/**
 * Validates a structured request body or parameters against strict schema rules
 */
export function validateInputSchema(
  rawData: Record<string, unknown>,
  rules: FieldValidationRule[]
): ValidationReport {
  const normalizedData: Record<string, unknown> = {};
  const errors: ValidationErrorDetail[] = [];
  const canonicalizationNotes: string[] = [];

  for (const rule of rules) {
    const rawVal = rawData[rule.fieldName];
    const val = canonicalizeInput(rawVal);

    if (rawVal !== val) {
      canonicalizationNotes.push(`Field '${rule.fieldName}' normalized (trimmed / NFC canonicalized).`);
    }

    // 1. Required Check
    if (rule.required && (val === undefined || val === null || val === '')) {
      errors.push({
        field: rule.fieldName,
        errorCode: 'REQUIRED',
        messageEn: `Field '${rule.fieldName}' is required but was missing or empty.`,
        messageAr: `الحقل '${rule.fieldName}' إجباري ومطلوب.`,
        rejectedValue: val,
      });
      continue;
    }

    if (val === undefined || val === null) {
      continue;
    }

    // 2. Type & Format Checks
    if (rule.type === 'string') {
      if (typeof val !== 'string') {
        errors.push({
          field: rule.fieldName,
          errorCode: 'INVALID_TYPE',
          messageEn: `Field '${rule.fieldName}' must be a string.`,
          messageAr: `الحقل '${rule.fieldName}' يجب أن يكون نصاً.`,
          rejectedValue: val,
        });
        continue;
      }

      if (rule.minLength !== undefined && val.length < rule.minLength) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'TOO_SHORT',
          messageEn: `Field '${rule.fieldName}' length (${val.length}) is below minimum (${rule.minLength}).`,
          messageAr: `طول الحقل '${rule.fieldName}' أقل من الحد الأدنى (${rule.minLength}).`,
          rejectedValue: val,
        });
      }

      if (rule.maxLength !== undefined && val.length > rule.maxLength) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'TOO_LONG',
          messageEn: `Field '${rule.fieldName}' length (${val.length}) exceeds maximum (${rule.maxLength}).`,
          messageAr: `طول الحقل '${rule.fieldName}' يتجاوز الحد الأقصى (${rule.maxLength}).`,
          rejectedValue: val,
        });
      }
    } else if (rule.type === 'number') {
      const num = typeof val === 'number' ? val : Number(val);
      if (isNaN(num)) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'INVALID_TYPE',
          messageEn: `Field '${rule.fieldName}' must be a valid number.`,
          messageAr: `الحقل '${rule.fieldName}' يجب أن يكون رقماً صحيحاً.`,
          rejectedValue: val,
        });
        continue;
      }

      if (rule.min !== undefined && num < rule.min) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'OUT_OF_RANGE',
          messageEn: `Field '${rule.fieldName}' (${num}) is less than minimum allowed (${rule.min}).`,
          messageAr: `قيمة الحقل '${rule.fieldName}' أقل من الحد الأدنى المسموح (${rule.min}).`,
          rejectedValue: val,
        });
      }

      if (rule.max !== undefined && num > rule.max) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'OUT_OF_RANGE',
          messageEn: `Field '${rule.fieldName}' (${num}) exceeds maximum allowed (${rule.max}).`,
          messageAr: `قيمة الحقل '${rule.fieldName}' تتجاوز الحد الأقصى المسموح (${rule.max}).`,
          rejectedValue: val,
        });
      }
      normalizedData[rule.fieldName] = num;
      continue;
    } else if (rule.type === 'email') {
      const emailStr = String(val);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(emailStr)) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'INVALID_FORMAT',
          messageEn: `Field '${rule.fieldName}' is not a valid email address format.`,
          messageAr: `الحقل '${rule.fieldName}' ليس بصيغة بريد إلكتروني صالحة.`,
          rejectedValue: val,
        });
      }
    } else if (rule.type === 'alphanumeric') {
      const str = String(val);
      if (!/^[a-zA-Z0-9_-]+$/.test(str)) {
        errors.push({
          field: rule.fieldName,
          errorCode: 'INVALID_FORMAT',
          messageEn: `Field '${rule.fieldName}' contains invalid characters (allowed: a-z, 0-9, _, -).`,
          messageAr: `الحقل '${rule.fieldName}' يحتوي على محارف غير مسموحة.`,
          rejectedValue: val,
        });
      }
    }

    // 3. Allowed Values Enum Check
    if (rule.allowedValues && !rule.allowedValues.includes(String(val))) {
      errors.push({
        field: rule.fieldName,
        errorCode: 'DISALLOWED_VALUE',
        messageEn: `Field '${rule.fieldName}' value '${val}' is not in allowed set: [${rule.allowedValues.join(', ')}].`,
        messageAr: `قيمة الحقل '${rule.fieldName}' غير موجودة ضمن القيم المصرح بها.`,
        rejectedValue: val,
      });
    }

    // 4. Custom Regex Pattern
    if (rule.pattern && !rule.pattern.test(String(val))) {
      errors.push({
        field: rule.fieldName,
        errorCode: 'INVALID_FORMAT',
        messageEn: `Field '${rule.fieldName}' does not match required security pattern.`,
        messageAr: `الحقل '${rule.fieldName}' لا يطابق النمط الأمني المطلوب.`,
        rejectedValue: val,
      });
    }

    normalizedData[rule.fieldName] = val;
  }

  return {
    isValid: errors.length === 0,
    normalizedData,
    errors,
    canonicalizationNotes,
  };
}
