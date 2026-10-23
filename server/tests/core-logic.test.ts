import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateInvoiceTotals, validateJournalEntry, calculateWeightedAverageCost } from '../utils/accounting';
import { sanitizeSheetValue, desanitizeSheetValue } from '../utils/sanitizer';
import { getNextSequenceId } from '../utils/idGenerator';

test('Invoice calculations: Intra-state split CGST & SGST', () => {
  const result = calculateInvoiceTotals({
    items: [
      { quantity: 2, unitPrice: 1000, discountPercent: 10, taxRatePercent: 18 } // 2000 - 200 = 1800 taxable, 18% tax = 324 (162 CGST + 162 SGST)
    ],
    isInterState: false,
  });

  assert.equal(result.taxableAmount, 1800);
  assert.equal(result.cgstAmount, 162);
  assert.equal(result.sgstAmount, 162);
  assert.equal(result.igstAmount, 0);
  assert.equal(result.totalTax, 324);
  assert.equal(result.grandTotal, 2124);
});

test('Invoice calculations: Inter-state full IGST', () => {
  const result = calculateInvoiceTotals({
    items: [
      { quantity: 5, unitPrice: 500, discountPercent: 0, taxRatePercent: 18 } // 2500 taxable, 18% = 450 IGST
    ],
    isInterState: true,
  });

  assert.equal(result.taxableAmount, 2500);
  assert.equal(result.cgstAmount, 0);
  assert.equal(result.sgstAmount, 0);
  assert.equal(result.igstAmount, 450);
  assert.equal(result.totalTax, 450);
  assert.equal(result.grandTotal, 2950);
});

test('Journal entry validation: Balanced entry passes', () => {
  const balanced = validateJournalEntry([
    { accountId: 'ACC-101', accountName: 'Cash', debit: 5000, credit: 0 },
    { accountId: 'ACC-201', accountName: 'Accounts Receivable', debit: 0, credit: 5000 },
  ]);
  assert.equal(balanced.isValid, true);
  assert.equal(balanced.difference, 0);
});

test('Journal entry validation: Unbalanced entry fails', () => {
  const unbalanced = validateJournalEntry([
    { accountId: 'ACC-101', accountName: 'Cash', debit: 5000, credit: 0 },
    { accountId: 'ACC-201', accountName: 'Accounts Receivable', debit: 0, credit: 4500 },
  ]);
  assert.equal(unbalanced.isValid, false);
  assert.equal(unbalanced.difference, 500);
  assert.match(unbalanced.errorMessage || '', /do not balance/i);
});

test('Stock calculation: Moving average cost calculation', () => {
  // Existing: 10 units @ $100 ($1000)
  // New: 10 units @ $150 ($1500)
  // Total: 20 units @ $2500 / 20 = $125
  const avg = calculateWeightedAverageCost(10, 100, 10, 150);
  assert.equal(avg, 125);
});

test('Formula Injection Sanitization: Escapes spreadsheet formulas', () => {
  assert.equal(sanitizeSheetValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
  assert.equal(sanitizeSheetValue('+12345'), "'+12345");
  assert.equal(sanitizeSheetValue('-CMD'), "'-CMD");
  assert.equal(sanitizeSheetValue('@EVIL'), "'@EVIL");
  assert.equal(sanitizeSheetValue('Normal Customer Name'), 'Normal Customer Name');
  assert.equal(desanitizeSheetValue("'=SUM(A1:A10)"), '=SUM(A1:A10)');
});

test('Sequence generator produces consecutive padded IDs', () => {
  const id1 = getNextSequenceId('TEST');
  const id2 = getNextSequenceId('TEST');
  assert.match(id1, /^TEST-\d{6}$/);
  assert.match(id2, /^TEST-\d{6}$/);
  const num1 = parseInt(id1.split('-')[1], 10);
  const num2 = parseInt(id2.split('-')[1], 10);
  assert.equal(num2, num1 + 1);
});
