import type { TransactionType } from "./types";

export const EXPENSE_CATEGORIES = ["Comida", "Mercado", "Uber", "Casa", "Contas", "Saúde", "Lazer", "Cartão", "Outros"];
export const INCOME_CATEGORIES = ["Salário", "Freela", "Vendas", "Extra", "Outros"];
export const FIXED_EXPENSE_CATEGORIES = ["Moradia", "Transporte", "Educação", "Saúde", "Assinaturas", "Financiamentos", "Serviços", "Outros"];
export const DEBT_CATEGORIES = ["Cartão", "Empréstimo", "Financiamento", "Parcelamento", "Outros"];

/** Emoji de um toque para cada categoria, usado nos chips do formulário. */
export const CATEGORY_EMOJI: Record<string, string> = {
  comida: "🍕",
  mercado: "🛒",
  uber: "🚗",
  casa: "🏠",
  contas: "🧾",
  saúde: "💊",
  lazer: "🎉",
  cartão: "💳",
  salário: "💰",
  freela: "💻",
  vendas: "🏷️",
  extra: "✨",
  empréstimo: "🏦",
  financiamento: "🏦",
  parcelamento: "📦",
  outros: "🔖",
};

export function categoryEmoji(category: string) {
  const key = category.trim().toLocaleLowerCase("pt-BR");
  return CATEGORY_EMOJI[key] || "🔖";
}

export function categoriesForType(type: TransactionType) {
  return type === "income" ? INCOME_CATEGORIES : type === "debt" ? DEBT_CATEGORIES : EXPENSE_CATEGORIES;
}

export function normalizeCategory(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  if (!normalized) return "Sem categoria";
  return normalized.charAt(0).toLocaleUpperCase("pt-BR") + normalized.slice(1);
}
