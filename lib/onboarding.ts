import type { FixedExpense, FixedExpenseDuration, Installment, OnboardingDetails, OtherIncome, QuizInput } from "./types";

export type YesNo = "yes" | "no" | "";

export interface IncomeRow { id: string; description: string; amount: string }
export interface ExpenseRow { id: string; name: string; amount: string; category: string; duration: FixedExpenseDuration | ""; dueDay: string }
export interface InstallmentRow { id: string; description: string; amount: string; remaining: string; card: string; dueDay: string }

export interface OnboardingDraft {
  salary: string;
  hasOtherIncome: YesNo;
  otherIncomes: IncomeRow[];
  expenses: ExpenseRow[];
  hasInstallments: YesNo;
  installments: InstallmentRow[];
}

let seq = 0;
const uid = () => `row-${++seq}`;

export const newIncomeRow = (): IncomeRow => ({ id: uid(), description: "", amount: "" });
export const newExpenseRow = (): ExpenseRow => ({ id: uid(), name: "", amount: "", category: "", duration: "", dueDay: "" });
export const newInstallmentRow = (): InstallmentRow => ({ id: uid(), description: "", amount: "", remaining: "", card: "", dueDay: "" });

export function createEmptyDraft(): OnboardingDraft {
  return { salary: "", hasOtherIncome: "", otherIncomes: [newIncomeRow()], expenses: [newExpenseRow()], hasInstallments: "", installments: [newInstallmentRow()] };
}

const isBlank = (...values: string[]) => values.every((v) => v.trim() === "");
const positive = (v: string) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) > 0;
const validDay = (v: string) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 31 && v.trim() !== "";
const validCount = (v: string) => Number.isInteger(Number(v)) && Number(v) >= 1 && v.trim() !== "";

export const isIncomeRowBlank = (r: IncomeRow) => isBlank(r.description, r.amount);
export const isIncomeRowValid = (r: IncomeRow) => r.description.trim() !== "" && positive(r.amount);
export const isExpenseRowBlank = (r: ExpenseRow) => isBlank(r.name, r.amount, r.category, r.duration, r.dueDay);
export const isExpenseRowValid = (r: ExpenseRow) => r.name.trim() !== "" && positive(r.amount) && r.category !== "" && r.duration !== "" && validDay(r.dueDay);
export const isInstallmentRowBlank = (r: InstallmentRow) => isBlank(r.description, r.amount, r.remaining, r.card, r.dueDay);
export const isInstallmentRowValid = (r: InstallmentRow) => r.description.trim() !== "" && positive(r.amount) && validCount(r.remaining) && r.card.trim() !== "" && validDay(r.dueDay);

function rowsOk<T>(rows: T[], blank: (r: T) => boolean, valid: (r: T) => boolean, requireOne: boolean) {
  const filled = rows.filter((r) => !blank(r));
  if (requireOne && filled.length === 0) return false;
  return filled.every(valid);
}

export function isIncomeStepValid(d: OnboardingDraft) {
  if (d.salary.trim() === "" || !(Number(d.salary) >= 0)) return false;
  if (d.hasOtherIncome === "") return false;
  if (d.hasOtherIncome === "no") return true;
  return rowsOk(d.otherIncomes, isIncomeRowBlank, isIncomeRowValid, true);
}

/** Despesas fixas: pode seguir sem nenhuma, mas toda linha começada precisa estar completa. */
export function isExpensesStepValid(d: OnboardingDraft) {
  return rowsOk(d.expenses, isExpenseRowBlank, isExpenseRowValid, false);
}

export function isInstallmentsStepValid(d: OnboardingDraft) {
  if (d.hasInstallments === "") return false;
  if (d.hasInstallments === "no") return true;
  return rowsOk(d.installments, isInstallmentRowBlank, isInstallmentRowValid, true);
}

export function draftToDetails(d: OnboardingDraft): OnboardingDetails {
  const otherIncomes: OtherIncome[] = d.hasOtherIncome === "yes"
    ? d.otherIncomes.filter(isIncomeRowValid).map((r) => ({ id: r.id, description: r.description.trim(), amount: Number(r.amount) }))
    : [];
  const fixedExpenses: FixedExpense[] = d.expenses.filter(isExpenseRowValid).map((r) => ({ id: r.id, name: r.name.trim(), amount: Number(r.amount), category: r.category, duration: r.duration as FixedExpenseDuration, dueDay: Number(r.dueDay) }));
  const installments: Installment[] = d.hasInstallments === "yes"
    ? d.installments.filter(isInstallmentRowValid).map((r) => ({ id: r.id, description: r.description.trim(), amount: Number(r.amount), remaining: Number(r.remaining), card: r.card.trim(), dueDay: Number(r.dueDay) }))
    : [];
  return { salary: Number(d.salary) || 0, otherIncomes, fixedExpenses, installments };
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export interface OnboardingSummary {
  monthlyIncome: number;
  fixedTotal: number;
  installmentsMonthly: number;
  installmentsOutstanding: number;
  committedTotal: number;
  committedPercent: number | null;
  leftover: number;
  topExpenses: FixedExpense[];
}

export function summarizeOnboarding(details: OnboardingDetails): OnboardingSummary {
  const monthlyIncome = details.salary + sum(details.otherIncomes.map((i) => i.amount));
  const fixedTotal = sum(details.fixedExpenses.map((e) => e.amount));
  const installmentsMonthly = sum(details.installments.map((i) => i.amount));
  const installmentsOutstanding = sum(details.installments.map((i) => i.amount * i.remaining));
  const committedTotal = fixedTotal + installmentsMonthly;
  return {
    monthlyIncome,
    fixedTotal,
    installmentsMonthly,
    installmentsOutstanding,
    committedTotal,
    committedPercent: monthlyIncome > 0 ? (committedTotal / monthlyIncome) * 100 : null,
    leftover: monthlyIncome - committedTotal,
    topExpenses: [...details.fixedExpenses].sort((a, b) => b.amount - a.amount).slice(0, 3),
  };
}

/**
 * Converte as respostas do formulário para o formato que o restante do app já usa.
 * Campos que o formulário não pergunta mais recebem valores neutros:
 * sem dependentes, sem variáveis, reserva zerada e perfil moderado.
 */
export function onboardingToQuizInput(details: OnboardingDetails): QuizInput {
  const s = summarizeOnboarding(details);
  return {
    monthlyIncome: s.monthlyIncome,
    incomeStability: details.otherIncomes.length > 0 ? "mixed" : "stable",
    dependents: 0,
    essentialExpenses: s.fixedTotal,
    variableExpenses: 0,
    debtBalance: s.installmentsOutstanding,
    monthlyDebtPayments: s.installmentsMonthly,
    currentReserve: 0,
    profileScore: 5,
    details,
  };
}
