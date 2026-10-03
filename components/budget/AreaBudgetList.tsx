import { formatCurrency } from "@/lib/format";
import type { BudgetSuggestion } from "@/lib/budget";

/** Lista as áreas com o valor sugerido; se `spent` for passado, mostra o quanto já foi gasto no mês. */
export default function AreaBudgetList({ suggestion, spent }: { suggestion: BudgetSuggestion; spent?: Record<string, number> }) {
  if (suggestion.deficit) {
    return (
      <p className="rounded-2xl bg-[#F4E0A5]/60 px-4 py-3 text-sm text-[#92400E]">
        Suas despesas fixas e parcelas já ocupam toda a renda, então não sobra espaço para dividir por área. Revise os compromissos mais pesados para abrir uma folga no mês.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#E6EED3]/70 px-4 py-3">
        <div className="min-w-0"><p className="text-sm font-semibold text-[#3E2723]">{suggestion.savingsLabel}</p><p className="text-xs text-[#7B6A5D]">Separe primeiro · {suggestion.savingsPercent}% da sobra</p></div>
        <b className="shrink-0 text-[#556B2F]">{formatCurrency(suggestion.savings)}</b>
      </div>
      {suggestion.areas.map((a) => {
        const used = spent ? (spent[a.category] ?? 0) : null;
        const ratio = used !== null && a.amount > 0 ? Math.min(100, Math.round((used / a.amount) * 100)) : 0;
        const over = used !== null && used > a.amount;
        return (
          <div key={a.category}>
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0"><p className="text-sm font-medium text-[#2C1E18]">{a.label}</p><p className="truncate text-xs text-[#7B6A5D]">{a.hint}</p></div>
              <b className="shrink-0 text-sm text-[#2C1E18]">{formatCurrency(a.amount)}</b>
            </div>
            {used !== null && (
              <>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EFEBE4]"><div className={`h-full rounded-full ${over ? "bg-[#DC2626]" : "bg-[#6B8E23]"}`} style={{ width: `${ratio}%` }} /></div>
                <p className={`mt-1 text-[11px] ${over ? "font-semibold text-[#DC2626]" : "text-[#7B6A5D]"}`}>{over ? `Passou ${formatCurrency(used - a.amount)}` : `Gasto no mês: ${formatCurrency(used)}`}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
