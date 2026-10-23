/**
 * Google Sheets API v4 Service
 * Handles authenticated communication with Google Cloud Sheets API,
 * schema validation, worksheet initialization, and batch reads/writes.
 */

import { google, sheets_v4 } from 'googleapis';
import { getSheetsConfig } from '../config/sheetsConfig';
import { ERP_WORKSHEETS } from './schema';
import { sanitizeSheetValue } from '../utils/sanitizer';

export interface SheetsHealthStatus {
  connected: boolean;
  mode: 'live' | 'demo';
  spreadsheetId?: string;
  spreadsheetTitle?: string;
  totalWorksheets: number;
  expectedWorksheets: number;
  missingWorksheets: string[];
  lastChecked: string;
  error?: string;
}

export class GoogleSheetsService {
  private sheetsClient: sheets_v4.Sheets | null = null;
  private authClient: InstanceType<typeof google.auth.JWT> | null = null;

  constructor() {
    this.initClient();
  }

  public initClient(): boolean {
    const config = getSheetsConfig();
    if (!config.isConfigured) {
      this.sheetsClient = null;
      this.authClient = null;
      return false;
    }

    try {
      this.authClient = new google.auth.JWT({
        email: config.serviceAccountEmail,
        key: config.privateKey,
        keyFile: config.keyFilePath,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.readonly',
        ],
      });

      this.sheetsClient = google.sheets({
        version: 'v4',
        auth: this.authClient,
      });

      return true;
    } catch (err: unknown) {
      console.error('Failed to initialize Google Sheets client:', err);
      this.sheetsClient = null;
      return false;
    }
  }

  public isLive(): boolean {
    return this.sheetsClient !== null && getSheetsConfig().isConfigured;
  }

  /**
   * Health check and connectivity test
   */
  public async testConnection(): Promise<SheetsHealthStatus> {
    const config = getSheetsConfig();
    const timestamp = new Date().toISOString();

    if (!config.isConfigured || !this.sheetsClient || !config.spreadsheetId) {
      return {
        connected: false,
        mode: 'demo',
        expectedWorksheets: ERP_WORKSHEETS.length,
        totalWorksheets: 0,
        missingWorksheets: ERP_WORKSHEETS.map(w => w.name),
        lastChecked: timestamp,
        error: 'Google Cloud service account or Spreadsheet ID is not configured. Running in Demo Mode with built-in operational repository.',
      };
    }

    try {
      const response = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: config.spreadsheetId,
      });

      const existingSheets = response.data.sheets?.map(s => s.properties?.title || '').filter(Boolean) || [];
      const missingWorksheets = ERP_WORKSHEETS
        .map(w => w.name)
        .filter(expected => !existingSheets.includes(expected));

      return {
        connected: true,
        mode: 'live',
        spreadsheetId: config.spreadsheetId,
        spreadsheetTitle: response.data.properties?.title || 'OmniERP Live Database',
        totalWorksheets: existingSheets.length,
        expectedWorksheets: ERP_WORKSHEETS.length,
        missingWorksheets,
        lastChecked: timestamp,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        connected: false,
        mode: 'demo',
        spreadsheetId: config.spreadsheetId,
        expectedWorksheets: ERP_WORKSHEETS.length,
        totalWorksheets: 0,
        missingWorksheets: ERP_WORKSHEETS.map(w => w.name),
        lastChecked: timestamp,
        error: `Failed to connect to Google Sheets: ${errorMsg}`,
      };
    }
  }

  /**
   * Creates missing worksheets and writes column headers without touching existing records
   */
  public async initializeSpreadsheet(): Promise<{ success: boolean; createdSheets: string[]; message: string }> {
    const config = getSheetsConfig();
    if (!this.isLive() || !this.sheetsClient || !config.spreadsheetId) {
      return {
        success: false,
        createdSheets: [],
        message: 'Cannot initialize live Google Sheets: Service account is not configured.',
      };
    }

    try {
      const meta = await this.sheetsClient.spreadsheets.get({
        spreadsheetId: config.spreadsheetId,
      });

      const existingSheets = new Set(
        meta.data.sheets?.map(s => s.properties?.title || '').filter(Boolean) || []
      );

      const createdSheets: string[] = [];
      const sheetsToAdd = ERP_WORKSHEETS.filter(w => !existingSheets.has(w.name));

      // 1. Batch create missing sheet tabs
      if (sheetsToAdd.length > 0) {
        const requests = sheetsToAdd.map(sheet => ({
          addSheet: {
            properties: {
              title: sheet.name,
              gridProperties: {
                rowCount: 1000,
                columnCount: Math.max(sheet.columns.length + 2, 26),
                frozenRowCount: 1,
              },
            },
          },
        }));

        await this.sheetsClient.spreadsheets.batchUpdate({
          spreadsheetId: config.spreadsheetId,
          requestBody: { requests },
        });

        createdSheets.push(...sheetsToAdd.map(s => s.name));
      }

      // 2. Add header rows to sheets that don't have row 1 populated
      const headerUpdates: sheets_v4.Schema$ValueRange[] = [];
      for (const sheetDef of ERP_WORKSHEETS) {
        // Read row 1 to see if header already exists
        const checkHeader = await this.sheetsClient.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: `'${sheetDef.name}'!A1:Z1`,
        });

        if (!checkHeader.data.values || checkHeader.data.values.length === 0) {
          headerUpdates.push({
            range: `'${sheetDef.name}'!A1:${String.fromCharCode(65 + sheetDef.columns.length - 1)}1`,
            values: [sheetDef.columns],
          });
        }
      }

      if (headerUpdates.length > 0) {
        await this.sheetsClient.spreadsheets.values.batchUpdate({
          spreadsheetId: config.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: headerUpdates,
          },
        });
      }

      return {
        success: true,
        createdSheets,
        message: `Successfully verified and synchronized all ${ERP_WORKSHEETS.length} worksheets in Google Sheets.`,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        createdSheets: [],
        message: `Initialization failed: ${message}`,
      };
    }
  }

  /**
   * Append a record to a worksheet with formula-injection sanitization
   */
  public async appendRecord(sheetName: string, record: Record<string, unknown>): Promise<boolean> {
    const config = getSheetsConfig();
    if (!this.isLive() || !this.sheetsClient || !config.spreadsheetId) {
      return false;
    }

    const sheetDef = ERP_WORKSHEETS.find(w => w.name.toLowerCase() === sheetName.toLowerCase());
    if (!sheetDef) return false;

    const rowValues = sheetDef.columns.map(col => sanitizeSheetValue(record[col]));

    try {
      await this.sheetsClient.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: `'${sheetDef.name}'!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues],
        },
      });
      return true;
    } catch (err: unknown) {
      console.error(`Error appending to ${sheetName}:`, err);
      return false;
    }
  }

  /**
   * Read all records from a worksheet
   */
  public async readRecords(sheetName: string): Promise<Record<string, unknown>[]> {
    const config = getSheetsConfig();
    if (!this.isLive() || !this.sheetsClient || !config.spreadsheetId) {
      return [];
    }

    const sheetDef = ERP_WORKSHEETS.find(w => w.name.toLowerCase() === sheetName.toLowerCase());
    if (!sheetDef) return [];

    try {
      const res = await this.sheetsClient.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `'${sheetDef.name}'!A:Z`,
      });

      const rows = res.data.values || [];
      if (rows.length < 2) return [];

      const headers = rows[0].map(h => String(h).trim());
      const records: Record<string, unknown>[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] ?? '';
        });
        records.push(obj);
      }

      return records;
    } catch (err: unknown) {
      console.error(`Error reading ${sheetName}:`, err);
      return [];
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
