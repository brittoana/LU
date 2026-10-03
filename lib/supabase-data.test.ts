import { describe, expect, it } from "vitest";
import { investmentFromRow, investmentToRow, transactionFromRow, transactionToRow } from "./supabase-data";

describe("mapeamento Supabase", () => {
  it("transação: ida e volta preserva os dados e converte numeric em number", () => {
    const tx = { type: "expense" as const, status: "realized" as const, amount: 49.9, category: "Mercado", description: "Feira", account: "Nubank", date: "2026-10-01", recurring: false };
    const row = transactionToRow(tx, "id-1", "user-1");
    expect(row.user_id).toBe("user-1");
    expect(transactionFromRow({ ...row, amount: "49.90" })).toEqual({ ...tx, id: "id-1" });
  });

  it("investimento: campos opcionais viram null e voltam como undefined", () => {
    const row = investmentToRow({ name: "Tesouro Selic", amount: 1000, investedAt: "2026-01-01", availableAt: "2027-01-01" }, "i-1", "user-1");
    expect(row.kind).toBeNull();
    expect(row.notes).toBeNull();
    const back = investmentFromRow(row);
    expect(back.kind).toBeUndefined();
    expect(back.notes).toBeUndefined();
    expect(back.amount).toBe(1000);
  });
});
