export type TransactionType = "income" | "expense" | "debt";
export type TransactionStatus = "realized" | "receivable" | "scheduled";
export type IncomeStability = "stable" | "mixed" | "variable";
export type FinancialStage = "debt_priority" | "stabilization" | "reserve_building" | "investing";
export type InvestorProfile = "Conservador" | "Moderado" | "Crescimento";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  category: string;
  description: string;
  account: string;
  date: string;
  recurring: boolean;
}

export type FixedExpenseDuration = "indefinite" | "5to12" | "over12";

export interface OtherIncome {
  id: string;
  description: string;
  amount: number;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
  duration: FixedExpenseDuration;
  dueDay: number;
}

export interface Installment {
  id: string;
  description: string;
  amount: number;
  remaining: number;
  card: string;
  dueDay: number;
}

/** Respostas detalhadas do formulário inicial (renda, despesas fixas e parcelamentos). */
export interface OnboardingDetails {
  salary: number;
  otherIncomes: OtherIncome[];
  fixedExpenses: FixedExpense[];
  installments: Installment[];
}

export interface QuizInput {
  monthlyIncome: number;
  incomeStability: IncomeStability;
  dependents: number;
  essentialExpenses: number;
  variableExpenses: number;
  debtBalance: number;
  monthlyDebtPayments: number;
  currentReserve: number;
  profileScore: number;
  details?: OnboardingDetails;
}

export interface QuizResult extends QuizInput {
  profile: InvestorProfile;
  stage: FinancialStage;
  reserveUnlocked: boolean;
  investmentUnlocked: boolean;
  freeCashFlow: number;
  reserveMonths: number;
  reserveTarget: number;
  weeklyBudget: number;
  weeklyBudgetMonth: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Investment {
  id: string;
  name: string;
  amount: number;
  investedAt: string;
  availableAt: string;
  kind?: string;
  notes?: string;
}

export interface AppState {
  user: UserProfile | null;
  quizResult: QuizResult | null;
  transactions: Transaction[];
  investments: Investment[];
}

export interface DashboardData {
  balance: number | null;
  available: number | null;
  committed: number | null;
  income: number | null;
  expenses: number | null;
  receivable: number | null;
  weeklyLimit: number | null;
  weeklySpent: number | null;
  weeklyAvailable: number | null;
  categories: { name: string; amount: number; percent: number }[];
  upcoming: Transaction[];
}
