/**
 * Sequential and Collision-Resistant ID Generator
 * Generates human-readable prefixed IDs (e.g. CUS-000001, INV-000001)
 * paired with internal sequence counters.
 */

const inMemoryCounters: Record<string, number> = {
  CUS: 104,
  LEAD: 215,
  PRD: 152,
  QTN: 310,
  SO: 205,
  INV: 412,
  PAY: 512,
  WH: 12,
  MOV: 840,
  SUP: 65,
  PO: 180,
  GRN: 130,
  BIL: 145,
  EMP: 88,
  ATT: 950,
  LEV: 120,
  PAYR: 110,
  EXP: 340,
  JRN: 220,
  PRJ: 45,
  TSK: 180,
  DOC: 75,
  AUD: 1240,
  NOTIF: 450,
};

export function getNextSequenceId(prefix: string): string {
  const cleanPrefix = prefix.toUpperCase();
  const current = (inMemoryCounters[cleanPrefix] || 100) + 1;
  inMemoryCounters[cleanPrefix] = current;
  const padded = String(current).padStart(6, '0');
  return `${cleanPrefix}-${padded}`;
}

export function generateCollisionResistantId(prefix: string): string {
  const seqId = getNextSequenceId(prefix);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${seqId}-${randomSuffix}`;
}

export function getCurrentCounters(): Record<string, number> {
  return { ...inMemoryCounters };
}

export function setCounter(prefix: string, value: number): void {
  inMemoryCounters[prefix.toUpperCase()] = value;
}
