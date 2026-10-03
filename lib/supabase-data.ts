import type { Investment, Transaction } from "./types";

/** Linhas como vêm do Postgres (snake_case) → objetos do app (camelCase), e vice-versa. */
export interface TransactionRow {
  id: string;
  user_id: string;
  type: Transaction["type"];
  status: Transaction["status"];
  amount: number | string;
  category: string;
  description: string;
  account: string;
  date: string;
  recurring: boolean;
}

export interface InvestmentRow {
  id: string;
  user_id: string;
  name: string;
  kind: string | null;
  amount: number | string;
  invested_at: string;
  available_at: string;
  notes: string | null;
}

export function transactionFromRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    account: row.account,
    date: row.date,
    recurring: row.recurring,
  };
}

export function transactionToRow(t: Omit<Transaction, "id">, id: string, userId: string): TransactionRow {
  return { id, user_id: userId, type: t.type, status: t.status, amount: t.amount, category: t.category, description: t.description, account: t.account, date: t.date, recurring: t.recurring };
}

export function investmentFromRow(row: InvestmentRow): Investment {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    investedAt: row.invested_at,
    availableAt: row.available_at,
    kind: row.kind ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export function investmentToRow(i: Omit<Investment, "id">, id: string, userId: string): InvestmentRow {
  return { id, user_id: userId, name: i.name, kind: i.kind ?? null, amount: i.amount, invested_at: i.investedAt, available_at: i.availableAt, notes: i.notes ?? null };
}
