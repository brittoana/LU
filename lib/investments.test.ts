import { describe, expect, it } from "vitest";
import { daysUntil, summarizeInvestments } from "./investments";
import type { Investment } from "./types";

const today = new Date("2026-10-02T10:00:00");
const inv = (id: string, amount: number, availableAt: string, kind?: string): Investment => ({ id, name: id, amount, investedAt: "2026-01-01", availableAt, kind });

describe("summarizeInvestments", () => {
  it("separa o que já pode ser sacado do que está em carência", () => {
    const s = summarizeInvestments([inv("a", 1000, "2026-09-01", "Tesouro Direto"), inv("b", 500, "2026-10-02", "Tesouro Direto"), inv("c", 2000, "2027-03-10", "Fundos")], today);
    expect(s.total).toBe(3500);
    expect(s.availableNow).toBe(1500);
    expect(s.locked).toBe(2000);
    expect(s.availableCount).toBe(2);
    expect(s.nextRelease?.id).toBe("c");
  });

  it("agrupa por tipo, do maior para o menor", () => {
    const s = summarizeInvestments([inv("a", 1000, "2027-01-01", "Fundos"), inv("b", 3000, "2027-01-01", "Tesouro Direto"), inv("c", 1000, "2027-01-01")], today);
    expect(s.byKind[0]).toMatchObject({ kind: "Tesouro Direto", percent: 60 });
    expect(s.byKind.map((k) => k.kind)).toContain("Outro");
  });

  it("funciona sem nenhum investimento", () => {
    const s = summarizeInvestments([], today);
    expect(s.total).toBe(0);
    expect(s.nextRelease).toBeNull();
    expect(s.byKind).toEqual([]);
  });
});

describe("daysUntil", () => {
  it("conta dias corridos até a data", () => {
    expect(daysUntil("2026-10-02", today)).toBe(0);
    expect(daysUntil("2026-10-12", today)).toBe(10);
  });
});
