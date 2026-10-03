"use client";
import { useMemo } from "react";
import { PieChart } from "lucide-react";
import Card from "@/components/ui/Card";
import AreaBudgetList from "@/components/budget/AreaBudgetList";
import { useApp } from "@/components/providers/AppProvider";
import { suggestAreaBudget } from "@/lib/budget";

export default function AreaBudgetCard() {
  const { state } = useApp();
  const current = state.quizResult;

  const suggestion = useMemo(() => current ? suggestAreaBudget({
    leftover: current.freeCashFlow,
    stage: current.stage,
    fixedCategories: current.details?.fixedExpenses.map((e) => e.category) ?? [],
  }) : null, [current]);

  const spent = useMemo(() => {
    const now = new Date();
    const totals: Record<string, number> = {};
    state.transactions
      .filter((t) => t.type === "expense" && t.status === "realized")
      .filter((t) => { const d = new Date(`${t.date}T12:00:00`); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); })
      .forEach((t) => { totals[t.category] = (totals[t.category] ?? 0) + t.amount; });
    return totals;
  }, [state.transactions]);

  if (!suggestion) return null;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-[#F4E0A5] p-3 text-[#D97706]"><PieChart /></div>
        <div><h2 className="font-bold">Quanto gastar por área</h2><p className="text-sm text-[#7B6A5D]">Sugestão para o mês, com base no que sobra depois das contas fixas e parcelas.</p></div>
      </div>
      <div className="mt-4"><AreaBudgetList suggestion={suggestion} spent={spent} /></div>
      <p className="mt-4 text-xs text-[#7B6A5D]">É um ponto de partida, não uma regra: ajuste conforme sua realidade.</p>
    </Card>
  );
}
