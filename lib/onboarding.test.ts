import { describe, expect, it } from "vitest";
import { createEmptyDraft, draftToDetails, isExpensesStepValid, isIncomeStepValid, isInstallmentsStepValid, onboardingToQuizInput, summarizeOnboarding } from "./onboarding";
import { evaluateFinancialProfile } from "./finance";

function filledDraft() {
  const d = createEmptyDraft();
  d.salary = "5000";
  d.hasOtherIncome = "yes";
  d.otherIncomes[0] = { ...d.otherIncomes[0], description: "Freela", amount: "1000" };
  d.expenses[0] = { ...d.expenses[0], name: "Aluguel", amount: "1800", category: "Moradia", duration: "over12", dueDay: "5" };
  d.hasInstallments = "yes";
  d.installments[0] = { ...d.installments[0], description: "Celular", amount: "300", remaining: "6", card: "Nubank", dueDay: "10" };
  return d;
}

describe("validação das etapas", () => {
  it("exige salário e a resposta sobre outras rendas", () => {
    const d = createEmptyDraft();
    expect(isIncomeStepValid(d)).toBe(false);
    d.salary = "3000";
    expect(isIncomeStepValid(d)).toBe(false);
    d.hasOtherIncome = "no";
    expect(isIncomeStepValid(d)).toBe(true);
  });

  it("com 'Sim' em outras rendas exige ao menos uma linha completa", () => {
    const d = createEmptyDraft();
    d.salary = "3000";
    d.hasOtherIncome = "yes";
    expect(isIncomeStepValid(d)).toBe(false);
    d.otherIncomes[0].description = "Freela";
    expect(isIncomeStepValid(d)).toBe(false);
    d.otherIncomes[0].amount = "500";
    expect(isIncomeStepValid(d)).toBe(true);
  });

  it("despesa começada precisa estar completa; lista vazia é permitida", () => {
    const d = createEmptyDraft();
    expect(isExpensesStepValid(d)).toBe(true);
    d.expenses[0].name = "Internet";
    expect(isExpensesStepValid(d)).toBe(false);
    expect(isExpensesStepValid(filledDraft())).toBe(true);
  });

  it("parcelamentos exigem resposta e número de parcelas inteiro", () => {
    const d = filledDraft();
    expect(isInstallmentsStepValid(d)).toBe(true);
    d.installments[0].remaining = "2.5";
    expect(isInstallmentsStepValid(d)).toBe(false);
    d.hasInstallments = "no";
    expect(isInstallmentsStepValid(d)).toBe(true);
  });
});

describe("resumo e conversão", () => {
  it("calcula renda, comprometido, parcelamentos e sobra", () => {
    const s = summarizeOnboarding(draftToDetails(filledDraft()));
    expect(s.monthlyIncome).toBe(6000);
    expect(s.fixedTotal).toBe(1800);
    expect(s.installmentsMonthly).toBe(300);
    expect(s.installmentsOutstanding).toBe(1800);
    expect(s.committedTotal).toBe(2100);
    expect(s.committedPercent).toBe(35);
    expect(s.leftover).toBe(3900);
  });

  it("ignora rendas e parcelamentos quando a resposta é 'Não'", () => {
    const d = filledDraft();
    d.hasOtherIncome = "no";
    d.hasInstallments = "no";
    const details = draftToDetails(d);
    expect(details.otherIncomes).toHaveLength(0);
    expect(details.installments).toHaveLength(0);
    expect(summarizeOnboarding(details).monthlyIncome).toBe(5000);
  });

  it("alimenta o diagnóstico existente e preserva os detalhes", () => {
    const result = evaluateFinancialProfile(onboardingToQuizInput(draftToDetails(filledDraft())), new Date("2026-09-10T12:00:00"));
    expect(result.freeCashFlow).toBe(3900);
    expect(result.essentialExpenses).toBe(1800);
    expect(result.details?.fixedExpenses[0].name).toBe("Aluguel");
    expect(result.stage).toBe("reserve_building");
  });
});
