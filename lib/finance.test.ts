import { describe, expect, it } from "vitest";
import { buildDashboard, evaluateFinancialProfile, refreshWeeklyBudget } from "./finance";
import type { AppState, QuizInput } from "./types";

const base: QuizInput = {
  monthlyIncome: 5000,
  incomeStability: "stable",
  dependents: 0,
  essentialExpenses: 2000,
  variableExpenses: 800,
  debtBalance: 0,
  monthlyDebtPayments: 200,
  currentReserve: 0,
  profileScore: 6,
};

describe("evaluateFinancialProfile", () => {
  it("bloqueia reserva e investimentos quando saldo devedor supera a renda", () => {
    const result = evaluateFinancialProfile({ ...base, debtBalance: 6000 }, new Date("2026-09-10T12:00:00"));
    expect(result.stage).toBe("debt_priority");
    expect(result.reserveUnlocked).toBe(false);
    expect(result.investmentUnlocked).toBe(false);
  });

  it("entra em estabilização quando o fluxo de caixa livre não é positivo", () => {
    const result = evaluateFinancialProfile({ ...base, essentialExpenses: 4500, variableExpenses: 500 }, new Date("2026-09-10T12:00:00"));
    expect(result.freeCashFlow).toBeLessThanOrEqual(0);
    expect(result.stage).toBe("stabilization");
  });

  it("libera reserva, mas não investimento, enquanto a meta de reserva não foi atingida", () => {
    const result = evaluateFinancialProfile(base, new Date("2026-09-10T12:00:00"));
    expect(result.stage).toBe("reserve_building");
    expect(result.reserveUnlocked).toBe(true);
    expect(result.investmentUnlocked).toBe(false);
  });

  it("libera investimentos quando a reserva alcança a meta", () => {
    const result = evaluateFinancialProfile({ ...base, currentReserve: 10000 }, new Date("2026-09-10T12:00:00"));
    expect(result.stage).toBe("investing");
    expect(result.investmentUnlocked).toBe(true);
  });

  it("fixa o orçamento semanal no momento do diagnóstico", () => {
    const result = evaluateFinancialProfile(base, new Date("2026-09-10T12:00:00"));
    expect(result.weeklyBudget).toBe(400);
    expect(result.weeklyBudgetMonth).toBe("2026-09");
  });
});

describe("refreshWeeklyBudget", () => {
  it("mantém o mesmo orçamento dentro do mês em que foi calculado", () => {
    const quizResult = evaluateFinancialProfile(base, new Date("2026-09-02T12:00:00"));
    const refreshed = refreshWeeklyBudget(quizResult, new Date("2026-09-28T12:00:00"));
    expect(refreshed).toBe(quizResult);
    expect(refreshed.weeklyBudget).toBe(quizResult.weeklyBudget);
  });

  it("recalcula o orçamento semanal quando o mês muda", () => {
    const quizResult = evaluateFinancialProfile(base, new Date("2026-09-02T12:00:00"));
    const refreshed = refreshWeeklyBudget(quizResult, new Date("2026-10-05T12:00:00"));
    expect(refreshed.weeklyBudgetMonth).toBe("2026-10");
    expect(refreshed.stage).toBe(quizResult.stage);
    expect(refreshed.profile).toBe(quizResult.profile);
  });
});

describe("buildDashboard", () => {
  it("calcula saldo e mantém o mesmo limite semanal em dias diferentes do mês", () => {
    const quizResult = evaluateFinancialProfile(base, new Date("2026-09-02T12:00:00"));
    const state: AppState = {
      user: { name: "Teste", email: "teste@example.com" },
      quizResult,
      investments: [],
      transactions: [
        { id: "1", type: "income", status: "realized", amount: 5000, category: "Salário", description: "Salário", account: "Conta", date: "2026-09-01", recurring: false },
        { id: "2", type: "expense", status: "realized", amount: 500, category: "Alimentação", description: "Mercado", account: "Conta", date: "2026-09-03", recurring: false },
      ],
    };
    const start = buildDashboard(state, new Date("2026-09-04T12:00:00"));
    const end = buildDashboard(state, new Date("2026-09-25T12:00:00"));
    expect(start.balance).toBe(4500);
    expect(start.weeklyLimit).toBe(quizResult.weeklyBudget);
    expect(end.weeklyLimit).toBe(quizResult.weeklyBudget);
  });
});
