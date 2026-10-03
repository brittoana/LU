import type { AppState, DashboardData, InvestorProfile, QuizInput, QuizResult } from "./types";

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function weeksInMonth(date = new Date()) {
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.ceil(days / 7);
}

export function evaluateFinancialProfile(input: QuizInput, referenceDate = new Date()): QuizResult {
  const freeCashFlow = input.monthlyIncome - input.essentialExpenses - input.variableExpenses - input.monthlyDebtPayments;

  let reserveMonths = input.incomeStability === "stable" ? 3 : input.incomeStability === "mixed" ? 4 : 6;
  if (input.dependents > 0) reserveMonths += 1;
  reserveMonths = Math.min(reserveMonths, 9);

  const reserveTarget = Math.max(0, input.essentialExpenses * reserveMonths);
  const profile: InvestorProfile = input.profileScore <= 4 ? "Conservador" : input.profileScore <= 7 ? "Moderado" : "Crescimento";
  const weeklyBudget = Math.max(0, freeCashFlow) / weeksInMonth(referenceDate);
  const base = { ...input, profile, freeCashFlow, reserveMonths, reserveTarget, weeklyBudget, weeklyBudgetMonth: monthKey(referenceDate) };

  if (input.debtBalance > input.monthlyIncome) {
    return { ...base, stage: "debt_priority", reserveUnlocked: false, investmentUnlocked: false };
  }

  if (freeCashFlow <= 0) {
    return { ...base, stage: "stabilization", reserveUnlocked: false, investmentUnlocked: false };
  }

  if (input.currentReserve < reserveTarget) {
    return { ...base, stage: "reserve_building", reserveUnlocked: true, investmentUnlocked: false };
  }

  return { ...base, stage: "investing", reserveUnlocked: true, investmentUnlocked: true };
}

/** Lista os meses (mais recente primeiro) com movimentações registradas, sempre incluindo o mês atual. */
export function listAvailableMonths(state: AppState, referenceDate = new Date()): Date[] {
  const keys = new Set<string>();
  keys.add(monthKey(referenceDate));
  state.transactions.forEach((t) => keys.add(monthKey(new Date(`${t.date}T12:00:00`))));
  return Array.from(keys)
    .sort((a, b) => (a < b ? 1 : -1))
    .map((key) => {
      const [year, month] = key.split("-").map(Number);
      return new Date(year, month - 1, 1);
    });
}

export function refreshWeeklyBudget(quizResult: QuizResult, referenceDate = new Date()): QuizResult {
  const currentMonth = monthKey(referenceDate);
  if (quizResult.weeklyBudgetMonth === currentMonth) return quizResult;
  return evaluateFinancialProfile(quizResult, referenceDate);
}

function isSameMonth(date: Date, now: Date) {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

function isThisWeek(date: Date, now: Date) {
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day + 1);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return date >= monday && date < nextMonday;
}

function startOfWeek(date: Date) {
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(date.getDate() - day + 1);
  return monday;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export interface WeekEvolutionDay {
  label: string;
  dateLabel: string;
  amount: number;
  isToday: boolean;
}

export interface WeekEvolution {
  days: WeekEvolutionDay[];
  changePercent: number | null;
}

/** Evolução dos gastos de segunda a sexta da semana que contém referenceDate, comparada à semana anterior. */
export function buildWeekEvolution(state: AppState, referenceDate = new Date()): WeekEvolution {
  const monday = startOfWeek(referenceDate);
  const expenseByDay = (base: Date) => {
    let total = 0;
    for (let i = 0; i < 5; i += 1) {
      const day = new Date(base);
      day.setDate(base.getDate() + i);
      total += state.transactions
        .filter((t) => t.type === "expense" && t.status === "realized" && sameDay(new Date(`${t.date}T12:00:00`), day))
        .reduce((s, t) => s + t.amount, 0);
    }
    return total;
  };

  const days: WeekEvolutionDay[] = Array.from({ length: 5 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const amount = state.transactions
      .filter((t) => t.type === "expense" && t.status === "realized" && sameDay(new Date(`${t.date}T12:00:00`), day))
      .reduce((s, t) => s + t.amount, 0);
    return {
      label: WEEKDAY_LABELS[i],
      dateLabel: `${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`,
      amount,
      isToday: sameDay(day, referenceDate),
    };
  });

  const previousMonday = new Date(monday);
  previousMonday.setDate(monday.getDate() - 7);
  const currentTotal = expenseByDay(monday);
  const previousTotal = expenseByDay(previousMonday);
  const changePercent = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10 : null;

  return { days, changePercent };
}

/** Todas as movimentações de um mês específico, da mais recente para a mais antiga. */
export function monthTransactions(state: AppState, referenceDate = new Date()) {
  return state.transactions
    .filter((t) => isSameMonth(new Date(`${t.date}T12:00:00`), referenceDate))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function buildDashboard(state: AppState, now = new Date()): DashboardData {
  const monthTx = state.transactions.filter((t) => isSameMonth(new Date(`${t.date}T12:00:00`), now));

  const realizedIncome = monthTx.filter((t) => t.type === "income" && t.status === "realized").reduce((s, t) => s + t.amount, 0);
  const realizedExpenses = monthTx.filter((t) => t.type === "expense" && t.status === "realized").reduce((s, t) => s + t.amount, 0);
  const receivable = monthTx.filter((t) => t.type === "income" && t.status !== "realized").reduce((s, t) => s + t.amount, 0);
  const committed = state.transactions.filter((t) => t.type === "expense" && t.status === "scheduled" && new Date(`${t.date}T12:00:00`) >= now).reduce((s, t) => s + t.amount, 0);

  const hasTransactions = state.transactions.length > 0;
  const balance = hasTransactions ? realizedIncome - realizedExpenses : null;
  const available = balance === null ? null : balance - committed;

  const categoryMap = new Map<string, number>();
  monthTx.filter((t) => t.type === "expense" && t.status === "realized").forEach((t) => {
    categoryMap.set(t.category || "Sem categoria", (categoryMap.get(t.category || "Sem categoria") ?? 0) + t.amount);
  });
  const totalCategory = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
  const categories = Array.from(categoryMap.entries())
    .map(([name, amount]) => ({ name, amount, percent: totalCategory > 0 ? Math.round((amount / totalCategory) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const upcoming = state.transactions
    .filter((t) => t.status === "scheduled" && new Date(`${t.date}T12:00:00`) >= now)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  let weeklyLimit: number | null = null;
  let weeklySpent: number | null = null;
  let weeklyAvailable: number | null = null;
  if (state.quizResult) {
    weeklyLimit = state.quizResult.weeklyBudget;
    weeklySpent = state.transactions
      .filter((t) => t.type === "expense" && t.status === "realized" && isThisWeek(new Date(`${t.date}T12:00:00`), now))
      .reduce((s, t) => s + t.amount, 0);
    weeklyAvailable = Math.max(0, weeklyLimit - weeklySpent);
  }

  return {
    balance,
    available,
    committed: hasTransactions ? committed : null,
    income: hasTransactions ? realizedIncome : null,
    expenses: hasTransactions ? realizedExpenses : null,
    receivable: hasTransactions ? receivable : null,
    weeklyLimit,
    weeklySpent,
    weeklyAvailable,
    categories,
    upcoming,
  };
}
