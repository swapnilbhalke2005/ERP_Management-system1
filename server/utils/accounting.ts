/**
 * Financial and Accounting Math Utilities
 * Precision decimal arithmetic, GST tax calculations, and double-entry validation
 */

export interface TaxCalculationResult {
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTax: number;
  discountAmount: number;
  grandTotal: number;
}

export interface TaxCalculationParams {
  items: Array<{
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRatePercent?: number;
  }>;
  isInterState?: boolean; // If true: IGST; if false: CGST + SGST split 50/50
  orderDiscountPercent?: number;
  orderDiscountFixed?: number;
}

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function calculateInvoiceTotals(params: TaxCalculationParams): TaxCalculationResult {
  let subtotal = 0;
  let itemLevelDiscount = 0;
  let calculatedTax = 0;

  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  for (const item of params.items) {
    const rawLineTotal = item.quantity * item.unitPrice;
    const discount = item.discountPercent ? (rawLineTotal * item.discountPercent) / 100 : 0;
    const discountedLine = Math.max(0, rawLineTotal - discount);
    
    subtotal += rawLineTotal;
    itemLevelDiscount += discount;

    const taxRate = item.taxRatePercent || 0;
    const lineTax = (discountedLine * taxRate) / 100;
    calculatedTax += lineTax;

    if (params.isInterState) {
      igstTotal += lineTax;
    } else {
      cgstTotal += lineTax / 2;
      sgstTotal += lineTax / 2;
    }
  }

  const overallDiscount = params.orderDiscountFixed 
    ? params.orderDiscountFixed 
    : params.orderDiscountPercent 
      ? (subtotal * params.orderDiscountPercent) / 100 
      : 0;

  const totalDiscount = roundToTwo(itemLevelDiscount + overallDiscount);
  const taxableAmount = roundToTwo(Math.max(0, subtotal - itemLevelDiscount));
  
  const finalCgst = roundToTwo(cgstTotal);
  const finalSgst = roundToTwo(sgstTotal);
  const finalIgst = roundToTwo(igstTotal);
  const totalTax = roundToTwo(finalCgst + finalSgst + finalIgst);
  const grandTotal = roundToTwo(taxableAmount + totalTax - (params.orderDiscountFixed || 0));

  return {
    taxableAmount,
    cgstRate: params.isInterState ? 0 : 9,
    cgstAmount: finalCgst,
    sgstRate: params.isInterState ? 0 : 9,
    sgstAmount: finalSgst,
    igstRate: params.isInterState ? 18 : 0,
    igstAmount: finalIgst,
    totalTax,
    discountAmount: totalDiscount,
    grandTotal: Math.max(0, grandTotal),
  };
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalValidationResult {
  isValid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errorMessage?: string;
}

export function validateJournalEntry(lines: JournalLine[]): JournalValidationResult {
  if (!lines || lines.length < 2) {
    return {
      isValid: false,
      totalDebit: 0,
      totalCredit: 0,
      difference: 0,
      errorMessage: 'A journal entry must contain at least two lines.',
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    if (line.debit < 0 || line.credit < 0) {
      return {
        isValid: false,
        totalDebit: 0,
        totalCredit: 0,
        difference: 0,
        errorMessage: 'Debits and credits cannot be negative values.',
      };
    }
    if (line.debit > 0 && line.credit > 0) {
      return {
        isValid: false,
        totalDebit: 0,
        totalCredit: 0,
        difference: 0,
        errorMessage: 'A single line cannot have both debit and credit amounts.',
      };
    }
    totalDebit += line.debit;
    totalCredit += line.credit;
  }

  totalDebit = roundToTwo(totalDebit);
  totalCredit = roundToTwo(totalCredit);
  const difference = roundToTwo(Math.abs(totalDebit - totalCredit));

  if (totalDebit === 0 && totalCredit === 0) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      errorMessage: 'Journal entry total amount cannot be zero.',
    };
  }

  if (difference > 0.009) {
    return {
      isValid: false,
      totalDebit,
      totalCredit,
      difference,
      errorMessage: `Debits (${totalDebit}) and Credits (${totalCredit}) do not balance. Discrepancy: ${difference}`,
    };
  }

  return {
    isValid: true,
    totalDebit,
    totalCredit,
    difference: 0,
  };
}

/**
 * Weighted Average Stock Valuation
 */
export function calculateWeightedAverageCost(
  currentStock: number,
  currentUnitCost: number,
  newStock: number,
  newUnitCost: number
): number {
  const totalStock = currentStock + newStock;
  if (totalStock <= 0) return 0;
  const totalValue = (currentStock * currentUnitCost) + (newStock * newUnitCost);
  return roundToTwo(totalValue / totalStock);
}
