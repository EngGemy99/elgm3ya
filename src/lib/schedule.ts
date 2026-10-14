import type { Association, Cycle } from "../types.ts";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(value: string): Date | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number): Date {
  const targetMonth = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    Math.min(date.getDate(), lastDay),
  );
}

export function roundDate(startDate: string, cycle: Cycle, index: number): Date | null {
  const start = parseISODate(startDate);
  if (!start || index < 0) return null;
  return cycle === "weekly" ? addDays(start, index * 7) : addMonths(start, index);
}

export function endDate(startDate: string, cycle: Cycle, shareCount: number): Date | null {
  if (!Number.isInteger(shareCount) || shareCount < 1) return null;
  return roundDate(startDate, cycle, shareCount - 1);
}

const arabicDate = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
  calendar: "gregory",
});

export function formatArabicDate(value: string | Date): string {
  const date = typeof value === "string" ? parseISODate(value) : value;
  if (!date) return "";
  return arabicDate.format(date);
}

export function cycleLabel(cycle: Cycle): string {
  return cycle === "monthly" ? "شهري" : "أسبوعي";
}

export function cyclePaymentLabel(cycle: Cycle): string {
  return cycle === "monthly" ? "كل شهر" : "كل أسبوع";
}

const moneyFormat = new Intl.NumberFormat("ar-EG-u-nu-latn", {
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number): string {
  return `${moneyFormat.format(amount)} ج.م`;
}

export function parseAmount(value: string): number | null {
  const normalized = value.replace(/,/g, "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return amount;
}

export function payoutAmount(shareCount: number, shareAmount: number): number {
  if (!Number.isInteger(shareCount) || shareCount < 1 || shareAmount <= 0) return 0;
  return shareCount * shareAmount;
}

export function memberPayment(shareAmount: number, shares: number): number {
  return shareAmount * shares;
}

export function memberReceipt(shareCount: number, shareAmount: number, shares: number): number {
  return payoutAmount(shareCount, shareAmount) * shares;
}

export function usedShares(association: Association): number {
  return association.members.reduce((total, member) => total + member.shares, 0);
}

export function takenRoundIndexes(association: Association): Set<number> {
  const taken = new Set<number>();
  for (const member of association.members) {
    for (const index of member.roundIndexes) taken.add(index);
  }
  return taken;
}
