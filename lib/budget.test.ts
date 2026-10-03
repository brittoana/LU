import { describe, expect, it } from "vitest";
import { suggestAreaBudget } from "./budget";

describe("suggestAreaBudget", () => {
  it("divide a sobra inteira entre reserva e áreas, sem perder nem criar dinheiro", () => {
    const s = suggestAreaBudget({ leftover: 3000, stage: "reserve_building", fixedCategories: [] });
    expect(s.deficit).toBe(false);
    expect(s.savings).toBe(750);
    const total = s.savings + s.areas.reduce((sum, a) => sum + a.amount, 0);
    expect(total).toBe(3000);
    expect(s.areas.every((a) => a.amount > 0)).toBe(true);
  });

  it("mantém a soma exata mesmo com valores que não dividem redondo", () => {
    const s = suggestAreaBudget({ leftover: 1234.56, stage: "debt_priority", fixedCategories: [] });
    const total = s.savings + s.areas.reduce((sum, a) => sum + a.amount, 0);
    expect(total).toBe(Math.round(1234.56));
  });

  it("não sugere nada quando não há sobra", () => {
    const s = suggestAreaBudget({ leftover: -200, stage: "stabilization", fixedCategories: [] });
    expect(s.deficit).toBe(true);
    expect(s.areas).toHaveLength(0);
    expect(s.savings).toBe(0);
  });

  it("reduz a área que já existe como despesa fixa", () => {
    const base = suggestAreaBudget({ leftover: 2000, stage: "investing", fixedCategories: [] });
    const withFixed = suggestAreaBudget({ leftover: 2000, stage: "investing", fixedCategories: ["Transporte", "Saúde"] });
    const get = (s: typeof base, c: string) => s.areas.find((a) => a.category === c)!.amount;
    expect(get(withFixed, "Uber")).toBeLessThan(get(base, "Uber"));
    expect(get(withFixed, "Saúde")).toBeLessThan(get(base, "Saúde"));
  });
});
