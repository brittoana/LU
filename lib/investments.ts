import type { Investment } from "./types";

export const INVESTMENT_KINDS = ["Tesouro Direto", "CDB / LCI / LCA", "Renda fixa", "Fundos", "Ações e ETFs", "Cripto", "Outro"] as const;

export interface KindSlice { kind: string; amount: number; percent: number }

export interface InvestmentSummary {
  total: number;
  availableNow: number;
  locked: number;
  availableCount: number;
  lockedCount: number;
  nextRelease: Investment | null;
  byKind: KindSlice[];
}

const dayOf = (iso: string) => new Date(`${iso}T12:00:00`);

export function isAvailable(inv: Investment, today = new Date()) {
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);
  return dayOf(inv.availableAt) <= end;
}

export function daysUntil(iso: string, today = new Date()) {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(dayOf(iso).getFullYear(), dayOf(iso).getMonth(), dayOf(iso).getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function summarizeInvestments(list: Investment[], today = new Date()): InvestmentSummary {
  const total = list.reduce((s, i) => s + i.amount, 0);
  const available = list.filter((i) => isAvailable(i, today));
  const locked = list.filter((i) => !isAvailable(i, today));
  const nextRelease = [...locked].sort((a, b) => a.availableAt.localeCompare(b.availableAt))[0] ?? null;

  const kinds = new Map<string, number>();
  list.forEach((i) => kinds.set(i.kind || "Outro", (kinds.get(i.kind || "Outro") ?? 0) + i.amount));
  const byKind = Array.from(kinds.entries())
    .map(([kind, amount]) => ({ kind, amount, percent: total > 0 ? Math.round((amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    availableNow: available.reduce((s, i) => s + i.amount, 0),
    locked: locked.reduce((s, i) => s + i.amount, 0),
    availableCount: available.length,
    lockedCount: locked.length,
    nextRelease,
    byKind,
  };
}
