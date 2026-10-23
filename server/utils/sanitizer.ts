/**
 * Google Sheets and CSV Formula Injection Sanitizer
 * Spreadsheet formula injection (CSV Injection) occurs when untrusted input
 * starts with '=', '+', '-', '@', tab, or carriage return.
 */

export function sanitizeSheetValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const str = String(value).trim();
  if (str.length === 0) return '';

  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousPrefixes.some(prefix => str.startsWith(prefix))) {
    // Prefix with single quote so spreadsheet engines treat it as plain literal text
    return `'${str}`;
  }

  return str;
}

export function sanitizeRowData(row: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(row)) {
    sanitized[key] = sanitizeSheetValue(val);
  }
  return sanitized;
}

export function desanitizeSheetValue(val: unknown): string {
  if (typeof val === 'string' && val.startsWith("'") && ['=', '+', '-', '@'].includes(val.charAt(1))) {
    return val.substring(1);
  }
  return String(val ?? '');
}
