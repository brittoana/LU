import type { FinancialStage } from "./types";

/**
 * Áreas de gasto variável. `category` é o nome usado nas movimentações do app,
 * o que permite comparar o sugerido com o que já foi gasto no mês.
 */
const AREAS = [
  { category: "Mercado", label: "Mercado", hint: "Compras do mês", weight: 30 },
  { category: "Comida", label: "Comida fora", hint: "Restaurantes e delivery", weight: 20 },
  { category: "Uber", label: "Transporte", hint: "Apps, combustível, passagens", weight: 15 },
  { category: "Lazer", label: "Lazer", hint: "Passeios e diversão", weight: 15 },
  { category: "Saúde", label: "Saúde", hint: "Farmácia e consultas", weight: 8 },
  { category: "Outros", label: "Imprevistos e extras", hint: "O que não cabe nas outras áreas", weight: 12 },
] as const;

/** Quanto da sobra vai para reserva/dívida/objetivos antes de dividir o resto. */
const SAVINGS_SHARE: Record<FinancialStage, { share: number; label: string }> = {
  debt_priority: { share: 0.25, label: "Reduzir dívidas" },
  stabilization: { share: 0.1, label: "Colchão de segurança" },
  reserve_building: { share: 0.25, label: "Reserva de emergência" },
  investing: { share: 0.2, label: "Investimentos e objetivos" },
};

export interface AreaSuggestion {
  category: string;
  label: string;
  hint: string;
  amount: number;
  /** Fatia da sobra mensal, em %. */
  percent: number;
}

export interface BudgetSuggestion {
  leftover: number;
  deficit: boolean;
  savings: number;
  savingsLabel: string;
  savingsPercent: number;
  areas: AreaSuggestion[];
}

/**
 * Divide a sobra mensal (renda − despesas fixas − parcelas) entre as áreas de gasto.
 * Se a pessoa já tem despesa fixa numa área (ex.: transporte), essa área recebe menos
 * para não contar duas vezes.
 */
export function suggestAreaBudget({ leftover, stage, fixedCategories }: { leftover: number; stage: FinancialStage; fixedCategories: string[] }): BudgetSuggestion {
  const { share, label } = SAVINGS_SHARE[stage];
  if (!(leftover > 0)) {
    return { leftover, deficit: true, savings: 0, savingsLabel: label, savingsPercent: 0, areas: [] };
  }

  const fixed = new Set(fixedCategories.map((c) => c.trim().toLocaleLowerCase("pt-BR")));
  const adjusted = AREAS.map((a) => {
    let weight: number = a.weight;
    if (a.category === "Uber" && fixed.has("transporte")) weight *= 0.5;
    if (a.category === "Saúde" && fixed.has("saúde")) weight *= 0.5;
    if (a.category === "Lazer" && fixed.has("assinaturas")) weight *= 0.7;
    return { ...a, weight };
  });
  const totalWeight = adjusted.reduce((sum, a) => sum + a.weight, 0);

  const savings = Math.round(leftover * share);
  const pool = Math.round(leftover) - savings;
  const amounts = adjusted.map((a) => Math.floor((pool * a.weight) / totalWeight));
  // Os centavos que sobraram do arredondamento vão para a maior área.
  amounts[0] += pool - amounts.reduce((sum, v) => sum + v, 0);

  return {
    leftover,
    deficit: false,
    savings,
    savingsLabel: label,
    savingsPercent: Math.round((savings / leftover) * 100),
    areas: adjusted.map((a, i) => ({ category: a.category, label: a.label, hint: a.hint, amount: amounts[i], percent: Math.round((amounts[i] / leftover) * 100) })),
  };
}
