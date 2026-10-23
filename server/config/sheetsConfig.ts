/**
 * Google Sheets Configuration and Credential Manager
 * Supports environment variables, live Google Cloud Service Account connections,
 * and seamless fallback to Demo Mode when credentials are not yet supplied.
 */

import dotenv from 'dotenv';
dotenv.config();

export interface SheetsConfig {
  serviceAccountEmail?: string;
  privateKey?: string;
  spreadsheetId?: string;
  keyFilePath?: string;
  isConfigured: boolean;
  mode: 'live' | 'demo';
}

function formatPrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined;
  // Handle escaped newlines from environment variables or .env files
  return rawKey.replace(/\\n/g, '\n');
}

export function getSheetsConfig(): SheetsConfig {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();

  const privateKey = formatPrivateKey(rawKey);

  const hasCredentials = Boolean(
    (serviceAccountEmail && privateKey && spreadsheetId) ||
    (keyFilePath && spreadsheetId)
  );

  return {
    serviceAccountEmail,
    privateKey,
    spreadsheetId,
    keyFilePath,
    isConfigured: hasCredentials,
    mode: hasCredentials ? 'live' : 'demo',
  };
}
